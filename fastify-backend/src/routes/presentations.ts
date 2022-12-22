import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { hasPerms } from "./auth/authentication";
import e, { select } from '../dbschema'

import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Presentation } from "../schema/presentation";
import { ID, idSchema } from "../schema/presentation";



export const routes: FastifyPluginCallback = async (fastify, opts) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  /** List all presentations of a user */
  fastify.get('/presentations', {
    onRequest: fastify.auth([
      fastify.handleAuth,
      hasPerms(['PERM_USER'])
    ])
  },async (request, reply) => {
    console.log(request.userId);
    const query = e.select(e.Presentation, (presentation) => ({
      id: true,
      name: true,

      filter: e.op(presentation.owner.id, '=', e.uuid(request.userId))
    }));

    const result = await query.run(fastify.edgedb);
    console.log(result);

    reply.send(result);
  });

  /** List all models */
  fastify.get('/presentations-models', {

  },async (request, reply) => {
    const query = e.select(e.Presentation, (presentation) => ({
      id: true,
      name: true,

      filter: e.op('not', e.op('exists', presentation.model))
    }));

    const result = await query.run(fastify.edgedb);

    reply.send(result);
  });

  /** Get a specific presentation data */
  server.get<{Params: ID}>('/presentation/:id',{
    schema: {
      params: idSchema
    },
    onRequest: fastify.auth([
      fastify.handleAuth,
      hasPerms(['PERM_USER'])
    ])
  }, async (request, reply) => {

    // Bad but the typing is broken for some reason
    const id = request.params.id;

    reply.send(await getPresentation(fastify, id, request.userId));
  });

    

  /** Get the presentation, from the id */
  async function getPresentation(fastify: FastifyInstance, presentationId: string, owner: string | undefined = undefined): Promise<Presentation | null> {
    console.log("get presentation")
    const presentationUuid = e.uuid(presentationId);

    const queryDevices = e.select(e.PresentationDevice, (device) => ({
      id: true,
      imagePath: true,
      x: true,
      y: true,
      z: true,
      yaw: true,
      pitch: true,
      roll: true,

      device : {
        id: true,
        name: true,
        filePath: true
      },

      filter: e.op(device.presentation.id, '=', presentationUuid)
    }));


    const queryLights = e.select(e.PresentationLight, (light) => ({
      id: true,
      lightType: true,
      x: true,
      y: true,
      z: true,
      yaw: true,
      pitch: true,
      roll: true,

      filter: e.op(light.presentation.id, '=', presentationUuid)
    }));

    // Filter with the owner if necessary.
    const queryBasePresentation = e.assert_single(e.select(e.Presentation, (presentation) => ({
      id: true,
      name: true,
      devices: queryDevices,
      lights: queryLights,

      filter: (owner ?
        e.op(e.op(presentation.owner.id, '=', e.uuid((owner))), 'and', e.op(presentation.id, '=', presentationUuid))
        : e.op(presentation.id, '=', presentationUuid))
    }))); 

    const result = await queryBasePresentation.run(fastify.edgedb);
    console.log(result);
    if(!result)
      throw new Error("No result ! Probably no permission to access the data");
      
    return result;
  }

  /** Create one presentation, from an existing one */
  server.post<{Body: ID }>('/presentation', {
    schema: {
      body: idSchema
    },
    onRequest: fastify.auth([
      fastify.handleAuth,
      hasPerms(['PERM_USER'])
    ])
  }, async (request, reply) => {
    //TODO THIS IS UNOPTIMIZED !
    const props = request.body;
    
    const modelPresentation = await getPresentation(fastify, props.id);
    const insertQuery = e.insert(e.Presentation, {
      name: 'Untitled query',
      owner: e.select(e.User, (presentation) => ({
        id: true,

        filter_single: {id: request.userId}
      })),

      model: e.select(e.Presentation, (presentation) => ({
        filter_single: {id: e.uuid(modelPresentation!.id)}
      }))
    });

    const insertedPresentation = await insertQuery.run(fastify.edgedb);

    const insertLightQuery = e.params({items: e.json}, (params) => {
      return e.for(e.json_array_unpack(params.items), (item) => {
        return e.insert(e.PresentationLight, {
          presentation: e.select(e.Presentation, (presentation) => ({
            filter_single: {id: insertedPresentation.id}
          })),
          lightType: e.cast(e.LightType, item.lightType),
          x: e.cast(e.float64, item.x),
          y: e.cast(e.float64, item.y),
          z: e.cast(e.float64, item.z),
          roll: e.cast(e.float64, item.roll),
          pitch: e.cast(e.float64, item.pitch),
          yaw: e.cast(e.float64, item.yaw),
        })
      })
    });

    const insertDeviceQuery = e.params({items: e.json}, (params) => {
      return e.for(e.json_array_unpack(params.items), (item) => {
        return e.insert(e.PresentationDevice, {
          presentation: e.select(e.Presentation, (presentation) => ({
            filter_single: {id: insertedPresentation.id}
          })),
          
          device: e.select(e.Device, (device) => ({
            filter_single: {id: e.cast(e.uuid, item.device.id)}
          })),
          imagePath: e.str(''),
          x: e.cast(e.float64, item.x),
          y: e.cast(e.float64, item.y),
          z: e.cast(e.float64, item.z),
          roll: e.cast(e.float64, item.roll),
          pitch: e.cast(e.float64, item.pitch),
          yaw: e.cast(e.float64, item.yaw),
        })
      })
    });

    const results = await Promise.all([
      insertDeviceQuery.run(fastify.edgedb, {items: modelPresentation!.devices}),
      insertLightQuery.run(fastify.edgedb, {items: modelPresentation!.lights})]);

    reply.send(insertedPresentation.id);

    });

  /** Save the current presentation edited by a user */
  server.put<{ Body: Presentation, Params: ID }>('/presentation/:id', {
    onRequest: fastify.auth([
      fastify.handleAuth,
      hasPerms(['PERM_USER'])
    ])
  }, async (request, reply) => {
    // TODO unoptimized !
    const updateQuery = e.update(e.Presentation, (presentation) => ({
      filter_single: {id: e.uuid(request.body.id)},
      set: {
        name: request.body.name
      }
    }));

    const updateDeviceQuery = e.params({items: e.json}, (params) => {
      return e.for(e.json_array_unpack(params.items), (item) => {
        return e.update(e.PresentationDevice, (presentation) => ({
          filter_single: {id: e.cast(e.uuid, item.id)},
          set: {
            imagePath: e.cast(e.str, item.imagePath),
            x: e.cast(e.float64, item.x),
            y: e.cast(e.float64, item.y),
            z: e.cast(e.float64, item.z),
            roll: e.cast(e.float64, item.roll),
            pitch: e.cast(e.float64, item.pitch),
            yaw: e.cast(e.float64, item.yaw),
          }
        }))
      })
    });

    const updateLightQuery = e.params({items: e.json}, (params) => {
      return e.for(e.json_array_unpack(params.items), (item) => {
        return e.update(e.PresentationDevice, (presentation) => ({
          filter_single: {id: e.cast(e.uuid, item.id)},
          set: {
            lightType: e.cast(e.LightType, item.lightType),
            x: e.cast(e.float64, item.x),
            y: e.cast(e.float64, item.y),
            z: e.cast(e.float64, item.z),
            roll: e.cast(e.float64, item.roll),
            pitch: e.cast(e.float64, item.pitch),
            yaw: e.cast(e.float64, item.yaw),
          }
        }))
      })
    });

    const results = await Promise.all([
      updateQuery.run(fastify.edgedb),
      updateDeviceQuery.run(fastify.edgedb, {items: request.body.devices}),
      updateLightQuery.run(fastify.edgedb, {items: request.body.lights})]);

      return {};
  });
  
  server.delete<{ Params: ID }>('/presentation/:id', {
    schema: {
      params: idSchema
    },
    onRequest: fastify.auth([
      fastify.handleAuth,
      hasPerms(['PERM_USER'])
    ])
  }, async (request, reply) => {

    // FIXME permissions are broken in this entire file acutally
    const deleteQuery = e.delete(e.Presentation, (presentation) => ({
      filter_single: {id: e.uuid(request.params.id)}
    }));

    const result = await deleteQuery.run(fastify.edgedb);

    if(!result)
      throw new Error('Error on deletion ! Does the id exists !');
  });
  
}
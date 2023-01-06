import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyPluginCallback } from "fastify";
import { hasPerms } from "./auth/authentication";
import multipart from '@fastify/multipart';
import { timeStamp } from "console";
import e from '../dbschema'
import { ID, idSchema } from "../schema/presentation";
import { UserImage, userImageSchema } from "../schema/user-images";



const USER_IMAGES_BUCKET = 'user-images';


export const routes: FastifyPluginCallback = async (fastify, opts) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();
  
  server.get<{Params: ID}>('/presentation/device/:id/image', {
    onRequest: fastify.auth([
      fastify.handleAuth,
      hasPerms(['PERM_USER'])
    ]),
    schema: {
      params: idSchema,
      response: {
        '2xx': userImageSchema
      }
    }
  }, async (request, reply) => {
    const uuid = e.uuid(request.params.id);

    // Getting the imagePath also acts as a check for access
    const query = e.select(e.PresentationDevice, (device) => ({
      id: true,
      imagePath: true,
      filter_single: {id: uuid}
    }));

    const result = await query.run(server.edgedb);

    // Verify access
    if(!result){
      reply.statusCode = 403;
      return reply.send();
    }
    
    if(!result.imagePath){
      reply.statusCode = 404;
      return reply.send();
    }
    
    const image = await server.S3.getObject({
      Bucket: USER_IMAGES_BUCKET,
      Key: result.id!,
      ResponseContentType: 'text/plain'
    });
    
    reply.header('Content-Type', 'application/octet-stream');
    return reply.send(await image.Body!.transformToString());
  });



  server.post<{Params: ID, Body: UserImage}>('/presentation/device/:id/image', {
    onRequest: fastify.auth([
      fastify.handleAuth,
      hasPerms(['PERM_USER'])
    ]),
    schema: {
      params: idSchema,
      body: userImageSchema
    }
  }, async (request, reply) => {
    
    const uuid = request.params.id; 
    const imageData = request.body.imageData;

    // Test Whether the access to resource is authorized
    const deviceQuery = e.assert_single(e.select(e.PresentationDevice, (device) => ({
      filter: e.op(
        e.op(device.presentation.owner.id, '=', e.uuid(request.userId)),
        'and',
        e.op(device.id, '=', e.uuid(uuid)))
    })));

    const result = await deviceQuery.run(server.edgedb);

    if(!result){
      reply.statusCode = 403;
      return reply.send();
    }

    // Upload the file, without caring about its content.
    await server.S3.putObject({
      Key: uuid,
      Body: imageData,
      Bucket: 'user-images',
      ContentType: 'text/plain'
    });
    
    const updateDeviceQuery = e.update(e.PresentationDevice, (device) => ({
      filter_single: {id: e.uuid(uuid)},
      set : { imagePath: '/presentation/device/:id/image' }
    }));
    
    const updateResult = await updateDeviceQuery.run(server.edgedb);

    reply.send({});
  })
}

export default routes;

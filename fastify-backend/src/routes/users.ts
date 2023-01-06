import { FastifyPluginCallback } from "fastify";
import e from '../dbschema'
import { handleAuth, hasPerms } from "./auth/authentication";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { ID, idSchema } from "../schema/presentation";
import { Permissions, permissionsSchema, userMetadataSchema, userSchema } from "../schema/users";
import { Static, Type } from "@sinclair/typebox";
import { Pagination, paginationSchema } from "../schema/parts/pagination";


export const routes: FastifyPluginCallback = async (fastify, opts) => {
  console.log('Adding users routes');
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  /** Get your own user info */
  server.get('/user', {
    onRequest: fastify.auth([
      fastify.handleAuth,
      hasPerms(['PERM_USER'])
    ]),
    schema: {
      response: {
        '2xx': userSchema
      }
    }
  }, async (request, reply) => {
    const userQuery = e.select(e.User, user => ({
      filter_single: {id: request.userId},
      ...e.User['*']  // Alias for all properties
    }));
    const result = await userQuery.run(server.edgedb);

    if(!result){
      reply.statusCode = 404;
      reply.send({});
      return;
    }

    reply.send(result)
  });

  /** Get all users */
  server.get<{Params: Pagination}>('/users', {
    onRequest: fastify.auth([
      fastify.handleAuth,
      hasPerms(['PERM_ADMIN'])
    ]),
    schema: {
      params: paginationSchema,
      response: {
        200: Type.Array(userSchema)
      }
    }
  }, async (request, reply) => {
    const queryUsers = e.select(e.User, (user) => ({
      id: true,
      email: true,
      permissions: true,

      limit: request.params.limit,
      offset: request.params.offset
    }));

    const users = await queryUsers.run(fastify.edgedb);

    reply.send(users);
  });

  /** Get user metadata */
  fastify.get('/users-meta', {
    onRequest: fastify.auth([
      fastify.handleAuth,
      hasPerms(['PERM_ADMIN'])
    ]),
    schema: {
      response: {
        '2xx': userMetadataSchema
      }
    }
  },async (request, reply) => {
    const countQuery = e.count(e.select(e.User, user => ({})));
    
    const result = await countQuery.run(server.edgedb);

    reply.send({
      count: result
    });
  });

  /** Create a new user with the default permission level */
  server.put('/users', {
    onRequest: fastify.auth([
      fastify.handleAuth
    ]),
    schema: {
      response: {
        '2xx': Type.Union([idSchema, Type.Null()])
      }
    }
  }, async (request, reply) => {

    const query =  e.insert(e.User, {
      email: request.userEmail,
      permissions: ['PERM_USER']
    }).unlessConflict();

    const result = await query.run(fastify.edgedb);

    reply.statusCode = 201;
    reply.send(result);
  });

  /** Remove an existing user */
  server.delete<{Params: ID}>('/user/:id', {
    schema: idSchema,
    onRequest: fastify.auth([
      handleAuth,
      hasPerms(['PERM_ADMIN'])
    ])
  }, async (request, reply) => {
    
    // Pull the user out of the db, the schema handles cascade deletion
    const deleteQuery = e.delete(e.User, user => ({
      filter_single: {id: e.uuid(request.params.id)}
    }));

    const result = await deleteQuery.run(fastify.edgedb);
    
    if(!result)
      throw new Error('Error on deletion ! Does the user exists ?');
      

      reply.send({});
  });

  /** Replace the permission list of a user */
  server.patch<{Params: ID, Body: Permissions }>('/user/:id/permissions', {
    onRequest: fastify.auth([
      fastify.handleAuth,
      hasPerms(['PERM_ADMIN'])
    ]),

    schema: {
      body: permissionsSchema
    }
  },async (request, reply) => {
    const query = e.update(e.User, user => ({
      filter_single: {id: e.uuid(request.params.id)},
      set: {
        permissions: request.body
      }
    }));

    const result = await query.run(server.edgedb);

    return result;
  })
}
import { FastifyPluginCallback } from "fastify";
import e from '../dbschema'
import { handleAuth, hasPerms } from "./auth/authentication";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { ID, idSchema } from "../schema/presentation";


export const routes: FastifyPluginCallback = async (fastify, opts) => {
  console.log('Adding users routes');
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  /** Get all users */
  fastify.get('/users', {
    onRequest: fastify.auth([
      fastify.handleAuth,
      hasPerms(['PERM_ADMIN'])
    ])
  }, async (request, reply) => {
    const queryUsers = e.select(e.User, (user) => ({
      id: true,
      email: true,
      permissions: true
    }));

    const users = await queryUsers.run(fastify.edgedb);

    return users;
  })


  fastify.post('/users', {
    onRequest: fastify.auth([
      fastify.handleAuth
    ])
  }, async (request, reply) => {

    const query = e.insert(e.User, {
      email: request.userEmail,
      permissions: ['PERM_USER']
    });

    const result = await query.run(fastify.edgedb);

    reply.send(result);
  });

  server.delete<{Params: ID}>('/user/:id', {
    schema: idSchema,
    onRequest: fastify.auth([
      handleAuth,
      hasPerms(['PERM_USER'])
    ])
  },async (request, reply) => {
    
    // Pull the user out of the db, the schema handles cascade deletion
    const deleteQuery = e.delete(e.User, user => ({
      filter_single: {id: e.uuid(request.params.id)}
    }));

    const result = await deleteQuery.run(fastify.edgedb);
    
    if(!result)
      throw new Error('Error on deletion ! Does the user exists ?');
      

      reply.send({});
  });
}
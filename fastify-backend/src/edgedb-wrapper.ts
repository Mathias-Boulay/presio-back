import { FastifyInstance } from 'fastify'
import { edgedb } from './dbschema/imports'

/**
 * Wrapper file to decorate fastify with an edgedb instance
 */

// Declare the additional request property
declare module 'fastify' {

  export interface FastifyInstance {
    edgedb: edgedb.Client
  }
}

export async function decorateInstanceEdge(fastify: FastifyInstance){
  fastify.decorate('edgedb', edgedb.createClient({ 
      tlsSecurity: 'insecure',
      host:'edgedb',
      port: 5656
    })
  );
}
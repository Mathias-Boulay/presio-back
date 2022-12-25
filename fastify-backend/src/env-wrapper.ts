import { FastifyInstance } from "fastify"
import fastifyEnv from "@fastify/env"

declare module 'fastify' {
  interface FastifyInstance {
    env: { // this should be same as the confKey in options
      GOOGLE_AUTH_ID: string,
      GOOGLE_AUTH_SECRET: string,
      GOOGLE_AUTH_RETURN_URI: string,
    };
  }
}

const schema = {
  type: 'object',
  
  properties: {
    GOOGLE_AUTH_ID: { type: 'string'},
    GOOGLE_AUTH_SECRET: { type: 'string'},
    GOOGLE_AUTH_RETURN_URI: { type: 'string'},
  },

  required: [ 'GOOGLE_AUTH_ID', 'GOOGLE_AUTH_SECRET', 'GOOGLE_AUTH_RETURN_URI' ]
}

const options = {
  confKey: 'env', // optional, default: 'config'
  schema: schema,
}

/** Add env variables to the instance. Need to wait until the module is loaded */
export function decorateInstanceEnv(fastify: FastifyInstance){
  fastify.register(fastifyEnv, options);
}
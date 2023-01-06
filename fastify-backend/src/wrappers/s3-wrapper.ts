import { FastifyInstance } from "fastify";
import { S3 } from '@aws-sdk/client-s3'

/**
 * Wrapper file to decorate fastify with a S3 client instance
 */

// Declare the additional request property
declare module 'fastify' {
  export interface FastifyInstance {
    S3: S3
  }
}

export function decorateInstanceS3(fastify: FastifyInstance){
  fastify.decorate('S3', new S3({
    endpoint : `https://${fastify.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: fastify.env.CLOUDFLARE_R2_ACCESS_ID,
      secretAccessKey: fastify.env.CLOUDFLARE_R2_ACCESS_KEY
    },
    region: 'us-east-1'  // Alias to auto on cloudflare
  }));
}
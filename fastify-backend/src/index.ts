import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyAuth from '@fastify/auth'
import * as edgedb from "edgedb";
import e from './dbschema'
import { decorateInstance as decorateInstanceAuth} from './routes/auth/authentication';
import { decorateInstanceEdge } from './wrappers/edgedb-wrapper';
import { routes as userRoutes } from './routes/users'
import { routes as presentationRoutes } from './routes/presentations'
import { routes as userImageRoutes } from './routes/user-images';
import { Presentation } from './dbschema/modules/default';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { decorateInstanceEnv } from './wrappers/env-wrapper';
import { decorateInstanceS3 } from './wrappers/s3-wrapper';
import multipart from '@fastify/multipart';


export const fastifyInstance = Fastify().withTypeProvider<TypeBoxTypeProvider>();

decorateInstanceEnv(fastifyInstance);
await fastifyInstance.after();  // Ensure env is loaded

decorateInstanceAuth(fastifyInstance);
decorateInstanceEdge(fastifyInstance);
decorateInstanceS3(fastifyInstance);

fastifyInstance
  .register(cors)
  .register(fastifyAuth, {
    defaultRelation: 'and'
  })
  .register(multipart, {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 100,     // Max field value size in bytes
      fields: 10,         // Max number of non-file fields
      fileSize: 1_000_000,    // For multipart forms, the max file size in bytes
      files: 1,           // Max number of file fields
      headerPairs: 10     // Max number of header key=>value pairs
    }
  });

// Load the plugins before defining routes
await fastifyInstance.after(); 


fastifyInstance
  .register(userRoutes)
  .register(presentationRoutes)
  .register(userImageRoutes);

// Bad, but good enough for development purposes
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let test: any;
setTimeout(async () => {
  const dbInstance = edgedb.createClient({ 
    tlsSecurity: 'insecure',
    host:'edgedb',
    port: 5656
  });
  
  test = await dbInstance.query(`select "Hello world"`); 
  
  console.log(test); 

  // Test query builder
  const query = e.select(e.User, (user) => ({
    id: true,
    email: true,
  }));

  const result = await query.run(dbInstance);


  console.log(result);
  
}, 20000)



fastifyInstance.get('/ping', async (request, reply) => {
  return `${test}\n`
})

fastifyInstance.after()

fastifyInstance.listen({ port: 8080, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`) 
}) 
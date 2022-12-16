import fastify from 'fastify'
import * as edgedb from "edgedb";
import e from './dbschema'

const server = fastify();

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


server.get('/ping', async (request, reply) => {
  return `${test}\n`
})

server.listen({ port: 8080, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`) 
}) 
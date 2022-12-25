import fastifyAuth, {FastifyAuthFunction} from '@fastify/auth';
import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { GoogleAuth } from 'google-auth-library';
import { fastifyInstance } from '../..';
import e from '../../dbschema';
import { UserPermission } from '../../dbschema/interfaces';


import { getClient, googleCheck } from './google_auth';

// Declare the additional request property
declare module 'fastify' {
  export interface FastifyRequest {
    /** Authenticated user id, filled when permission checking is done */
    userId: string;

    /** Authenticated user email, defined when 'handleAuth' is used */
    userEmail: string;
  }

  export interface FastifyInstance {
    handleAuth: FastifyAuthFunction;
  }
}

/** Function querying the identity provider, return the email if successful, undefined otherwise */
export type IdentityCheckerFunction = (token: string) => Promise<string | undefined>;

/** Decorates the request with the user email we want */
export function decorateInstance(fastify: FastifyInstance){
  fastify.decorate('handleAuth', handleAuth);
  fastify.decorateRequest('userEmail', '');

  getClient(fastify);
}

/** Check whether a user is connected, called by on route */
export const handleAuth: FastifyAuthFunction = async (request, reply) => {
  const authMode = request.headers['x-authmode'];
  if(!authMode || typeof authMode !== 'string'){
    throw new Error("No auth mode specified");
  }

  const tokenHeader = request.headers.authorization;
  if(!tokenHeader){
    throw new Error("Invalid login");
  }

  // FIXME poor verification of input
  const token = tokenHeader.split(' ')[1];

  const email = await dispatchAuthCheck(token, authMode);
  if(email){
    request.userEmail = email;
    return;
  }
  
  // Failure
  throw new Error("Invalid login");
} 

/** Dispatch the auth to the proper Identity Provider. Return the email if successful */
async function dispatchAuthCheck(token: string, authMode: string): Promise<string  | undefined> {
  switch(authMode){
    case 'GOOGLE': return await googleCheck(token);
  }
  
  return undefined;
}

/** Creates a closure which verifies whether the user has said permission level  */
export function hasPerms(requestedPermissions: UserPermission[]): FastifyAuthFunction {
  const hasPermsClosure: FastifyAuthFunction = async (request, reply) => {
    // TODO can be optimized as a query
    const query = e.select(e.User, (user) => ({
      id: true,
      permissions: true,
      filter_single: {email: request.userEmail}
    }));

    const user = await query.run(fastifyInstance.edgedb);
    if(!user)
      throw new Error("No permissions !")
    
    for (const permission of user.permissions) {
      if(requestedPermissions.includes(permission)){
        request.userId = user.id;
        return;
      }
    }

    throw new Error("No permissions !");
  }
  
  return hasPermsClosure;
}

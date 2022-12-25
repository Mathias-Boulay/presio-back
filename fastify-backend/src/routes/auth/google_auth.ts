import { FastifyInstance } from "fastify";
import { OAuth2Client } from "google-auth-library";
import { userInfo } from "os";
import { IdentityCheckerFunction } from "./authentication";

let client: OAuth2Client;

export const googleCheck: IdentityCheckerFunction = async (token) => {
  try {
    client.setCredentials({ access_token: token })
    const userinfo = await client.request<{email:string}>({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });

    console.log(userInfo);
    return userinfo.data.email;

  } catch(error) {

    console.error("Issue with login !");
    console.error(error);
  }

  return undefined;
}

/** Initialize clients from env. Requires the env module to be loaded */
export function getClient(fastify: FastifyInstance): OAuth2Client{
  if(!client)
    client = new OAuth2Client(
      {
        clientId: fastify.env.GOOGLE_AUTH_ID,
        clientSecret: fastify.env.GOOGLE_AUTH_SECRET,
        redirectUri: fastify.env.GOOGLE_AUTH_RETURN_URI
      }
    )

  return client;
}

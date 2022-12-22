import { OAuth2Client } from "google-auth-library";
import { IdentityCheckerFunction } from "./authentication";

const client = new OAuth2Client('266772770444-37sihfe16m1365gu6es3l6fa86c70u10.apps.googleusercontent.com');


export const googleCheck: IdentityCheckerFunction = async (token) =>{
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '266772770444-37sihfe16m1365gu6es3l6fa86c70u10.apps.googleusercontent.com'
    });

    return ticket.getPayload()?.email;
  } catch (error) {
    console.log(error);
  }

  return undefined;
}

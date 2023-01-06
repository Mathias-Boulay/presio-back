import { Static, Type } from "@sinclair/typebox";

export const userImageSchema =  Type.Object({
  imageData: Type.String()
});

export type UserImage = Static<typeof userImageSchema>;
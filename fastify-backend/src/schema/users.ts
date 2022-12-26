import { Static, Type } from "@sinclair/typebox";
import { type } from "os";


export const permissionSchema = Type.Union([
  Type.Literal('PERM_USER'),
  Type.Literal('PERM_ADMIN')
]);

export const permissionsSchema = Type.Array(permissionSchema);



export type permissions = Static<typeof permissionsSchema>;
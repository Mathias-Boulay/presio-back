import { Static, Type } from "@sinclair/typebox";
import { type } from "os";


export const permissionSchema = Type.Union([
  Type.Literal('PERM_USER'),
  Type.Literal('PERM_ADMIN')
]);

export const permissionsSchema = Type.Array(permissionSchema);

export const userSchema = Type.Object({
  id: Type.String(),
  email: Type.String({format: 'email'}),
  permissions: permissionsSchema
});

export type Permissions = Static<typeof permissionsSchema>;
export type User = Static<typeof userSchema>;

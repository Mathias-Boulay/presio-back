import { Static, Type, TSchema } from '@sinclair/typebox'
import { type } from 'os';
// Dumb fastify issue: having to specify both schema and interface manually
const Nullable = <T extends TSchema>(type: T) => Type.Optional(Type.Union([type, Type.Null()]))

function StringEnum<T extends string[]>(values: [...T]) {
  return Type.Unsafe<T[number]>({ type: 'string', enum: values })
}

/** Schema version */
export const idSchema = Type.Object({ id: Type.String() });
export const optionalIdSchema = Type.Optional(idSchema);

export const positionSchema = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
  z: Type.Number(),
});

export const rotationSchema = Type.Object({
  roll: Type.Number(),
  pitch: Type.Number(),
  yaw: Type.Number(),
});

export const deviceSchema = Type.Intersect([
  idSchema,
  Type.Object({
    name: Type.String(),
    filePath: Type.String()
  })
]);

export const devicePresentationSchema = Type.Intersect([
  idSchema,
  positionSchema,
  rotationSchema,
  Type.Object({
    device: deviceSchema,
    imagePath: Nullable(Type.String())
  })
]);

export const lightTypeSchema = StringEnum(["AMBIANT", "POINT"]);

export const lightPresentationSchema = Type.Intersect([
  idSchema,
  positionSchema,
  rotationSchema,
  Type.Object({
    lightType: lightTypeSchema
  })
])

export const presentationSchema = Type.Intersect([
  idSchema,
  Type.Object({
    name: Type.String(),
    devices: Type.Array(devicePresentationSchema),
    lights: Type.Array(lightPresentationSchema)
  })
])

export type ID = Static<typeof idSchema>;
export type Position = Static<typeof positionSchema>;
export type Rotation = Static<typeof rotationSchema>;
export type Device = Static<typeof deviceSchema>;
export type LightType = Static<typeof lightTypeSchema>;
export type LightPresentation = Static<typeof lightPresentationSchema>;
export type DevicePresentation = Static<typeof devicePresentationSchema>;
export type Presentation = Static<typeof presentationSchema>;





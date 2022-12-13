CREATE TYPE "permissions" AS ENUM (
  'PERM_ADMIN',
  'PERM_USER'
);

CREATE TYPE "light_type" AS ENUM (
  'AMBIANT',
  'POINT'
);

CREATE TABLE "USER" (
  "id" int PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL
);

CREATE TABLE "USER_PERMISIONS" (
  "userId" int,
  "permission" permissions,
  PRIMARY KEY ("userId", "permission")
);

CREATE TABLE "PRESENTATION" (
  "id" int PRIMARY KEY,
  "name" varchar NOT NULL,
  "modelId" int
);

CREATE TABLE "DEVICES" (
  "id" int PRIMARY KEY,
  "name" varchar NOT NULL,
  "filePath" varchar NOT NULL
);

CREATE TABLE "PRESENTATION_DEVICES" (
  "id" int,
  "presentationId" int,
  "deviceId" int,
  "imageId" int,
  "x" float4 NOT NULL DEFAULT 0,
  "y" float4 NOT NULL DEFAULT 0,
  "z" float4 NOT NULL DEFAULT 0,
  "roll" float4 NOT NULL DEFAULT 0,
  "pitch" float4 NOT NULL DEFAULT 0,
  "yaw" float4 NOT NULL DEFAULT 0,
  PRIMARY KEY ("id", "presentationId", "deviceId")
);

CREATE TABLE "PRESENTATION_LIGHTS" (
  "id" int PRIMARY KEY,
  "presentationId" int NOT NULL,
  "type" LIGHT_TYPE,
  "x" float4 NOT NULL DEFAULT 0,
  "y" float4 NOT NULL DEFAULT 0,
  "z" float4 NOT NULL DEFAULT 0,
  "roll" float4 NOT NULL DEFAULT 0,
  "pitch" float4 NOT NULL DEFAULT 0,
  "yaw" float4 NOT NULL DEFAULT 0
);

CREATE TABLE "USER_PRESENTATION" (
  "userId" int NOT NULL,
  "presentationId" int NOT NULL,
  PRIMARY KEY ("userId", "presentationId")
);

CREATE TABLE "PRESENTATION_IMAGE" (
  "id" int PRIMARY KEY,
  "presentationId" int NOT NULL,
  "path" varchar NOT NULL
);

COMMENT ON COLUMN "DEVICES"."filePath" IS 'Path to the model files';

COMMENT ON COLUMN "USER_PRESENTATION"."userId" IS 'Data applying modifiers to the model presentation';

COMMENT ON COLUMN "USER_PRESENTATION"."presentationId" IS 'The base presentation';

COMMENT ON COLUMN "PRESENTATION_IMAGE"."path" IS 'Either a relative url for a file or a full one for iframes';

ALTER TABLE "USER_PERMISIONS" ADD FOREIGN KEY ("userId") REFERENCES "USER" ("id");

ALTER TABLE "USER_PRESENTATION" ADD FOREIGN KEY ("userId") REFERENCES "USER" ("id");

ALTER TABLE "USER_PRESENTATION" ADD FOREIGN KEY ("presentationId") REFERENCES "PRESENTATION" ("id");

ALTER TABLE "PRESENTATION_DEVICES" ADD FOREIGN KEY ("presentationId") REFERENCES "PRESENTATION" ("id");

ALTER TABLE "PRESENTATION_LIGHTS" ADD FOREIGN KEY ("presentationId") REFERENCES "PRESENTATION" ("id");

ALTER TABLE "PRESENTATION_DEVICES" ADD FOREIGN KEY ("deviceId") REFERENCES "DEVICES" ("id");

ALTER TABLE "PRESENTATION_DEVICES" ADD FOREIGN KEY ("imageId") REFERENCES "PRESENTATION_IMAGE" ("id");

ALTER TABLE "PRESENTATION" ADD FOREIGN KEY ("modelId") REFERENCES "PRESENTATION" ("id");

ALTER TABLE "PRESENTATION_IMAGE" ADD FOREIGN KEY ("presentationId") REFERENCES "PRESENTATION" ("id");
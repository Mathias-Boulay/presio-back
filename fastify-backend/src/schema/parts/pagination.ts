import { Static, Type } from "@sinclair/typebox";

/** Schema part: describe pagination parameters */
export const paginationSchema = Type.Object({
  limit: Type.Number({ minimum: 1, maximum: 20, default: 10}),
  offset: Type.Number({ minimum: 0, default: 0})
});

export type Pagination = Static<typeof paginationSchema>;




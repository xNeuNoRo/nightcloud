import { z } from "zod";

// Schema para respuestas estandarizadas de la API
export const apiResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object().or(z.array(z.any())).optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
  errors: z
    .array(
      z.object({
        type: z.string(),
        msg: z.string(),
        value: z.string(),
        path: z.string().optional(),
        location: z.string().optional(),
      })
    )
    .optional(),
});

export const nodeSchema = z.object({
  id: z.uuidv4(),
  parentId: z.uuid().nullable(),
  name: z.string().min(1).max(250),
  size: z.string(),
  mime: z.string(),
  isDir: z.boolean(),
});
export const nodesSchema = z.array(nodeSchema);

export type ApiResponseType = z.infer<typeof apiResponseSchema>;
export type NodeType = z.infer<typeof nodeSchema>;

import { z } from "zod";

// Schema para respuestas estandarizadas de la API
export const apiResponseSchema = z.object({
  ok: z.boolean(),
  data: z
    .union([z.record(z.any(), z.any()), z.array(z.record(z.any(), z.any()))])
    .optional(),
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

// Schema para ancestros de un nodo
export const ancestorSchema = z.object({
  id: z.uuidv4(),
  parentId: z.uuid().nullable(),
  name: z.string().min(1).max(250),
  size: z.string(),
  mime: z.string(),
  isDir: z.boolean(),
  depth: z.number().min(0),
});

// Schema para una lista de ancestros
export const ancestorsSchema = z.array(ancestorSchema);

// Schema para un nodo completo
export const nodeSchema = ancestorSchema
  .extend({
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .omit({ depth: true });

// Schema para una lista de nodos
export const nodesSchema = z.array(nodeSchema);

export type ApiResponseType = z.infer<typeof apiResponseSchema>;
export type NodeType = z.infer<typeof nodeSchema>;
export type AncestorType = z.infer<typeof ancestorSchema>;

// Tipo para el formulario de creación de carpetas
export type NodeFolderFormData = Pick<NodeType, "name">;

export type UploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};
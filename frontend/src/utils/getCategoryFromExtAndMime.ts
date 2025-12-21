import mimeTypes from "mime-types";
import { FileCategory } from "@/data/fileCategories";
import { extToCategory } from "@/data/extCategories";
import { extCatOverride } from "@/data/extCategoriesOverrides";

export function getCategoryFromMime(mime: string): FileCategory {
  if (!mime) return FileCategory.Unknown;

  // Obtenemos la extensión a partir del MIME si está disponible
  const ext = mimeTypes.extension(mime);

  // Si no se pudo obtener la extensión, devolvemos Unknown
  if (!ext) return FileCategory.Unknown;

  // Normalizamos la extensión a minúsculas
  const normalizedExt = ext.toLowerCase();

  // Obtenemos la categoría base a partir de la extensión
  const base = extToCategory[normalizedExt] ?? FileCategory.Unknown;

  // Comprobamos si hay una anulación específica para esta extensión y MIME
  const override = extCatOverride[normalizedExt];

  console.log(mime);
  // Devolvemos la categoría anulada si existe, o la base en caso contrario
  return override?.[mime] ?? base;
}

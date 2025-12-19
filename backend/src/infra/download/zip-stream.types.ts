import type { Response } from "express";

// ZipDirType representa un directorio en el zip
type ZipDirType = {
  isDir: true; // Indica que es un directorio
  relativePath: string; // Ruta relativa dentro del zip. Ej: "folder/subfolder/"
};

type ZipFileType = {
  isDir: false; // Indica que es un archivo
  relativePath: string; // Ruta relativa dentro del zip. Ej: "folder/file.txt"
  physicalPath: string; // Ruta física en el sistema de archivos. Ej: "/cloud/0e49294b62.pdf"
};

// ZipEntryType representa una entrada en el zip, que puede ser un archivo o un directorio
export type ZipEntryType = ZipDirType | ZipFileType;

export type ZipStreamDirInput = {
  res: Response; // Respuesta HTTP para enviar el stream del zip
  zipName: string; // Nombre del archivo zip a descargar
  entries: Generator<ZipEntryType>; // Generador de entradas del zip
  options?: {
    level?: number; // Nivel de compresión (0-9)
  };
};

import archiver from "archiver";
import fs from "node:fs";

import { AppError } from "@/utils";

import type { ZipStreamDirInput } from "./zip-stream.types";

/**
 * @description Genera un stream ZIP de un directorio y lo envía en la respuesta HTTP.
 * @param input Parámetros para generar el ZIP y enviarlo
 */
export async function zipStreamDirectory(
  input: ZipStreamDirInput,
): Promise<void> {
  const { res, zipName, entries, options } = input;
  try {
    // Inicializamos archiver
    const archive = archiver("zip", {
      zlib: {
        level: options?.level ?? 3, // Nivel de compresión (0-9)
      },
    });

    // Establecemos los headers
    res.attachment(zipName); // Nombre del archivo zip
    res.setHeader("Content-Type", "application/zip"); // Tipo de contenido

    // Si el cliente cierra la conexión ya sea por que cancelo la descarga o perdida de conexión
    res.on("close", () => {
      // Abortar la creación del ZIP si no ha finalizado
      if (!archive.destroyed) {
        archive.abort();
      }
    });

    const streamPromise = new Promise<void>((resolve, reject) => {
      // Funcion de limpieza de listeners
      const cleanup = () => {
        archive.off("error", onError);
        archive.off("end", onEnd);
      };

      // Funcion de manejo de errores
      const onError = () => {
        cleanup(); // Limpiar listeners
        if (res.headersSent) {
          res.end();
          return resolve();
        }
        reject(new AppError("INTERNAL", "Error al descargar el directorio"));
      };

      // Funcion al finalizar el stream
      const onEnd = () => {
        cleanup(); // Limpiar listeners
        resolve(); // Resolver la promesa para salir de la funcion
      };

      // Registrar listeners
      archive.on("error", onError);
      archive.on("end", onEnd); // Al finalizar el stream se finalizara esta promise
    });

    // Conectar el Readable Stream (archive) al Writable Stream de la respuesta HTTP mediante un pipeline
    archive.pipe(res);

    // Agregar entradas al ZIP
    for (const entry of entries) {
      // Si es un directorio
      if (entry.isDir) {
        // Agregamos la carpeta vacía para asegurar que exista en el ZIP
        archive.append(Buffer.from(""), { name: entry.relativePath + "/" });
      } else {
        // Si es un archivo, creamos un Readable Stream desde el sistema de archivos
        const fileStream = fs
          .createReadStream(entry.physicalPath) // Ruta física del archivo
          .on("error", (err) => {
            // Manejo de errores al leer el archivo
            console.error(
              `Error al leer el archivo ${entry.physicalPath}:`,
              err,
            );

            // Si el stream no ha sido destruido, emitimos un error en el archive
            if (!archive.destroyed) {
              console.error(
                `Ocurrio un error leyendo el archivo en la ruta: ${entry.physicalPath}`,
              );
              archive.emit(
                "error",
                new AppError(
                  "INTERNAL",
                  "Ha ocurrido un error al generar el ZIP, posiblemente haya un archivo corrupto.",
                ),
              );
            }
          });

        // Agregamos el archivo al ZIP con su ruta relativa
        archive.append(fileStream, { name: entry.relativePath });
      }
    }

    // Le decimos a archiver que hemos terminado de agregarle archivos/directorios al ZIP
    await archive.finalize();

    // Esperamos a que el stream termine o falle
    await streamPromise;
  } catch (err) {
    console.error("Error en zipStreamDirectory:", err);
    throw err;
  }
}

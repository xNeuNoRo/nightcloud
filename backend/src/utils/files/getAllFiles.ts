import path, { join } from "node:path";
import { readdir } from "node:fs/promises";

export default async function getAllFiles(dir: string|null, recursive: boolean) {
  // Obtenemos la carpeta root de la nube
  const rootPath = path.resolve(process.cwd(), `${process.env.CLOUD_ROOT}`);

  // Obtenemos la ruta a consultar en base a si dir es un string o null
  const dirPath = dir == null ? rootPath : path.resolve(rootPath, dir);

  // Obtenemos todos los archivos de la ruta final
  try {
    // To do: mejorar optimizacion...
    const files = await readdir(dirPath, { recursive, withFileTypes: true, });

    const result = files.map(file => {
      return {
        name: file.name,
        isDir: file.isDirectory(),
        ext: path.extname(file.name)
      }
    });
    
    return result;
  } catch (err) {
    console.error(err);
  }
}
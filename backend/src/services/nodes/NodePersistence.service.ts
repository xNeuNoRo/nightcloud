import path from "node:path";

import type { UploadedFile } from "@/domain/uploads/uploaded-file";
import { NodeRepository } from "@/repositories/NodeRepository";
import type { PrismaTxClient } from "@/types/prisma";

import { CloudStorageService } from "../cloud/CloudStorage.service";

/**
 * @description Servicio para persistir nodos en el almacenamiento y la base de datos.
 */
export class NodePersistenceService {
  private static readonly cloud = CloudStorageService;
  private static readonly repo = NodeRepository;

  /**
   * @description Persiste un nodo en el almacenamiento en la nube y en la base de datos.
   * @param file Archivo del nodo subido
   * @param parentId ID del nodo padre
   * @param nodeName Nombre del nodo
   * @param nodeHash Hash del nodo
   * @returns Nodo persistido
   */
  static async persist(
    file: UploadedFile,
    parentId: string | null,
    nodeName: string,
    nodeHash: string,
  ) {
    // Ruta final en el almacenamiento en la nube
    const finalPath = path.resolve(
      await this.cloud.getCloudRootPath(),
      nodeHash,
    );

    // Verificar si el archivo ya existe en el almacenamiento
    if (await this.cloud.fileExists(finalPath)) {
      // Eliminar el archivo temporal subido
      await this.cloud.delete(file.path);

      // Retornar el nodo existente o crear uno nuevo en la base de datos
      return (
        (await this.repo.findByHash(nodeHash)) ??
        this.repo.create({
          parent: parentId ? { connect: { id: parentId } } : undefined,
          name: nodeName,
          hash: nodeHash,
          size: file.size,
          mime: file.mimetype,
          isDir: false,
        })
      );
    }

    // Mover el archivo desde la ruta temporal a la ruta final en el almacenamiento
    await this.cloud.move(file.path, finalPath);

    // Crear y retornar el nodo en la base de datos
    return this.repo.create({
      parent: parentId ? { connect: { id: parentId } } : undefined,
      name: nodeName,
      hash: nodeHash,
      size: file.size,
      mime: file.mimetype,
      isDir: false,
    });
  }

  static async persistTx(
    tx: PrismaTxClient,
    file: UploadedFile,
    parentId: string | null,
    nodeName: string,
    nodeHash: string,
  ) {
    // Ruta final en el almacenamiento en la nube
    const finalPath = path.resolve(
      await this.cloud.getCloudRootPath(),
      nodeHash,
    );

    // Verificar si el archivo ya existe en el almacenamiento
    if (await this.cloud.fileExists(finalPath)) {
      // Eliminar el archivo temporal subido
      await this.cloud.delete(file.path);

      // Retornar el nodo existente o crear uno nuevo en la base de datos
      return (
        (await this.repo.findByHashTx(tx, nodeHash)) ??
        this.repo.createTx(tx, {
          parent: parentId ? { connect: { id: parentId } } : undefined,
          name: nodeName,
          hash: nodeHash,
          size: file.size,
          mime: file.mimetype,
          isDir: false,
        })
      );
    }

    // Mover el archivo desde la ruta temporal a la ruta final en el almacenamiento
    await this.cloud.move(file.path, finalPath);

    // Crear y retornar el nodo en la base de datos
    return this.repo.createTx(tx, {
      parent: parentId ? { connect: { id: parentId } } : undefined,
      name: nodeName,
      hash: nodeHash,
      size: file.size,
      mime: file.mimetype,
      isDir: false,
    });
  }
}

import path from "node:path";

import { buildConflictRegex } from "@/domain/nodes/conflicts/buildConflictRegex";
import { getNextName } from "@/domain/nodes/conflicts/getNextName";
import { computeNodeIdentity } from "@/domain/nodes/identity/computeNodeIdentity";
import type {
  DirectoryNode,
  FileNode,
  Node,
  NodeLite,
} from "@/domain/nodes/node";
import type { UploadedFile } from "@/domain/uploads/uploaded-file";
import { isDirectoryNode } from "@/infra/guards/node";
import { isUploadedFile } from "@/infra/guards/uploaded-file";
import { NodeRepository } from "@/repositories/NodeRepository";
import type { PrismaTxClient } from "@/types/prisma";
import { AppError, NodeUtils } from "@/utils";

import { CloudStorageService } from "../cloud/CloudStorage.service";

/**
 * @description Servicio para resolver identidades únicas de nodos.
 */
export class NodeIdentityService {
  private static readonly repo = NodeRepository;

  /**
   * @description Resuelve la identidad única de un nodo (nombre y hash) dentro de su carpeta padre.
   * @param node Nodo a resolver (puede ser un archivo subido o un nodo existente)
   * @param parentId ID del nodo padre donde se ubicará el nodo
   * @param params Parámetros adicionales (como un nuevo nombre propuesto)
   * @returns Objeto con el nombre y hash resueltos
   */
  static async resolve(
    node: UploadedFile | FileNode | DirectoryNode | NodeLite,
    parentId: string | null,
    params: { newName?: string } = {},
  ) {
    try {
      // Almacenamos la referencia al nombre original del nodo
      const originalNodeName = isUploadedFile(node)
        ? node.originalname
        : params.newName || node.name;

      // Ruta completa del nodo en el almacenamiento en la nube
      const nodePath = isUploadedFile(node)
        ? node.path
        : path.resolve(await CloudStorageService.getCloudRootPath(), node.hash);

      // Nombre del nodo resuelto (inicialmente el original)
      let nodeName = originalNodeName;

      // Generamos el hash del nodo basado en su identidad unica
      let nodeHash: string;
      if (isDirectoryNode(node)) {
        nodeHash = NodeUtils.genDirectoryHash(nodeName, parentId);
      } else {
        nodeHash = await NodeUtils.genFileHash(
          nodePath,
          computeNodeIdentity(nodeName, parentId).identityName,
        );
      }

      // Buscamos si ya existe un nodo con el mismo hash en la carpeta destino
      const conflict = await this.repo.findByHashAndParentId(
        nodeHash,
        parentId,
      );

      // Si no hay conflicto, retornamos el nombre y hash resueltos
      if (!conflict) {
        return { nodeName, nodeHash };
      }

      // Si hay conflicto y pertenece a la misma carpeta padre, resolvemos un nuevo nombre
      if (conflict.parentId === parentId) {
        // Obtenemos los nombres que ya existen y que generan conflicto
        const conflictingNames = await this.repo.findConflictingNames(
          parentId,
          buildConflictRegex(nodeName),
        );

        // Generamos un nuevo nombre unico en base a los nombres conflictivos
        nodeName = getNextName(nodeName, conflictingNames);

        // Actualizar el nombre en el nodo original
        if (isUploadedFile(node)) node.originalname = nodeName;
      }

      // Generamos un nuevo hash basado en el nuevo nombre unico
      if (isDirectoryNode(node)) {
        nodeHash = NodeUtils.genDirectoryHash(nodeName, parentId);
      } else {
        nodeHash = await NodeUtils.genFileHash(
          nodePath,
          computeNodeIdentity(nodeName, parentId).identityName,
        );
      }

      return { nodeName, nodeHash };
    } catch (err) {
      console.log(err);
      throw new AppError("INTERNAL");
    }
  }

  /**
   * @description Resuelve la identidad única de un nodo (nombre y hash) dentro de su carpeta padre, usando una transacción Prisma.
   * @param tx Transacción Prisma
   * @param node Nodo a resolver (puede ser un archivo subido o un nodo existente)
   * @param parentId ID del nodo padre donde se ubicará el nodo
   * @param params Parámetros adicionales (como un nuevo nombre propuesto)
   * @returns Objeto con el nombre y hash resueltos
   */
  static async resolveTx(
    tx: PrismaTxClient,
    node: UploadedFile | FileNode | DirectoryNode | NodeLite,
    parentId: string | null,
    params: { newName?: string } = {},
  ) {
    try {
      // Almacenamos la referencia al nombre original del nodo
      const originalNodeName = isUploadedFile(node)
        ? node.originalname
        : params.newName || node.name;

      // Ruta completa del nodo en el almacenamiento en la nube
      const nodePath = isUploadedFile(node)
        ? node.path
        : path.resolve(await CloudStorageService.getCloudRootPath(), node.hash);

      // Nombre del nodo resuelto (inicialmente el original)
      let nodeName = originalNodeName;

      // Generamos el hash del nodo basado en su identidad unica
      let nodeHash: string;
      if (isDirectoryNode(node)) {
        nodeHash = NodeUtils.genDirectoryHash(nodeName, parentId);
      } else {
        nodeHash = await NodeUtils.genFileHash(
          nodePath,
          computeNodeIdentity(nodeName, parentId).identityName,
        );
      }

      // Buscamos si ya existe un nodo con el mismo hash en la carpeta destino
      const conflict = await this.repo.findByHashAndParentIdTx(
        tx,
        nodeHash,
        parentId,
      );

      // Si no hay conflicto, retornamos el nombre y hash resueltos
      if (!conflict) {
        return { nodeName, nodeHash };
      }

      // Si hay conflicto y pertenece a la misma carpeta padre, resolvemos un nuevo nombre
      if (conflict.parentId === parentId) {
        // Obtenemos los nombres que ya existen y que generan conflicto
        const conflictingNames = await this.repo.findConflictingNamesTx(
          tx,
          parentId,
          buildConflictRegex(nodeName),
        );

        // Generamos un nuevo nombre unico en base a los nombres conflictivos
        nodeName = getNextName(nodeName, conflictingNames);

        // Actualizar el nombre en el nodo original
        if (isUploadedFile(node)) node.originalname = nodeName;
      }

      // Generamos un nuevo hash basado en el nuevo nombre unico
      if (isDirectoryNode(node)) {
        nodeHash = NodeUtils.genDirectoryHash(nodeName, parentId);
      } else {
        nodeHash = await NodeUtils.genFileHash(
          nodePath,
          computeNodeIdentity(nodeName, parentId).identityName,
        );
      }

      return { nodeName, nodeHash };
    } catch (err) {
      console.log(err);
      throw new AppError("INTERNAL");
    }
  }

  /**
   * @description Resuelve un nombre único para un nodo dentro de su carpeta padre.
   * @param parentId ParentId del nodo a resolver
   * @param name Nombre original del nodo a resolver
   * @param newName Nuevo nombre propuesto (opcional)
   * @returns string Nombre único resuelto
   */
  static async resolveName(
    parentId: Node["parentId"],
    name: Node["name"],
    newName?: string,
  ): Promise<string> {
    const targetName = newName ?? name;
    const regexPattern = buildConflictRegex(targetName);

    const existingNames = await this.repo.findConflictingNames(
      parentId,
      regexPattern,
    );

    return getNextName(targetName, existingNames);
  }

  /**
   * @description Resuelve un nombre único para un nodo dentro de su carpeta
   * @param tx Transacción Prisma
   * @param parentId ParentId del nodo a resolver
   * @param name Nombre original del nodo a resolver
   * @param newName Nuevo nombre propuesto (opcional)
   * @returns string Nombre único resuelto
   */
  static async resolveNameTx(
    tx: PrismaTxClient,
    parentId: Node["parentId"],
    name: Node["name"],
    newName?: string,
  ): Promise<string> {
    const targetName = newName ?? name;
    const regexPattern = buildConflictRegex(targetName);

    const existingNames = await this.repo.findConflictingNamesTx(
      tx,
      parentId,
      regexPattern,
    );

    return getNextName(targetName, existingNames);
  }
}

import getAllNodes from "./getAllNodes";
import processNode from "./processNode";
import getNodePath from "./getNodePath";
import deleteNodes from "./deleteNodes";
import { detectConflict, getNextName } from "./nameConflicts";

export class NodeUtils {
  static readonly getAllNodes = getAllNodes;
  static readonly processNode = processNode;
  static readonly getNodePath = getNodePath;
  static readonly deleteNodes = deleteNodes;
  static readonly nameConflicts = {
    detectConflict,
    getNextName,
  };
}

import getAllNodes from "./getAllNodes";
import getNodePath from "./getNodePath";
import deleteNodes from "./deleteNodes";
import { ProcessUtils } from "./process";
import { ConflictsUtils } from "./conflicts";
import { HashUtils } from "./hash";

export class NodeUtils {
  static readonly ProcessUtils = ProcessUtils; // Exponer ProcessUtils como una de las utilidades de NodeUtils
  static readonly ConflictsUtils = ConflictsUtils; // Exponer ConflictsUtils como una de las utilidades de NodeUtils
  static readonly HashUtils = HashUtils; // Exponer HashUtils como una de las utilidades de NodeUtils
  static readonly getAllNodes = getAllNodes;
  static readonly getNodePath = getNodePath;
  static readonly deleteNodes = deleteNodes;
}

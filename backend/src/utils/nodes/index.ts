import ensureNodeExt from "./ensureNodeExt";
import genDirectoryHash from "./genDirectoryHash";
import genFileHash from "./genFileHash";

export class NodeUtils {
  static readonly genFileHash = genFileHash;
  static readonly genDirectoryHash = genDirectoryHash;
  static readonly ensureNodeExt = ensureNodeExt;
}

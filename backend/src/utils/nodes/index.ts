import buildRelativeNodePath from "./buildRelativePath";
import ensureNodeExt from "./ensureNodeExt";
import forEachDepthLevel from "./forEachDepthLevel";
import genDirectoryHash from "./genDirectoryHash";
import genFileHash from "./genFileHash";
import parseManifestPath from "./parseManifestPath";

export class NodeUtils {
  static readonly genFileHash = genFileHash;
  static readonly genDirectoryHash = genDirectoryHash;
  static readonly ensureNodeExt = ensureNodeExt;
  static readonly buildRelativeNodePath = buildRelativeNodePath;
  static readonly forEachDepthLevel = forEachDepthLevel;
  static readonly parseManifestPath = parseManifestPath;
}

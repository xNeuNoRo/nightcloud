import getAllFiles from "./getAllFiles";
import processFile from "./processFile";
import getFilePath from "./getFilePath";
import deleteFiles from "./deleteFiles";
import { detectConflict, getNextName } from "./nameConflicts";

export class FileUtils {
  static readonly getAllFiles = getAllFiles;
  static readonly processFile = processFile;
  static readonly getFilePath = getFilePath;
  static readonly deleteFiles = deleteFiles;
  static readonly nameConflicts = {
    detectConflict,
    getNextName,
  };
}

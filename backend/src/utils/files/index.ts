import getAllFiles from "./getAllFiles";
import processFile from "./processFile";
import getFilePath from "./getFilePath";
import deleteFiles from "./deleteFiles";

export class FileUtils {
  static readonly getAllFiles = getAllFiles;
  static readonly processFile = processFile;
  static readonly getFilePath = getFilePath;
  static readonly deleteFiles = deleteFiles;
}

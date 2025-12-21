import capitalizeFirstLetter from "./capitalizeFirstLetter";
import { getCategoryFromMime } from "./getCategoryFromExtAndMime";

export default function getHumanFileType(mime: string) {
  return mime === "inode/directory"
    ? "Folder"
    : capitalizeFirstLetter(getCategoryFromMime(mime));
}

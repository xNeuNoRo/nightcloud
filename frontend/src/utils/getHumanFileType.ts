import { fromMime } from "human-filetypes"
import capitalizeFirstLetter from "./capitalizeFirstLetter"

export default function getHumanFileType(mime: string) {
    return mime === "inode/directory" ? "Folder" : capitalizeFirstLetter(fromMime(mime))
}
import fs from "fs/promises";

export default async function deleteFiles(filePaths: string[]) {
  // Declare an array of promises for deleting files
  const deletePromises = filePaths.map(async (filePath) => {
    return fs
      .unlink(filePath)
      .catch((err) => console.error(`Error deleting file ${filePath}:`, err));
  });

  // Execute all delete operations in parallel
  await Promise.all(deletePromises);
}

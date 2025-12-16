import fs from "node:fs/promises";
import path from "node:path";
import { pathExists } from "../pathExists";

export default async function ensureCloudRoot() {
  const cloudPath = path.resolve(
    process.cwd(),
    process.env.CLOUD_ROOT || "cloud",
  );

  if (!(await pathExists(cloudPath))) {
    await fs.mkdir(cloudPath, { recursive: true });
  }

  return cloudPath;
}

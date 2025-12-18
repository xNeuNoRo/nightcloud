import crypto from "node:crypto";

import type { Prisma } from "../generated/client";

export const rootFolders: Prisma.NodeCreateManyInput[] = [
  {
    id: crypto.randomUUID(),
    parentId: null,
    name: "Documents",
    hash: "6b7c9b9e7c5a9e7c98c7c2b6c9c0c2c9b8fbb5e2a1b6b2e8b8b4a7d2a4c9e8f1",
    size: 0,
    mime: "inode/directory",
    isDir: true,
  },
  {
    id: crypto.randomUUID(),
    parentId: null,
    name: "Pictures",
    hash: "a6c3d8d2c1f3a7f4e1d1b6c0e5b0a8d4a6f7b2e8c9d1f4b5a3e2c8d9f6a1b7",
    size: 0,
    mime: "inode/directory",
    isDir: true,
  },
  {
    id: crypto.randomUUID(),
    parentId: null,
    name: "Music",
    hash: "e1c9a8b7d6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1",
    size: 0,
    mime: "inode/directory",
    isDir: true,
  },
  {
    id: crypto.randomUUID(),
    parentId: null,
    name: "Videos",
    hash: "b4f1e9c7d2a6b8f3c5e4a9d1f7b6c8e2a0d9f5b1c4e6a3d8f7c2b9e5a1",
    size: 0,
    mime: "inode/directory",
    isDir: true,
  },
];

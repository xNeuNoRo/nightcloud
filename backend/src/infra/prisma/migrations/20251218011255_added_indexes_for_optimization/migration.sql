/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `node` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "node_hash_key" ON "node"("hash");

-- CreateIndex
CREATE INDEX "node_parentId_hash_idx" ON "node"("parentId", "hash");

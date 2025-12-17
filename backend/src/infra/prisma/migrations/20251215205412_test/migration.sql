/*
  Warnings:

  - You are about to drop the `Node` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_parentId_fkey";

-- DropTable
DROP TABLE "Node";

-- CreateTable
CREATE TABLE "node" (
    "id" UUID NOT NULL,
    "parentId" UUID,
    "name" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mime" TEXT NOT NULL,
    "isDir" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "node_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "node" ADD CONSTRAINT "node_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "node"("id") ON DELETE SET NULL ON UPDATE CASCADE;

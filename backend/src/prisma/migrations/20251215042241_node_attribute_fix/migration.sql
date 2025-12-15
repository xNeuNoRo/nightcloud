/*
  Warnings:

  - You are about to drop the column `IsDir` on the `Node` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Node" DROP COLUMN "IsDir",
ADD COLUMN     "isDir" BOOLEAN NOT NULL DEFAULT false;

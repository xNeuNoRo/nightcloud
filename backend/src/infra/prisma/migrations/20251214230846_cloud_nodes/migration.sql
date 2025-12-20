-- CreateTable
CREATE TABLE "Node" (
    "id" UUID NOT NULL,
    "parentId" UUID,
    "name" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mime" TEXT NOT NULL,
    "IsDir" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;

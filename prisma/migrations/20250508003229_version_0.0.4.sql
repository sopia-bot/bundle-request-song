-- AlterTable
ALTER TABLE "Song" ADD COLUMN "playedAt" DATETIME;

-- CreateTable
CREATE TABLE "Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "liveId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "sticker" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "combo" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isUsed" BOOLEAN NOT NULL DEFAULT false
);


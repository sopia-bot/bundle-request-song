-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "allowFree" BOOLEAN NOT NULL,
    "limitByCount" BOOLEAN NOT NULL,
    "maxRequestCount" INTEGER,
    "limitByTime" BOOLEAN NOT NULL,
    "requestTimeLimit" INTEGER,
    "allowPaid" BOOLEAN NOT NULL,
    "paidType" TEXT,
    "stickerId" TEXT,
    "minAmount" INTEGER,
    "allowDistribution" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Song" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "artist" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "requester" TEXT NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "playTime" INTEGER NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "isPlayed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "RequestHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "liveId" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "songName" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "playTime" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RequestHistoryBackup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "liveId" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "songName" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "playTime" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('BROWSER', 'ANDROID', 'IOS');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fullName" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "phoneCode" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "Status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "Platform" "Platform" NOT NULL DEFAULT 'ANDROID',

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Point" (
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "Point_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "GameMatch" (
    "id" SERIAL NOT NULL,
    "gameActivityData" TEXT NOT NULL,

    CONSTRAINT "GameMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameMatchOnUser" (
    "userId" INTEGER NOT NULL,
    "gameMatchId" INTEGER NOT NULL,

    CONSTRAINT "GameMatchOnUser_pkey" PRIMARY KEY ("userId","gameMatchId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Point_userId_key" ON "Point"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Point" ADD CONSTRAINT "Point_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMatchOnUser" ADD CONSTRAINT "GameMatchOnUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMatchOnUser" ADD CONSTRAINT "GameMatchOnUser_gameMatchId_fkey" FOREIGN KEY ("gameMatchId") REFERENCES "GameMatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

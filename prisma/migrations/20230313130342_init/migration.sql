-- CreateEnum
CREATE TYPE "acccess_roles" AS ENUM ('user', 'priv1', 'priv2', 'admin', 'localhost');

-- CreateTable
CREATE TABLE "Users" (
    "identifer" TEXT NOT NULL,
    "role" "acccess_roles" NOT NULL DEFAULT 'user',
    "name" TEXT NOT NULL,
    "surname" TEXT,
    "token" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "telegramAccountId" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("identifer")
);

-- CreateTable
CREATE TABLE "TelegramAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT,
    "telegramId" BIGINT NOT NULL,
    "username" TEXT,

    CONSTRAINT "TelegramAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_identifer_key" ON "Users"("identifer");

-- CreateIndex
CREATE UNIQUE INDEX "Users_token_key" ON "Users"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramAccount_id_key" ON "TelegramAccount"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramAccount_telegramId_key" ON "TelegramAccount"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramAccount_username_key" ON "TelegramAccount"("username");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_telegramAccountId_fkey" FOREIGN KEY ("telegramAccountId") REFERENCES "TelegramAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

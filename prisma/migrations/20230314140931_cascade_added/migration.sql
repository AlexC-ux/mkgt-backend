-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_telegramAccountId_fkey";

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_telegramAccountId_fkey" FOREIGN KEY ("telegramAccountId") REFERENCES "TelegramAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "territories" AS ENUM ('kuchin', 'lublino');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "territory" "territories" NOT NULL DEFAULT 'kuchin';

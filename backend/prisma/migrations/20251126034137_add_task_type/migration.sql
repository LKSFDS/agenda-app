-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('META', 'IMPORTANTE', 'AMANHA');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "type" "TaskType" NOT NULL DEFAULT 'IMPORTANTE';

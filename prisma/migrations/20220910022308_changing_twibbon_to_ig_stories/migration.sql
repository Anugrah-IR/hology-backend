/*
  Warnings:

  - You are about to drop the column `twibbon` on the `user_seminars` table. All the data in the column will be lost.
  - Added the required column `ig_story` to the `user_seminars` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admins` ADD COLUMN `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `admin_uuid` CHAR(36) NOT NULL DEFAULT UUID();

-- AlterTable
ALTER TABLE `user_seminars` DROP COLUMN `twibbon`,
    ADD COLUMN `ig_story` VARCHAR(200) NOT NULL,
    MODIFY `ticket_uuid` CHAR(36) NOT NULL DEFAULT UUID();

-- AlterTable
ALTER TABLE `users` ADD COLUMN `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `user_uuid` CHAR(36) NOT NULL DEFAULT UUID();

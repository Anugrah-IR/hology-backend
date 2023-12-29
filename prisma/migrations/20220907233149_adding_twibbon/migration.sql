/*
  Warnings:

  - Added the required column `twibbon` to the `user_seminars` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admins` MODIFY `admin_uuid` CHAR(36) NOT NULL DEFAULT UUID();

-- AlterTable
ALTER TABLE `user_seminars` ADD COLUMN `twibbon` VARCHAR(60) NOT NULL,
    MODIFY `ticket_uuid` CHAR(36) NOT NULL DEFAULT UUID();

-- AlterTable
ALTER TABLE `users` MODIFY `user_uuid` CHAR(36) NOT NULL DEFAULT UUID();

-- CreateTable
CREATE TABLE `admins` (
    `admin_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `admin_uuid` CHAR(36) NOT NULL DEFAULT UUID(),
    `admin_email` VARCHAR(60) NOT NULL,
    `admin_name` VARCHAR(45) NOT NULL,
    `admin_password` TEXT NOT NULL,
    `admin_role` ENUM('SEKBEN', 'INTI', 'GOD', 'EXHIBITOR') NOT NULL,

    UNIQUE INDEX `admins_admin_uuid_key`(`admin_uuid`),
    UNIQUE INDEX `admins_admin_email_key`(`admin_email`),
    PRIMARY KEY (`admin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_uuid` CHAR(36) NOT NULL DEFAULT UUID(),
    `user_fullname` VARCHAR(60) NOT NULL,
    `user_email` VARCHAR(60) NOT NULL,
    `user_birthdate` DATE NOT NULL,
    `user_gender` CHAR(1) NOT NULL,
    `user_password` TEXT NOT NULL,
    `institution_id` SMALLINT UNSIGNED NOT NULL,
    `forgot_password_token` VARCHAR(20) NOT NULL DEFAULT 'no_token',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `users_user_uuid_key`(`user_uuid`),
    UNIQUE INDEX `user_email`(`user_email`),
    INDEX `users_institution_id_foreign`(`institution_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `institutions` (
    `institution_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `institution_name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `institutions_institution_id_key`(`institution_id`),
    UNIQUE INDEX `institutions_institution_name_key`(`institution_name`),
    PRIMARY KEY (`institution_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_seminars` (
    `user_id` SMALLINT UNSIGNED NOT NULL,
    `ticket_uuid` CHAR(36) NOT NULL DEFAULT UUID(),
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `present` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `user_seminars_user_id_key`(`user_id`),
    UNIQUE INDEX `user_seminars_ticket_uuid_key`(`ticket_uuid`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_institution_id_foreign` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`institution_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_seminars` ADD CONSTRAINT `seminar_attendance_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

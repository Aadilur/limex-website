-- Keep public contact details separate from editable landing copy so service
-- CTAs and contact surfaces always use one managed source of truth.
CREATE TABLE `ContactSettings` (
    `id` VARCHAR(191) NOT NULL,
    `revision` INTEGER NOT NULL DEFAULT 1,
    `whatsappNumber` VARCHAR(40) NOT NULL,
    `whatsappDisplay` VARCHAR(80) NOT NULL,
    `whatsappMessage` VARCHAR(500) NOT NULL,
    `email` VARCHAR(200) NOT NULL,
    `phone` VARCHAR(40) NOT NULL,
    `address` VARCHAR(300) NOT NULL,
    `businessHours` VARCHAR(240) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

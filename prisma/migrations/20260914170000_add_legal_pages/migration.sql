-- Create dedicated managed storage for Terms & Conditions and Privacy Policy pages
CREATE TABLE `LegalPage` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(60) NOT NULL,
    `title` VARCHAR(180) NOT NULL,
    `contentHtml` LONGTEXT NOT NULL,
    `contentJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LegalPage_slug_key`(`slug`),
    INDEX `LegalPage_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

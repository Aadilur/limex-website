CREATE TABLE `AboutReel` (
    `id` VARCHAR(191) NOT NULL,
    `youtubeUrl` VARCHAR(500) NOT NULL,
    `videoId` VARCHAR(32) NOT NULL,
    `title` VARCHAR(160) NULL,
    `youtubeTitle` VARCHAR(200) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AboutReel_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

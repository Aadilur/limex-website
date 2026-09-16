-- CreateTable
CREATE TABLE `SiteBranding` (
    `id` VARCHAR(191) NOT NULL,
    `backgroundColor` VARCHAR(32) NOT NULL DEFAULT '#eeece7',
    `primaryColor` VARCHAR(32) NOT NULL DEFAULT '#0055ff',
    `accentColor` VARCHAR(32) NOT NULL DEFAULT '#008cff',
    `inkColor` VARCHAR(32) NOT NULL DEFAULT '#07142e',
    `logoUrl` VARCHAR(500) NULL,
    `logoLightUrl` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default row
INSERT INTO `SiteBranding` (`id`, `backgroundColor`, `primaryColor`, `accentColor`, `inkColor`, `logoUrl`, `logoLightUrl`, `createdAt`, `updatedAt`)
VALUES ('default', '#eeece7', '#0055ff', '#008cff', '#07142e', NULL, NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `id`=`id`;


-- CreateTable
CREATE TABLE `ServiceProfile` (
    `id` VARCHAR(191) NOT NULL,
    `serviceKey` VARCHAR(180) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `menuItemId` VARCHAR(191) NULL,
    `titleEn` VARCHAR(180) NOT NULL,
    `titleBn` VARCHAR(180) NOT NULL,
    `descriptionEn` VARCHAR(500) NOT NULL,
    `descriptionBn` VARCHAR(500) NOT NULL,
    `detail` JSON NULL,
    `publishedDetail` JSON NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'LINK_ONLY',
    `revision` INTEGER NOT NULL DEFAULT 1,
    `publishedRevision` INTEGER NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ServiceProfile_serviceKey_key`(`serviceKey`),
    UNIQUE INDEX `ServiceProfile_slug_key`(`slug`),
    UNIQUE INDEX `ServiceProfile_menuItemId_key`(`menuItemId`),
    INDEX `ServiceProfile_status_updatedAt_idx`(`status`, `updatedAt`),
    INDEX `ServiceProfile_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceProfileRevision` (
    `id` VARCHAR(191) NOT NULL,
    `profileId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `kind` VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    `snapshot` JSON NOT NULL,
    `createdBy` VARCHAR(120) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ServiceProfileRevision_profileId_version_key`(`profileId`, `version`),
    INDEX `ServiceProfileRevision_profileId_createdAt_idx`(`profileId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ServiceProfile` ADD CONSTRAINT `ServiceProfile_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `MenuItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceProfileRevision` ADD CONSTRAINT `ServiceProfileRevision_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ServiceProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

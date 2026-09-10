-- CreateTable
CREATE TABLE `BlogPost` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `publishedSlug` VARCHAR(180) NULL,
    `category` VARCHAR(100) NOT NULL,
    `author` VARCHAR(120) NOT NULL,
    `readTimeMinutes` INTEGER NOT NULL DEFAULT 6,
    `coverTone` VARCHAR(20) NOT NULL DEFAULT 'mint',
    `coverNote` VARCHAR(240) NULL,
    `coverNumber` VARCHAR(20) NULL,
    `coverMediaId` VARCHAR(191) NULL,
    `sidebarVideoUrl` VARCHAR(500) NULL,
    `sidebarVideoId` VARCHAR(64) NULL,
    `sidebarVideoTitle` VARCHAR(240) NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `noIndex` BOOLEAN NOT NULL DEFAULT false,
    `canonicalUrl` VARCHAR(500) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `revision` INTEGER NOT NULL DEFAULT 1,
    `publishedRevision` INTEGER NULL,
    `publishedSnapshot` JSON NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    UNIQUE INDEX `BlogPost_publishedSlug_key`(`publishedSlug`),
    INDEX `BlogPost_status_publishedAt_idx`(`status`, `publishedAt`),
    INDEX `BlogPost_status_sortOrder_idx`(`status`, `sortOrder`),
    INDEX `BlogPost_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPostTranslation` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(5) NOT NULL,
    `title` VARCHAR(240) NOT NULL,
    `subtitle` VARCHAR(500) NOT NULL,
    `intro` TEXT NOT NULL,
    `atAGlance` TEXT NULL,
    `bodyHtml` LONGTEXT NOT NULL,
    `bodyJson` JSON NULL,
    `keywords` JSON NOT NULL,
    `seoTitle` VARCHAR(240) NULL,
    `seoDescription` VARCHAR(320) NULL,
    `coverAlt` VARCHAR(240) NULL,
    `coverCaption` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPostTranslation_postId_locale_key`(`postId`, `locale`),
    INDEX `BlogPostTranslation_locale_updatedAt_idx`(`locale`, `updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPostMedia` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(16) NOT NULL DEFAULT 'IMAGE',
    `objectKey` VARCHAR(500) NOT NULL,
    `contentType` VARCHAR(80) NOT NULL,
    `byteSize` INTEGER NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `altText` VARCHAR(240) NULL,
    `caption` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPostMedia_objectKey_key`(`objectKey`),
    INDEX `BlogPostMedia_postId_kind_idx`(`postId`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPostService` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `serviceKey` VARCHAR(180) NOT NULL,
    `label` VARCHAR(180) NOT NULL,
    `href` VARCHAR(1000) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `BlogPostService_postId_serviceKey_key`(`postId`, `serviceKey`),
    INDEX `BlogPostService_postId_sortOrder_idx`(`postId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPostRevision` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `kind` VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    `snapshot` JSON NOT NULL,
    `createdBy` VARCHAR(120) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `BlogPostRevision_postId_version_key`(`postId`, `version`),
    INDEX `BlogPostRevision_postId_createdAt_idx`(`postId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPostRedirect` (
    `id` VARCHAR(191) NOT NULL,
    `fromSlug` VARCHAR(180) NOT NULL,
    `toSlug` VARCHAR(180) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `BlogPostRedirect_fromSlug_key`(`fromSlug`),
    INDEX `BlogPostRedirect_toSlug_idx`(`toSlug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BlogPostTranslation` ADD CONSTRAINT `BlogPostTranslation_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `BlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPostMedia` ADD CONSTRAINT `BlogPostMedia_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `BlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPostService` ADD CONSTRAINT `BlogPostService_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `BlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPostRevision` ADD CONSTRAINT `BlogPostRevision_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `BlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPostRedirect` ADD CONSTRAINT `BlogPostRedirect_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `BlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

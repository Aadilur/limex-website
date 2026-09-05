CREATE TABLE `DocumentTemplate` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(180) NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `description` TEXT NOT NULL,
  `settings` JSON NOT NULL,
  `fields` JSON NOT NULL,
  `blocks` JSON NOT NULL,
  `publishedSettings` JSON NULL,
  `publishedFields` JSON NULL,
  `publishedBlocks` JSON NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
  `revision` INTEGER NOT NULL DEFAULT 1,
  `publishedRevision` INTEGER NULL,
  `publishedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `DocumentTemplate_slug_key`(`slug`),
  INDEX `DocumentTemplate_status_updatedAt_idx`(`status`, `updatedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

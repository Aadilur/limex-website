CREATE TABLE `BusinessToolSettings` (
  `id` VARCHAR(191) NOT NULL DEFAULT 'default',
  `version` INTEGER NOT NULL DEFAULT 1,
  `settings` JSON NOT NULL,
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ToolServiceRequest` (
  `id` VARCHAR(191) NOT NULL,
  `submissionId` VARCHAR(36) NOT NULL,
  `toolSlug` VARCHAR(80) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `message` TEXT NOT NULL,
  `context` JSON NOT NULL,
  `status` VARCHAR(24) NOT NULL DEFAULT 'NEW',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `ToolServiceRequest_submissionId_key` (`submissionId`),
  INDEX `ToolServiceRequest_status_createdAt_idx` (`status`, `createdAt`),
  INDEX `ToolServiceRequest_createdAt_idx` (`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

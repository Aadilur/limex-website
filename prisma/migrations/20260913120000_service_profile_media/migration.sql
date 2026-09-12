ALTER TABLE `ServiceProfile`
    ADD COLUMN `mediaAssetId` VARCHAR(191) NULL,
    ADD COLUMN `publishedMediaAssetId` VARCHAR(191) NULL;

CREATE INDEX `ServiceProfile_mediaAssetId_idx` ON `ServiceProfile`(`mediaAssetId`);
CREATE INDEX `ServiceProfile_publishedMediaAssetId_idx` ON `ServiceProfile`(`publishedMediaAssetId`);

ALTER TABLE `ServiceProfile`
    ADD CONSTRAINT `ServiceProfile_mediaAssetId_fkey`
    FOREIGN KEY (`mediaAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ServiceProfile`
    ADD CONSTRAINT `ServiceProfile_publishedMediaAssetId_fkey`
    FOREIGN KEY (`publishedMediaAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

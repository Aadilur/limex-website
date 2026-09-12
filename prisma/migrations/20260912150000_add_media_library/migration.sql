-- CreateTable
CREATE TABLE MediaFolder (
    id VARCHAR(191) NOT NULL,
    parentId VARCHAR(191) NULL,
    name VARCHAR(120) NOT NULL,
    isSystem BOOLEAN NOT NULL DEFAULT false,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL,

    UNIQUE INDEX MediaFolder_parentId_name_key(parentId, name),
    INDEX MediaFolder_parentId_idx(parentId),
    PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE MediaAsset (
    id VARCHAR(191) NOT NULL,
    folderId VARCHAR(191) NOT NULL,
    objectKey VARCHAR(500) NOT NULL,
    originalName VARCHAR(255) NOT NULL,
    displayName VARCHAR(255) NOT NULL,
    contentType VARCHAR(80) NOT NULL,
    byteSize INTEGER NOT NULL,
    width INTEGER NULL,
    height INTEGER NULL,
    checksum VARCHAR(64) NOT NULL,
    altText VARCHAR(240) NULL,
    caption VARCHAR(300) NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL,

    UNIQUE INDEX MediaAsset_objectKey_key(objectKey),
    INDEX MediaAsset_folderId_createdAt_idx(folderId, createdAt),
    INDEX MediaAsset_checksum_idx(checksum),
    PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE BlogPostMedia ADD COLUMN mediaAssetId VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX BlogPostMedia_mediaAssetId_key ON BlogPostMedia(mediaAssetId);

-- AddForeignKey
ALTER TABLE MediaFolder ADD CONSTRAINT MediaFolder_parentId_fkey FOREIGN KEY (parentId) REFERENCES MediaFolder(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE MediaAsset ADD CONSTRAINT MediaAsset_folderId_fkey FOREIGN KEY (folderId) REFERENCES MediaFolder(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE BlogPostMedia ADD CONSTRAINT BlogPostMedia_mediaAssetId_fkey FOREIGN KEY (mediaAssetId) REFERENCES MediaAsset(id) ON DELETE RESTRICT ON UPDATE CASCADE;

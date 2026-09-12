-- Service pages are standalone records. A menu entry is an optional assignment,
-- not the source of truth for creating a service page.
ALTER TABLE `ServiceProfile`
    ADD COLUMN `icon` VARCHAR(80) NOT NULL DEFAULT 'briefcase',
    ADD COLUMN `origin` VARCHAR(16) NOT NULL DEFAULT 'ADMIN',
    ADD COLUMN `menuLinkId` VARCHAR(191) NULL,
    ADD COLUMN `menuSnapshot` JSON NULL;

CREATE UNIQUE INDEX `ServiceProfile_menuLinkId_key` ON `ServiceProfile`(`menuLinkId`);

ALTER TABLE `ServiceProfile`
    ADD CONSTRAINT `ServiceProfile_menuLinkId_fkey`
    FOREIGN KEY (`menuLinkId`) REFERENCES `MenuLink`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Older versions seeded one empty link-only profile for every menu item. Keep
-- those rows and their revision history, but detach untouched placeholders so
-- they cannot block a real service from being assigned to the menu.
UPDATE `ServiceProfile`
SET `origin` = 'SEED', `menuItemId` = NULL
WHERE `status` = 'LINK_ONLY'
  AND `detail` IS NULL
  AND `publishedDetail` IS NULL
  AND `revision` = 1
  AND `publishedRevision` IS NULL
  AND `menuItemId` IS NOT NULL
  AND `menuLinkId` IS NULL;

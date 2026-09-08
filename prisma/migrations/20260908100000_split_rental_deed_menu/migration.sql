UPDATE `MenuLink` AS link
JOIN `MenuItem` AS item ON item.`id` = link.`itemId`
SET
  link.`label` = 'Office Rental Deed - English',
  link.`href` = '/business-tools/templates/office-rental-deed-en',
  link.`sortOrder` = 0,
  link.`updatedAt` = CURRENT_TIMESTAMP(3)
WHERE item.`label` = 'Business Agreement Builder'
  AND (
    link.`href` = '/business-tools/rental-deed'
    OR link.`label` = 'Office Rental Deed Agreement Builder (Eng and Bangla)'
  );

INSERT INTO `MenuLink` (`id`, `itemId`, `label`, `href`, `sortOrder`, `isVisible`, `createdAt`, `updatedAt`)
SELECT
  'office-rental-deed-bangla-link',
  item.`id`,
  'Office Rental Deed - বাংলা',
  '/business-tools/templates/office-rental-deed-bn',
  1,
  true,
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
FROM `MenuItem` AS item
WHERE item.`label` = 'Business Agreement Builder'
  AND NOT EXISTS (
    SELECT 1
    FROM `MenuLink` AS link
    WHERE link.`itemId` = item.`id`
      AND link.`href` = '/business-tools/templates/office-rental-deed-bn'
  )
LIMIT 1;

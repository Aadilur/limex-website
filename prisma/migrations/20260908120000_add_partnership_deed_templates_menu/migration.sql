-- Split the old combined partnership deed menu entry into language-specific
-- links without replacing any other administrator-customised menu links.
UPDATE `MenuLink` AS link
JOIN `MenuItem` AS item ON item.`id` = link.`itemId`
SET
  link.`label` = '40 Page Partnership Deed - English',
  link.`href` = '/business-tools/templates/partnership-deed-40-en',
  link.`updatedAt` = CURRENT_TIMESTAMP(3)
WHERE item.`label` = 'Business Agreement Builder'
  AND (
    link.`href` = '/business-tools/partnership-deed'
    OR link.`label` = 'Partnership Deed Agreement Builder (Eng and Bangla)'
  );

INSERT INTO `MenuLink` (`id`, `itemId`, `label`, `href`, `sortOrder`, `isVisible`, `createdAt`, `updatedAt`)
SELECT
  'partnership-deed-40-bangla-link',
  item.`id`,
  '40 Page Partnership Deed - বাংলা',
  '/business-tools/templates/partnership-deed-40-bn',
  3,
  true,
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
FROM `MenuItem` AS item
WHERE item.`label` = 'Business Agreement Builder'
  AND NOT EXISTS (
    SELECT 1
    FROM `MenuLink` AS link
    WHERE link.`itemId` = item.`id`
      AND link.`href` = '/business-tools/templates/partnership-deed-40-bn'
  )
LIMIT 1;

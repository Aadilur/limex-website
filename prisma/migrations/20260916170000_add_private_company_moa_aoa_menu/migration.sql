-- Add the new source-based private-company MoA/AoA builder without changing
-- administrator-managed links that are already present in Business Tools.
INSERT INTO `MenuLink` (`id`, `itemId`, `label`, `href`, `sortOrder`, `isVisible`, `createdAt`, `updatedAt`)
SELECT
  'private-company-moa-aoa-template-link',
  item.`id`,
  'Private Company MoA & AoA Builder',
  '/business-tools/templates/private-company-moa-aoa',
  4,
  true,
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
FROM `MenuItem` AS item
JOIN `MenuGroup` AS menu_group ON menu_group.`id` = item.`groupId`
JOIN `MenuSection` AS section ON section.`id` = menu_group.`sectionId`
WHERE section.`key` = 'business-tools'
  AND item.`label` = 'Business Agreement Builder'
  AND NOT EXISTS (
    SELECT 1
    FROM `MenuLink` AS link
    WHERE link.`itemId` = item.`id`
      AND link.`href` = '/business-tools/templates/private-company-moa-aoa'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM `MenuLink` AS existing_id
    WHERE existing_id.`id` = 'private-company-moa-aoa-template-link'
  )
LIMIT 1;

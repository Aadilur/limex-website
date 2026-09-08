-- Keep the seeded deed pages faithful to the supplied artwork. The revision
-- guard prevents this one-time default refinement from replacing admin edits.
UPDATE `DocumentTemplate`
SET
  `settings` = JSON_SET(`settings`, '$.showPageNumbers', false),
  `publishedSettings` = JSON_SET(`publishedSettings`, '$.showPageNumbers', false)
WHERE `slug` IN ('office-rental-deed-en', 'office-rental-deed-bn')
  AND `status` = 'PUBLISHED'
  AND `revision` = 1
  AND `publishedRevision` = 1;

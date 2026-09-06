UPDATE `DocumentTemplate`
SET `settings` = JSON_SET(
  `settings`,
  '$.serviceCta',
  JSON_OBJECT(
    'enabled', false,
    'href', '',
    'title', 'Need help with this service?',
    'description', 'See the service details and next steps before completing this document.',
    'linkLabel', 'View service page'
  )
)
WHERE JSON_EXTRACT(`settings`, '$.serviceCta') IS NULL;

UPDATE `DocumentTemplate`
SET `publishedSettings` = JSON_SET(
  `publishedSettings`,
  '$.serviceCta',
  JSON_OBJECT(
    'enabled', false,
    'href', '',
    'title', 'Need help with this service?',
    'description', 'See the service details and next steps before completing this document.',
    'linkLabel', 'View service page'
  )
)
WHERE `publishedSettings` IS NOT NULL
  AND JSON_EXTRACT(`publishedSettings`, '$.serviceCta') IS NULL;

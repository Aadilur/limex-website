-- Expand the legacy zero-fee band into the exact RJSC capital ranges so the
-- rules view can show every published threshold. The fee calculation is
-- equivalent to the previous three-row schedule. Only the untouched seeded
-- schedule is changed; administrator-customised bands are preserved.
UPDATE `BusinessToolSettings`
SET `settings` = JSON_SET(
  `settings`,
  '$.companyRegistration.capitalFeeBands', JSON_ARRAY(
    JSON_OBJECT('upto', 20000, 'unit', 1, 'feePerUnit', 0),
    JSON_OBJECT('upto', 50000, 'unit', 10000, 'feePerUnit', 0),
    JSON_OBJECT('upto', 1000000, 'unit', 10000, 'feePerUnit', 0),
    JSON_OBJECT('upto', 5000000, 'unit', 100000, 'feePerUnit', 80),
    JSON_OBJECT('upto', NULL, 'unit', 100000, 'feePerUnit', 130)
  )
)
WHERE `id` = 'default'
  AND JSON_LENGTH(JSON_EXTRACT(`settings`, '$.companyRegistration.capitalFeeBands')) = 3
  AND JSON_EXTRACT(`settings`, '$.companyRegistration.capitalFeeBands[0].upto') = 1000000
  AND JSON_EXTRACT(`settings`, '$.companyRegistration.capitalFeeBands[1].upto') = 5000000
  AND JSON_TYPE(JSON_EXTRACT(`settings`, '$.companyRegistration.capitalFeeBands[2].upto')) = 'NULL'
  AND JSON_EXTRACT(`settings`, '$.companyRegistration.capitalFeeBands[0].feePerUnit') = 0
  AND JSON_EXTRACT(`settings`, '$.companyRegistration.capitalFeeBands[1].feePerUnit') = 80
  AND JSON_EXTRACT(`settings`, '$.companyRegistration.capitalFeeBands[2].feePerUnit') = 130;

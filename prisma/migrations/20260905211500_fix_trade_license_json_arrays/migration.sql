-- MySQL can coerce JSON session variables to quoted strings inside JSON_OBJECT.
-- Parse those three seeded arrays back into JSON values before the settings are read.
UPDATE `BusinessToolSettings`
SET `settings` = JSON_SET(
  `settings`,
  '$.tradeLicense.dncc.tariffRows', JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(`settings`, '$.tradeLicense.dncc.tariffRows')), '$'),
  '$.tradeLicense.dncc.limitedCompanyBands', JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(`settings`, '$.tradeLicense.dncc.limitedCompanyBands')), '$'),
  '$.tradeLicense.dncc.advertisingRates', JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(`settings`, '$.tradeLicense.dncc.advertisingRates')), '$'),
  '$.tradeLicense.dscc.tariffRows', JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(`settings`, '$.tradeLicense.dscc.tariffRows')), '$'),
  '$.tradeLicense.dscc.limitedCompanyBands', JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(`settings`, '$.tradeLicense.dscc.limitedCompanyBands')), '$'),
  '$.tradeLicense.dscc.advertisingRates', JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(`settings`, '$.tradeLicense.dscc.advertisingRates')), '$')
)
WHERE `id` = 'default'
  AND JSON_TYPE(JSON_EXTRACT(`settings`, '$.tradeLicense.dncc.tariffRows')) = 'STRING';

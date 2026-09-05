UPDATE `BusinessToolSettings`
SET `settings` = JSON_SET(
  COALESCE(`settings`, JSON_OBJECT()),
  '$.companyRegistration', JSON_OBJECT(
    'nameClearanceFee', 500,
    'filingFee', 1200,
    'moaStamp', 1000,
    'aoaStampBands', JSON_ARRAY(
      JSON_OBJECT('upto', 1000000, 'amount', 2000),
      JSON_OBJECT('upto', 30000000, 'amount', 4000),
      JSON_OBJECT('upto', NULL, 'amount', 10000)
    ),
    'capitalFeeBands', JSON_ARRAY(
      JSON_OBJECT('upto', 1000000, 'unit', 1, 'feePerUnit', 0),
      JSON_OBJECT('upto', 5000000, 'unit', 100000, 'feePerUnit', 80),
      JSON_OBJECT('upto', NULL, 'unit', 100000, 'feePerUnit', 130)
    ),
    'sourceUrl', 'https://app1.roc.gov.bd/psp/RJSC_Fees',
    'effectiveDate', '2026-09-05',
    'note', 'Reviewed against the current RJSC fee schedule: name clearance is ৳500 per proposed name; filing is ৳1,200; MoA stamp is ৳1,000; AoA stamp is ৳2,000 up to ৳10 lakh, ৳4,000 up to ৳3 crore and ৳10,000 above; authorized-capital fees are nil up to ৳10 lakh, then ৳80 per ৳1 lakh or part up to ৳50 lakh and ৳130 per ৳1 lakh or part above that. Confirm the final assessment before filing.'
  ),
  '$."fees"."limited-company"."sourceUrl"', 'https://app1.roc.gov.bd/psp/RJSC_Fees',
  '$."fees"."limited-company"."serviceFee"', 10000
)
WHERE `id` = 'default';

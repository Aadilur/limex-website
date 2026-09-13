-- Persist the Limex package-level RJSC reference table without replacing any
-- administrator-customised component fee schedule.
UPDATE `BusinessToolSettings`
SET `settings` = JSON_SET(
  COALESCE(`settings`, JSON_OBJECT()),
  '$.companyRegistration.rjscReferenceRows', JSON_ARRAY(
    JSON_OBJECT('capital', 1000000, 'governmentFee', 16003),
    JSON_OBJECT('capital', 2000000, 'governmentFee', 16923),
    JSON_OBJECT('capital', 3000000, 'governmentFee', 17843),
    JSON_OBJECT('capital', 4000000, 'governmentFee', 18763),
    JSON_OBJECT('capital', 5000000, 'governmentFee', 39683),
    JSON_OBJECT('capital', 6000000, 'governmentFee', 41178),
    JSON_OBJECT('capital', 7000000, 'governmentFee', 42673),
    JSON_OBJECT('capital', 8000000, 'governmentFee', 44168),
    JSON_OBJECT('capital', 9000000, 'governmentFee', 45663),
    JSON_OBJECT('capital', 10000000, 'governmentFee', 47158),
    JSON_OBJECT('capital', 20000000, 'governmentFee', 62108),
    JSON_OBJECT('capital', 30000000, 'governmentFee', 77058),
    JSON_OBJECT('capital', 40000000, 'governmentFee', 92008),
    JSON_OBJECT('capital', 50000000, 'governmentFee', 106958),
    JSON_OBJECT('capital', 100000000, 'governmentFee', 181708)
  )
)
WHERE `id` = 'default'
  AND JSON_CONTAINS_PATH(COALESCE(`settings`, JSON_OBJECT()), 'one', '$.companyRegistration.rjscReferenceRows') = 0;

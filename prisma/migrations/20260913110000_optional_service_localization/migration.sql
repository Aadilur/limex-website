-- English is the required service identity. Bangla localization is optional
-- and is stored as an empty string until an administrator adds it.
ALTER TABLE `ServiceProfile`
    ALTER COLUMN `titleBn` SET DEFAULT '';

ALTER TABLE `ServiceProfile`
    ALTER COLUMN `descriptionBn` SET DEFAULT '';

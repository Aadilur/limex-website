ALTER TABLE `ToolServiceRequest`
  MODIFY `phone` VARCHAR(30) NULL,
  ADD COLUMN `email` VARCHAR(200) NULL,
  ADD COLUMN `preferredDate` VARCHAR(10) NULL,
  ADD COLUMN `preferredTime` VARCHAR(5) NULL,
  ADD COLUMN `requestType` VARCHAR(24) NOT NULL DEFAULT 'CALLBACK';

CREATE INDEX `ToolServiceRequest_requestType_createdAt_idx` ON `ToolServiceRequest`(`requestType`, `createdAt`);
CREATE INDEX `ToolServiceRequest_toolSlug_createdAt_idx` ON `ToolServiceRequest`(`toolSlug`, `createdAt`);

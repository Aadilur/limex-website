ALTER TABLE `DocumentTemplate` ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0;

SET @document_template_sort_order = -1;
UPDATE `DocumentTemplate`
SET `sortOrder` = (@document_template_sort_order := @document_template_sort_order + 1)
ORDER BY `createdAt` ASC, `id` ASC;

CREATE INDEX `DocumentTemplate_status_sortOrder_idx` ON `DocumentTemplate`(`status`, `sortOrder`);
CREATE INDEX `DocumentTemplate_sortOrder_idx` ON `DocumentTemplate`(`sortOrder`);

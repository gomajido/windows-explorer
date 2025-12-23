CREATE TABLE `folders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`parent_id` int,
	`is_folder` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `folders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `parent_id_idx` ON `folders` (`parent_id`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `folders` (`name`);--> statement-breakpoint
CREATE INDEX `deleted_at_idx` ON `folders` (`deleted_at`);
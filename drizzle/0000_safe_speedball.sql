CREATE TABLE `development_records` (
	`id` text PRIMARY KEY NOT NULL,
	`nis` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`date` text NOT NULL,
	`points` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

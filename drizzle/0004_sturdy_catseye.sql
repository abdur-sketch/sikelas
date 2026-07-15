CREATE TABLE `academic_periods` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`semester` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`active` integer DEFAULT false NOT NULL,
	`closed_at` text
);
--> statement-breakpoint
CREATE TABLE `communication_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`nis` text NOT NULL,
	`channel` text NOT NULL,
	`message` text NOT NULL,
	`status` text NOT NULL,
	`actor_email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `communication_nis_idx` ON `communication_logs` (`nis`);--> statement-breakpoint
CREATE TABLE `deleted_records` (
	`id` text PRIMARY KEY NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`payload` text NOT NULL,
	`deleted_by` text NOT NULL,
	`deleted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`restored_at` text
);
--> statement-breakpoint
CREATE INDEX `deleted_entity_idx` ON `deleted_records` (`entity`);--> statement-breakpoint
CREATE TABLE `task_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`nis` text NOT NULL,
	`status` text NOT NULL,
	`score` integer,
	`feedback` text DEFAULT '' NOT NULL,
	`evidence_url` text,
	`submitted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_task_student_idx` ON `task_submissions` (`task_id`,`nis`);--> statement-breakpoint
ALTER TABLE `users` ADD `student_nis` text;
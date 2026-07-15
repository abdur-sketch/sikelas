CREATE TABLE `announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`audience` text NOT NULL,
	`date` text NOT NULL,
	`author` text NOT NULL,
	`priority` text NOT NULL,
	`status` text NOT NULL,
	`excerpt` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `announcements_audience_idx` ON `announcements` (`audience`);--> statement-breakpoint
CREATE TABLE `attendance_records` (
	`id` text PRIMARY KEY NOT NULL,
	`nis` text NOT NULL,
	`class_label` text NOT NULL,
	`date` text NOT NULL,
	`status` text NOT NULL,
	`method` text DEFAULT 'manual' NOT NULL,
	`scanned_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendance_student_date_idx` ON `attendance_records` (`nis`,`date`);--> statement-breakpoint
CREATE INDEX `attendance_class_date_idx` ON `attendance_records` (`class_label`,`date`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_email` text NOT NULL,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`detail` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `classes` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`short` text NOT NULL,
	`boys` integer NOT NULL,
	`girls` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `classes_label_idx` ON `classes` (`label`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_email` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`user_email`);--> statement-breakpoint
CREATE TABLE `point_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`label` text NOT NULL,
	`points` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portfolios` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`nis` text NOT NULL,
	`student` text NOT NULL,
	`class_label` text NOT NULL,
	`date` text NOT NULL,
	`status` text NOT NULL,
	`score` integer NOT NULL,
	`tone` text NOT NULL,
	`description` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `portfolios_class_idx` ON `portfolios` (`class_label`);--> statement-breakpoint
CREATE INDEX `portfolios_nis_idx` ON `portfolios` (`nis`);--> statement-breakpoint
CREATE TABLE `students` (
	`nis` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`class_label` text NOT NULL,
	`gender` text NOT NULL,
	`guardian` text NOT NULL,
	`status` text NOT NULL,
	`initials` text NOT NULL,
	`color` text NOT NULL,
	`barcode_token` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `students_class_idx` ON `students` (`class_label`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`class_label` text NOT NULL,
	`subject` text NOT NULL,
	`due` text NOT NULL,
	`submitted` integer NOT NULL,
	`total` integer NOT NULL,
	`status` text NOT NULL,
	`tone` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tasks_class_idx` ON `tasks` (`class_label`);--> statement-breakpoint
CREATE TABLE `users` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`class_label` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

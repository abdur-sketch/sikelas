CREATE TABLE `grades` (
	`id` text PRIMARY KEY NOT NULL,
	`nis` text NOT NULL,
	`class_label` text NOT NULL,
	`assignment` integer NOT NULL,
	`practice` integer NOT NULL,
	`exam` integer NOT NULL,
	`attitude` text NOT NULL,
	`final_score` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grades_student_class_idx` ON `grades` (`nis`,`class_label`);--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`class_label` text NOT NULL,
	`day` text NOT NULL,
	`start_time` text NOT NULL,
	`subject` text NOT NULL,
	`teacher` text NOT NULL,
	`room` text NOT NULL,
	`tone` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `schedules_class_idx` ON `schedules` (`class_label`);--> statement-breakpoint
CREATE TABLE `settings` (
	`class_label` text PRIMARY KEY NOT NULL,
	`school_name` text NOT NULL,
	`npsn` text NOT NULL,
	`school_email` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`homeroom` text NOT NULL,
	`academic_year` text NOT NULL,
	`room` text NOT NULL,
	`entry_time` text NOT NULL,
	`late_time` text NOT NULL,
	`end_time` text NOT NULL,
	`min_attendance` integer NOT NULL,
	`assignment_weight` integer NOT NULL,
	`practice_weight` integer NOT NULL,
	`exam_weight` integer NOT NULL,
	`attitude_weight` integer NOT NULL,
	`kkm` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `portfolios` ADD `evidence_key` text;--> statement-breakpoint
ALTER TABLE `portfolios` ADD `evidence_name` text;--> statement-breakpoint
ALTER TABLE `portfolios` ADD `evidence_type` text;--> statement-breakpoint
ALTER TABLE `portfolios` ADD `evidence_url` text;
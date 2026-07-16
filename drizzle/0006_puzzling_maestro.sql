CREATE TABLE `subject_grades` (
	`id` text PRIMARY KEY NOT NULL,
	`nis` text NOT NULL,
	`class_label` text NOT NULL,
	`subject` text NOT NULL,
	`assignment` integer DEFAULT 0 NOT NULL,
	`practice` integer DEFAULT 0 NOT NULL,
	`exam` integer DEFAULT 0 NOT NULL,
	`attitude` text DEFAULT 'B' NOT NULL,
	`final_score` integer DEFAULT 0 NOT NULL,
	`updated_by` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subject_grades_student_idx` ON `subject_grades` (`nis`,`class_label`,`subject`);--> statement-breakpoint
CREATE INDEX `subject_grades_class_idx` ON `subject_grades` (`class_label`,`subject`);--> statement-breakpoint
CREATE TABLE `user_subject_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`class_label` text NOT NULL,
	`subject` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_subject_assignment_idx` ON `user_subject_assignments` (`email`,`class_label`,`subject`);--> statement-breakpoint
CREATE INDEX `user_subject_email_idx` ON `user_subject_assignments` (`email`);
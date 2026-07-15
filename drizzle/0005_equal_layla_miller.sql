CREATE TABLE `user_class_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`class_label` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_class_assignment_idx` ON `user_class_assignments` (`email`,`class_label`);--> statement-breakpoint
CREATE INDEX `user_class_email_idx` ON `user_class_assignments` (`email`);--> statement-breakpoint
ALTER TABLE `users` ADD `status` text DEFAULT 'Pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `active` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `approved_by` text;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` text;

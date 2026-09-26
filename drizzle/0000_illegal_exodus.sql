CREATE TABLE `client_portfolio` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`image_url` text,
	`project_url` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_client_portfolio_display_order` ON `client_portfolio` (`display_order`);--> statement-breakpoint
CREATE TABLE `community_radios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text,
	`description` text,
	`logo_url` text,
	`site_url` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `community_radios_slug_unique` ON `community_radios` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_community_radios_active` ON `community_radios` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_community_radios_display_order` ON `community_radios` (`display_order`);--> statement-breakpoint
CREATE TABLE `news` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`image` text,
	`author` text DEFAULT 'IPStream' NOT NULL,
	`published_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_slug_unique` ON `news` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_news_published_at` ON `news` (`published_at`);--> statement-breakpoint
CREATE INDEX `idx_news_active` ON `news` (`is_active`);--> statement-breakpoint
CREATE TABLE `plan_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`icon` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plan_categories_slug_unique` ON `plan_categories` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_plan_categories_display_order` ON `plan_categories` (`display_order`);--> statement-breakpoint
CREATE TABLE `plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_key` text NOT NULL,
	`plan_name` text NOT NULL,
	`price` integer NOT NULL,
	`title` text,
	`icon` text,
	`image_url` text,
	`description` text,
	`features` text,
	`monthly_price` integer,
	`annual_price` integer,
	`billing_note` text,
	`demo_url` text,
	`category_id` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `plan_categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plans_plan_key_unique` ON `plans` (`plan_key`);--> statement-breakpoint
CREATE INDEX `idx_plans_category` ON `plans` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_plans_active` ON `plans` (`is_active`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tutorial_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`color` text DEFAULT 'blue' NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tutorial_categories_slug_unique` ON `tutorial_categories` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_tutorial_categories_display_order` ON `tutorial_categories` (`display_order`);--> statement-breakpoint
CREATE TABLE `tutorials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`video_url` text,
	`duration` text,
	`difficulty` text DEFAULT 'beginner' NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `tutorial_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tutorials_slug_unique` ON `tutorials` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_tutorials_category` ON `tutorials` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_tutorials_active` ON `tutorials` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_tutorials_display_order` ON `tutorials` (`display_order`);
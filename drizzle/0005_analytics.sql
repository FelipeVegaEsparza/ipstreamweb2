CREATE TABLE `analytics_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`pageview_id` text,
	`name` text NOT NULL,
	`label` text,
	`path` text NOT NULL,
	`value` real,
	`metadata` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_analytics_events_created` ON `analytics_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_analytics_events_name` ON `analytics_events` (`name`);--> statement-breakpoint
CREATE INDEX `idx_analytics_events_path` ON `analytics_events` (`path`);--> statement-breakpoint
CREATE INDEX `idx_analytics_events_session` ON `analytics_events` (`session_id`);--> statement-breakpoint
CREATE TABLE `analytics_pageviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pageview_id` text NOT NULL,
	`session_id` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`path` text NOT NULL,
	`title` text,
	`locale` text,
	`referrer` text,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`country` text,
	`region` text,
	`city` text,
	`device` text,
	`browser` text,
	`os` text,
	`language` text,
	`screen_width` integer,
	`screen_height` integer,
	`duration_ms` integer DEFAULT 0 NOT NULL,
	`max_scroll_depth` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analytics_pageviews_pageview_id_unique` ON `analytics_pageviews` (`pageview_id`);--> statement-breakpoint
CREATE INDEX `idx_analytics_pageviews_created` ON `analytics_pageviews` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_analytics_pageviews_path` ON `analytics_pageviews` (`path`);--> statement-breakpoint
CREATE INDEX `idx_analytics_pageviews_session` ON `analytics_pageviews` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_analytics_pageviews_visitor` ON `analytics_pageviews` (`visitor_hash`);--> statement-breakpoint
CREATE INDEX `idx_analytics_pageviews_country` ON `analytics_pageviews` (`country`);--> statement-breakpoint
CREATE INDEX `idx_analytics_pageviews_device` ON `analytics_pageviews` (`device`);--> statement-breakpoint
CREATE TABLE `analytics_section_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pageview_id` text NOT NULL,
	`session_id` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`path` text NOT NULL,
	`section_key` text NOT NULL,
	`section_label` text,
	`duration_ms` integer DEFAULT 0 NOT NULL,
	`max_visible_ratio` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_analytics_section_pageview` ON `analytics_section_views` (`pageview_id`,`section_key`);--> statement-breakpoint
CREATE INDEX `idx_analytics_sections_created` ON `analytics_section_views` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_analytics_sections_key` ON `analytics_section_views` (`section_key`);--> statement-breakpoint
CREATE INDEX `idx_analytics_sections_path` ON `analytics_section_views` (`path`);--> statement-breakpoint
CREATE TABLE `analytics_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_hash` text NOT NULL,
	`started_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`landing_path` text NOT NULL,
	`exit_path` text,
	`pageviews` integer DEFAULT 0 NOT NULL,
	`referrer` text,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`country` text,
	`region` text,
	`city` text,
	`device` text,
	`browser` text,
	`os` text,
	`language` text,
	`screen_width` integer,
	`screen_height` integer
);
--> statement-breakpoint
CREATE INDEX `idx_analytics_sessions_started` ON `analytics_sessions` (`started_at`);--> statement-breakpoint
CREATE INDEX `idx_analytics_sessions_visitor` ON `analytics_sessions` (`visitor_hash`);--> statement-breakpoint
CREATE INDEX `idx_analytics_sessions_landing` ON `analytics_sessions` (`landing_path`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_news` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`image` text,
	`seo_title` text,
	`seo_description` text,
	`seo_image` text,
	`author` text DEFAULT 'CasterFly' NOT NULL,
	`published_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_news`("id", "title", "slug", "excerpt", "content", "image", "seo_title", "seo_description", "seo_image", "author", "published_at", "is_active", "created_at", "updated_at") SELECT "id", "title", "slug", "excerpt", "content", "image", "seo_title", "seo_description", "seo_image", "author", "published_at", "is_active", "created_at", "updated_at" FROM `news`;--> statement-breakpoint
DROP TABLE `news`;--> statement-breakpoint
ALTER TABLE `__new_news` RENAME TO `news`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `news_slug_unique` ON `news` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_news_published_at` ON `news` (`published_at`);--> statement-breakpoint
CREATE INDEX `idx_news_active` ON `news` (`is_active`);
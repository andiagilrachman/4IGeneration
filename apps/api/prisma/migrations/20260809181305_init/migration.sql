-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(120) NULL,
    `role` ENUM('USER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER',
    `status` ENUM('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DELETED') NOT NULL DEFAULT 'PENDING_VERIFICATION',
    `email_verified_at` DATETIME(3) NULL,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(160) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `phone` VARCHAR(30) NULL,
    `country` CHAR(2) NULL DEFAULT 'ID',
    `preferences` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_profiles_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `user_agent` VARCHAR(500) NULL,
    `ip_address` VARCHAR(45) NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revoked_at` DATETIME(3) NULL,

    UNIQUE INDEX `sessions_token_hash_key`(`token_hash`),
    INDEX `sessions_user_id_idx`(`user_id`),
    INDEX `sessions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_resets` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_resets_token_hash_key`(`token_hash`),
    INDEX `password_resets_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_verifications` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `email_verifications_token_hash_key`(`token_hash`),
    INDEX `email_verifications_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plans` (
    `id` CHAR(36) NOT NULL,
    `slug` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('FREE', 'RETAIL', 'API', 'ENTERPRISE') NOT NULL DEFAULT 'RETAIL',
    `priceMonthly` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `priceYearly` DECIMAL(12, 2) NULL DEFAULT 0,
    `currency` CHAR(3) NOT NULL DEFAULT 'IDR',
    `credits_per_month` INTEGER NOT NULL DEFAULT 0,
    `features` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `plans_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `plan_id` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED', 'TRIALING') NOT NULL DEFAULT 'TRIALING',
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NULL,
    `cancelled_at` DATETIME(3) NULL,
    `trial_ends_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `subscriptions_user_id_idx`(`user_id`),
    INDEX `subscriptions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credits` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `balance` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `credits_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_transactions` (
    `id` CHAR(36) NOT NULL,
    `credit_id` VARCHAR(191) NOT NULL,
    `type` ENUM('PURCHASE', 'SUBSCRIPTION_ALLOCATION', 'USAGE_DEDUCTION', 'REFUND', 'ADJUSTMENT') NOT NULL,
    `amount` INTEGER NOT NULL,
    `description` VARCHAR(255) NULL,
    `reference_id` VARCHAR(80) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `credit_transactions_credit_id_created_at_idx`(`credit_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'IDR',
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `gateway` VARCHAR(30) NOT NULL DEFAULT 'midtrans',
    `gateway_ref` VARCHAR(120) NULL,
    `metadata` JSON NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `payments_user_id_idx`(`user_id`),
    INDEX `payments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` CHAR(36) NOT NULL,
    `payment_id` VARCHAR(191) NOT NULL,
    `number` VARCHAR(40) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'IDR',
    `status` VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    `due_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `invoices_payment_id_key`(`payment_id`),
    UNIQUE INDEX `invoices_number_key`(`number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_keys` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `key_prefix` VARCHAR(12) NOT NULL,
    `key_hash` VARCHAR(255) NOT NULL,
    `scopes` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_used_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `api_keys_key_hash_key`(`key_hash`),
    INDEX `api_keys_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_key_usage_logs` (
    `id` CHAR(36) NOT NULL,
    `api_key_id` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(160) NOT NULL,
    `status_code` INTEGER NULL,
    `tokens_used` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `api_key_usage_logs_api_key_id_created_at_idx`(`api_key_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_providers` (
    `id` CHAR(36) NOT NULL,
    `slug` VARCHAR(60) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `base_url` VARCHAR(255) NOT NULL,
    `auth_type` VARCHAR(40) NOT NULL DEFAULT 'api_key_header',
    `priority` INTEGER NOT NULL DEFAULT 100,
    `weight` INTEGER NOT NULL DEFAULT 0,
    `timeout_ms` INTEGER NOT NULL DEFAULT 30000,
    `max_retries` INTEGER NOT NULL DEFAULT 3,
    `health_path` VARCHAR(160) NULL,
    `config` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ai_providers_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_keys` (
    `id` CHAR(36) NOT NULL,
    `provider_id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NULL,
    `encrypted_key` TEXT NOT NULL,
    `status` ENUM('ACTIVE', 'COOLING_DOWN', 'RATE_LIMITED', 'DISABLED', 'DEAD') NOT NULL DEFAULT 'ACTIVE',
    `daily_used` INTEGER NOT NULL DEFAULT 0,
    `daily_limit` INTEGER NOT NULL DEFAULT 1500,
    `monthly_used` INTEGER NOT NULL DEFAULT 0,
    `monthly_limit` INTEGER NOT NULL DEFAULT 45000,
    `cooling_until` DATETIME(3) NULL,
    `last_used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `provider_keys_provider_id_status_idx`(`provider_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_models` (
    `id` CHAR(36) NOT NULL,
    `provider_id` VARCHAR(191) NOT NULL,
    `model_id` VARCHAR(120) NOT NULL,
    `alias` VARCHAR(40) NOT NULL,
    `context_window` INTEGER NOT NULL DEFAULT 128000,
    `price_input` DECIMAL(12, 6) NOT NULL DEFAULT 0,
    `price_output` DECIMAL(12, 6) NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ai_models_provider_id_idx`(`provider_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stocks` (
    `id` CHAR(36) NOT NULL,
    `ticker` VARCHAR(10) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `sector` VARCHAR(80) NULL,
    `industry` VARCHAR(80) NULL,
    `is_idx` BOOLEAN NOT NULL DEFAULT false,
    `idx_name` VARCHAR(40) NULL,
    `listed_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stocks_ticker_key`(`ticker`),
    INDEX `stocks_sector_idx`(`sector`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_prices` (
    `id` CHAR(36) NOT NULL,
    `stock_id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `open` DECIMAL(12, 2) NOT NULL,
    `high` DECIMAL(12, 2) NOT NULL,
    `low` DECIMAL(12, 2) NOT NULL,
    `close` DECIMAL(12, 2) NOT NULL,
    `volume` BIGINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stock_prices_stock_id_date_idx`(`stock_id`, `date`),
    UNIQUE INDEX `stock_prices_stock_id_date_key`(`stock_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_fundamentals` (
    `id` CHAR(36) NOT NULL,
    `stock_id` VARCHAR(191) NOT NULL,
    `period` VARCHAR(10) NOT NULL,
    `revenue` DECIMAL(18, 2) NULL,
    `net_income` DECIMAL(18, 2) NULL,
    `eps` DECIMAL(12, 2) NULL,
    `pe` DECIMAL(12, 2) NULL,
    `pbv` DECIMAL(12, 2) NULL,
    `roe` DECIMAL(6, 2) NULL,
    `debt_to_equity` DECIMAL(6, 2) NULL,
    `data` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `stock_fundamentals_stock_id_period_key`(`stock_id`, `period`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_news` (
    `id` CHAR(36) NOT NULL,
    `stock_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `url` VARCHAR(500) NULL,
    `source` VARCHAR(120) NULL,
    `published_at` DATETIME(3) NOT NULL,
    `sentiment` VARCHAR(20) NULL,
    `content` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stock_news_stock_id_published_at_idx`(`stock_id`, `published_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analysis_requests` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` ENUM('STOCK', 'COMPARE', 'SCREENER', 'SENTIMENT', 'SUMMARY', 'CHAT', 'MARKET_RECAP', 'PORTFOLIO') NOT NULL,
    `input` JSON NULL,
    `prompt_used` TEXT NULL,
    `result` JSON NULL,
    `provider` VARCHAR(40) NULL,
    `model_alias` VARCHAR(40) NULL,
    `tokens_used` INTEGER NULL,
    `credits_cost` INTEGER NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    `error_message` VARCHAR(500) NULL,
    `response_time_ms` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `analysis_requests_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usage_logs` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(160) NOT NULL,
    `method` VARCHAR(10) NULL,
    `status_code` INTEGER NULL,
    `tokens_used` INTEGER NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `usage_logs_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `usage_logs_endpoint_created_at_idx`(`endpoint`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rate_limit_hits` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `api_key_id` VARCHAR(191) NULL,
    `endpoint` VARCHAR(160) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `rate_limit_hits_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `watchlists` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL DEFAULT 'My Watchlist',
    `tickers` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `watchlists_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` CHAR(36) NOT NULL,
    `category` VARCHAR(40) NOT NULL,
    `key` VARCHAR(80) NOT NULL,
    `value` JSON NULL,
    `is_secret` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settings_category_key_key`(`category`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feature_flags` (
    `id` CHAR(36) NOT NULL,
    `slug` VARCHAR(80) NOT NULL,
    `description` VARCHAR(255) NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `feature_flags_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prompt_templates` (
    `id` CHAR(36) NOT NULL,
    `slug` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `content` TEXT NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `variables` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `prompt_templates_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_pages` (
    `id` CHAR(36) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `seo_title` VARCHAR(200) NULL,
    `seo_description` VARCHAR(300) NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `content_pages_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_templates` (
    `id` CHAR(36) NOT NULL,
    `slug` VARCHAR(80) NOT NULL,
    `subject` VARCHAR(200) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `variables` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `email_templates_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `action` VARCHAR(80) NOT NULL,
    `entity_type` VARCHAR(60) NULL,
    `entity_id` CHAR(36) NULL,
    `metadata` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `audit_logs_action_created_at_idx`(`action`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(40) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `body` TEXT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_is_read_idx`(`user_id`, `is_read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_logs` (
    `id` CHAR(36) NOT NULL,
    `to` VARCHAR(255) NOT NULL,
    `template` VARCHAR(80) NULL,
    `subject` VARCHAR(200) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'SENT',
    `error` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `email_logs_to_created_at_idx`(`to`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credits` ADD CONSTRAINT `credits_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_transactions` ADD CONSTRAINT `credit_transactions_credit_id_fkey` FOREIGN KEY (`credit_id`) REFERENCES `credits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `api_key_usage_logs` ADD CONSTRAINT `api_key_usage_logs_api_key_id_fkey` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_keys` ADD CONSTRAINT `provider_keys_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `ai_providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_models` ADD CONSTRAINT `ai_models_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `ai_providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_prices` ADD CONSTRAINT `stock_prices_stock_id_fkey` FOREIGN KEY (`stock_id`) REFERENCES `stocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_fundamentals` ADD CONSTRAINT `stock_fundamentals_stock_id_fkey` FOREIGN KEY (`stock_id`) REFERENCES `stocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_news` ADD CONSTRAINT `stock_news_stock_id_fkey` FOREIGN KEY (`stock_id`) REFERENCES `stocks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analysis_requests` ADD CONSTRAINT `analysis_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `watchlists` ADD CONSTRAINT `watchlists_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

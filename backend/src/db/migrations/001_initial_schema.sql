-- 001_initial_schema.sql
-- Core relational schema for the ERIM online shops platform (MySQL 8+).
-- Money is stored as DECIMAL(16,2) in the platform currency (UGX).
-- Long tail admin configuration collections are stored in `admin_resources`
-- as JSON documents because every collection exposes the same generic CRUD API.

CREATE TABLE IF NOT EXISTS shops (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(160) NOT NULL,
  owner_name VARCHAR(160) NOT NULL,
  owner_user_id VARCHAR(64) DEFAULT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'General',
  status VARCHAR(32) NOT NULL DEFAULT 'review',
  plan VARCHAR(32) NOT NULL DEFAULT 'Starter',
  rating DECIMAL(3,1) NOT NULL DEFAULT 0.0,
  orders_count INT UNSIGNED NOT NULL DEFAULT 0,
  revenue DECIMAL(16,2) NOT NULL DEFAULT 0.00,
  location VARCHAR(120) DEFAULT NULL,
  contact_phone VARCHAR(40) DEFAULT NULL,
  whatsapp VARCHAR(40) DEFAULT NULL,
  email VARCHAR(190) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  pickup_available TINYINT(1) NOT NULL DEFAULT 0,
  delivery_regions JSON DEFAULT NULL,
  delivery_charges JSON DEFAULT NULL,
  return_policy JSON DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_shops_status (status),
  KEY idx_shops_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'customer',
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  verification_status VARCHAR(32) NOT NULL DEFAULT 'verified',
  admin_role VARCHAR(80) DEFAULT NULL,
  permissions JSON DEFAULT NULL,
  phone VARCHAR(40) DEFAULT NULL,
  whatsapp VARCHAR(40) DEFAULT NULL,
  shop_id VARCHAR(64) DEFAULT NULL,
  personal_email VARCHAR(190) DEFAULT NULL,
  must_change_password TINYINT(1) NOT NULL DEFAULT 0,
  personal_email_required TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_shop (shop_id),
  CONSTRAINT fk_users_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_otps (
  id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  otp VARCHAR(12) NOT NULL,
  channel VARCHAR(16) NOT NULL DEFAULT 'email',
  destination VARCHAR(190) DEFAULT NULL,
  consumed TINYINT(1) NOT NULL DEFAULT 0,
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_otp_user (user_id, consumed),
  CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS delivery_logs (
  id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) DEFAULT NULL,
  channel VARCHAR(16) NOT NULL DEFAULT 'email',
  destination VARCHAR(190) DEFAULT NULL,
  type VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'sent',
  message VARCHAR(512) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_delivery_user (user_id),
  CONSTRAINT fk_delivery_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kyc_submissions (
  id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  account_type VARCHAR(32) NOT NULL DEFAULT 'customer',
  legal_name VARCHAR(160) NOT NULL,
  country VARCHAR(80) NOT NULL,
  document_type VARCHAR(64) NOT NULL,
  document_number VARCHAR(120) NOT NULL,
  business_name VARCHAR(160) DEFAULT NULL,
  tax_id VARCHAR(80) DEFAULT NULL,
  document_front_name VARCHAR(255) DEFAULT NULL,
  document_back_name VARCHAR(255) DEFAULT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'under_review',
  submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_kyc_user (user_id),
  KEY idx_kyc_status (status),
  CONSTRAINT fk_kyc_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_categories (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(120) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_subcategories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id VARCHAR(64) NOT NULL,
  name VARCHAR(120) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_subcategory (category_id, name),
  CONSTRAINT fk_subcategory_category FOREIGN KEY (category_id) REFERENCES platform_categories (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) NOT NULL,
  shop_id VARCHAR(64) NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'General',
  price DECIMAL(16,2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  image VARCHAR(512) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_products_shop (shop_id),
  KEY idx_products_category (category),
  KEY idx_products_sort (sort_order),
  CONSTRAINT fk_products_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) NOT NULL,
  customer VARCHAR(160) NOT NULL DEFAULT 'Guest customer',
  customer_user_id VARCHAR(64) DEFAULT NULL,
  shop_id VARCHAR(64) NOT NULL,
  total DECIMAL(16,2) NOT NULL DEFAULT 0.00,
  subtotal DECIMAL(16,2) DEFAULT NULL,
  delivery_fee DECIMAL(16,2) DEFAULT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'awaiting_arrangement',
  items_count INT UNSIGNED NOT NULL DEFAULT 1,
  stock_committed TINYINT(1) NOT NULL DEFAULT 0,
  delivery JSON DEFAULT NULL,
  payment JSON DEFAULT NULL,
  arrangement JSON DEFAULT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_orders_shop (shop_id),
  KEY idx_orders_status (status),
  KEY idx_orders_created (created_at),
  CONSTRAINT fk_orders_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE RESTRICT,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) DEFAULT NULL,
  name VARCHAR(200) NOT NULL,
  image VARCHAR(512) DEFAULT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  price DECIMAL(16,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id),
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_product (product_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_messages (
  id VARCHAR(64) NOT NULL,
  order_id VARCHAR(64) NOT NULL,
  sender VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_order_messages_order (order_id),
  CONSTRAINT fk_order_messages_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS merchant_chats (
  id VARCHAR(96) NOT NULL,
  shop_id VARCHAR(64) NOT NULL,
  customer VARCHAR(160) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'open',
  last_updated DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_chats_shop (shop_id, last_updated),
  CONSTRAINT fk_chats_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(64) NOT NULL,
  chat_id VARCHAR(96) NOT NULL,
  sender VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_chat_messages_chat (chat_id),
  CONSTRAINT fk_chat_messages_chat FOREIGN KEY (chat_id) REFERENCES merchant_chats (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(64) NOT NULL,
  customer VARCHAR(160) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  priority VARCHAR(16) NOT NULL DEFAULT 'medium',
  status VARCHAR(32) NOT NULL DEFAULT 'open',
  channel VARCHAR(16) NOT NULL DEFAULT 'form',
  order_id VARCHAR(64) DEFAULT NULL,
  email VARCHAR(190) DEFAULT NULL,
  phone VARCHAR(40) DEFAULT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'General Support',
  assigned_to VARCHAR(160) DEFAULT NULL,
  issue TEXT DEFAULT NULL,
  last_updated DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_tickets_status (status),
  KEY idx_tickets_order (order_id),
  CONSTRAINT fk_tickets_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ticket_notes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ticket_id VARCHAR(64) NOT NULL,
  note TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_ticket_notes_ticket (ticket_id),
  CONSTRAINT fk_ticket_notes_ticket FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ticket_replies (
  id VARCHAR(64) NOT NULL,
  ticket_id VARCHAR(64) NOT NULL,
  agent VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_ticket_replies_ticket (ticket_id),
  CONSTRAINT fk_ticket_replies_ticket FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_resources (
  seq BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  collection VARCHAR(48) NOT NULL,
  item_id VARCHAR(96) NOT NULL,
  payload JSON NOT NULL,
  status VARCHAR(32) DEFAULT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (seq),
  UNIQUE KEY uq_admin_resource (collection, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) NOT NULL,
  actor VARCHAR(160) NOT NULL DEFAULT 'System',
  action VARCHAR(200) NOT NULL,
  target VARCHAR(255) DEFAULT NULL,
  ip VARCHAR(64) DEFAULT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

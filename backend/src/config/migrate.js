import pool from './database.js';

const migrations = [
  `
  CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE,
    preferred_locale VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS user_tts_settings (
    user_id CHAR(36) PRIMARY KEY,
    enabled BOOLEAN DEFAULT TRUE,
    auto_read BOOLEAN DEFAULT FALSE,
    preferred_voice VARCHAR(100),
    preferred_accent VARCHAR(50),
    playback_speed DECIMAL(3,2) DEFAULT 1.00,
    pitch DECIMAL(3,2) DEFAULT 1.00,
    volume DECIMAL(3,2) DEFAULT 1.00,
    skip_code BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS conversations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    title VARCHAR(255),
    locale VARCHAR(10) DEFAULT 'en',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id CHAR(36),
    role ENUM('user', 'assistant', 'system') NOT NULL,
    content TEXT NOT NULL,
    model VARCHAR(50),
    tokens_used INTEGER,
    latency_ms INTEGER,
    feedback TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  );
  `,
  `
  CREATE INDEX idx_messages_conversation ON messages(conversation_id);
  `,
  `
  CREATE INDEX idx_conversations_user ON conversations(user_id);
  `
];

async function migrate() {
  console.log('Running migrations...');
  for (const migration of migrations) {
    try {
      await pool.execute(migration);
      console.log('Migration executed successfully');
    } catch (err) {
      // Ignore "Duplicate key name" errors for indexes that already exist
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('Index already exists, skipping...');
      } else {
        console.error('Migration failed:', err.message);
      }
    }
  }
  console.log('Migrations complete!');
  await pool.end();
}

migrate();

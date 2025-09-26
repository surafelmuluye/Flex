import { db } from './drizzle';
import { sql } from 'drizzle-orm';
import log from '@/lib/logger';

export async function runMigration() {
  log.info('Starting database migration...');

  try {
    // Drop old SaaS tables that we don't need
    await db.execute(sql`DROP TABLE IF EXISTS team_members CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS invitations CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS teams CASCADE`);
    log.info('Dropped old SaaS tables');

    // Create managers table (fresh start)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS managers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        is_first_user BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    log.info('Created managers table');

    // Create activity_logs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        manager_id INTEGER NOT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `);
    log.info('Created activity_logs table');

    // Create review_approvals table (without foreign key constraint initially)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS review_approvals (
        id SERIAL PRIMARY KEY,
        review_id VARCHAR(100) NOT NULL,
        listing_id VARCHAR(100) NOT NULL,
        approved BOOLEAN DEFAULT false,
        approved_by INTEGER,
        approved_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    log.info('Created review_approvals table');

    // Add foreign key constraint after table exists
    await db.execute(sql`
      ALTER TABLE activity_logs 
      DROP CONSTRAINT IF EXISTS activity_logs_manager_id_fkey
    `);
    await db.execute(sql`
      ALTER TABLE activity_logs 
      ADD CONSTRAINT activity_logs_manager_id_fkey 
      FOREIGN KEY (manager_id) REFERENCES managers(id)
    `);

    await db.execute(sql`
      ALTER TABLE review_approvals 
      DROP CONSTRAINT IF EXISTS review_approvals_approved_by_fkey
    `);
    await db.execute(sql`
      ALTER TABLE review_approvals 
      ADD CONSTRAINT review_approvals_approved_by_fkey 
      FOREIGN KEY (approved_by) REFERENCES managers(id)
    `);

    log.info('Migration completed successfully!');
  } catch (error: any) {
    log.error('Migration failed', { error: error?.message || String(error) });
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

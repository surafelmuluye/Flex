import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function createReviewsTable() {
  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL environment variable is not set');
    process.exit(1);
  }

  const client = postgres(process.env.POSTGRES_URL);

  try {
    console.log('Creating reviews table...');

    // Create reviews table
    await client`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        hostaway_id INTEGER UNIQUE,
        listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        rating INTEGER,
        content TEXT NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        author_email VARCHAR(255),
        categories JSONB,
        submitted_at TIMESTAMP NOT NULL,
        approved_by INTEGER REFERENCES managers(id),
        approved_at TIMESTAMP,
        rejected_by INTEGER REFERENCES managers(id),
        rejected_at TIMESTAMP,
        rejection_reason TEXT,
        notes TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create indexes
    await client`
      CREATE INDEX IF NOT EXISTS reviews_listing_idx ON reviews(listing_id)
    `;
    await client`
      CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews(status)
    `;
    await client`
      CREATE INDEX IF NOT EXISTS reviews_type_idx ON reviews(type)
    `;
    await client`
      CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(rating)
    `;
    await client`
      CREATE INDEX IF NOT EXISTS reviews_submitted_at_idx ON reviews(submitted_at)
    `;
    await client`
      CREATE INDEX IF NOT EXISTS reviews_hostaway_id_idx ON reviews(hostaway_id)
    `;

    // Add trigger to update updated_at timestamp
    await client`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await client`
      DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews
    `;

    await client`
      CREATE TRIGGER update_reviews_updated_at 
          BEFORE UPDATE ON reviews 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column()
    `;

    console.log('✅ Reviews table created successfully!');

  } catch (error) {
    console.error('❌ Error creating reviews table:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
createReviewsTable()
  .then(() => {
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });





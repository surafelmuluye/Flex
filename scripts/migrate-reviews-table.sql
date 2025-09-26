-- Migration script to add reviews table
-- Run this script to add the reviews table to your database

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
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS reviews_listing_idx ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews(status);
CREATE INDEX IF NOT EXISTS reviews_type_idx ON reviews(type);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(rating);
CREATE INDEX IF NOT EXISTS reviews_submitted_at_idx ON reviews(submitted_at);
CREATE INDEX IF NOT EXISTS reviews_hostaway_id_idx ON reviews(hostaway_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();





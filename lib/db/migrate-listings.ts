import { db } from './drizzle';
import { sql } from 'drizzle-orm';
import log from '@/lib/logger';

export async function runListingsMigration() {
  log.info('Starting listings database migration...');

  try {
    // Drop existing listings tables if they exist (for clean migration)
    await db.execute(sql`DROP TABLE IF EXISTS listing_bed_types CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS listing_images CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS listing_amenities CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS listings CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS bed_types CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS amenities CASCADE`);
    log.info('Dropped existing listings tables');

    // Create amenities table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS amenities (
        id SERIAL PRIMARY KEY,
        amenity_id INTEGER UNIQUE,
        amenity_name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        icon VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    log.info('Created amenities table');

    // Create bed_types table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bed_types (
        id SERIAL PRIMARY KEY,
        bed_type_id INTEGER UNIQUE,
        bed_type_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    log.info('Created bed_types table');

    // Create listings table with all fields and indexes
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        hostaway_id INTEGER UNIQUE,
        name VARCHAR(255) NOT NULL,
        external_listing_name VARCHAR(255),
        internal_listing_name VARCHAR(255),
        description TEXT,
        thumbnail_url TEXT,
        
        -- Location fields
        country VARCHAR(100) NOT NULL,
        country_code VARCHAR(3),
        state VARCHAR(100),
        city VARCHAR(100) NOT NULL,
        street VARCHAR(255),
        address TEXT NOT NULL,
        public_address TEXT,
        zipcode VARCHAR(20),
        lat DECIMAL(10,8),
        lng DECIMAL(11,8),
        
        -- Pricing and capacity
        price DECIMAL(10,2) NOT NULL,
        cleaning_fee DECIMAL(10,2) DEFAULT 0,
        checkin_fee DECIMAL(10,2) DEFAULT 0,
        price_for_extra_person DECIMAL(10,2) DEFAULT 0,
        refundable_damage_deposit DECIMAL(10,2) DEFAULT 0,
        
        -- Property details
        bedrooms_number INTEGER NOT NULL DEFAULT 0,
        bathrooms_number INTEGER NOT NULL DEFAULT 0,
        beds_number INTEGER DEFAULT 0,
        person_capacity INTEGER NOT NULL DEFAULT 1,
        max_children_allowed INTEGER,
        max_infants_allowed INTEGER,
        max_pets_allowed INTEGER,
        square_meters INTEGER,
        
        -- Property type and room details
        property_type_id INTEGER,
        room_type VARCHAR(50),
        bathroom_type VARCHAR(50),
        
        -- Stay policies
        min_nights INTEGER DEFAULT 1,
        max_nights INTEGER,
        guests_included INTEGER DEFAULT 1,
        check_in_time_start INTEGER,
        check_in_time_end INTEGER,
        check_out_time INTEGER,
        cancellation_policy VARCHAR(50),
        
        -- Property rules and instructions
        house_rules TEXT,
        key_pickup TEXT,
        special_instruction TEXT,
        door_security_code VARCHAR(50),
        cleaning_instruction TEXT,
        
        -- Contact information
        contact_name VARCHAR(100),
        contact_sur_name VARCHAR(100),
        contact_phone1 VARCHAR(50),
        contact_phone2 VARCHAR(50),
        contact_language VARCHAR(100),
        contact_email VARCHAR(255),
        contact_address TEXT,
        
        -- System fields
        language VARCHAR(10) DEFAULT 'en',
        currency_code VARCHAR(3) DEFAULT 'USD',
        time_zone_name VARCHAR(50),
        
        -- Status and metadata
        instant_bookable BOOLEAN DEFAULT false,
        allow_same_day_booking BOOLEAN DEFAULT false,
        same_day_booking_lead_time INTEGER,
        cleanness_status VARCHAR(10),
        cleanness_status_updated_on TIMESTAMP,
        
        -- WiFi credentials
        wifi_username VARCHAR(100),
        wifi_password VARCHAR(100),
        
        -- Timestamps
        inserted_on TIMESTAMP NOT NULL DEFAULT NOW(),
        latest_activity_on TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    log.info('Created listings table');

    // Create listing_amenities junction table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS listing_amenities (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER NOT NULL,
        amenity_id INTEGER NOT NULL,
        amenity_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(listing_id, amenity_id)
      )
    `);
    log.info('Created listing_amenities table');

    // Create listing_images table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS listing_images (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        caption VARCHAR(255),
        sort_order INTEGER DEFAULT 0,
        is_thumbnail BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    log.info('Created listing_images table');

    // Create listing_bed_types junction table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS listing_bed_types (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER NOT NULL,
        bed_type_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        bedroom_number INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    log.info('Created listing_bed_types table');

    // Create indexes for efficient filtering and searching
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listings_city_idx ON listings(city)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listings_country_idx ON listings(country)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listings_price_idx ON listings(price)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listings_bedrooms_idx ON listings(bedrooms_number)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listings_bathrooms_idx ON listings(bathrooms_number)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listings_capacity_idx ON listings(person_capacity)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listings_instant_bookable_idx ON listings(instant_bookable)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listings_location_idx ON listings(lat, lng)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listings_search_idx ON listings(name, city, country)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listings_hostaway_id_idx ON listings(hostaway_id)`);
    
    await db.execute(sql`CREATE INDEX IF NOT EXISTS amenities_name_idx ON amenities(amenity_name)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS amenities_category_idx ON amenities(category)`);
    
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listing_amenities_listing_idx ON listing_amenities(listing_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listing_amenities_amenity_idx ON listing_amenities(amenity_id)`);
    
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listing_images_listing_idx ON listing_images(listing_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listing_images_sort_order_idx ON listing_images(listing_id, sort_order)`);
    
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listing_bed_types_listing_idx ON listing_bed_types(listing_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS listing_bed_types_bedroom_idx ON listing_bed_types(listing_id, bedroom_number)`);
    
    log.info('Created all indexes');

    // Add foreign key constraints
    await db.execute(sql`
      ALTER TABLE listing_amenities 
      ADD CONSTRAINT listing_amenities_listing_id_fkey 
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
    `);
    await db.execute(sql`
      ALTER TABLE listing_amenities 
      ADD CONSTRAINT listing_amenities_amenity_id_fkey 
      FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
    `);

    await db.execute(sql`
      ALTER TABLE listing_images 
      ADD CONSTRAINT listing_images_listing_id_fkey 
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
    `);

    await db.execute(sql`
      ALTER TABLE listing_bed_types 
      ADD CONSTRAINT listing_bed_types_listing_id_fkey 
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
    `);
    await db.execute(sql`
      ALTER TABLE listing_bed_types 
      ADD CONSTRAINT listing_bed_types_bed_type_id_fkey 
      FOREIGN KEY (bed_type_id) REFERENCES bed_types(id) ON DELETE CASCADE
    `);

    log.info('Added foreign key constraints');
    log.info('Listings migration completed successfully!');
  } catch (error: any) {
    log.error('Listings migration failed', { error: error?.message || String(error) });
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  runListingsMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}






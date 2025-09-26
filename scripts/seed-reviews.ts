import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { reviews, listings } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

// Database connection
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/flex_dashboard';
const client = postgres(connectionString);
const db = drizzle(client);

// Review categories for realistic data
const reviewCategories = [
  { category: 'cleanliness', rating: 10 },
  { category: 'communication', rating: 10 },
  { category: 'check_in', rating: 10 },
  { category: 'accuracy', rating: 10 },
  { category: 'location', rating: 10 },
  { category: 'value', rating: 10 },
  { category: 'respect_house_rules', rating: 10 }
];

// Sample review content for different scenarios
const reviewTemplates = {
  positive: [
    "Amazing stay! The apartment was clean, well-equipped, and in a perfect location. The host was very responsive and helpful.",
    "Great experience! The place was exactly as described and the location was fantastic. Would definitely stay again.",
    "Wonderful property with excellent amenities. The host was very accommodating and the check-in process was smooth.",
    "Perfect location and beautiful views. The apartment was spotless and had everything we needed for our stay.",
    "Excellent host and property! The place was clean, comfortable, and in a great location. Highly recommended!"
  ],
  mixed: [
    "Good experience overall. The place was nice but could use some updates. Great location though!",
    "Decent stay. The apartment was clean but the WiFi was a bit slow. The host was responsive to our concerns.",
    "Nice property with good amenities. The location was convenient but the street noise was noticeable at night.",
    "Overall good stay. The place was clean and comfortable, though the check-in process could be smoother.",
    "Good value for money. The apartment was decent but could use some maintenance. The host was helpful."
  ],
  negative: [
    "Disappointing stay. The apartment didn't match the description and had several issues that weren't addressed.",
    "Not what we expected. The place was not clean and had maintenance issues that should have been fixed.",
    "Poor experience. The host was unresponsive and the apartment had several problems that affected our stay.",
    "Would not recommend. The place was not as advertised and the host was not helpful when we had issues.",
    "Terrible stay. The apartment was dirty and had multiple problems that made our stay uncomfortable."
  ]
};

// Guest names for realistic data
const guestNames = [
  'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Thompson', 'Lisa Anderson',
  'James Wilson', 'Maria Garcia', 'Robert Brown', 'Jennifer Davis', 'Christopher Lee',
  'Amanda Taylor', 'Daniel Martinez', 'Jessica White', 'Matthew Jackson', 'Ashley Harris',
  'Andrew Clark', 'Stephanie Lewis', 'Kevin Walker', 'Nicole Hall', 'Ryan Young',
  'Rachel King', 'Brandon Wright', 'Lauren Lopez', 'Tyler Hill', 'Megan Green',
  'Jordan Adams', 'Kayla Baker', 'Cameron Nelson', 'Samantha Carter', 'Justin Mitchell'
];

// Property-specific review content
const propertySpecificReviews = {
  'Luxury Downtown Apartment': {
    positive: [
      "Stunning views of the city skyline! The apartment was luxurious and had all the amenities we needed.",
      "Perfect downtown location with easy access to everything. The apartment was beautifully furnished and spotless.",
      "Amazing luxury apartment with incredible city views. The host was very professional and accommodating."
    ],
    mixed: [
      "Nice luxury apartment but the street noise was quite loud at night. Great location though.",
      "Beautiful apartment with great amenities, but the WiFi was inconsistent during our stay."
    ]
  },
  'Cozy Beach House': {
    positive: [
      "Perfect beach getaway! The house was charming and just steps from the ocean.",
      "Amazing beach house with a great view. The location was perfect for our family vacation.",
      "Wonderful beach house! The sound of the waves was so relaxing and the house was well-equipped."
    ],
    mixed: [
      "Nice beach house but the weather wasn't great during our stay. The house itself was lovely.",
      "Good beach house with great location, though it could use some updates to the furniture."
    ]
  },
  'Modern City Loft': {
    positive: [
      "Fantastic modern loft with industrial charm! The space was perfect for our urban getaway.",
      "Amazing loft with great design and perfect location. The host was very helpful with local recommendations.",
      "Beautiful modern space with excellent amenities. The loft was exactly as described and very comfortable."
    ],
    mixed: [
      "Nice modern loft but the open floor plan made it a bit noisy. Great location and design though.",
      "Good loft with modern amenities, though the heating system was a bit tricky to figure out."
    ]
  }
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateReviewCategories(): Array<{ category: string; rating: number }> {
  const categories = getRandomElement(reviewCategories);
  const numCategories = Math.floor(Math.random() * 4) + 3; // 3-6 categories
  const selectedCategories = reviewCategories.slice(0, numCategories);
  
  return selectedCategories.map(cat => ({
    category: cat.category,
    rating: Math.floor(Math.random() * 3) + 8 // 8-10 rating
  }));
}

function generateReviewContent(propertyName: string, rating: number): string {
  const propertyReviews = propertySpecificReviews[propertyName as keyof typeof propertySpecificReviews];
  
  if (rating >= 4.5) {
    if (propertyReviews?.positive) {
      return getRandomElement(propertyReviews.positive);
    }
    return getRandomElement(reviewTemplates.positive);
  } else if (rating >= 3.0) {
    if (propertyReviews?.mixed) {
      return getRandomElement(propertyReviews.mixed);
    }
    return getRandomElement(reviewTemplates.mixed);
  } else {
    return getRandomElement(reviewTemplates.negative);
  }
}

async function seedReviews() {
  try {
    console.log('🌱 Starting review seeding...');
    
    // Get all listings
    const allListings = await db.select().from(listings);
    console.log(`📋 Found ${allListings.length} listings to seed reviews for`);
    
    if (allListings.length === 0) {
      console.log('❌ No listings found. Please seed listings first.');
      return;
    }
    
    const reviewsToInsert = [];
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
    
    // Generate reviews for each listing
    for (const listing of allListings) {
      const numReviews = Math.floor(Math.random() * 20) + 5; // 5-24 reviews per property
      
      for (let i = 0; i < numReviews; i++) {
        const rating = Math.floor(Math.random() * 5) + 1; // 1-5 rating
        const reviewType = Math.random() > 0.7 ? 'host-to-guest' : 'guest-to-host';
        const status = Math.random() > 0.3 ? 'pending' : (Math.random() > 0.5 ? 'approved' : 'rejected');
        const submittedAt = generateRandomDate(sixMonthsAgo, now);
        
        const review = {
          hostawayId: Math.floor(Math.random() * 10000) + 1000, // Random Hostaway ID
          listingId: listing.id,
          type: reviewType,
          status: status,
          rating: rating,
          content: generateReviewContent(listing.name, rating),
          authorName: getRandomElement(guestNames),
          authorEmail: `guest${Math.floor(Math.random() * 1000)}@example.com`,
          categories: generateReviewCategories(),
          submittedAt: submittedAt,
          isPublic: status === 'approved' && Math.random() > 0.3, // 70% of approved reviews are public
          notes: Math.random() > 0.8 ? 'Great guest, would host again!' : null,
        };
        
        reviewsToInsert.push(review);
      }
    }
    
    console.log(`📝 Generated ${reviewsToInsert.length} reviews to insert`);
    
    // Insert reviews in batches
    const batchSize = 100;
    for (let i = 0; i < reviewsToInsert.length; i += batchSize) {
      const batch = reviewsToInsert.slice(i, i + batchSize);
      await db.insert(reviews).values(batch);
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(reviewsToInsert.length / batchSize)}`);
    }
    
    console.log('🎉 Review seeding completed successfully!');
    
    // Print summary statistics
    const totalReviews = await db.select().from(reviews);
    const approvedReviews = totalReviews.filter(r => r.status === 'approved');
    const pendingReviews = totalReviews.filter(r => r.status === 'pending');
    const rejectedReviews = totalReviews.filter(r => r.status === 'rejected');
    const publicReviews = totalReviews.filter(r => r.isPublic);
    
    console.log('\n📊 Review Statistics:');
    console.log(`Total Reviews: ${totalReviews.length}`);
    console.log(`Approved: ${approvedReviews.length}`);
    console.log(`Pending: ${pendingReviews.length}`);
    console.log(`Rejected: ${rejectedReviews.length}`);
    console.log(`Public: ${publicReviews.length}`);
    
    const avgRating = totalReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews.length;
    console.log(`Average Rating: ${avgRating.toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedReviews()
    .then(() => {
      console.log('✅ Review seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Review seeding failed:', error);
      process.exit(1);
    });
}

export { seedReviews };

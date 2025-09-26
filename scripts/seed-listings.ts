import { db } from '../lib/db/drizzle';
import { 
  listings, 
  amenities, 
  listingAmenities, 
  listingImages, 
  bedTypes, 
  listingBedTypes,
  type NewListing,
  type NewAmenity,
  type NewListingAmenity,
  type NewListingImage,
  type NewBedType,
  type NewListingBedType
} from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import log from '../lib/logger';

// Sample data for generating realistic listings
const cities = [
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lng: 2.3522 },
  { name: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lng: -74.0060 },
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6762, lng: 139.6503 },
  { name: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8688, lng: 151.2093 },
  { name: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.3851, lng: 2.1734 },
  { name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.3676, lng: 4.9041 },
  { name: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.5200, lng: 13.4050 },
  { name: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.9028, lng: 12.4964 },
  { name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lng: 55.2708 },
  { name: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lng: 103.8198 },
  { name: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.7563, lng: 100.5018 },
  { name: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.0760, lng: 72.8777 },
  { name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', lat: -33.9249, lng: 18.4241 },
  { name: 'São Paulo', country: 'Brazil', countryCode: 'BR', lat: -23.5505, lng: -46.6333 },
  { name: 'Mexico City', country: 'Mexico', countryCode: 'MX', lat: 19.4326, lng: -99.1332 },
  { name: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.6532, lng: -79.3832 },
  { name: 'Vancouver', country: 'Canada', countryCode: 'CA', lat: 49.2827, lng: -123.1207 },
  { name: 'Melbourne', country: 'Australia', countryCode: 'AU', lat: -37.8136, lng: 144.9631 },
  { name: 'Seoul', country: 'South Korea', countryCode: 'KR', lat: 37.5665, lng: 126.9780 }
];

const propertyTypes = [
  'Apartment', 'House', 'Condo', 'Villa', 'Studio', 'Loft', 'Penthouse', 'Townhouse', 'Cottage', 'Mansion'
];

const roomTypes = ['entire_home', 'private_room', 'shared_room'];
const bathroomTypes = ['private', 'shared'];
const cancellationPolicies = ['flexible', 'moderate', 'strict', 'super_strict_30', 'super_strict_60'];

const propertyNames = [
  'Modern', 'Cozy', 'Luxury', 'Charming', 'Stylish', 'Elegant', 'Contemporary', 'Traditional', 'Boutique', 'Premium',
  'Urban', 'Historic', 'Seaside', 'Mountain', 'Garden', 'Sky', 'Royal', 'Grand', 'Classic', 'Artistic'
];

const locationDescriptors = [
  'Downtown', 'Historic District', 'Arts Quarter', 'Financial District', 'Old Town', 'Waterfront', 'Hillside', 'Garden District', 'University Area', 'Business Center'
];

// Amenities data from the Hostaway listing
const amenityData = [
  { id: 1, name: 'Cable TV', category: 'Entertainment' },
  { id: 2, name: 'Internet', category: 'Connectivity' },
  { id: 3, name: 'Wireless', category: 'Connectivity' },
  { id: 13, name: 'Washing Machine', category: 'Laundry' },
  { id: 16, name: '24-hour checkin', category: 'Check-in' },
  { id: 17, name: 'Hair Dryer', category: 'Bathroom' },
  { id: 18, name: 'Heating', category: 'Climate' },
  { id: 25, name: 'Smoke detector', category: 'Safety' },
  { id: 26, name: 'Carbon Monoxide Detector', category: 'Safety' },
  { id: 29, name: 'Essentials', category: 'Basic' },
  { id: 30, name: 'Shampoo', category: 'Bathroom' },
  { id: 31, name: 'Hangers', category: 'Storage' },
  { id: 32, name: 'Iron', category: 'Laundry' },
  { id: 34, name: 'TV', category: 'Entertainment' },
  { id: 47, name: 'Private living room', category: 'Space' },
  { id: 48, name: 'Suitable for children', category: 'Family' },
  { id: 49, name: 'Suitable for infants', category: 'Family' },
  { id: 53, name: 'Iron board', category: 'Laundry' },
  { id: 54, name: 'Linens', category: 'Bedding' },
  { id: 56, name: 'Toaster', category: 'Kitchen' },
  { id: 57, name: 'Dishwasher', category: 'Kitchen' },
  { id: 58, name: 'Microwave', category: 'Kitchen' },
  { id: 59, name: 'Oven', category: 'Kitchen' },
  { id: 60, name: 'Electric kettle', category: 'Kitchen' },
  { id: 62, name: 'Shower', category: 'Bathroom' },
  { id: 63, name: 'Tub', category: 'Bathroom' },
  { id: 68, name: 'Stove', category: 'Kitchen' },
  { id: 69, name: 'Refrigerator', category: 'Kitchen' },
  { id: 70, name: 'Towels', category: 'Bathroom' },
  { id: 72, name: 'Garden or backyard', category: 'Outdoor' },
  { id: 74, name: 'Kitchen utensils', category: 'Kitchen' },
  { id: 101, name: 'Hot water', category: 'Basic' },
  { id: 129, name: 'Toilet', category: 'Bathroom' },
  { id: 149, name: 'Dining area', category: 'Space' },
  { id: 202, name: 'Long term stays allowed', category: 'Policy' },
  { id: 267, name: 'Enhanced Cleaning Practices', category: 'Cleaning' },
  { id: 272, name: 'Contactless Check-In/Out', category: 'Check-in' },
  { id: 280, name: 'Free WiFi', category: 'Connectivity' },
  { id: 282, name: 'WiFi speed (25+ Mbps)', category: 'Connectivity' },
  { id: 287, name: 'Smart TV', category: 'Entertainment' },
  { id: 294, name: 'Dining table', category: 'Furniture' },
  { id: 337, name: 'Cleaning products', category: 'Cleaning' },
  { id: 338, name: 'Body soap', category: 'Bathroom' },
  { id: 339, name: 'Conditioner', category: 'Bathroom' },
  { id: 341, name: 'Shower gel', category: 'Bathroom' },
  { id: 342, name: 'Clothing storage', category: 'Storage' },
  { id: 343, name: 'Drying rack for clothing', category: 'Laundry' },
  { id: 351, name: 'Portable fans', category: 'Climate' },
  { id: 357, name: 'Freezer', category: 'Kitchen' },
  { id: 361, name: 'Wine glasses', category: 'Kitchen' }
];

const bedTypeData = [
  { id: 1, name: 'Single bed' },
  { id: 2, name: 'Double bed' },
  { id: 3, name: 'Queen bed' },
  { id: 4, name: 'King bed' },
  { id: 5, name: 'Sofa bed' },
  { id: 6, name: 'Bunk bed' },
  { id: 7, name: 'Futon' },
  { id: 8, name: 'Air mattress' },
  { id: 49, name: 'Air mattress' }
];

// Sample images from the Hostaway listing (we'll reuse these)
const sampleImages = [
  {
    url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/61148-155613-Q--MbaXvAXE-zjXmOxoJ2Pq9cuC06iwhkZu12FefEies-6425773082011",
    caption: "Living Room"
  },
  {
    url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/61148-155613-8kZYWNkuTpiBCDLYq2--ftV--3BrChTZBGuDv2ZqxZQFk-642577378cbb2",
    caption: "Kitchen"
  },
  {
    url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/61148-155613-wsfgj1N9QbgIUJDtOc3RWrpZ6d0MpKOLW79bukNp--gM-6425773eb346a",
    caption: "Bedroom"
  },
  {
    url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/61148-155613-MPSNBffYst12DUwg4SxAfApqD5yfewt3Yd9t5p7vrww-6425774610986",
    caption: "Bathroom"
  },
  {
    url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/61148-155613-iyM94ntDUqzJWlvM7K0jydynf3nUm3nKYTokZv9WnR8-6425774de77d2",
    caption: "Cover Photo"
  },
  {
    url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/61148-155613-jWE3j5tl6Hq1KUW3MNenRbHB8byTcqBylbXy3vn5GW8-642577571e71f",
    caption: "Exterior"
  },
  {
    url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/61148-155613-fpANhjPxQH0UBsXF4LGaM60lzK78w0drVn2e3tq4gTE-642577615abd4",
    caption: "Dining Area"
  },
  {
    url: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/61148-155613-cXzFkL--eb42nnvhxlCkpUohN5RWrGqx7LFsU6THxjyE-64257769ce50c",
    caption: "Balcony"
  }
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomPrice(): string {
  const basePrice = Math.floor(Math.random() * 500) + 50; // $50-$550
  return basePrice.toString();
}

function generateRandomCapacity(): number {
  return Math.floor(Math.random() * 8) + 1; // 1-8 guests
}

function generateRandomBedrooms(): number {
  return Math.floor(Math.random() * 4) + 1; // 1-4 bedrooms
}

function generateRandomBathrooms(): number {
  return Math.floor(Math.random() * 3) + 1; // 1-3 bathrooms
}

function generatePropertyName(city: string): string {
  const propertyType = getRandomElement(propertyTypes);
  const descriptor = getRandomElement(propertyNames);
  const location = getRandomElement(locationDescriptors);
  
  return `${descriptor} ${propertyType} in ${location}`;
}

function generateDescription(name: string, city: string, country: string, bedrooms: number, bathrooms: number, capacity: number): string {
  const descriptions = [
    `Experience the perfect blend of comfort and style in this beautiful ${name.toLowerCase()}. Located in the heart of ${city}, this property offers an ideal base for exploring the city.`,
    `Welcome to this stunning ${name.toLowerCase()} in ${city}, ${country}. This beautifully appointed property combines modern amenities with classic charm, perfect for both business and leisure travelers.`,
    `Discover the magic of ${city} from this exceptional ${name.toLowerCase()}. With its prime location and thoughtful design, this property provides an unforgettable stay in one of the world's most exciting cities.`,
    `This elegant ${name.toLowerCase()} in ${city} offers the perfect combination of luxury and convenience. Whether you're here for business or pleasure, you'll find everything you need for a comfortable stay.`,
    `Step into this beautifully designed ${name.toLowerCase()} in the vibrant city of ${city}. This property features modern amenities and a prime location, making it the perfect choice for your next getaway.`
  ];
  
  const baseDescription = getRandomElement(descriptions);
  const roomDetails = `\n\nThis ${bedrooms}-bedroom, ${bathrooms}-bathroom property can comfortably accommodate up to ${capacity} guests.`;
  const amenities = `\n\nKey features include:\n- High-speed WiFi\n- Fully equipped kitchen\n- Modern bathroom facilities\n- Comfortable living spaces\n- Prime location in ${city}`;
  
  return baseDescription + roomDetails + amenities;
}

async function seedAmenities(): Promise<Map<number, number>> {
  log.info('Seeding amenities...');
  const amenityMap = new Map<number, number>();
  
  for (const amenity of amenityData) {
    const [inserted] = await db.insert(amenities).values({
      amenityId: amenity.id,
      amenityName: amenity.name,
      category: amenity.category,
    }).returning({ id: amenities.id });
    
    amenityMap.set(amenity.id, inserted.id);
  }
  
  log.info(`Seeded ${amenityData.length} amenities`);
  return amenityMap;
}

async function seedBedTypes(): Promise<Map<number, number>> {
  log.info('Seeding bed types...');
  const bedTypeMap = new Map<number, number>();
  
  for (const bedType of bedTypeData) {
    const [inserted] = await db.insert(bedTypes).values({
      bedTypeId: bedType.id,
      bedTypeName: bedType.name,
    }).returning({ id: bedTypes.id });
    
    bedTypeMap.set(bedType.id, inserted.id);
  }
  
  log.info(`Seeded ${bedTypeData.length} bed types`);
  return bedTypeMap;
}

async function seedListings(count: number, amenityMap: Map<number, number>, bedTypeMap: Map<number, number>): Promise<void> {
  log.info(`Seeding ${count} listings...`);
  
  for (let i = 0; i < count; i++) {
    const city = getRandomElement(cities);
    const bedrooms = generateRandomBedrooms();
    const bathrooms = generateRandomBathrooms();
    const capacity = generateRandomCapacity();
    const price = generateRandomPrice();
    const name = generatePropertyName(city.name);
    const description = generateDescription(name, city.name, city.country, bedrooms, bathrooms, capacity);
    
    // Create the listing
    const [listing] = await db.insert(listings).values({
      hostawayId: 155613 + i, // Start from the original Hostaway ID
      name,
      externalListingName: name,
      internalListingName: `${bedrooms}B ${city.name} - ${i + 1}`,
      description,
      country: city.country,
      countryCode: city.countryCode,
      city: city.name,
      street: `${Math.floor(Math.random() * 999) + 1} ${getRandomElement(['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Cedar Ln'])}`,
      address: `${Math.floor(Math.random() * 999) + 1} ${getRandomElement(['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Cedar Ln'])}, ${city.name}, ${city.country}`,
      publicAddress: `${city.name}, ${city.country}`,
      zipcode: Math.floor(Math.random() * 99999).toString().padStart(5, '0'),
      lat: (city.lat + (Math.random() - 0.5) * 0.1).toString(), // Add some variation
      lng: (city.lng + (Math.random() - 0.5) * 0.1).toString(),
      price,
      cleaningFee: (Math.floor(Math.random() * 100) + 25).toString(), // $25-$125
      checkinFee: Math.random() > 0.7 ? (Math.floor(Math.random() * 50) + 10).toString() : '0',
      priceForExtraPerson: Math.random() > 0.5 ? (Math.floor(Math.random() * 50) + 10).toString() : '0',
      refundableDamageDeposit: Math.random() > 0.6 ? (Math.floor(Math.random() * 500) + 100).toString() : '0',
      bedroomsNumber: bedrooms,
      bathroomsNumber: bathrooms,
      bedsNumber: bedrooms + Math.floor(Math.random() * 2), // Usually bedrooms + 0-1 extra beds
      personCapacity: capacity,
      maxChildrenAllowed: Math.floor(Math.random() * 4),
      maxInfantsAllowed: Math.floor(Math.random() * 2),
      maxPetsAllowed: Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0,
      squareMeters: Math.floor(Math.random() * 200) + 50, // 50-250 sqm
      propertyTypeId: Math.floor(Math.random() * 10) + 1,
      roomType: getRandomElement(roomTypes),
      bathroomType: getRandomElement(bathroomTypes),
      minNights: Math.floor(Math.random() * 7) + 1, // 1-7 nights
      maxNights: Math.floor(Math.random() * 365) + 30, // 30-395 nights
      guestsIncluded: Math.floor(Math.random() * 4) + 1,
      checkInTimeStart: 15,
      checkInTimeEnd: 23,
      checkOutTime: 10,
      cancellationPolicy: getRandomElement(cancellationPolicies),
      houseRules: 'No smoking, No parties, Respect quiet hours (10pm-8am)',
      contactName: getRandomElement(['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Anna']),
      contactSurName: getRandomElement(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']),
      contactPhone1: `+${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      contactLanguage: 'English',
      contactEmail: `contact${i}@example.com`,
      language: 'en',
      currencyCode: getRandomElement(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
      timeZoneName: getRandomElement(['UTC', 'EST', 'PST', 'CET', 'JST', 'AEST']),
      instantBookable: Math.random() > 0.3,
      allowSameDayBooking: Math.random() > 0.7,
      sameDayBookingLeadTime: Math.floor(Math.random() * 12) + 1,
      cleannessStatus: getRandomElement(['1', '2', '3']),
    }).returning({ id: listings.id });
    
    // Add amenities (5-15 random amenities per listing)
    const selectedAmenities = getRandomElements(amenityData, Math.floor(Math.random() * 11) + 5);
    for (const amenity of selectedAmenities) {
      await db.insert(listingAmenities).values({
        listingId: listing.id,
        amenityId: amenityMap.get(amenity.id)!,
        amenityName: amenity.name,
      });
    }
    
    // Add images (3-8 images per listing)
    const imageCount = Math.floor(Math.random() * 6) + 3;
    const selectedImages = getRandomElements(sampleImages, imageCount);
    for (let j = 0; j < selectedImages.length; j++) {
      await db.insert(listingImages).values({
        listingId: listing.id,
        url: selectedImages[j].url,
        caption: selectedImages[j].caption,
        sortOrder: j,
        isThumbnail: j === 0,
      });
    }
    
    // Add bed types
    const bedTypesForListing = [
      { bedTypeId: 2, quantity: bedrooms, bedroomNumber: 1 }, // Double beds in bedrooms
    ];
    
    // Add extra bed in living room if capacity > bedrooms * 2
    if (capacity > bedrooms * 2) {
      bedTypesForListing.push({
        bedTypeId: 49, // Air mattress
        quantity: 1,
        bedroomNumber: 0, // Living room
      });
    }
    
    for (const bedType of bedTypesForListing) {
      await db.insert(listingBedTypes).values({
        listingId: listing.id,
        bedTypeId: bedTypeMap.get(bedType.bedTypeId)!,
        quantity: bedType.quantity,
        bedroomNumber: bedType.bedroomNumber,
      });
    }
    
    if ((i + 1) % 50 === 0) {
      log.info(`Seeded ${i + 1} listings...`);
    }
  }
  
  log.info(`Successfully seeded ${count} listings`);
}

async function main() {
  try {
    log.info('Starting database seeding...');
    
    // Clear existing data
    log.info('Clearing existing data...');
    await db.delete(listingBedTypes);
    await db.delete(listingImages);
    await db.delete(listingAmenities);
    await db.delete(listings);
    await db.delete(bedTypes);
    await db.delete(amenities);
    
    // Seed amenities and bed types first
    const amenityMap = await seedAmenities();
    const bedTypeMap = await seedBedTypes();
    
    // Seed listings
    await seedListings(300, amenityMap, bedTypeMap);
    
    log.info('Database seeding completed successfully!');
  } catch (error: any) {
    log.error('Error seeding database:', error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  main()
    .then(() => {
      log.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      log.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { main as seedListings };




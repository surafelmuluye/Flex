import { NextRequest, NextResponse } from 'next/server';
import { eq, avg, count } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { listings, reviews } from '@/lib/db/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID' },
        { status: 400 }
      );
    }

    // Fetch property details using Drizzle ORM
    const propertyResult = await db
      .select({
        id: listings.id,
        name: listings.name,
        description: listings.description,
        address: listings.address,
        publicAddress: listings.publicAddress,
        city: listings.city,
        state: listings.state,
        country: listings.country,
        street: listings.street,
        zipcode: listings.zipcode,
        lat: listings.lat,
        lng: listings.lng,
        price: listings.price,
        cleaningFee: listings.cleaningFee,
        checkinFee: listings.checkinFee,
        priceForExtraPerson: listings.priceForExtraPerson,
        refundableDamageDeposit: listings.refundableDamageDeposit,
        bedrooms: listings.bedroomsNumber,
        bathrooms: listings.bathroomsNumber,
        bedsNumber: listings.bedsNumber,
        personCapacity: listings.personCapacity,
        maxChildrenAllowed: listings.maxChildrenAllowed,
        maxInfantsAllowed: listings.maxInfantsAllowed,
        maxPetsAllowed: listings.maxPetsAllowed,
        squareMeters: listings.squareMeters,
        propertyType: listings.propertyTypeId,
        roomType: listings.roomType,
        bathroomType: listings.bathroomType,
        minNights: listings.minNights,
        maxNights: listings.maxNights,
        guestsIncluded: listings.guestsIncluded,
        checkInTimeStart: listings.checkInTimeStart,
        checkInTimeEnd: listings.checkInTimeEnd,
        checkOutTime: listings.checkOutTime,
        cancellationPolicy: listings.cancellationPolicy,
        houseRules: listings.houseRules,
        keyPickup: listings.keyPickup,
        specialInstruction: listings.specialInstruction,
        doorSecurityCode: listings.doorSecurityCode,
        cleaningInstruction: listings.cleaningInstruction,
        contactName: listings.contactName,
        contactSurName: listings.contactSurName,
        contactPhone1: listings.contactPhone1,
        contactPhone2: listings.contactPhone2,
        contactLanguage: listings.contactLanguage,
        contactEmail: listings.contactEmail,
        contactAddress: listings.contactAddress,
        language: listings.language,
        currencyCode: listings.currencyCode,
        timeZoneName: listings.timeZoneName,
        instantBookable: listings.instantBookable,
        allowSameDayBooking: listings.allowSameDayBooking,
        sameDayBookingLeadTime: listings.sameDayBookingLeadTime,
        cleannessStatus: listings.cleannessStatus,
        wifiUsername: listings.wifiUsername,
        wifiPassword: listings.wifiPassword,
        thumbnailUrl: listings.thumbnailUrl,
        status: listings.instantBookable, // Using instantBookable as status proxy
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
      })
      .from(listings)
      .where(eq(listings.id, propertyId))
      .limit(1);

    if (propertyResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    const propertyData = propertyResult[0];

    // Get review statistics using Drizzle ORM
    const reviewStatsResult = await db
      .select({
        avgRating: avg(reviews.rating),
        reviewCount: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.listingId, propertyId));

    const stats = reviewStatsResult[0];

    const responseData = {
      success: true,
      data: {
        property: {
          id: propertyData.id,
          name: propertyData.name,
          description: propertyData.description,
          address: propertyData.address,
          publicAddress: propertyData.publicAddress,
          city: propertyData.city,
          state: propertyData.state,
          country: propertyData.country,
          street: propertyData.street,
          zipcode: propertyData.zipcode,
          lat: propertyData.lat ? parseFloat(propertyData.lat.toString()) : null,
          lng: propertyData.lng ? parseFloat(propertyData.lng.toString()) : null,
          price: parseFloat(propertyData.price?.toString() || '0'),
          cleaningFee: parseFloat(propertyData.cleaningFee?.toString() || '0'),
          checkinFee: parseFloat(propertyData.checkinFee?.toString() || '0'),
          priceForExtraPerson: parseFloat(propertyData.priceForExtraPerson?.toString() || '0'),
          refundableDamageDeposit: parseFloat(propertyData.refundableDamageDeposit?.toString() || '0'),
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          bedsNumber: propertyData.bedsNumber,
          personCapacity: propertyData.personCapacity,
          maxChildrenAllowed: propertyData.maxChildrenAllowed,
          maxInfantsAllowed: propertyData.maxInfantsAllowed,
          maxPetsAllowed: propertyData.maxPetsAllowed,
          squareMeters: propertyData.squareMeters,
          property_type: propertyData.propertyType,
          roomType: propertyData.roomType,
          bathroomType: propertyData.bathroomType,
          minNights: propertyData.minNights,
          maxNights: propertyData.maxNights,
          guestsIncluded: propertyData.guestsIncluded,
          checkInTimeStart: propertyData.checkInTimeStart,
          checkInTimeEnd: propertyData.checkInTimeEnd,
          checkOutTime: propertyData.checkOutTime,
          cancellationPolicy: propertyData.cancellationPolicy,
          houseRules: propertyData.houseRules,
          keyPickup: propertyData.keyPickup,
          specialInstruction: propertyData.specialInstruction,
          doorSecurityCode: propertyData.doorSecurityCode,
          cleaningInstruction: propertyData.cleaningInstruction,
          contactName: propertyData.contactName,
          contactSurName: propertyData.contactSurName,
          contactPhone1: propertyData.contactPhone1,
          contactPhone2: propertyData.contactPhone2,
          contactLanguage: propertyData.contactLanguage,
          contactEmail: propertyData.contactEmail,
          contactAddress: propertyData.contactAddress,
          language: propertyData.language,
          currencyCode: propertyData.currencyCode,
          timeZoneName: propertyData.timeZoneName,
          instantBookable: propertyData.instantBookable,
          allowSameDayBooking: propertyData.allowSameDayBooking,
          sameDayBookingLeadTime: propertyData.sameDayBookingLeadTime,
          cleannessStatus: propertyData.cleannessStatus,
          wifiUsername: propertyData.wifiUsername,
          wifiPassword: propertyData.wifiPassword,
          thumbnailUrl: propertyData.thumbnailUrl,
          status: propertyData.status,
          avg_rating: parseFloat(stats?.avgRating?.toString() || '0'),
          review_count: stats?.reviewCount || 0,
          amenities: ['WiFi', 'Parking', 'Kitchen', 'Air conditioning', 'TV', 'Washing Machine', 'Hair Dryer', 'Heating'], // Enhanced amenities
        }
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

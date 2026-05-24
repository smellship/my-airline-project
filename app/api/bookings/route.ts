import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    // 1. Parse the request body
    const { flightId, passengerName, passengerEmail } = await request.json();

    if (!flightId || !passengerName || !passengerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // 2. Find the flight to check capacity
    const flight = await db.collection('schedules').findOne({ 
      _id: new ObjectId(flightId) 
    });

    if (!flight) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    // 3. Business Logic: Check if the flight is full
    // Brief Requirement: "A booking should not be allowed on scheduled flights that are full up."
    const currentBookingsCount = flight.bookings?.length || 0;
    if (currentBookingsCount >= flight.capacity) {
      return NextResponse.json({ error: "This flight is fully booked." }, { status: 400 });
    }

    // 4. Generate a unique booking reference
    // Brief Requirement: "The user should be provided with a unique booking reference."
    const bookingReference = Math.random().toString(36).substring(2, 9).toUpperCase();

    // 5. Create the booking object
    const newBooking = {
      bookingReference,
      passengerName,
      passengerEmail,
      bookedAt: new Date()
    };

    // 6. Update the flight document in MongoDB
    // We use $push to add the booking to the existing array inside the flight document
    const result = await db.collection('schedules').updateOne(
      { _id: new ObjectId(flightId) },
      { $push: { bookings: newBooking } as any }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Failed to update the flight booking.");
    }

    // 7. Return the booking reference and success message
    return NextResponse.json({ 
      message: "Booking successful!", 
      reference: bookingReference 
    });

  } catch (e: any) {
    console.error("Booking Error:", e);
    return NextResponse.json(
      { error: "Internal Server Error", details: e.message },
      { status: 500 }
    );
  }
}
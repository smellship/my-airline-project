import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    
    const { flightId, passengerName, passengerEmail } = await request.json();

    if (!flightId || !passengerName || !passengerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    
    const flight = await db.collection('schedules').findOne({ 
      _id: new ObjectId(flightId) 
    });

    if (!flight) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    
    
    const currentBookingsCount = flight.bookings?.length || 0;
    if (currentBookingsCount >= flight.capacity) {
      return NextResponse.json({ error: "This flight is fully booked." }, { status: 400 });
    }

    
    
    const bookingReference = Math.random().toString(36).substring(2, 9).toUpperCase();

    
    const newBooking = {
      bookingReference,
      passengerName,
      passengerEmail,
      bookedAt: new Date()
    };

    
    
    const result = await db.collection('schedules').updateOne(
      { _id: new ObjectId(flightId) },
      { $push: { bookings: newBooking } as any }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Failed to update the flight booking.");
    }

    
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
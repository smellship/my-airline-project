import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  try {
    const client = await clientPromise;
    const db = client.db();

    
    const flights = await db.collection('schedules')
      .find({ "bookings.passengerEmail": email })
      .toArray();

    
    const results = flights.map(f => ({
      flightId: f._id,
      flightNumber: f.flightNumber,
      origin: f.origin,
      destination: f.destination,
      departureDate: f.departureDate,
      departureTime: f.departureTime,
      aircraft: f.aircraft,
      
      myBooking: f.bookings.find((b: any) => b.passengerEmail === email)
    }));

    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const { flightId, bookingReference } = await request.json();

    const client = await clientPromise;
    const db = client.db();

    
    const result = await db.collection('schedules').updateOne(
      { _id: new ObjectId(flightId) },
      { $pull: { bookings: { bookingReference: bookingReference } } as any }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Booking not found or already cancelled" }, { status: 404 });
    }

    return NextResponse.json({ message: "Booking cancelled successfully" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
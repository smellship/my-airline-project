import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const flights = await db.collection('schedules').find({}).toArray();
    const bookedEmailsSet = new Set<string>();
    flights.forEach(f => {
      f.bookings?.forEach((b: any) => {
        if (b.passengerEmail) bookedEmailsSet.add(b.passengerEmail);
      });
    });
    const bookedEmails = Array.from(bookedEmailsSet);

    const allPassengers = await db.collection('passengers').find({}).toArray();
    const allEmails = allPassengers.map(p => p.email);

    const unbookedEmails = allEmails.filter(email => !bookedEmailsSet.has(email));

    return NextResponse.json({
      summary: {
        totalPassengersInSystem: allEmails.length,
        passengersWithBookings: bookedEmails.length,
        passengersWithoutBookings: unbookedEmails.length
      },
      exampleEmailsWithBookings: bookedEmails.slice(0, 10), 
      exampleEmailsWithoutBookings: unbookedEmails.slice(0, 10)
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
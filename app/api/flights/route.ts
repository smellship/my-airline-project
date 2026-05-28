import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  
  
  const { searchParams } = new URL(request.url);
  const orig = searchParams.get('orig');
  const dest = searchParams.get('dest');
  const date = searchParams.get('date');

  try {
    const client = await clientPromise;
    const db = client.db();

    
    const query: any = {};
    
    
    if (orig) query.origin = orig;
    if (dest) query.destination = dest;
    if (date) query.departureDate = date;

    
    
    const flights = await db.collection('schedules')
      .find(query)
      .sort({ departureTime: 1 })
      .toArray();

    
    return NextResponse.json(flights);
  } catch (e: any) {
    console.error("Database query error:", e);
    return NextResponse.json(
      { error: "Failed to fetch flights", details: e.message },
      { status: 500 }
    );
  }
}
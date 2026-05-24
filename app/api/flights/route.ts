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

    // 构建查询条件
    const query: any = {};
    if (orig) query.origin = orig;
    if (dest) query.destination = dest;
    if (date) query.departureDate = date;

    const flights = await db.collection('schedules').find(query).toArray();
    return NextResponse.json(flights);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
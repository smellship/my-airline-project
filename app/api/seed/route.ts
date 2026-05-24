import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // 1. 清除旧数据（可选）
    await db.collection('schedules').deleteMany({});

    // 2. 准备一些初始航班数据 (以悉尼和罗托鲁瓦为例)
    const initialFlights = [
      {
        flightNumber: "SJ101",
        origin: "NZNE",
        destination: "YSSY",
        departureDate: "2026-05-29",
        departureTime: "10:30",
        aircraft: "SyberJet SJ30i",
        capacity: 6,
        price: 350,
        bookings: []
      },
      {
        flightNumber: "RT201",
        origin: "NZNE",
        destination: "NZRO",
        departureDate: "2026-05-25",
        departureTime: "07:00",
        aircraft: "Cirrus SF50",
        capacity: 4,
        price: 150,
        bookings: []
      }
    ];

    await db.collection('schedules').insertMany(initialFlights);

    return NextResponse.json({ message: "Cloud seeding successful!", count: initialFlights.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
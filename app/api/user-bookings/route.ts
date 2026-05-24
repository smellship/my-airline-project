import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// 1. 查询乘客的所有预订
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  try {
    const client = await clientPromise;
    const db = client.db();

    // 在 schedules 集合中查找 bookings 数组中包含该 email 的所有文档
    const flights = await db.collection('schedules')
      .find({ "bookings.passengerEmail": email })
      .toArray();

    // 格式化输出：提取该乘客在该航班中的具体预订信息
    const results = flights.map(f => ({
      flightId: f._id,
      flightNumber: f.flightNumber,
      origin: f.origin,
      destination: f.destination,
      departureDate: f.departureDate,
      departureTime: f.departureTime,
      aircraft: f.aircraft,
      // 只找出属于这个人的那条预订记录
      myBooking: f.bookings.find((b: any) => b.passengerEmail === email)
    }));

    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 2. 取消预订 (作业要求：have the capability for a user to cancel a booking)
export async function DELETE(request: Request) {
  try {
    const { flightId, bookingReference } = await request.json();

    const client = await clientPromise;
    const db = client.db();

    // 使用 $pull 操作符从 bookings 数组中删除匹配预订号的元素
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
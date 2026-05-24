import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    await db.collection('schedules').deleteMany({}); // 清除旧数据

    const flights = [];
    const startDate = new Date("2026-05-18"); // 从5月18日周一开始生成
    const daysToGenerate = 21; 

    for (let i = 0; i < daysToGenerate; i++) {
      const curr = new Date(startDate);
      curr.setDate(startDate.getDate() + i);
      const day = curr.getDay(); // 0:日, 1:一...
      const dateStr = curr.toISOString().split('T')[0];

      // 1. Sydney (Fri/Sun)
      if (day === 5) flights.push(makeF("SJ101", "NZNE", "YSSY", dateStr, "10:30", "SyberJet SJ30i", 6, 350));
      if (day === 0) flights.push(makeF("SJ102", "YSSY", "NZNE", dateStr, "15:30", "SyberJet SJ30i", 6, 350));

      // 2. Rotorua (Mon-Fri, Twice daily)
      if (day >= 1 && day <= 5) {
        flights.push(makeF("RT201", "NZNE", "NZRO", dateStr, "07:00", "Cirrus SF50", 4, 120));
        flights.push(makeF("RT202", "NZRO", "NZNE", dateStr, "08:30", "Cirrus SF50", 4, 120));
        flights.push(makeF("RT203", "NZNE", "NZRO", dateStr, "16:30", "Cirrus SF50", 4, 120));
        flights.push(makeF("RT204", "NZRO", "NZNE", dateStr, "18:00", "Cirrus SF50", 4, 120));
      }

      // 3. Claris (Out: 1,3,5; Ret: 2,4,6)
      if ([1, 3, 5].includes(day)) flights.push(makeF("GB301", "NZNE", "NZGB", dateStr, "09:00", "Cirrus SF50", 4, 90));
      if ([2, 4, 6].includes(day)) flights.push(makeF("GB302", "NZGB", "NZNE", dateStr, "10:00", "Cirrus SF50", 4, 90));

      // 4. Tuuta (Out: 2,5; Ret: 3,6)
      if ([2, 5].includes(day)) flights.push(makeF("CI401", "NZNE", "NZCI", dateStr, "11:00", "HondaJet Elite", 5, 280));
      if ([3, 6].includes(day)) flights.push(makeF("CI402", "NZCI", "NZNE", dateStr, "13:00", "HondaJet Elite", 5, 280));

      // 5. Lake Tekapo (Out: 1; Ret: 2)
      if (day === 1) flights.push(makeF("TL501", "NZNE", "NZTL", dateStr, "13:00", "HondaJet Elite", 5, 200));
      if (day === 2) flights.push(makeF("TL502", "NZTL", "NZNE", dateStr, "09:00", "HondaJet Elite", 5, 200));
    }

    await db.collection('schedules').insertMany(flights);
    return NextResponse.json({ message: "Full schedule seeded!", count: flights.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function makeF(fn:string, orig:string, dest:string, date:string, time:string, craft:string, cap:number, pr:number) {
  return { flightNumber: fn, origin: orig, destination: dest, departureDate: date, departureTime: time, aircraft: craft, capacity: cap, price: pr, bookings: [] };
}
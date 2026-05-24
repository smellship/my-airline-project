import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // 1. 清除旧数据
    await db.collection('schedules').deleteMany({});
    await db.collection('passengers').deleteMany({});

    // 2. 在云端读取并处理 CSV 文件
    // Vercel 环境下，使用 process.cwd() 获取项目根目录
    const csvPath = path.join(process.cwd(), 'randomnames.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    const passengerLines = csvContent.split('\n').filter(line => line.trim() !== '');
    const passengerDocs = passengerLines.map(line => {
      // 假设格式: ID,Title,FirstName,LastName,Gender,Email
      const [id, title, firstName, lastName, gender, email] = line.split(',');
      return {
        title: title?.trim(),
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        email: email?.trim()
      };
    });

    if (passengerDocs.length > 0) {
      await db.collection('passengers').insertMany(passengerDocs);
    }

    // 3. 生成航班数据 (保持之前的逻辑)
    const flights = [];
    const startDate = new Date("2026-05-18");
    const daysToGenerate = 21; 

    for (let i = 0; i < daysToGenerate; i++) {
      const curr = new Date(startDate);
      curr.setDate(startDate.getDate() + i);
      const day = curr.getDay(); 
      const dateStr = curr.toISOString().split('T')[0];

      // Sydney (SJ101/102)
      if (day === 5) flights.push(makeF("SJ101", "NZNE", "YSSY", dateStr, "10:30", "SyberJet SJ30i", 6, 350));
      if (day === 0) flights.push(makeF("SJ102", "YSSY", "NZNE", dateStr, "15:30", "SyberJet SJ30i", 6, 350));

      // Rotorua (RT201-204)
      if (day >= 1 && day <= 5) {
        flights.push(makeF("RT201", "NZNE", "NZRO", dateStr, "07:00", "Cirrus SF50", 4, 120));
        flights.push(makeF("RT202", "NZRO", "NZNE", dateStr, "08:30", "Cirrus SF50", 4, 120));
        flights.push(makeF("RT203", "NZNE", "NZRO", dateStr, "16:30", "Cirrus SF50", 4, 120));
        flights.push(makeF("RT204", "NZRO", "NZNE", dateStr, "18:00", "Cirrus SF50", 4, 120));
      }

      // 其他航线简略添加... (以此类推)
      if ([1, 3, 5].includes(day)) flights.push(makeF("GB301", "NZNE", "NZGB", dateStr, "09:00", "Cirrus SF50", 4, 90));
      if ([2, 5].includes(day)) flights.push(makeF("CI401", "NZNE", "NZCI", dateStr, "11:00", "HondaJet Elite", 5, 280));
    }

    await db.collection('schedules').insertMany(flights);

    return NextResponse.json({ 
      message: "Seeding Successful!", 
      passengersImported: passengerDocs.length,
      flightsGenerated: flights.length 
    });

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function makeF(fn:string, orig:string, dest:string, date:string, time:string, craft:string, cap:number, pr:number) {
  return { flightNumber: fn, origin: orig, destination: dest, departureDate: date, departureTime: time, aircraft: craft, capacity: cap, price: pr, bookings: [] };
}
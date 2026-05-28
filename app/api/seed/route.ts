import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    
    await db.collection('schedules').deleteMany({});
    await db.collection('passengers').deleteMany({});

    
    const csvPath = path.join(process.cwd(), 'randomnames.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const passengerLines = csvContent.split('\n').filter(line => line.trim() !== '');
    
    const passengerDocs = passengerLines.map(line => {
      const parts = line.split(',');
      return {
        firstName: parts[2]?.trim(),
        lastName: parts[3]?.trim(),
        email: parts[5]?.trim()
      };
    });

    if (passengerDocs.length > 0) {
      await db.collection('passengers').insertMany(passengerDocs);
    }

    
    
    const flights: any[] = []; 
    const startDate = new Date("2026-05-18");
    const daysToGenerate = 21; 

    for (let i = 0; i < daysToGenerate; i++) {
      const curr = new Date(startDate);
      curr.setDate(startDate.getDate() + i);
      const day = curr.getDay(); 
      const dateStr = curr.toISOString().split('T')[0];

      
      const dailyFlights: any[] = []; 
      
      if (day === 5) dailyFlights.push(makeF("SJ101", "NZNE", "YSSY", dateStr, "10:30", "SyberJet SJ30i", 6, 350));
      if (day === 0) dailyFlights.push(makeF("SJ102", "YSSY", "NZNE", dateStr, "15:30", "SyberJet SJ30i", 6, 350));
      if (day >= 1 && day <= 5) {
        dailyFlights.push(makeF("RT201", "NZNE", "NZRO", dateStr, "07:00", "Cirrus SF50", 4, 120));
        dailyFlights.push(makeF("RT203", "NZNE", "NZRO", dateStr, "16:30", "Cirrus SF50", 4, 120));
      }
      if ([1, 3, 5].includes(day)) dailyFlights.push(makeF("GB301", "NZNE", "NZGB", dateStr, "09:00", "Cirrus SF50", 4, 90));
      if ([2, 5].includes(day)) dailyFlights.push(makeF("CI401", "NZNE", "NZCI", dateStr, "11:00", "HondaJet Elite", 5, 280));
      if (day === 1) dailyFlights.push(makeF("TL501", "NZNE", "NZTL", dateStr, "13:00", "HondaJet Elite", 5, 200));

      
      dailyFlights.forEach(f => {
        const numBookings = Math.floor(Math.random() * 2) + 1; 
        for (let j = 0; j < numBookings; j++) {
          const randomP = passengerDocs[Math.floor(Math.random() * passengerDocs.length)];
          f.bookings.push({
            bookingReference: Math.random().toString(36).substring(2, 9).toUpperCase(),
            passengerName: `${randomP.firstName} ${randomP.lastName}`,
            passengerEmail: randomP.email,
            bookedAt: new Date()
          });
        }
        flights.push(f);
      });
    }

    await db.collection('schedules').insertMany(flights);

    return NextResponse.json({ 
      message: "Seeding Successful with Bookings!", 
      passengersImported: passengerDocs.length,
      flightsWithPreBookings: flights.length 
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function makeF(fn:string, orig:string, dest:string, date:string, time:string, craft:string, cap:number, pr:number) {
  return { 
    flightNumber: fn, 
    origin: orig, 
    destination: dest, 
    departureDate: date, 
    departureTime: time, 
    aircraft: craft, 
    capacity: cap, 
    price: pr, 
    bookings: [] as any[] 
  };
}
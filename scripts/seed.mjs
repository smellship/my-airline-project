import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';


dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Error: MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await client.connect();
    const db = client.db(); 
    console.log("Successfully connected to the database.");

    
    await db.collection('schedules').deleteMany({});
    await db.collection('passengers').deleteMany({});
    console.log("Existing data cleared.");

    
    const csvPath = path.join(process.cwd(), 'randomnames.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const passengerDocs = csvData.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const [id, title, firstName, lastName, gender, email] = line.split(',');
        return {
          title: title.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          gender: gender.trim(),
          email: email.trim()
        };
      });

    const passengerResult = await db.collection('passengers').insertMany(passengerDocs);
    const passengerIds = Object.values(passengerResult.insertedIds);
    console.log(`Imported ${passengerIds.length} passengers.`);

    
    const schedules = [];
    const startDate = new Date(); 
    const daysToGenerate = 21;    

    for (let i = 0; i < daysToGenerate; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dayOfWeek = currentDate.getDay(); 

      const dateStr = currentDate.toISOString().split('T')[0];

      
      if (dayOfWeek === 5) { 
        schedules.push(createFlight("SJ101", "NZNE", "YSSY", dateStr, "10:30", 240, "SyberJet SJ30i", 6));
      }
      if (dayOfWeek === 0) { 
        schedules.push(createFlight("SJ102", "YSSY", "NZNE", dateStr, "15:30", 180, "SyberJet SJ30i", 6));
      }

      
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        
        schedules.push(createFlight("RT201", "NZNE", "NZRO", dateStr, "07:00", 45, "Cirrus SF50", 4));
        schedules.push(createFlight("RT202", "NZRO", "NZNE", dateStr, "08:30", 45, "Cirrus SF50", 4));
        
        schedules.push(createFlight("RT203", "NZNE", "NZRO", dateStr, "16:30", 45, "Cirrus SF50", 4));
        schedules.push(createFlight("RT204", "NZRO", "NZNE", dateStr, "18:00", 45, "Cirrus SF50", 4));
      }

      
      if ([1, 3, 5].includes(dayOfWeek)) { 
        schedules.push(createFlight("GB301", "NZNE", "NZGB", dateStr, "09:00", 30, "Cirrus SF50", 4));
      }
      if ([2, 4, 6].includes(dayOfWeek)) { 
        schedules.push(createFlight("GB302", "NZGB", "NZNE", dateStr, "10:00", 30, "Cirrus SF50", 4));
      }

      
      if ([2, 5].includes(dayOfWeek)) { 
        schedules.push(createFlight("CI401", "NZNE", "NZCI", dateStr, "11:00", 120, "HondaJet Elite", 5));
      }
      if ([3, 6].includes(dayOfWeek)) { 
        schedules.push(createFlight("CI402", "NZCI", "NZNE", dateStr, "13:00", 120, "HondaJet Elite", 5));
      }

      
      if (dayOfWeek === 1) { 
        schedules.push(createFlight("TL501", "NZNE", "NZTL", dateStr, "13:00", 90, "HondaJet Elite", 5));
      }
      if (dayOfWeek === 2) { 
        schedules.push(createFlight("TL502", "NZTL", "NZNE", dateStr, "09:00", 90, "HondaJet Elite", 5));
      }
    }

    
    schedules.forEach(flight => {
      const numBookings = Math.floor(Math.random() * 2) + 1; 
      for (let j = 0; j < numBookings; j++) {
        const randomPassenger = passengerDocs[Math.floor(Math.random() * passengerDocs.length)];
        flight.bookings.push({
          bookingReference: Math.random().toString(36).substring(2, 8).toUpperCase(),
          passengerName: `${randomPassenger.firstName} ${randomPassenger.lastName}`,
          passengerEmail: randomPassenger.email,
          bookedAt: new Date()
        });
      }
    });

    await db.collection('schedules').insertMany(schedules);
    console.log(`Successfully generated ${schedules.length} flights.`);

  } catch (err) {
    console.error("Error during data seeding:", err);
  } finally {
    await client.close();
  }
}


function createFlight(flightNumber, origin, destination, date, depTime, durationMins, aircraft, capacity) {
  return {
    flightNumber,
    origin,
    destination,
    departureDate: date,
    departureTime: depTime,
    duration: durationMins,
    aircraft,
    capacity,
    price: Math.floor(Math.random() * 200) + 150, 
    bookings: []
  };
}

run();
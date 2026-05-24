'use client';
import { useState } from 'react';

export default function Home() {
  const [orig, setOrig] = useState('NZNE');
  const [dest, setDest] = useState('YSSY');
  const [date, setDate] = useState('2026-05-29');
  const [flights, setFlights] = useState([]);

  const search = async () => {
    const res = await fetch(`/api/flights?orig=${orig}&dest=${dest}&date=${date}`);
    const data = await res.json();
    setFlights(data);
  };

  return (
    <main className="p-10 bg-slate-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dairy Flat Airline Booking</h1>
      
      <div className="flex gap-4 mb-8 p-6 bg-slate-800 rounded-lg">
        <select value={orig} onChange={e => setOrig(e.target.value)} className="bg-slate-700 p-2 rounded">
          <option value="NZNE">Dairy Flat (NZNE)</option>
          <option value="YSSY">Sydney (YSSY)</option>
          <option value="NZRO">Rotorua (NZRO)</option>
        </select>
        <span>to</span>
        <select value={dest} onChange={e => setDest(e.target.value)} className="bg-slate-700 p-2 rounded">
          <option value="YSSY">Sydney (YSSY)</option>
          <option value="NZRO">Rotorua (NZRO)</option>
          <option value="NZCI">Tuuta (NZCI)</option>
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-slate-700 p-2 rounded" />
        <button onClick={search} className="bg-blue-600 px-6 py-2 rounded font-bold">Search</button>
      </div>

      <div className="grid gap-4">
        {flights.map((f: any) => (
          <div key={f._id} className="border border-slate-700 p-4 rounded bg-slate-800 flex justify-between items-center">
            <div>
              <p className="font-bold text-xl">{f.flightNumber} - {f.aircraft}</p>
              <p>{f.departureDate} at {f.departureTime}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl text-green-400">${f.price}</p>
              <button className="bg-green-600 px-4 py-1 rounded mt-2">Book Now</button>
            </div>
          </div>
        ))}
        {flights.length === 0 && <p className="text-slate-400">No flights found. Try seeding data or changing dates.</p>}
      </div>
    </main>
  );
}
'use client';
import { useState, useEffect } from 'react';

// 1. 定义机场列表 (符合作业 Brief)
const AIRPORTS = [
  { code: 'NZNE', name: 'Dairy Flat (Hub)' },
  { code: 'YSSY', name: 'Sydney' },
  { code: 'NZRO', name: 'Rotorua' },
  { code: 'NZCI', name: 'Tuuta (Chatham Islands)' },
  { code: 'NZGB', name: 'Claris (Great Barrier)' },
  { code: 'NZTL', name: 'Lake Tekapo' },
];

export default function Home() {
  const [orig, setOrig] = useState('NZNE');
  const [dest, setDest] = useState('YSSY');
  const [date, setDate] = useState('2026-05-29'); // 默认设为一个有航班的周五
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 搜索航班函数
  const handleSearch = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/flights?orig=${orig}&dest=${dest}&date=${date}`);
      const data = await res.json();
      setFlights(data);
      if (data.length === 0) setMessage('No flights found for this route/date.');
    } catch (err) {
      setMessage('Search failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // 订票函数
  const handleBook = async (flightId: string, flightNum: string) => {
    const passengerName = prompt(`Booking Flight ${flightNum}\nPlease enter Passenger Name:`);
    if (!passengerName) return;

    const passengerEmail = prompt(`Please enter contact Email:`);
    if (!passengerEmail) return;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId, passengerName, passengerEmail })
      });
      const result = await res.json();

      if (res.ok) {
        alert(`Successfully Booked!\nYour Reference: ${result.reference}\n\nPlease keep this for your records.`);
        handleSearch(); // 刷新列表查看剩余容量
      } else {
        alert(`Booking failed: ${result.error}`);
      }
    } catch (err) {
      alert('Network error during booking.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-6 shadow-2xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-500">
            Dairy Flat <span className="text-white">Airlines</span>
          </h1>
          <nav className="space-x-4 text-sm font-medium">
            <span className="text-green-500">● Database Online</span>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Search Bar Section */}
        <section className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl mb-10">
          <h2 className="text-xl font-semibold mb-6">Search Scheduled Flights</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <label className="text-xs uppercase text-slate-500 mb-2 font-bold">Origin</label>
              <select 
                value={orig} 
                onChange={e => setOrig(e.target.value)}
                className="bg-slate-800 border border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {AIRPORTS.map(ap => <option key={ap.code} value={ap.code}>{ap.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs uppercase text-slate-500 mb-2 font-bold">Destination</label>
              <select 
                value={dest} 
                onChange={e => setDest(e.target.value)}
                className="bg-slate-800 border border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {AIRPORTS.map(ap => <option key={ap.code} value={ap.code}>{ap.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs uppercase text-slate-500 mb-2 font-bold">Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col justify-end">
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg"
              >
                {loading ? 'Searching...' : 'Find Flights'}
              </button>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Available Flights</h2>
            <p className="text-slate-400 text-sm">Showing results for {date}</p>
          </div>

          {message && (
            <div className="bg-slate-900 border border-slate-800 p-10 text-center rounded-2xl text-slate-400">
              {message}
            </div>
          )}

          <div className="space-y-4">
            {flights.map((f: any) => (
              <div key={f._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-600 transition-all flex flex-col md:flex-row justify-between items-center shadow-md">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className="bg-blue-900/30 p-4 rounded-xl">
                    <p className="text-blue-400 font-black text-2xl">{f.flightNumber}</p>
                    <p className="text-[10px] uppercase text-slate-500">{f.aircraft}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Departure</p>
                    <p className="text-xl font-bold">{f.departureTime}</p>
                    <p className="text-xs text-slate-500">{f.origin} → {f.destination}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-bold uppercase">Price</p>
                    <p className="text-3xl font-black text-green-400">${f.price}</p>
                    <p className="text-[10px] text-slate-500">Seats Left: {f.capacity - (f.bookings?.length || 0)}</p>
                  </div>
                  <button 
                    onClick={() => handleBook(f._id, f.flightNumber)}
                    disabled={f.bookings?.length >= f.capacity}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${
                      f.bookings?.length >= f.capacity 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                    }`}
                  >
                    {f.bookings?.length >= f.capacity ? 'Sold Out' : 'Book Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-20 border-t border-slate-900 p-10 text-center text-slate-600 text-sm">
        &copy; 2026 Dairy Flat Airlines System | 159.352 Assignment 2
      </footer>
    </main>
  );
}
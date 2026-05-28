'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';


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
  const [date, setDate] = useState('2026-05-29'); 
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastBooking, setLastBooking] = useState<any>(null);

  
  const handleSearch = async () => {
    setLoading(true);
    setFlights([]);
    try {
      const res = await fetch(`/api/flights?orig=${orig}&dest=${dest}&date=${date}`);
      const data = await res.json();
      setFlights(data);
    } catch (err) {
      console.error("Search error", err);
    } finally {
      setLoading(false);
    }
  };

  
  const handleBook = async (f: any) => {
    const name = prompt(`Booking ${f.flightNumber}\nPlease enter Passenger Name:`);
    if (!name) return;
    const email = prompt(`Please enter Passenger Email:`);
    if (!email) return;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId: f._id, passengerName: name, passengerEmail: email })
      });
      const data = await res.json();

      if (res.ok) {
        
        setLastBooking({
          ...f,
          passengerName: name,
          passengerEmail: email,
          reference: data.reference
        });
        setShowInvoice(true);
        handleSearch(); 
      } else {
        alert("Booking error: " + data.error);
      }
    } catch (err) {
      alert("Network error occurred.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-sans">
      {/* 顶部导航 */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">D</div>
            <h1 className="text-xl font-black tracking-tighter">DAIRY FLAT AIR</h1>
          </div>
          <nav className="flex gap-6">
            <Link href="/" className="text-blue-500 font-bold">Search Flights</Link>
            <Link href="/my-bookings" className="text-slate-400 hover:text-white transition-colors">My Bookings</Link>
          </nav>
        </div>
      </header>

      {/* Hero 区域 */}
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <div className="mb-12">
          <h2 className="text-5xl font-black mb-4">Fly Beyond Limits.</h2>
          <p className="text-slate-400 max-w-xl">Exclusive point-to-point service from our North Albany hub. Luxury light jets to New Zealand&apos;s most iconic destinations.</p>
        </div>

        {/* 搜索面板 */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Origin</label>
              <select value={orig} onChange={e => setOrig(e.target.value)} className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600">
                {AIRPORTS.map(ap => <option key={ap.code} value={ap.code}>{ap.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Destination</label>
              <select value={dest} onChange={e => setDest(e.target.value)} className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600">
                {AIRPORTS.map(ap => <option key={ap.code} value={ap.code}>{ap.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600" />
            </div>
            <div className="flex items-end">
              <button onClick={handleSearch} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20">
                {loading ? 'Finding...' : 'Search Flights'}
              </button>
            </div>
          </div>
        </div>

        {/* 结果列表 */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-6 tracking-widest">Available Results</h3>
          {flights.length === 0 && !loading && (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-500">Select a route and date to see scheduled flights.</p>
            </div>
          )}
          
          {flights.map((f: any) => (
            <div key={f._id} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-slate-800 rounded-2xl flex flex-col items-center justify-center">
                  <span className="text-blue-500 font-black text-xs">{f.flightNumber}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold">{f.departureTime}</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-slate-400 text-xs">{f.aircraft}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{f.origin} to {f.destination}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-2xl font-black text-green-400">${f.price}</p>
                  <p className="text-[10px] text-slate-600 font-bold uppercase">{f.capacity - (f.bookings?.length || 0)} Seats Left</p>
                </div>
                <button 
                  onClick={() => handleBook(f)}
                  disabled={f.bookings?.length >= f.capacity}
                  className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                    f.bookings?.length >= f.capacity 
                    ? 'bg-slate-800 text-slate-600' 
                    : 'bg-white text-black hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  {f.bookings?.length >= f.capacity ? 'Sold Out' : 'Book Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 发票模态框 (Invoice Modal) */}
      {showInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white text-slate-900 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-8 text-white">
              <h4 className="text-2xl font-black">BOOKING INVOICE</h4>
              <p className="text-blue-200 text-sm">Ref: {lastBooking?.reference}</p>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex justify-between border-b pb-4">
                <span className="text-slate-500 font-medium">Passenger</span>
                <span className="font-bold">{lastBooking?.passengerName}</span>
              </div>
              <div className="flex justify-between border-b pb-4">
                <span className="text-slate-500 font-medium">Flight</span>
                <span className="font-bold">{lastBooking?.flightNumber}</span>
              </div>
              <div className="flex justify-between border-b pb-4">
                <span className="text-slate-500 font-medium">Route</span>
                <span className="font-bold">{lastBooking?.origin} ➔ {lastBooking?.destination}</span>
              </div>
              <div className="flex justify-between border-b pb-4">
                <span className="text-slate-500 font-medium">Departure</span>
                <span className="font-bold">{lastBooking?.departureDate} @ {lastBooking?.departureTime}</span>
              </div>
              <div className="flex justify-between pt-4">
                <span className="text-slate-900 font-black text-xl">TOTAL PAID</span>
                <span className="text-blue-600 font-black text-2xl">${lastBooking?.price}</span>
              </div>
              <button 
                onClick={() => setShowInvoice(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold mt-6"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchBookings = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user-bookings?email=${email}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (flightId: string, ref: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch('/api/user-bookings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId, bookingReference: ref })
      });

      if (res.ok) {
        alert("Booking cancelled successfully.");
        fetchBookings(); 
      } else {
        alert("Failed to cancel booking.");
      }
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-400 hover:text-blue-300 mb-8 inline-block font-medium">
          ← Back to Flight Search
        </Link>
        
        <h1 className="text-4xl font-black mb-2">My Itinerary</h1>
        <p className="text-slate-400 mb-10">Manage your luxury jet bookings</p>

        <div className="flex flex-col md:flex-row gap-4 mb-12 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <input 
            type="email" 
            placeholder="Enter your registered email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-slate-800 border-none p-4 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none"
          />
          <button 
            onClick={fetchBookings}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl font-bold transition-all"
          >
            {loading ? 'Searching...' : 'Find My Flights'}
          </button>
        </div>

        <div className="grid gap-6">
          {bookings.map((item: any) => (
            <div key={item.myBooking.bookingReference} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center group hover:border-slate-600 transition-all">
              <div className="mb-6 md:mb-0">
                <span className="text-blue-500 font-black text-xs tracking-widest uppercase">Ref: {item.myBooking.bookingReference}</span>
                <h3 className="text-2xl font-bold mt-1 mb-2">{item.origin} ➔ {item.destination}</h3>
                <div className="flex gap-4 text-sm text-slate-400">
                  <span>📅 {item.departureDate}</span>
                  <span>⏰ {item.departureTime}</span>
                </div>
                <p className="text-xs text-slate-500 mt-4 font-medium uppercase tracking-tighter">
                  {item.aircraft} | Passenger: {item.myBooking.passengerName}
                </p>
              </div>
              
              <button 
                onClick={() => handleCancel(item.flightId, item.myBooking.bookingReference)}
                className="w-full md:w-auto bg-red-900/20 text-red-500 border border-red-900/30 px-6 py-3 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all"
              >
                Cancel Booking
              </button>
            </div>
          ))}

          {searched && bookings.length === 0 && (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
              <p className="text-slate-500 italic">No bookings found for this email address.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
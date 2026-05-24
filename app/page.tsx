'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('Checking connection...');
  const [dbInfo, setDbInfo] = useState<any>(null);

  useEffect(() => {
    // 页面加载后自动测试 API
    fetch('/api/test')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'Connected!') {
          setStatus('✅ Connected to MongoDB!');
          setDbInfo(data);
        } else {
          setStatus('❌ Connection Error');
          setDbInfo(data);
        }
      })
      .catch((err) => {
        setStatus('❌ Fetch Failed (404 or Network Error)');
        console.error(err);
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Dairy Flat Airline System</h1>
      
      <div className="p-6 border border-slate-700 rounded-lg bg-slate-800 shadow-xl max-w-2xl w-full">
        <h2 className="text-xl font-semibold mb-4">Database Status</h2>
        <p className="text-lg mb-4">{status}</p>
        
        {dbInfo && (
          <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-auto max-h-60">
            {JSON.stringify(dbInfo, null, 2)}
          </pre>
        )}
      </div>

      <p className="mt-8 text-slate-400">
        Project Root: <code className="text-pink-400">/my-airline-project</code>
      </p>
    </main>
  );
}
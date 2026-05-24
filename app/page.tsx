'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // 尝试获取航班数据
    fetch('/api/test') 
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#111', color: '#fff', minHeight: '100vh' }}>
      <h1>Airline System Status</h1>
      <hr />
      <section>
        <h2>Database Connection:</h2>
        {data ? <p style={{color: 'green'}}>✅ {data.status}</p> : <p>Loading...</p>}
        {error && <p style={{color: 'red'}}>❌ {error}</p>}
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2>Quick Actions:</h2>
        <a href="/api/seed" target="_blank" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          点击这里执行【云端初始化数据 (Seed)】
        </a>
        <p style={{ fontSize: '12px', color: '#888' }}>(点击后如果看到 successful，请刷新本页)</p>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2>Collections in DB:</h2>
        <pre style={{ background: '#222', padding: '10px' }}>
          {JSON.stringify(data?.existingCollections || [], null, 2)}
        </pre>
      </section>
    </div>
  );
}
'use client';
import { useEffect, useState } from 'react';

export default function InboxPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  const load = async () => {
    const res = await fetch('/api/inbox');
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000); // auto refresh every 3 sec
    return () => clearInterval(interval);
  }, []);

  const filtered = messages.filter((m) => !filter || m.from.includes(filter));

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>WhatsApp Inbox - AV DMC</h1>
      <input
        placeholder="Filter by phone e.g. 917999267389"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ padding: 8, width: 300, marginBottom: 20 }}
      />
      <button onClick={load} style={{ marginLeft: 10, padding: 8 }}>
        Refresh
      </button>

      <div style={{ marginTop: 20 }}>
        {filtered.map((m, i) => (
          <div
            key={i}
            style={{
              border: '1px solid #ddd',
              padding: 10,
              marginBottom: 8,
              background:
                m.direction === 'INCOMING'
                  ? '#e1ffc7'
                  : m.direction === 'OUTGOING'
                    ? '#fff'
                    : '#ffcccc',
              borderRadius: 8,
            }}
          >
            <b>{m.from}</b> <small>{m.time}</small>{' '}
            <span style={{ float: 'right' }}>{m.direction}</span>
            <div>{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

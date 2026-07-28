'use client';
import { useEffect, useState } from 'react';

export default function WhatsappCRM() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    const load = () =>
      fetch('/api/whatsapp/messages')
        .then((r) => r.json())
        .then(setMessages);
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  const contacts = [...new Set(messages.map((m) => m.from))].filter(Boolean) as string[];
  const chat = messages.filter((m) => m.from === selected).reverse();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left - Contacts */}
      <div className="w- bg-white border-r">
        <div className="p-4 font-bold text-lg border-b">AV_DMC Chats - Inbox Only</div>
        {contacts.length === 0 && (
          <div className="p-4 text-sm text-gray-400">No messages yet. Send hi to your number.</div>
        )}
        {contacts.map((c) => (
          <div
            key={c}
            onClick={() => setSelected(c)}
            className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${selected === c ? 'bg-green-50' : ''}`}
          >
            <div className="font-semibold">{c}</div>
            <div className="text-sm text-gray-500 truncate">
              {messages.find((m) => m.from === c)?.text}
            </div>
          </div>
        ))}
      </div>

      {/* Right - Chat View Only */}
      <div className="flex-1 flex flex-col">
        {!selected ? (
          <div className="m-auto text-gray-400">Select a chat to view messages</div>
        ) : (
          <>
            <div className="p-4 bg-white border-b font-bold">{selected}</div>
            <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-[#e5ddd5]">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.direction === 'OUTGOING' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg shadow max-w-[60%] text-sm ${m.direction === 'OUTGOING' ? 'bg-[#dcf8c6]' : 'bg-white'}`}
                  >
                    <div>{m.text}</div>
                    <div className="text- text-gray-500 mt-1">{m.time || ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

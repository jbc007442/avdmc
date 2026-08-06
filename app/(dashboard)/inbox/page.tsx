// 'use client';
// import { useEffect, useState } from 'react';

// export default function InboxPage() {
//   const [messages, setMessages] = useState<any[]>([]);
//   const [filter, setFilter] = useState('');

//   const load = async () => {
//     const res = await fetch('/api/inbox');
//     const data = await res.json();
//     setMessages(data);
//   };

//   useEffect(() => {
//     load();
//     const interval = setInterval(load, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   const filtered = messages.filter(
//     (m) =>
//       !filter || m.from?.includes(filter) || m.text?.toLowerCase().includes(filter.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">WhatsApp Inbox</h1>
//               <p className="text-sm text-gray-500 mt-1">
//                 AV DMC • {messages.length} messages • Live every 3s
//               </p>
//             </div>
//             <div className="flex gap-2">
//               <input
//                 placeholder="Search number or message..."
//                 value={filter}
//                 onChange={(e) => setFilter(e.target.value)}
//                 className="px-4 py-2.5 w- border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
//               />
//               <button
//                 onClick={load}
//                 className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition"
//               >
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-gray-900 text-white text-left">
//                   <th className="px-4 py-3 font-semibold">#</th>
//                   <th className="px-4 py-3 font-semibold">Customer Number</th>
//                   <th className="px-4 py-3 font-semibold">Message They Wrote</th>
//                   <th className="px-4 py-3 font-semibold">Type</th>
//                   <th className="px-4 py-3 font-semibold">Time</th>
//                   <th className="px-4 py-3 font-semibold">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {filtered.map((m, i) => (
//                   <tr key={m._id || i} className="hover:bg-gray-50 transition">
//                     <td className="px-4 py-3 text-gray-400">{i + 1}</td>
//                     <td className="px-4 py-3">
//                       <div className="font-bold text-gray-900">+{m.from}</div>
//                       <div className="text- text-gray-400">{m._id?.toString().slice(-8)}</div>
//                     </td>
//                     <td className="px-4 py-3 max-w-">
//                       <div
//                         className={`inline-block px-3 py-2 rounded-2xl whitespace-pre-wrap break-words leading-5
//                         ${m.direction === 'INCOMING' ? 'bg-green-100 text-green-900 rounded-bl-sm' : ''}
//                         ${m.direction === 'OUTGOING' ? 'bg-gray-100 text-gray-800 rounded-br-sm' : ''}
//                         ${m.direction === 'STATUS' ? 'bg-red-50 text-red-700' : ''}
//                       `}
//                       >
//                         {m.text}
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span
//                         className={`px-2.5 py-1 rounded-full text- font-bold text-white
//                         ${m.direction === 'INCOMING' ? 'bg-green-500' : ''}
//                         ${m.direction === 'OUTGOING' ? 'bg-blue-500' : ''}
//                         ${m.direction === 'STATUS' ? 'bg-red-500' : ''}
//                       `}
//                       >
//                         {m.direction}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
//                       {new Date(m.createdAt).toLocaleString('en-IN', {
//                         day: '2-digit',
//                         month: 'short',
//                         hour: '2-digit',
//                         minute: '2-digit',
//                       })}
//                     </td>
//                     <td className="px-4 py-3">
//                       <a
//                         href={`https://wa.me/${m.from}`}
//                         target="_blank"
//                         className="inline-flex px-3 py-1.5 bg-black text-white rounded-full text-xs font-semibold hover:bg-gray-800 transition"
//                       >
//                         Reply
//                       </a>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {filtered.length === 0 && (
//               <div className="py-16 text-center">
//                 <div className="text-4xl mb-3">💬</div>
//                 <p className="text-gray-500 text-sm">
//                   No messages yet. Ask customer to send Hi to your Business Number.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';
import { useEffect, useState } from 'react';

export default function InboxPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [replyTo, setReplyTo] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    const res = await fetch('/api/inbox');
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleReply = async () => {
    if (!replyTo || !replyText) return;
    setSending(true);
    const res = await fetch('/api/inbox/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: replyTo, message: replyText }),
    });
    const data = await res.json();
    setSending(false);
    if (data.success) {
      setReplyText('');
      setReplyTo('');
      load();
    } else {
      alert('Failed: ' + JSON.stringify(data.error));
    }
  };

  const filtered = messages.filter(
    (m) =>
      !filter || m.from?.includes(filter) || m.text?.toLowerCase().includes(filter.toLowerCase())
  );

  // Group by number for chat view
  const grouped = filtered.reduce((acc: any, msg) => {
    if (!acc[msg.from]) acc[msg.from] = [];
    acc[msg.from].push(msg);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">WhatsApp Inbox - AV DMC</h1>
              <p className="text-sm text-gray-500">
                {Object.keys(grouped).length} customers • {messages.length} messages
              </p>
            </div>
            <input
              placeholder="Search number or message..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2.5 w- border rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Customer List */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-4 font-bold border-b">Customers</div>
            <div className="divide-y max-h- overflow-y-auto">
              {Object.keys(grouped).map((num) => (
                <button
                  key={num}
                  onClick={() => setReplyTo(num)}
                  className={`w-full text-left p-4 hover:bg-gray-50 flex justify-between items-center ${replyTo === num ? 'bg-green-50' : ''}`}
                >
                  <div>
                    <div className="font-bold">+{num}</div>
                    <div className="text-xs text-gray-500 truncate max-w-">
                      {grouped[num][0]?.text}
                    </div>
                  </div>
                  <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded-full">
                    {grouped[num].length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Table + Reply */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-900 text-white sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left">Number</th>
                    <th className="px-4 py-3 text-left">Message</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.slice(0, 100).map((m: any, i: number) => (
                    <tr key={m._id || i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">+{m.from}</td>
                      <td className="px-4 py-3">
                        <div
                          className={`inline-block px-3 py-2 rounded-2xl max-w- break-words ${m.direction === 'INCOMING' ? 'bg-green-100' : 'bg-gray-100'}`}
                        >
                          {m.text}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text- font-bold text-white ${m.direction === 'INCOMING' ? 'bg-green-500' : 'bg-blue-500'}`}
                        >
                          {m.direction}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reply Box */}
            <div className="border-t p-4 bg-gray-50">
              {replyTo ? (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="text-xs font-bold mb-1">Replying to +{replyTo}</div>
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                    />
                  </div>
                  <button
                    onClick={handleReply}
                    disabled={sending}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 self-end"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                  <button
                    onClick={() => setReplyTo('')}
                    className="px-4 py-3 bg-gray-200 rounded-xl text-sm self-end"
                  >
                    X
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center">
                  Select a customer from left to reply
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// 'use client';
// import { useEffect, useState } from 'react';

// export default function InboxPage() {
//   const [messages, setMessages] = useState<any[]>([]);
//   const [filter, setFilter] = useState('');
//   const [replyTo, setReplyTo] = useState<string>('');
//   const [replyText, setReplyText] = useState('');
//   const [sending, setSending] = useState(false);

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

//   const handleReply = async () => {
//     if (!replyTo || !replyText) return;
//     setSending(true);
//     const res = await fetch('/api/inbox/reply', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ to: replyTo, message: replyText }),
//     });
//     const data = await res.json();
//     setSending(false);
//     if (data.success) {
//       setReplyText('');
//       setReplyTo('');
//       load();
//     } else {
//       alert('Failed: ' + JSON.stringify(data.error));
//     }
//   };

//   const filtered = messages.filter(
//     (m) =>
//       !filter || m.from?.includes(filter) || m.text?.toLowerCase().includes(filter.toLowerCase())
//   );

//   // Group by number for chat view
//   const grouped = filtered.reduce((acc: any, msg) => {
//     if (!acc[msg.from]) acc[msg.from] = [];
//     acc[msg.from].push(msg);
//     return acc;
//   }, {});

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <h1 className="text-2xl font-bold">WhatsApp Inbox - AV DMC</h1>
//               <p className="text-sm text-gray-500">
//                 {Object.keys(grouped).length} customers • {messages.length} messages
//               </p>
//             </div>
//             <input
//               placeholder="Search number or message..."
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//               className="px-4 py-2.5 w- border rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left: Customer List */}
//           <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//             <div className="p-4 font-bold border-b">Customers</div>
//             <div className="divide-y max-h- overflow-y-auto">
//               {Object.keys(grouped).map((num) => (
//                 <button
//                   key={num}
//                   onClick={() => setReplyTo(num)}
//                   className={`w-full text-left p-4 hover:bg-gray-50 flex justify-between items-center ${replyTo === num ? 'bg-green-50' : ''}`}
//                 >
//                   <div>
//                     <div className="font-bold">+{num}</div>
//                     <div className="text-xs text-gray-500 truncate max-w-">
//                       {grouped[num][0]?.text}
//                     </div>
//                   </div>
//                   <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded-full">
//                     {grouped[num].length}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Right: Table + Reply */}
//           <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col">
//             <div className="flex-1 overflow-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-900 text-white sticky top-0">
//                   <tr>
//                     <th className="px-4 py-3 text-left">Number</th>
//                     <th className="px-4 py-3 text-left">Message</th>
//                     <th className="px-4 py-3">Type</th>
//                     <th className="px-4 py-3">Time</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y">
//                   {filtered.slice(0, 100).map((m: any, i: number) => (
//                     <tr key={m._id || i} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 font-bold">+{m.from}</td>
//                       <td className="px-4 py-3">
//                         <div
//                           className={`inline-block px-3 py-2 rounded-2xl max-w- break-words ${m.direction === 'INCOMING' ? 'bg-green-100' : 'bg-gray-100'}`}
//                         >
//                           {m.text}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span
//                           className={`px-2 py-1 rounded-full text- font-bold text-white ${m.direction === 'INCOMING' ? 'bg-green-500' : 'bg-blue-500'}`}
//                         >
//                           {m.direction}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
//                         {new Date(m.createdAt).toLocaleString('en-IN')}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Reply Box */}
//             <div className="border-t p-4 bg-gray-50">
//               {replyTo ? (
//                 <div className="flex gap-2">
//                   <div className="flex-1">
//                     <div className="text-xs font-bold mb-1">Replying to +{replyTo}</div>
//                     <input
//                       value={replyText}
//                       onChange={(e) => setReplyText(e.target.value)}
//                       placeholder="Type your reply..."
//                       className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
//                       onKeyDown={(e) => e.key === 'Enter' && handleReply()}
//                     />
//                   </div>
//                   <button
//                     onClick={handleReply}
//                     disabled={sending}
//                     className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 self-end"
//                   >
//                     {sending ? 'Sending...' : 'Send'}
//                   </button>
//                   <button
//                     onClick={() => setReplyTo('')}
//                     className="px-4 py-3 bg-gray-200 rounded-xl text-sm self-end"
//                   >
//                     X
//                   </button>
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-400 text-center">
//                   Select a customer from left to reply
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Search,
  MoreVertical,
  Archive,
  MessageCircle,
  Smile,
  Paperclip,
  SendHorizontal,
  CheckCheck,
} from 'lucide-react';

interface Message {
  _id?: string;
  from: string;
  text: string;
  direction: 'INCOMING' | 'OUTGOING';
  createdAt: string;
}

interface Chat {
  number: string;
  messages: Message[];
  lastMessage: Message;
  unread: number;
}

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, selectedChat]);

  //-------------------------------------------------------
  // Load Messages
  //-------------------------------------------------------

  async function loadMessages() {
    try {
      const res = await fetch('/api/inbox', {
        cache: 'no-store',
      });

      const data = await res.json();

      setMessages(data);

      if (!selectedChat && data.length) {
        setSelectedChat(data[0].from);
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }

  //-------------------------------------------------------
  // Send Messages
  //-------------------------------------------------------
  async function sendReply() {
    if (!reply.trim() || !selectedChat) return;

    setSending(true);

    const tempMessage = {
      _id: Date.now().toString(),
      from: selectedChat,
      text: reply,
      direction: 'OUTGOING' as const,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, tempMessage]);

    const currentReply = reply;
    setReply('');

    try {
      const res = await fetch('/api/inbox/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedChat,
          message: currentReply,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert('Message failed');
        loadMessages();
      }
    } catch (err) {
      console.log(err);
      loadMessages();
    }

    setSending(false);
    await loadMessages();
  }

  useEffect(() => {
    loadMessages();

    const timer = setInterval(loadMessages, 3000);

    return () => clearInterval(timer);
  }, []);

  //-------------------------------------------------------
  // Group Messages
  //-------------------------------------------------------

  const chats = useMemo(() => {
    const map: Record<string, Message[]> = {};

    messages.forEach((msg) => {
      if (!map[msg.from]) map[msg.from] = [];
      map[msg.from].push(msg);
    });

    return Object.entries(map)
      .map(([number, msgs]) => ({
        number,
        messages: msgs,
        lastMessage: msgs[msgs.length - 1],
        unread: msgs.filter((x) => x.direction === 'INCOMING').length,
      }))
      .sort(
        (a, b) =>
          new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      );
  }, [messages]);

  //-------------------------------------------------------
  // Search
  //-------------------------------------------------------

  const filteredChats = chats.filter(
    (chat) =>
      chat.number.includes(filter) ||
      chat.lastMessage.text.toLowerCase().includes(filter.toLowerCase())
  );

  //-------------------------------------------------------

  const getInitials = (number: string) => {
    return number.slice(-2);
  };

  return (
    <div className="h-screen bg-[#111b21]">
      <div className="h-full flex">
        {/*==================================================*/}
        {/* Sidebar */}
        {/*==================================================*/}

        <aside className="w-[380px] bg-[#f0f2f5] border-r flex flex-col">
          {/* Header */}

          <div className="h-16 bg-[#202c33] px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-lg">
                AV
              </div>

              <div>
                <h2 className="text-white font-semibold">AV DMC</h2>

                <p className="text-xs text-gray-300">WhatsApp Inbox</p>
              </div>
            </div>

            <MoreVertical size={20} className="text-white" />
          </div>

          {/* Search */}

          <div className="p-3">
            <div className="bg-white rounded-lg h-11 px-4 flex items-center gap-3">
              <Search size={18} className="text-gray-500" />

              <input
                placeholder="Search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>

          {/* Chats */}

          <div className="flex-1 overflow-y-auto">
            {loading && <div className="text-center p-10 text-gray-400">Loading...</div>}

            {!loading &&
              filteredChats.map((chat) => (
                <button
                  key={chat.number}
                  onClick={() => setSelectedChat(chat.number)}
                  className={`w-full flex gap-4 px-4 py-3 border-b border-gray-200 hover:bg-[#e9edef]

                  ${selectedChat === chat.number ? 'bg-[#d9fdd3] shadow-sm' : ''}`}
                >
                  {/* Avatar */}

                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white font-bold flex items-center justify-center">
                      {getInitials(chat.number)}
                    </div>

                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                  </div>

                  {/* Chat */}

                  <div className="flex-1 text-left">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">+{chat.number}</h3>

                      <span className="text-xs text-gray-500">
                        {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm truncate text-gray-500">{chat.lastMessage.text}</p>

                      {chat.unread > 0 && (
                        <div className="bg-[#25D366] text-white rounded-full h-6 min-w-6 px-2 text-[10px] font-bold flex items-center justify-center shadow">
                          {chat.unread > 99 ? '99+' : chat.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </aside>

        {/*==================================================*/}
        {/* Right Side */}
        {/*==================================================*/}

        <section className="flex-1 flex flex-col bg-[#efeae2]">
          {/* =========================
        Header
  ========================= */}

          <div className="h-16 bg-[#f0f2f5] border-b flex items-center justify-between px-5">
            {selectedChat ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center font-bold">
                      {getInitials(selectedChat)}
                    </div>

                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#f0f2f5]"></span>
                  </div>

                  <div>
                    <h2 className="font-semibold">+{selectedChat}</h2>
                    <p className="text-xs text-green-600">Online now</p>
                  </div>
                </div>

                <div className="flex gap-5 text-gray-600">
                  <Search size={20} />
                  <MoreVertical size={20} />
                </div>
              </>
            ) : (
              <div className="text-gray-500">Select Chat</div>
            )}
          </div>

          {/* =========================
        Messages
  ========================= */}

          <div
            className="flex-1 overflow-y-auto px-8 py-6 scroll-smooth"
            style={{
              backgroundImage: "url('/whatsapp-bg.png')",
              backgroundRepeat: 'repeat',
            }}
          >
            {selectedChat ? (
              <div className="space-y-3">
                {(() => {
                  let lastDate = '';

                  return messages
                    .filter((m) => m.from === selectedChat)
                    .map((message, index) => {
                      const incoming = message.direction === 'INCOMING';

                      const messageDate = new Date(message.createdAt);
                      const currentDate = messageDate.toDateString();

                      const today = new Date().toDateString();

                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);

                      let dateLabel = currentDate;

                      if (currentDate === today) {
                        dateLabel = 'Today';
                      } else if (currentDate === yesterday.toDateString()) {
                        dateLabel = 'Yesterday';
                      }

                      const showDate = currentDate !== lastDate;
                      lastDate = currentDate;

                      const prev = messages.filter((m) => m.from === selectedChat)[index - 1];

                      const sameSender = prev && prev.direction === message.direction;

                      return (
                        <div key={message._id || index}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="bg-[#dff6ff] text-gray-600 text-xs px-4 py-1 rounded-full shadow">
                                {dateLabel}
                              </span>
                            </div>
                          )}

                          <div
                            className={`flex ${incoming ? 'justify-start' : 'justify-end'} ${
                              sameSender ? 'mt-1' : 'mt-4'
                            }`}
                          >
                            <div
                              className={`relative max-w-xl px-4 py-2 shadow transition-all duration-200 hover:shadow-lg
${incoming ? 'bg-white rounded-2xl rounded-tl-md' : 'bg-[#d9fdd3] rounded-2xl rounded-tr-md'}`}
                            >
                              {!sameSender && (
                                <span
                                  className={`absolute top-0 w-3 h-3 ${
                                    incoming ? '-left-1 bg-white' : '-right-1 bg-[#d9fdd3]'
                                  } rotate-45`}
                                />
                              )}
                              <p className="text-[15px] whitespace-pre-wrap break-words">
                                {message.text}
                              </p>

                              <div className="flex justify-end items-center gap-1 mt-2">
                                <span className="text-[11px] text-gray-500">
                                  {messageDate.toLocaleTimeString('en-IN', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                  })}
                                </span>

                                {!incoming && (
                                  <CheckCheck
                                    size={16}
                                    strokeWidth={2.5}
                                    className="text-[#53bdeb]"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                })()}

                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 shadow">
                  <MessageCircle size={70} className="mx-auto text-gray-300" />

                  <img src="/logo.png" className="w-40 opacity-60 mx-auto" />

                  <h2 className="text-3xl font-light mt-8">AV DMC Messenger</h2>

                  <p className="text-gray-500 mt-4">
                    Send and receive WhatsApp messages without keeping your phone online.
                  </p>

                  <p className="text-gray-500 mt-2">Start chatting with your customer</p>
                </div>
              </div>
            )}
          </div>

          {/* =========================
        Composer
  ========================= */}

          {selectedChat && (
            <div className="h-20 bg-[#f0f2f5] border-t px-4 flex items-center gap-3">
              <button className="text-gray-600 hover:text-black">
                <Smile size={24} />
              </button>

              <button className="text-gray-600 hover:text-black">
                <Paperclip size={22} />
              </button>

              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type a message"
                className="flex-1 h-11 rounded-full bg-white px-5 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
              />

              <button
                disabled={sending || !reply.trim()}
                onClick={sendReply}
                className="h-11 w-11 rounded-full bg-[#25D366] text-white flex items-center justify-center disabled:opacity-50"
              >
                <SendHorizontal size={20} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

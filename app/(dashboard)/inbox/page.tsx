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
  const selectedChatRef = useRef('');

  // Keep latest selected chat in the ref
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Auto scroll to latest message
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

      // Select only the first chat on initial load
      if (!selectedChatRef.current && data.length > 0) {
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
        await loadMessages();
      }
    } catch (err) {
      console.log(err);
      await loadMessages();
    }

    setSending(false);
    await loadMessages();
  }

  //-------------------------------------------------------
  // Initial Load + Polling
  //-------------------------------------------------------

  useEffect(() => {
    loadMessages();

    const timer = setInterval(() => {
      loadMessages();
    }, 3000);

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

                  // Sort messages oldest -> newest
                  const chatMessages = messages
                    .filter((m) => m.from === selectedChat)
                    .sort(
                      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );

                  return chatMessages.map((message, index) => {
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

                    const prev = chatMessages[index - 1];

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
                          className={`flex ${
                            incoming ? 'justify-start' : 'justify-end'
                          } ${sameSender ? 'mt-1' : 'mt-4'}`}
                        >
                          <div
                            className={`relative max-w-xl px-4 py-2 shadow transition-all duration-200 hover:shadow-lg ${
                              incoming
                                ? 'bg-white rounded-2xl rounded-tl-md'
                                : 'bg-[#d9fdd3] rounded-2xl rounded-tr-md'
                            }`}
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

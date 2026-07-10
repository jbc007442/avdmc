'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Mail, MessageCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success) {
        localStorage.removeItem('user');
        toast.success(data.message);

        router.replace('/login');
        router.refresh();
      }
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar - Elevated with a slight border and clean spacing */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between p-6">
          <span className="font-bold text-xl tracking-tight text-slate-900">BrandStudio</span>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col h-[calc(100vh-88px)] px-4 py-2">
          <div className="space-y-1">
            <NavItem href="/email" icon={<Mail size={18} />} label="Email Campaigns" />

            <NavItem href="/whatsapp" icon={<MessageCircle size={18} />} label="WhatsApp Flow" />
          </div>

          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium text-sm transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <button
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="flex-1" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-medium text-sm"
    >
      {icon}
      {label}
    </Link>
  );
}

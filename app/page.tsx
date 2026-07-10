'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mail,
  MessageCircle,
  ArrowRight,
  Plane,
  ShieldCheck,
  MapPin,
  UserCircle,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-slate-900 tracking-tighter">AVDMC</div>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <UserCircle size={18} />
            Login
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Welcome to <span className="text-blue-600">Avdmc</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            The premium travel management suite. Orchestrate your global marketing reach with
            precision-engineered email and messaging tools.
          </p>
        </section>

        {/* Marketing Hub Cards */}
        <section className="grid md:grid-cols-2 gap-8">
          <MarketingCard
            title="Email Campaigns"
            desc="Craft bespoke newsletters and automated drip sequences for your elite clientele."
            icon={<Mail className="text-blue-600" size={32} />}
            href="/email"
            action="Compose"
          />
          <MarketingCard
            title="WhatsApp Marketing"
            desc="Direct, real-time engagement via secure, encrypted messaging channels."
            icon={<MessageCircle className="text-green-600" size={32} />}
            href="/whatsapp"
            action="Connect"
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-20 pt-10 pb-12 text-center text-slate-400 text-sm">
        <div className="flex justify-center gap-12 mb-8">
          <FooterIcon icon={<Plane />} label="Luxury Travel" />
          <FooterIcon icon={<ShieldCheck />} label="Secure Portal" />
          <FooterIcon icon={<MapPin />} label="Global Reach" />
        </div>
        <p>&copy; {new Date().getFullYear()} Avdmc Travel Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}

function MarketingCard({ title, desc, icon, href, action }: any) {
  return (
    <div className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6">{desc}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all"
      >
        {action} <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function FooterIcon({ icon, label }: any) {
  return (
    <div className="flex flex-col items-center gap-2 text-slate-600">
      {icon}
      <span className="text-xs uppercase tracking-widest font-medium">{label}</span>
    </div>
  );
}

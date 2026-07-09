'use client';

import { Mail, Gift, Newspaper, Plane, Hotel, Cake, Receipt, KeyRound } from 'lucide-react';

type TemplateSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

const templates = [
  {
    id: 'welcome',
    name: 'Welcome',
    icon: Mail,
  },
  {
    id: 'offer',
    name: 'Offer',
    icon: Gift,
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    icon: Newspaper,
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: Plane,
  },
  {
    id: 'hotel',
    name: 'Hotel',
    icon: Hotel,
  },
  {
    id: 'birthday',
    name: 'Birthday',
    icon: Cake,
  },
  {
    id: 'invoice',
    name: 'Invoice',
    icon: Receipt,
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    icon: KeyRound,
  },
];

export default function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-slate-700">Email Template</label>

      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => {
          const Icon = template.icon;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              className={`rounded-xl border p-4 transition-all ${
                value === template.id
                  ? 'border-blue-600 bg-blue-50 shadow'
                  : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon
                  size={28}
                  className={value === template.id ? 'text-blue-600' : 'text-slate-600'}
                />

                <span
                  className={`text-sm font-medium ${
                    value === template.id ? 'text-blue-700' : 'text-slate-700'
                  }`}
                >
                  {template.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

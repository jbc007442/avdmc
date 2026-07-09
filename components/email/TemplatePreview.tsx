'use client';

import { useMemo } from 'react';

import { WelcomeTemplate } from '@/components/templates/WelcomeTemplate';
import { OfferTemplate } from '@/components/templates/OfferTemplate';
import { NewsletterTemplate } from '@/components/templates/NewsletterTemplate';
import { TravelTemplate } from '@/components/templates/TravelTemplate';
import { HotelTemplate } from '@/components/templates/HotelTemplate';
import { BirthdayTemplate } from '@/components/templates/BirthdayTemplate';
import { InvoiceTemplate } from '@/components/templates/InvoiceTemplate';
import { PasswordResetTemplate } from '@/components/templates/PasswordResetTemplate';

type Props = {
  template: string;
  html?: string;
};

export default function TemplatePreview({ template, html }: Props) {
  const templateHtml = useMemo(() => {
    switch (template) {
      case 'welcome':
        return WelcomeTemplate('Tarun');

      case 'offer':
        return OfferTemplate();

      case 'newsletter':
        return NewsletterTemplate();

      case 'travel':
        return TravelTemplate();

      case 'hotel':
        return HotelTemplate();

      case 'birthday':
        return BirthdayTemplate('Tarun');

      case 'invoice':
        return InvoiceTemplate();

      case 'password-reset':
        return PasswordResetTemplate('https://avdmc.com/reset-password');

      default:
        return `
          <html>
            <body style="font-family:Arial;padding:40px">
              <h1>No Template Selected</h1>
            </body>
          </html>
        `;
    }
  }, [template]);

  const previewHtml = html && html.trim().length > 0 ? html : templateHtml;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">Email Preview</label>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          Live
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow">
        <div className="flex items-center justify-between border-b bg-slate-100 px-4 py-3">
          <h3 className="font-semibold">Live Email Preview</h3>

          <span className="text-xs text-slate-500">{template.toUpperCase()}</span>
        </div>

        <iframe title="Email Preview" srcDoc={previewHtml} className="h-[700px] w-full bg-white" />
      </div>
    </div>
  );
}

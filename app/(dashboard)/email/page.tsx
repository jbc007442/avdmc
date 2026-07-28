'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import SubjectInput from '@/components/email/SubjectInput';
import TemplatePreview from '@/components/email/TemplatePreview';
import BulkEmailPaste from '@/components/email/BulkEmailPaste';
import ProgressBar from '@/components/email/ProgressBar';
import SendButton from '@/components/email/SendButton';

import { TravelTemplate } from '@/components/templates/TravelTemplate';
import { SingaporeTemplate } from '@/components/templates/SingaporeTemplate';

export default function Home() {
  const [loading, setLoading] = useState(false);

  const [recipients, setRecipients] = useState<string[]>([]);

  const [template, setTemplate] = useState<'travel' | 'singapore'>('travel');

  const [subject, setSubject] = useState('Maldives Special Offer');

  const [html, setHtml] = useState('');

  const [progress, setProgress] = useState(0);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    switch (template) {
      case 'travel':
        setHtml(TravelTemplate());
        setSubject('Maldives Special Offer');
        break;

      case 'singapore':
        setHtml(SingaporeTemplate());
        setSubject('Singapore Getaway');
        break;
    }
  }, [template]);

  async function sendMail() {
    try {
      setLoading(true);

      setProgress(15);

      const payload = {
        to: recipients,
        subject,
        html,
      };

      const res = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setProgress(70);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setProgress(100);
      setCurrent(data.sent ?? recipients.length);

      toast.success(`Successfully sent ${data.sent ?? recipients.length} email(s)`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-center text-4xl font-bold">AWS SES Email Marketing</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Side */}
          <div className="space-y-6">
            <BulkEmailPaste
              onImport={(emails) => {
                setRecipients(emails);
                toast.success(`${emails.length} email(s) imported`);
              }}
            />

            <SubjectInput value={subject} onChange={setSubject} />

            {/* Template Selector */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email Template</label>

              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as 'travel' | 'singapore')}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="travel">Maldives Offer</option>

                <option value="singapore">Singapore Getaway</option>
              </select>
            </div>

            <ProgressBar
              progress={progress}
              current={current}
              total={recipients.length}
              status={loading ? 'Sending...' : 'Ready'}
            />

            <SendButton loading={loading} onClick={sendMail} />
          </div>

          {/* Right Side */}
          <div>
            <TemplatePreview template={template} html={html} />
          </div>
        </div>
      </div>
    </main>
  );
}

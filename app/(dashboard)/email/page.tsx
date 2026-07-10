'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// import RecipientInput from '@/components/email/RecipientInput';
import SubjectInput from '@/components/email/SubjectInput';
import TemplateSelector from '@/components/email/TemplateSelector';
import TemplatePreview from '@/components/email/TemplatePreview';
import AttachmentUploader from '@/components/email/AttachmentUploader';
import BulkEmailPaste from '@/components/email/BulkEmailPaste';
import ScheduleMail from '@/components/email/ScheduleMail';
import ProgressBar from '@/components/email/ProgressBar';
import SendButton from '@/components/email/SendButton';

import { WelcomeTemplate } from '@/components/templates/WelcomeTemplate';
import { OfferTemplate } from '@/components/templates/OfferTemplate';
import { NewsletterTemplate } from '@/components/templates/NewsletterTemplate';
import { TravelTemplate } from '@/components/templates/TravelTemplate';
import { HotelTemplate } from '@/components/templates/HotelTemplate';
import { BirthdayTemplate } from '@/components/templates/BirthdayTemplate';
import { InvoiceTemplate } from '@/components/templates/InvoiceTemplate';
import { PasswordResetTemplate } from '@/components/templates/PasswordResetTemplate';

export default function Home() {
  const [loading, setLoading] = useState(false);

  const [recipients, setRecipients] = useState<string[]>([]);

  const [subject, setSubject] = useState('Welcome to AVDMC');

  const [template, setTemplate] = useState('welcome');

  const [html, setHtml] = useState('');

  const [files, setFiles] = useState<File[]>([]);

  const [progress, setProgress] = useState(0);

  const [current, setCurrent] = useState(0);

  const [scheduleEnabled, setScheduleEnabled] = useState(false);

  const [scheduleDate, setScheduleDate] = useState('');

  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    switch (template) {
      case 'welcome':
        setHtml(WelcomeTemplate('Tarun'));
        break;

      case 'offer':
        setHtml(OfferTemplate());
        break;

      case 'newsletter':
        setHtml(NewsletterTemplate());
        break;

      case 'travel':
        setHtml(TravelTemplate());
        break;

      case 'hotel':
        setHtml(HotelTemplate());
        break;

      case 'birthday':
        setHtml(BirthdayTemplate('Tarun'));
        break;

      case 'invoice':
        setHtml(InvoiceTemplate());
        break;

      case 'password-reset':
        setHtml(PasswordResetTemplate('https://avdmc.com/reset-password'));
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
        schedule: {
          enabled: scheduleEnabled,
          date: scheduleDate,
          time: scheduleTime,
        },
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
      setCurrent(recipients.length);

      toast.success('Email sent successfully');
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
          <div className="space-y-6">
            <BulkEmailPaste
              onImport={(emails) => {
                setRecipients(emails);

                toast.success(`${emails.length} email(s) imported`);
              }}
            />

            {/* <RecipientInput value={recipients} onChange={setRecipients} /> */}

            <SubjectInput value={subject} onChange={setSubject} />

            <TemplateSelector value={template} onChange={setTemplate} />

            {/* <EmailEditor value={html} onChange={setHtml} /> */}

            <AttachmentUploader files={files} onChange={setFiles} />

            <ScheduleMail
              enabled={scheduleEnabled}
              date={scheduleDate}
              time={scheduleTime}
              onEnabledChange={setScheduleEnabled}
              onDateChange={setScheduleDate}
              onTimeChange={setScheduleTime}
            />

            <ProgressBar
              progress={progress}
              current={current}
              total={recipients.length}
              status={loading ? 'Sending...' : 'Ready'}
            />

            <SendButton loading={loading} onClick={sendMail} />
          </div>

          <div>
            <TemplatePreview template={template} html={html} />
          </div>
        </div>
      </div>
    </main>
  );
}

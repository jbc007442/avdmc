'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

const templates = [
  { name: 'welcome_avdmc', lang: 'en', hasImage: true, params: ['name'] },
  { name: 'av_mc1', lang: 'en_US', hasImage: false, params: [] },
  { name: 'kuda_vllinagali', lang: 'en', hasImage: true, params: [] },
  { name: 'hello_world', lang: 'en_US', hasImage: false, params: [] },
];

export default function Page() {
  const [phones, setPhones] = useState('');
  const [template, setTemplate] = useState(templates[0].name);
  const [mediaUrl, setMediaUrl] = useState(
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLHNePLFGX8ZZ_bTYC5dBzK8OLp_IKipXZ8XMdsbem1A&s=10'
  );
  const [parameters, setParameters] = useState('Tarun');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const currentTemplate = templates.find((t) => t.name === template)!;

  const sendWhatsApp = async () => {
    const phoneList = phones
      .split(/[\n,]/)
      .map((p) => p.trim().replace(/\D/g, ''))
      .filter(Boolean)
      .map((p) => (p.length === 10 ? `91${p}` : p));
    if (!phoneList.length) return toast.warning('Enter phone numbers');
    if (currentTemplate.hasImage && !mediaUrl)
      return toast.warning('Media URL required for this template');

    setSending(true);
    setResults([]);

    // FIX: Convert params to named format for welcome_avdmc
    const paramLines = parameters
      .split(/\n|,/)
      .map((p) => p.trim())
      .filter(Boolean);
    let bodyParams: any[] = [];

    if (template === 'welcome_avdmc') {
      // Named param format
      bodyParams = paramLines.map((name) => ({ parameter_name: 'name', text: name }));
      // If bulk: use first name for all, or if same count as phones, map one-to-one
      if (paramLines.length === 1 && phoneList.length > 1) {
        bodyParams = [{ parameter_name: 'name', text: paramLines[0] }];
      }
    } else {
      bodyParams = paramLines;
    }

    const toastId = toast.loading('Sending...');

    for (let i = 0; i < phoneList.length; i++) {
      const phone = phoneList[i];
      const paramsToSend =
        template === 'welcome_avdmc' && paramLines.length === phoneList.length
          ? [{ parameter_name: 'name', text: paramLines[i] }]
          : bodyParams;

      try {
        const res = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            template,
            language: currentTemplate.lang,
            htype: currentTemplate.hasImage ? 'image' : undefined,
            mediaUrl: currentTemplate.hasImage ? mediaUrl : undefined,
            parameters: paramsToSend,
          }),
        });
        const data = await res.json();
        setResults((prev) => [
          ...prev,
          {
            phone,
            status: data.success ? '✅ Sent' : '❌ Failed',
            error: data.response?.error?.message || '',
          },
        ]);
        data.success ? toast.success(`✅ ${phone}`) : toast.error(`❌ ${phone}`);
      } catch (e: any) {
        setResults((prev) => [...prev, { phone, status: '❌ Failed', error: e.message }]);
      }
    }
    toast.dismiss(toastId);
    toast.success('Completed');
    setSending(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white border rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold">WhatsApp Sender - Fixed</h1>
        <p className="text-zinc-500 text-sm mb-6">welcome_avdmc is Ready ✅</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="font-medium text-sm">Template</label>
              <select
                className="w-full border rounded-xl p-3 mt-1"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              >
                {templates.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.lang}) {t.hasImage ? '+ Image' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-medium text-sm">
                Media URL {currentTemplate.hasImage && '*'}
              </label>
              <input
                className="w-full border rounded-xl p-3 mt-1"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://..."
                disabled={!currentTemplate.hasImage}
              />
            </div>
            <div>
              <label className="font-medium text-sm">Language: {currentTemplate.lang}</label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-medium text-sm">
                Name Parameter (one per line, same order as phones)
              </label>
              <textarea
                rows={4}
                className="w-full border rounded-xl p-3 mt-1"
                value={parameters}
                onChange={(e) => setParameters(e.target.value)}
                placeholder="Tarun&#10;Amit&#10;Rahul"
              />
            </div>
            <div>
              <label className="font-medium text-sm">Phone Numbers</label>
              <textarea
                rows={4}
                className="w-full border rounded-xl p-3 mt-1"
                value={phones}
                onChange={(e) => setPhones(e.target.value)}
                placeholder="7999267389&#10;9876543210"
              />
            </div>
            <button
              onClick={sendWhatsApp}
              disabled={sending}
              className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
            >
              {sending ? 'Sending...' : `Send ${template}`}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="mt-6 border-t pt-4">
            {results.map((r, i) => (
              <div key={i} className="text-sm py-1 flex justify-between">
                <span>{r.phone}</span>
                <span>
                  {r.status} {r.error}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

const templates = ['av_mc1', 'kuda_vllinagali', 'your_third_template'];

type Result = {
  phone: string;
  status: string;
  httpStatus?: number;
  response?: string;
  error?: string;
};

export default function Page() {
  const [phones, setPhones] = useState('');
  const [template, setTemplate] = useState(templates[0]);
  const [htype, setHtype] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [language, setLanguage] = useState('en');

  // Template variables
  const [parameters, setParameters] = useState('');

  const [sending, setSending] = useState(false);

  const [results, setResults] = useState<Result[]>([]);

  const sendWhatsApp = async () => {
    const phoneList = phones
      .split(/[\n,]/)
      .map((p) => p.trim().replace(/\D/g, ''))
      .filter(Boolean)
      .map((p) => (p.length === 10 ? `91${p}` : p));

    if (!phoneList.length) {
      alert('Enter phone number(s)');
      return;
    }

    if (htype && !mediaUrl) {
      alert('Please enter Media URL');
      return;
    }

    setSending(true);
    setResults([]);

    const bodyParameters = parameters
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    for (const phone of phoneList) {
      try {
        const res = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone,
            template,
            language,
            htype: htype || undefined,
            mediaUrl: mediaUrl || undefined,
            parameters: bodyParameters,
          }),
        });

        const data = await res.json();

        setResults((prev) => [
          ...prev,
          {
            phone,
            status: data.success ? '✅ Sent' : '❌ Failed',
            httpStatus: data.status,
            response: JSON.stringify(data.response, null, 2),
            error: data.response?.error?.message || data.error || '',
          },
        ]);
      } catch (err) {
        setResults((prev) => [
          ...prev,
          {
            phone,
            status: '❌ Failed',
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        ]);
      }
    }

    setSending(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">WhatsApp Cloud API</h1>

      <div className="space-y-5">
        <div>
          <label className="font-medium block mb-2">Template</label>

          <select
            className="w-full border rounded-lg p-3"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            {templates.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium block mb-2">Language</label>

          <input
            className="w-full border rounded-lg p-3"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="en"
          />
        </div>

        <div>
          <label className="font-medium block mb-2">Header Type</label>

          <select
            className="w-full border rounded-lg p-3"
            value={htype}
            onChange={(e) => setHtype(e.target.value)}
          >
            <option value="">No Header</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>
        </div>

        {htype && (
          <div>
            <label className="font-medium block mb-2">Media URL</label>

            <input
              className="w-full border rounded-lg p-3"
              placeholder="https://example.com/image.jpg"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="font-medium block mb-2">Template Parameters</label>

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Tarun Kumar,BK000123,Delhi"
            value={parameters}
            onChange={(e) => setParameters(e.target.value)}
          />

          <p className="text-sm text-gray-500 mt-1">Separate variables using commas.</p>
        </div>

        <div>
          <label className="font-medium block mb-2">Phone Numbers</label>

          <textarea
            rows={8}
            className="w-full border rounded-lg p-3"
            placeholder={`8950475004
9876543210

or

8950475004,9876543210`}
            value={phones}
            onChange={(e) => setPhones(e.target.value)}
          />
        </div>

        <button
          disabled={sending}
          onClick={sendWhatsApp}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg disabled:opacity-60"
        >
          {sending ? 'Sending...' : 'Send WhatsApp'}
        </button>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Results</h2>

        <table className="w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">HTTP</th>
              <th className="border p-2">Response</th>
              <th className="border p-2">Error</th>
            </tr>
          </thead>

          <tbody>
            {results.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center border p-6 text-gray-500">
                  No messages sent yet.
                </td>
              </tr>
            )}

            {results.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.phone}</td>

                <td className="border p-2">{item.status}</td>

                <td className="border p-2">{item.httpStatus ?? '-'}</td>

                <td className="border p-2 whitespace-pre-wrap break-all text-sm">
                  {item.response}
                </td>

                <td className="border p-2 whitespace-pre-wrap break-all text-red-600 text-sm">
                  {item.error}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

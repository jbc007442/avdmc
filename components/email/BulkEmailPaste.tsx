'use client';

import { useState } from 'react';

interface Props {
  onImport: (emails: string[]) => void;
}

export default function BulkEmailPaste({ onImport }: Props) {
  const [text, setText] = useState('');

  function importEmails() {
    const emails =
      text
        .match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)
        ?.map((email) => email.trim().toLowerCase()) || [];

    const uniqueEmails = [...new Set(emails)];

    onImport(uniqueEmails);
  }

  return (
    <div className="space-y-3">
      <label className="font-medium">Paste Excel / CSV / Email List</label>

      <textarea
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Paste emails copied from Excel, CSV, or Google Sheets...

john@gmail.com
tarun@gmail.com
admin@gmail.com`}
        className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="button"
        onClick={importEmails}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Import Emails
      </button>
    </div>
  );
}

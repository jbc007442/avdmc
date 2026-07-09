'use client';

type RecipientInputProps = {
  value: string[];
  onChange: (emails: string[]) => void;
};

export default function RecipientInput({ value, onChange }: RecipientInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const emails = e.target.value
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    onChange(emails);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">Recipients</label>

      <textarea
        rows={4}
        value={value.join(', ')}
        onChange={handleChange}
        placeholder="john@gmail.com, jane@gmail.com"
        className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />

      <p className="text-xs text-slate-500">Separate multiple email addresses with commas.</p>

      <div className="flex flex-wrap gap-2">
        {value.map((email) => (
          <span
            key={email}
            className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
          >
            {email}
          </span>
        ))}
      </div>
    </div>
  );
}

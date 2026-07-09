'use client';

type SubjectInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SubjectInput({ value, onChange }: SubjectInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="subject" className="text-sm font-semibold text-slate-700">
        Subject
      </label>

      <input
        id="subject"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter email subject..."
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Email subject</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}

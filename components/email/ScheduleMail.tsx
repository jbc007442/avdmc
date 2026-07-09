'use client';

import { CalendarClock } from 'lucide-react';

type ScheduleMailProps = {
  enabled: boolean;
  date: string;
  time: string;
  onEnabledChange: (enabled: boolean) => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
};

export default function ScheduleMail({
  enabled,
  date,
  time,
  onEnabledChange,
  onDateChange,
  onTimeChange,
}: ScheduleMailProps) {
  return (
    <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <CalendarClock className="text-blue-600" size={22} />

        <h2 className="text-lg font-semibold">Schedule Email</h2>
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          className="h-5 w-5 accent-blue-600"
        />

        <span className="font-medium">Send Later</span>
      </label>

      {enabled && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Date</label>

            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Time</label>

            <input
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}

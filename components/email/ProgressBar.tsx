'use client';

type ProgressBarProps = {
  progress: number;
  current?: number;
  total?: number;
  status?: string;
};

export default function ProgressBar({ progress, current, total, status }: ProgressBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Sending Progress</h3>

        <span className="text-sm font-bold text-blue-600">{progress}%</span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {(current !== undefined || total !== undefined) && (
        <div className="flex justify-between text-sm text-slate-500">
          <span>
            {current ?? 0} / {total ?? 0}
          </span>

          {status && <span className="font-medium">{status}</span>}
        </div>
      )}
    </div>
  );
}

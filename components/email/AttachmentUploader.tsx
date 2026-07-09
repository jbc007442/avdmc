'use client';

import { Upload, Paperclip, X } from 'lucide-react';

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
};

export default function AttachmentUploader({ files, onChange }: Props) {
  function handleFiles(selected: FileList | null) {
    if (!selected) return;

    onChange([...files, ...Array.from(selected)]);
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold text-slate-700">Attachments</label>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition hover:border-blue-500 hover:bg-blue-50">
        <Upload size={42} className="mb-3 text-blue-600" />

        <p className="font-medium text-slate-700">Click or Drag Files Here</p>

        <p className="mt-1 text-sm text-slate-500">PDF, Images, DOCX, XLSX, ZIP...</p>

        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border bg-white p-3"
            >
              <div className="flex items-center gap-3">
                <Paperclip size={18} className="text-blue-600" />

                <div>
                  <p className="font-medium">{file.name}</p>

                  <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="rounded-full p-2 text-red-500 transition hover:bg-red-100"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

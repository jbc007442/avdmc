'use client';

import { Loader2, Send } from 'lucide-react';

type SendButtonProps = {
  loading: boolean;
  onClick: () => void;
};

export default function SendButton({ loading, onClick }: SendButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="
        flex
        w-full
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-blue-600
        px-6
        py-3
        text-sm
        font-semibold
        text-white
        shadow-lg
        transition-all
        duration-200
        hover:bg-blue-700
        hover:shadow-xl
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Sending Email...
        </>
      ) : (
        <>
          <Send className="h-5 w-5" />
          Send Email
        </>
      )}
    </button>
  );
}

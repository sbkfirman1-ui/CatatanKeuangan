'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Caught by Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-red-50 text-red-900 rounded-2xl m-8">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <pre className="text-left bg-white p-4 rounded-lg shadow-inner overflow-auto max-w-full text-sm whitespace-pre-wrap">
        {error.message}
      </pre>
      <button
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}

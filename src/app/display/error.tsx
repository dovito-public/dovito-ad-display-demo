"use client";

import { useEffect } from "react";

export default function DisplayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Auto-retry after 10 seconds
  useEffect(() => {
    console.error("Display error:", error);
    const timeout = setTimeout(() => reset(), 10000);
    return () => clearTimeout(timeout);
  }, [error, reset]);

  // Auto-reload as final fallback after 60 seconds
  useEffect(() => {
    const reloadTimeout = setTimeout(() => {
      window.location.reload();
    }, 60000);
    return () => clearTimeout(reloadTimeout);
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white">
      <div className="text-center max-w-2xl mx-auto px-8">
        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="text-blue-600 text-4xl font-bold">D</span>
        </div>
        <h1 className="text-5xl lg:text-6xl font-bold mb-6">
          Ads by Dovito
        </h1>
        <p className="text-xl text-blue-100 mb-4">
          Reconnecting to display service...
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
}

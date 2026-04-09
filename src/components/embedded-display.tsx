"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Slide } from "@/lib/schema";
import UnifiedSlideDisplay from "@/components/unified-slide-display";

export default function EmbeddedDisplay() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const { data: slides = [], isLoading, isError } = useQuery<Slide[]>({
    queryKey: ["/api/slides/visible"],
    refetchInterval: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const { data: displaySettings = [] } = useQuery({
    queryKey: ["/api/display-settings"],
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Auto-rotate slides
  useEffect(() => {
    if (slides.length === 0) return;

    const globalInterval = parseInt(
      (displaySettings as any[]).find(
        (s: any) => s.setting_key === "slideInterval"
      )?.setting_value || "15"
    );
    const currentSlide = slides[currentSlideIndex];
    const duration = (currentSlide?.duration_seconds || globalInterval) * 1000;

    const interval = setInterval(() => {
      setCurrentSlideIndex((current) =>
        current >= slides.length - 1 ? 0 : current + 1
      );
    }, duration);

    return () => clearInterval(interval);
  }, [slides, displaySettings, currentSlideIndex]);

  // Reset slide index if out of bounds
  useEffect(() => {
    if (currentSlideIndex >= slides.length && slides.length > 0) {
      setCurrentSlideIndex(0);
    }
  }, [slides.length, currentSlideIndex]);

  if (isLoading) {
    return (
      <div
        className="w-full bg-black relative overflow-hidden flex items-center justify-center"
        style={{ aspectRatio: "16/9" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div
        className="w-full bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden flex items-center justify-center text-white"
        style={{ aspectRatio: "16/9" }}
      >
        <div className="text-center px-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 text-2xl font-bold">D</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Ads by Dovito</h2>
          <p className="text-sm text-blue-100">
            Your ad could be here
          </p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div
      className="w-full bg-black relative overflow-hidden"
      style={{ aspectRatio: "16/9" }}
    >
      <UnifiedSlideDisplay
        slide={currentSlide}
        className="w-full h-full"
        showQR={true}
        showBranding={true}
      />
    </div>
  );
}

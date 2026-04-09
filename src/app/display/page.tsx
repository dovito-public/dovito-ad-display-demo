"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Slide } from "@/lib/schema";
import UnifiedSlideDisplay from "@/components/unified-slide-display";

export default function DisplayPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [hideCursor, setHideCursor] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevSlideRef = useRef<Slide | null>(null);
  const displaySessionId = useRef(crypto.randomUUID());
  const slideStartTime = useRef(Date.now());
  const startTime = useRef(Date.now());

  // Fetch visible slides with retry and recovery for always-on display
  const { data: slides = [], isLoading, isError, error } = useQuery<Slide[]>({
    queryKey: ["/api/slides/visible"],
    refetchInterval: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Fetch display settings with retry
  const { data: displaySettings = [] } = useQuery({
    queryKey: ['/api/display-settings'],
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Auto-rotate slides using individual slide duration or global slideInterval setting
  useEffect(() => {
    if (slides.length <= 1) return;

    const raw = (displaySettings as any[]).find(
      (s: any) => s.setting_key === 'slideInterval'
    )?.setting_value;
    const parsed = typeof raw === 'number' ? raw : parseInt(String(raw));
    const globalInterval = Number.isFinite(parsed) && parsed > 0 ? parsed : 15;

    const currentSlide = slides[currentSlideIndex];
    const duration = ((currentSlide?.duration_seconds) || globalInterval) * 1000;
    slideStartTime.current = Date.now();

    const timeout = setTimeout(() => {
      const elapsedSeconds = Math.round((Date.now() - slideStartTime.current) / 1000);
      if (currentSlide && currentSlide.id) {
        fetch("/api/impressions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slide_id: currentSlide.id,
            duration_seconds: elapsedSeconds,
            display_session_id: displaySessionId.current,
          }),
        }).catch(() => {}); // Silently fail -- display must not break
      }

      setCurrentSlideIndex((current) => {
        if (slides.length === 0) return 0;
        return current >= slides.length - 1 ? 0 : current + 1;
      });
    }, duration);

    return () => clearTimeout(timeout);
  }, [slides, displaySettings, currentSlideIndex]);

  // Reset slide index if it's out of bounds
  useEffect(() => {
    if (currentSlideIndex >= slides.length && slides.length > 0) {
      setCurrentSlideIndex(0);
    }
  }, [slides, currentSlideIndex]);

  // Cross-fade transition: when currentSlideIndex changes, fade between slides
  useEffect(() => {
    if (slides.length === 0) return;
    const safeIndex = Math.min(currentSlideIndex, slides.length - 1);
    if (displayIndex !== safeIndex) {
      prevSlideRef.current = slides[displayIndex] ?? null;
      setDisplayIndex(safeIndex);
      setIsTransitioning(true);
      const fadeTimeout = setTimeout(() => setIsTransitioning(false), 500);
      return () => clearTimeout(fadeTimeout);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlideIndex, slides]);

  // Preload next slide's image before transition
  useEffect(() => {
    if (slides.length < 2) return;
    const nextIndex = currentSlideIndex >= slides.length - 1 ? 0 : currentSlideIndex + 1;
    const nextSlide = slides[nextIndex];
    if (nextSlide?.advertisement_image_url) {
      const img = new Image();
      img.src = nextSlide.advertisement_image_url;
    }
  }, [currentSlideIndex, slides]);

  // Auto-hide cursor after 5 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      setHideCursor(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setHideCursor(true);
      }, 5000);
    };

    handleMouseMove();

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // Auto-reload page if stuck in error state for extended period
  // (satisfies AC #5: 3 consecutive retries via useQuery retry:3, then 60s reload)
  useEffect(() => {
    if (!isError) return;
    const reloadTimeout = setTimeout(() => {
      window.location.reload();
    }, 60000); // Reload after 60s of error state
    return () => clearTimeout(reloadTimeout);
  }, [isError]);

  // Send heartbeat every 60 seconds so admin dashboard can show display health
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/display/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: displaySessionId.current,
          slide_count: slides.length,
          current_slide_id: slides[currentSlideIndex]?.id ?? null,
          uptime_seconds: Math.round((Date.now() - startTime.current) / 1000),
          last_error: isError ? String(error) : null,
        }),
      }).catch(() => {}); // Never break the display
    }, 60_000);

    return () => clearInterval(interval);
  }, [slides, currentSlideIndex, isError, error]);

  // Enter fullscreen on first user click (hides browser address bar on TV)
  useEffect(() => {
    const handleClick = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    document.addEventListener("click", handleClick, { once: true });
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center text-white" style={{ cursor: hideCursor ? 'none' : 'default' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold">Loading Display...</h2>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white" style={{ cursor: hideCursor ? 'none' : 'default' }}>
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

  if (slides.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white" style={{ cursor: hideCursor ? 'none' : 'default' }}>
        <div className="text-center max-w-2xl mx-auto px-8">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-blue-600 text-4xl font-bold">D</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Ads by Dovito
          </h1>
          <p className="text-2xl text-blue-100 mb-8">
            Get Your Business Seen on Main Street Windsor
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8">
            <p className="text-xl mb-4">
              Ready to advertise your business here?
            </p>
            <div className="text-lg">
              Visit <strong>ad.dovito.com</strong> to get started
            </div>
          </div>

          {/* Dovito Branding Pill */}
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <span className="text-sm">Get seen with Dovito Ads</span>
            <div className="w-6 h-6 bg-white rounded border border-gray-400 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const outgoingSlide = prevSlideRef.current;
  const incomingSlide = slides[Math.min(displayIndex, slides.length - 1)];

  return (
    <div className="relative w-full h-full bg-black" style={{ cursor: hideCursor ? 'none' : 'default' }}>
      {/* Outgoing slide: stays visible beneath while new slide fades in */}
      {isTransitioning && outgoingSlide && (
        <div className="absolute inset-0">
          <UnifiedSlideDisplay
            slide={outgoingSlide}
            className="w-full h-full"
            showQR={true}
            showBranding={true}
          />
        </div>
      )}
      {/* Incoming slide: fades in over the outgoing layer */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
        <UnifiedSlideDisplay
          slide={incomingSlide}
          className="w-full h-full"
          showQR={true}
          showBranding={true}
        />
      </div>
    </div>
  );
}

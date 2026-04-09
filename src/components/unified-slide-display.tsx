"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import type { Slide } from "@/lib/schema";

const BASE_PATH =
  process.env.NODE_ENV === "production" ? "/dovito-ad-display-demo" : "";
const dovitoLogo = `${BASE_PATH}/assets/white_1750804660917.png`;

const qrCache = new Map<string, string>();

interface UnifiedSlideDisplayProps {
  slide: Slide;
  className?: string;
  showQR?: boolean;
  showBranding?: boolean;
}

export default function UnifiedSlideDisplay({
  slide,
  className = "w-full aspect-video",
  showQR = true,
  showBranding = true
}: UnifiedSlideDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [dovitoQrCode, setDovitoQrCode] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const prevQrUrl = useRef<string | null>(null);

  // Reset QR code and image error state when slide changes
  useEffect(() => {
    if (slide?.qr_url !== prevQrUrl.current) {
      prevQrUrl.current = slide?.qr_url ?? null;
      setQrCodeDataUrl("");
    }
    setImageError(false);
  }, [slide?.qr_url, slide?.advertisement_image_url]);

  // Generate QR codes
  useEffect(() => {
    if (!slide) return;
    let cancelled = false;

    const generateQRCodes = async () => {
      if (slide.qr_url && slide.qr_url.trim() && !qrCodeDataUrl) {
        try {
          const cached = qrCache.get(slide.qr_url);
          if (cached) {
            if (!cancelled) setQrCodeDataUrl(cached);
          } else {
            const qrDataUrl = await QRCode.toDataURL(slide.qr_url, {
              width: 360,
              margin: 2,
              color: { dark: '#000000', light: '#FFFFFF' }
            });
            qrCache.set(slide.qr_url, qrDataUrl);
            if (!cancelled) setQrCodeDataUrl(qrDataUrl);
          }
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }

      if (showBranding && !dovitoQrCode) {
        try {
          const dovitoUrl = "https://ad.dovito.com";
          const cached = qrCache.get(dovitoUrl);
          if (cached) {
            if (!cancelled) setDovitoQrCode(cached);
          } else {
            const dovitoQr = await QRCode.toDataURL(dovitoUrl, {
              width: 120,
              margin: 2,
              color: { dark: '#000000', light: '#FFFFFF' }
            });
            qrCache.set(dovitoUrl, dovitoQr);
            if (!cancelled) setDovitoQrCode(dovitoQr);
          }
        } catch (error) {
          console.error('Error generating Dovito QR code:', error);
        }
      }
    };

    generateQRCodes();
    return () => { cancelled = true; };
  }, [slide?.qr_url, showBranding, qrCodeDataUrl, dovitoQrCode]);

  if (!slide) {
    return (
      <div className={`relative bg-gray-800 overflow-hidden ${className} flex items-center justify-center`}>
        <div className="text-white text-center">
          <div className="text-lg font-semibold">No Slide Data</div>
          <div className="text-sm opacity-75">Loading slide information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black overflow-hidden ${className}`}>
      {/* Main Advertisement Image */}
      {!imageError ? (
        <img
          src={slide.advertisement_image_url}
          alt={`Advertisement for ${slide.business_name}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold mb-2">{slide.business_name}</div>
            <div className="text-sm md:text-lg opacity-75">Advertisement Preview</div>
          </div>
        </div>
      )}

      {/* QR Code Overlay (if enabled and URL exists) */}
      {showQR && slide.qr_url && qrCodeDataUrl && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white rounded-lg p-2 sm:p-3 shadow-lg">
          <img
            src={qrCodeDataUrl}
            alt="QR Code"
            className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32"
          />
        </div>
      )}
      {/* Dovito Branding (if enabled) */}
      {showBranding && (
        <div className={`absolute left-1/2 transform -translate-x-1/2 bg-black/85 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-2 md:px-5 md:py-3 rounded-full flex items-center space-x-1 sm:space-x-2 text-xs sm:text-xs md:text-sm shadow-lg transition-all duration-300 ${
          slide.anchor_position === 'top' ? 'top-1 sm:top-2' : 'bottom-1 sm:bottom-2'
        }`}>
          <span className="font-medium hidden sm:inline">Explore the community with</span>
          <span className="font-medium sm:hidden">Get seen with</span>
          <img
            src={dovitoLogo}
            alt="Dovito"
            className="h-2 sm:h-3 md:h-4 w-auto"
          />
          {dovitoQrCode && (
            <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 bg-white rounded">
              <img
                src={dovitoQrCode}
                alt="Dovito QR"
                className="w-full h-full rounded"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { getGooglePlacesConfig } from "@/lib/maps/placesConfig";
import { MapPin, MapPinOff, ExternalLink, Info, CheckCircle2, X } from "lucide-react";

interface GooglePlacesStatusBadgeProps {
  className?: string;
  variant?: "badge" | "settings";
}

export const GooglePlacesStatusBadge: React.FC<GooglePlacesStatusBadgeProps> = ({
  className = "",
  variant = "badge",
}) => {
  const [config, setConfig] = useState(getGooglePlacesConfig());
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (variant === "settings") {
    return (
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                config.isLive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {config.isLive ? <MapPin className="w-4 h-4" /> : <MapPinOff className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Google Places API (New)</span>
              <span className="text-[11px] text-slate-500">Merchant Alternatives Engine</span>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${
              config.isLive
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-slate-100 text-slate-700 border-slate-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                config.isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {config.shortLabel}
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
          {config.description}
        </p>

        <div className="pt-1 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1">
          <div className="flex items-start gap-1.5 font-medium">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>Developer Setup Hint:</span>
          </div>
          <p className="text-[10px] text-amber-800 leading-relaxed pl-5">
            Set <code className="px-1 py-0.5 bg-amber-100/80 rounded font-mono font-bold">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in your <code className="px-1 py-0.5 bg-amber-100/80 rounded font-mono">.env</code> and enable <strong>Places API (New)</strong> in Google Cloud Console.
          </p>
          <div className="pl-5 pt-1">
            <a
              href={config.consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 hover:text-amber-950 underline"
            >
              <span>Enable Places API (New) in Google Cloud Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Small status indicator / badge button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border transition-colors cursor-pointer select-none ${
          config.isLive
            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
            : "bg-slate-100 hover:bg-slate-200/80 text-slate-600 border-slate-200"
        }`}
        title="Click to view Google Places API status & setup hint"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            config.isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
          }`}
        />
        <span>{config.shortLabel}</span>
        <Info className="w-2.5 h-2.5 opacity-60 ml-0.5" />
      </button>

      {/* Popover / Tooltip */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-50 w-72 sm:w-80 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xl animate-fade-in text-left">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  config.isLive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {config.isLive ? <MapPin className="w-3.5 h-3.5" /> : <MapPinOff className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  Google Places API (New)
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  {config.isLive ? "Key detected (Live)" : "No key detected"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-2.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <span
                className={`w-2 h-2 rounded-full ${
                  config.isLive ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span>{config.statusLabel}</span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
              {config.description}
            </p>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-900 space-y-1">
              <strong className="block font-semibold">💡 Setup Hint:</strong>
              <p className="leading-relaxed">
                Add <code className="px-1 py-0.5 bg-amber-100 rounded font-mono font-semibold">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=&quot;your_key&quot;</code> in your project <code className="px-1 py-0.5 bg-amber-100 rounded font-mono">.env</code> and enable <strong>Places API (New)</strong> in Google Cloud Console.
              </p>
              <div className="pt-1">
                <a
                  href={config.consoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-amber-900 hover:text-amber-950 underline"
                >
                  <span>Google Cloud Console</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

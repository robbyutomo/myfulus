"use client";

import { useState, useRef, useEffect } from "react";
import { formatIDR } from "@/lib/utils";

interface ClickableAmountProps {
  value: number;
  abbreviated: string;
  className?: string;
}

export function ClickableAmount({ value, abbreviated, className = "" }: ClickableAmountProps) {
  const [showPopup, setShowPopup] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPopup) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPopup]);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setShowPopup(!showPopup)}
        className="bg-transparent border-none p-0 cursor-pointer font-inherit text-inherit"
      >
        {abbreviated}
      </button>
      {showPopup && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 z-50 px-2.5 py-1.5 rounded-md bg-gray-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg">
          {formatIDR(value)}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Point, PointInfo } from './types';

interface SilhouettePanelProps {
  activePoint: Point;
  setActivePoint: React.Dispatch<React.SetStateAction<Point>>;
  schematicTitle: string;
  currentPointInfo: PointInfo;
}

export const SilhouettePanel: React.FC<SilhouettePanelProps> = ({
  activePoint,
  setActivePoint,
  schematicTitle,
  currentPointInfo,
}) => {
  return (
    <div className="lg:col-span-7 bg-canvas-base border border-border-hairline p-space-md md:p-space-lg flex flex-col justify-between relative">
      <div className="flex items-center justify-between pb-space-sm border-b border-border-hairline">
        <div>
          <span className="font-label-caps text-label-caps uppercase text-outline">
            FIG. 01 // SCHEMATIC OVERVIEW
          </span>
          <h2 className="font-headline-sm text-headline-sm text-primary uppercase">
            {schematicTitle}
          </h2>
        </div>
        <div className="flex items-center gap-space-xs bg-badge-new px-space-xs py-1">
          <span className="w-1.5 h-1.5 bg-badge-promo inline-block"></span>
          <span className="font-label-caps text-[10px] uppercase text-primary font-bold">
            Interaktif: Klik Titik Ukur
          </span>
        </div>
      </div>

      {/* Technical Silhouette Vector Graphic with Coordinate Measurement Hotspots */}
      <div className="relative w-full my-space-lg flex items-center justify-center min-h-[380px] bg-surface-subtle p-space-md overflow-hidden">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#111827 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>

        <svg
          className="w-full max-w-[420px] h-auto text-primary transition-all duration-300"
          viewBox="0 0 500 460"
        >
          <path
            d="M175,95 Q250,118 325,95 L405,155 L365,215 L320,185 L320,380 L180,380 L180,185 L135,215 L95,155 Z"
            fill="#FFFFFF"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2.5"
          ></path>
          <path
            d="M175,95 Q250,132 325,95"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          ></path>
          <path
            d="M185,95 Q250,120 315,95"
            fill="none"
            stroke="currentColor"
            strokeDasharray="3,3"
            strokeWidth="1"
          ></path>
          <line
            stroke="currentColor"
            strokeDasharray="4,4"
            strokeWidth="1.5"
            x1="180"
            x2="175"
            y1="185"
            y2="95"
          ></line>
          <line
            stroke="currentColor"
            strokeDasharray="4,4"
            strokeWidth="1.5"
            x1="320"
            x2="325"
            y1="185"
            y2="95"
          ></line>
          <line
            stroke="currentColor"
            strokeDasharray="3,3"
            strokeWidth="1"
            x1="180"
            x2="320"
            y1="365"
            y2="365"
          ></line>
          <line
            stroke="currentColor"
            strokeWidth="1.5"
            x1="95"
            x2="135"
            y1="155"
            y2="215"
          ></line>
          <line
            stroke="currentColor"
            strokeWidth="1.5"
            x1="405"
            x2="365"
            y1="155"
            y2="215"
          ></line>
          {/* Dimension Guide Line: A (Shoulder) */}
          <g className={activePoint === 'A' ? 'opacity-100' : 'opacity-60'}>
            <line
              stroke="#111827"
              strokeDasharray="2,2"
              strokeWidth={activePoint === 'A' ? '2.5' : '1.5'}
              x1="175"
              x2="325"
              y1="85"
              y2="85"
            ></line>
            <line stroke="#111827" strokeWidth="1.5" x1="175" x2="175" y1="78" y2="92"></line>
            <line stroke="#111827" strokeWidth="1.5" x1="325" x2="325" y1="78" y2="92"></line>
          </g>
          {/* Dimension Guide Line: B (Chest) */}
          <g className={activePoint === 'B' ? 'opacity-100' : 'opacity-60'}>
            <line
              stroke="#111827"
              strokeDasharray="2,2"
              strokeWidth={activePoint === 'B' ? '2.5' : '1.5'}
              x1="180"
              x2="320"
              y1="205"
              y2="205"
            ></line>
            <line
              stroke="#111827"
              strokeWidth="1.5"
              x1="180"
              x2="180"
              y1="198"
              y2="212"
            ></line>
            <line
              stroke="#111827"
              strokeWidth="1.5"
              x1="320"
              x2="320"
              y1="198"
              y2="212"
            ></line>
          </g>
          {/* Dimension Guide Line: C (Body Length) */}
          <g className={activePoint === 'C' ? 'opacity-100' : 'opacity-60'}>
            <line
              stroke="#111827"
              strokeDasharray="2,2"
              strokeWidth={activePoint === 'C' ? '2.5' : '1.5'}
              x1="340"
              x2="340"
              y1="95"
              y2="380"
            ></line>
            <line stroke="#111827" strokeWidth="1.5" x1="333" x2="347" y1="95" y2="95"></line>
            <line
              stroke="#111827"
              strokeWidth="1.5"
              x1="333"
              x2="347"
              y1="380"
              y2="380"
            ></line>
          </g>
          {/* Dimension Guide Line: D (Sleeve Length) */}
          <g className={activePoint === 'D' ? 'opacity-100' : 'opacity-60'}>
            <line
              stroke="#111827"
              strokeDasharray="2,2"
              strokeWidth={activePoint === 'D' ? '2.5' : '1.5'}
              x1="325"
              x2="395"
              y1="82"
              y2="135"
            ></line>
          </g>
        </svg>

        {/* Hotspot Buttons */}
        {(
          [
            { id: 'A', label: 'A. BAHU', pos: 'top-[18%] left-[49%] -translate-x-1/2' },
            { id: 'B', label: 'B. DADA', pos: 'top-[48%] left-[49%] -translate-x-1/2' },
            { id: 'C', label: 'C. PANJANG', pos: 'top-[52%] right-[18%]' },
            { id: 'D', label: 'D. LENGAN', pos: 'top-[28%] right-[16%]' },
          ] as const
        ).map((pt) => {
          const isSelected = activePoint === pt.id;
          return (
            <button
              key={pt.id}
              type="button"
              onClick={() => setActivePoint(pt.id)}
              className={`absolute ${pt.pos} flex items-center gap-1 group border border-border-strong px-2 py-1 shadow-sm transition-colors cursor-pointer ${
                isSelected ? 'bg-badge-promo' : 'bg-canvas-base hover:bg-badge-promo'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-none inline-block ${
                  isSelected ? 'bg-primary' : 'bg-badge-promo group-hover:bg-primary'
                }`}
              ></span>
              <span className="font-label-caps text-label-caps text-primary font-bold">
                {pt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Measurement Callout Card */}
      <div className="bg-surface-subtle border-t-2 border-border-strong p-space-md transition-all">
        <div className="flex items-start gap-space-sm">
          <span className="bg-primary text-badge-promo font-label-caps text-label-caps px-space-xs py-0.5 shrink-0">
            {currentPointInfo.tag}
          </span>
          <div>
            <h3 className="font-headline-sm text-headline-sm uppercase text-primary">
              {currentPointInfo.title}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {currentPointInfo.body}
            </p>
            <div className="mt-space-xs flex items-center gap-space-xs text-outline font-label-caps text-[11px] uppercase">
              <span className="material-symbols-outlined text-[16px]">lightbulb</span>
              Tips Pro: Jangan mengukur baju saat masih digantung untuk akurasi optimal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

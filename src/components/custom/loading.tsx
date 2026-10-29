import { useId } from 'react';

const SHIELD_PATH =
  'M12,1L3,5V11C3,16.55 6.84,20.74 12,22C17.16,20.74 21,16.55 21,11V5L12,1Z';

// 1. Pulse — a shield-shaped ripple behind a gently breathing shield.
export function ShieldPulseLoader({
  size = 64,
  className = '',
  color = 'text-orange-500',
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full animate-ping ${color} opacity-40 motion-reduce:animate-none`}
      >
        <path d={SHIELD_PATH} fill="currentColor" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`relative h-3/5 w-3/5 animate-pulse ${color}motion-reduce:animate-none`}
      >
        <path
          d={SHIELD_PATH}
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// 2. Spin — an arc orbits a still shield, like a scanner locking on.
export function ShieldSpinLoader({
  size = 64,
  className = '',
  color = 'text-orange-500',
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 50 50"
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full animate-spin ${color} motion-reduce:animate-none`}
        style={{ animationDuration: '1.1s' }}
      >
        <circle
          cx="25"
          cy="25"
          r="21"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="70 130"
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`relative h-1/2 w-1/2 ${color}`}
      >
        <path
          d={SHIELD_PATH}
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// 3. Draw — the outline traces itself, like a perimeter being established.
export function ShieldDrawLoader({ size = 64, className = '' }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <style>{`
        @keyframes sld-draw {
          0% { stroke-dashoffset: 1; opacity: 0.3; }
          50% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: -1; opacity: 0.3; }
        }
        .sld-draw-path { animation: sld-draw 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sld-draw-path { animation: none; stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-full w-full text-orange-500"
      >
        <path
          d={SHIELD_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          strokeDasharray="1"
          className="sld-draw-path"
        />
      </svg>
    </div>
  );
}

// 4. Fill — color rises inside the shield like a level being reached.
export function ShieldFillLoader({ size = 64, className = '' }) {
  const id = useId();
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <style>{`
        @keyframes sld-fill {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-24px); }
        }
        .sld-fill-rect { animation: sld-fill 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sld-fill-rect { animation: none; transform: translateY(-12px); }
        }
      `}</style>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
        <defs>
          <clipPath id={`sld-clip-${id}`}>
            <path d={SHIELD_PATH} />
          </clipPath>
        </defs>
        <path
          d={SHIELD_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="text-orange-300"
        />
        <g clipPath={`url(#sld-clip-${id})`}>
          <rect
            x="0"
            y="24"
            width="24"
            height="24"
            fill="currentColor"
            className="sld-fill-rect text-orange-500"
          />
        </g>
      </svg>
    </div>
  );
}

// 5. Scan — a light sweeps top to bottom, like an inspection pass.
export function ShieldScanLoader({ size = 64, className = '' }) {
  const id = useId();
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <style>{`
        @keyframes sld-scan {
          0% { transform: translateY(-8px); }
          100% { transform: translateY(26px); }
        }
        .sld-scan-bar { animation: sld-scan 1.6s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sld-scan-bar { animation: none; opacity: 0; }
        }
      `}</style>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
        <defs>
          <clipPath id={`sld-scan-clip-${id}`}>
            <path d={SHIELD_PATH} />
          </clipPath>
          <linearGradient
            id={`sld-scan-grad-${id}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={SHIELD_PATH}
          fill="currentColor"
          fillOpacity="0.08"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="text-orange-500"
        />
        <g clipPath={`url(#sld-scan-clip-${id})`}>
          <rect
            x="0"
            y="-8"
            width="24"
            height="7"
            fill={`url(#sld-scan-grad-${id})`}
            className="sld-scan-bar"
          />
        </g>
      </svg>
    </div>
  );
}

// Showcase — demonstrates all five together.
const VARIANTS = [
  { Loader: ShieldPulseLoader, name: 'PULSE', caption: 'Verifying' },
  { Loader: ShieldSpinLoader, name: 'SPIN', caption: 'Authenticating' },
  { Loader: ShieldDrawLoader, name: 'DRAW', caption: 'Establishing' },
  { Loader: ShieldFillLoader, name: 'FILL', caption: 'Securing' },
  { Loader: ShieldScanLoader, name: 'SCAN', caption: 'Inspecting' },
];

export default function ShieldLoaderShowcase() {
  return (
    <div className="min-h-full w-full bg-stone-950 px-6 py-12 sm:px-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex flex-col gap-2 border-b border-stone-800 pb-6">
          <span className="font-mono text-xs tracking-widest text-orange-500">
            SHIELD LOADER // COMPONENT SET
          </span>
          <h1 className="text-2xl font-semibold text-stone-100 sm:text-3xl">
            Animated shield loading indicators
          </h1>
          <p className="max-w-xl text-sm text-stone-400">
            Five self-contained React and Tailwind components. Drop one in
            wherever a moment needs to read as protected, verified, or in
            progress.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {VARIANTS.map(({ Loader, name, caption }) => (
            <div
              key={name}
              className="relative flex flex-col items-center gap-5 border border-stone-800 bg-stone-900 px-4 py-8"
            >
              <span className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-orange-500" />
              <span className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-orange-500" />
              <span className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-orange-500" />
              <span className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-orange-500" />
              <Loader size={56} />
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="font-mono text-xs tracking-widest text-orange-500">
                  {name}
                </span>
                <span className="font-mono text-xs tracking-wide text-stone-500">
                  {caption}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border border-stone-800 bg-stone-900 px-5 py-4">
          <p className="font-mono text-xs tracking-wide text-stone-500">
            {"import { ShieldSpinLoader } from './ShieldLoaders';"}
          </p>
          <p className="mt-1 font-mono text-xs tracking-wide text-stone-500">
            {'<ShieldSpinLoader size={48} />'}
          </p>
        </div>
      </div>
    </div>
  );
}

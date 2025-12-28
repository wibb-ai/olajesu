export function AfricanPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <pattern id="africanPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="5" r="2" fill="currentColor" opacity="0.3" />
        <circle cx="35" cy="5" r="2" fill="currentColor" opacity="0.3" />
        <circle cx="5" cy="35" r="2" fill="currentColor" opacity="0.3" />
        <circle cx="35" cy="35" r="2" fill="currentColor" opacity="0.3" />
        <path d="M20,10 Q25,15 20,20 Q15,15 20,10" fill="currentColor" opacity="0.2" />
        <path d="M20,30 Q25,35 20,40 Q15,35 20,30" fill="currentColor" opacity="0.2" />
      </pattern>
      <rect width="200" height="200" fill="url(#africanPattern)" />
    </svg>
  );
}

export function WaveDecoration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path
        d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CircleDecoration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
      <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
      <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7" />
    </svg>
  );
}

export function ScribbleUnderline({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 20" preserveAspectRatio="none">
      <path
        d="M 5,10 Q 50,5 100,12 Q 150,8 195,10 Q 150,12 100,8 Q 50,15 5,10"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DotPattern({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" fill="currentColor" opacity="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotPattern)" />
      </svg>
    </div>
  );
}

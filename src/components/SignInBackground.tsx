export function SignInBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#eaf2ec] to-[#dcebe0] px-4">
      <svg className="hidden">
        <symbol id="pine-tree" viewBox="0 0 60 90">
          <path d="M30 0 L44 20 L37 20 L48 38 L39 38 L52 58 L34 58 L34 70 L26 70 L26 58 L8 58 L21 38 L12 38 L23 20 L16 20 Z" />
          <rect x="26" y="70" width="8" height="12" />
          <rect x="16" y="84" width="28" height="5" />
        </symbol>
      </svg>

      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute bottom-0 left-0 h-full w-full"
        aria-hidden="true"
      >
        <g fill="#2fa864" opacity="0.18">
          <use href="#pine-tree" x="90" y="810" width="90" height="135" />
          <use href="#pine-tree" x="180" y="855" width="70" height="105" />
          <use href="#pine-tree" x="40" y="870" width="55" height="82" />
          <use href="#pine-tree" x="1750" y="790" width="100" height="150" />
          <use href="#pine-tree" x="1850" y="850" width="65" height="97" />
        </g>
        <g style={{ fill: 'var(--color-primary)' }} opacity="0.1">
          <use href="#pine-tree" x="1580" y="880" width="60" height="90" />
          <use href="#pine-tree" x="280" y="890" width="55" height="82" />
        </g>
      </svg>

      <div className="relative w-[440px] max-w-[90vw] rounded-2xl bg-white px-10 py-11 text-center shadow-[0_20px_50px_rgba(28,43,87,0.15)]">
        {children}
      </div>
    </div>
  );
}

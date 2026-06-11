/**
 * Elangovan Associates logo mark — a serif "E" crossed by a sweeping metallic
 * gold swoosh, recreated from the firm's reference logo. The letter uses
 * ``currentColor`` so it can sit on light (navy letter) or dark (ivory letter)
 * surfaces; the swoosh is always champagne gold.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 52 52"
      className={className}
      fill="none"
      role="img"
      aria-label="Elangovan Associates"
    >
      <defs>
        <linearGradient id="ea-gold-swoosh" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#9C7B3D" />
          <stop offset="45%" stopColor="#C6A769" />
          <stop offset="100%" stopColor="#EBD9A6" />
        </linearGradient>
      </defs>

      {/* Sweeping gold swoosh (behind the letter) */}
      <path
        d="M4 47 C 16 36, 31 43, 39 30 C 44 22, 45 15, 50 9"
        stroke="url(#ea-gold-swoosh)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      {/* small gold tail flourish */}
      <path
        d="M4 47 C 9 46, 13 44, 16 40"
        stroke="url(#ea-gold-swoosh)"
        strokeWidth="3.4"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Serif E */}
      <text
        x="9"
        y="41"
        fontFamily="'Cormorant Garamond', Georgia, 'Times New Roman', serif"
        fontSize="46"
        fontWeight="600"
        fill="currentColor"
      >
        E
      </text>
    </svg>
  );
}

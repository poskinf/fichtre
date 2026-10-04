/** Fichtre's mascot: a little teal creature holding a worksheet. */
export function Mascot({ size = 180 }: { size?: number }) {
  return (
    <svg viewBox="0 0 260 240" width={size} height={(size * 240) / 260} role="img" aria-label="Fichtre, la mascotte, tient une fiche de calcul" style={{ display: "block" }}>
      {/* antennae */}
      <path d="M108 50 Q98 30 92 20M148 50 Q158 32 164 22" stroke="#1d7f93" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="92" cy="19" r="7" fill="#f59f40" />
      <circle cx="164" cy="21" r="7" fill="#f59f40" />
      {/* feet */}
      <ellipse cx="104" cy="222" rx="20" ry="9" fill="#1d7f93" />
      <ellipse cx="158" cy="222" rx="20" ry="9" fill="#1d7f93" />
      {/* body */}
      <path d="M58 150 C48 90 78 44 128 46 C178 48 200 98 192 152 C187 196 162 220 128 220 C90 220 62 196 58 150Z" fill="#2c9fb3" />
      <path d="M76 100 C80 72 98 56 120 54 C100 66 90 84 88 108Z" fill="#6cc9d6" opacity="0.7" />
      {/* eyes */}
      <ellipse cx="104" cy="98" rx="20" ry="23" fill="#fff" />
      <ellipse cx="154" cy="98" rx="20" ry="23" fill="#fff" />
      <circle cx="108" cy="100" r="13" fill="#1b3a57" />
      <circle cx="158" cy="100" r="13" fill="#1b3a57" />
      <circle cx="113" cy="93" r="5" fill="#fff" />
      <circle cx="163" cy="93" r="5" fill="#fff" />
      <circle cx="103" cy="106" r="2.5" fill="#fff" />
      <circle cx="153" cy="106" r="2.5" fill="#fff" />
      {/* cheeks and mouth */}
      <ellipse cx="80" cy="128" rx="11" ry="7" fill="#f28ba0" opacity="0.65" />
      <ellipse cx="180" cy="128" rx="11" ry="7" fill="#f28ba0" opacity="0.65" />
      <path d="M113 130 Q130 156 148 130Z" fill="#8a2f45" />
      <ellipse cx="130" cy="141" rx="8" ry="4.5" fill="#f28ba0" />
      {/* the worksheet */}
      <g transform="rotate(-5 130 190)">
        <rect x="66" y="156" width="134" height="68" rx="7" fill="#fff" stroke="#c5d3e0" strokeWidth="2" />
        <text x="90" y="176" fontSize="12" fontWeight="700" fill="#2f6fa8" fontFamily="inherit">
          Mes fiches !
        </text>
        <text x="88" y="205" fontSize="20" fontWeight="700" fill="#23303f" fontFamily="inherit">
          3 + 2 = ?
        </text>
      </g>
      {/* hands */}
      <circle cx="70" cy="182" r="10" fill="#2c9fb3" />
      <circle cx="198" cy="172" r="10" fill="#2c9fb3" />
      {/* glowing check mark */}
      <circle cx="206" cy="206" r="19" fill="#b2f2bb" opacity="0.7" />
      <path d="M196 206 l8 8 l14 -17" stroke="#2f9e44" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

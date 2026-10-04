/** Fichtre's face alone: used in the top bar and as the tab icon. */
export function MascotFace({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 175" width={size} height={(size * 175) / 200} aria-hidden="true" style={{ display: "block" }}>
      <defs>
        <linearGradient id="face-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3cb4c8" />
          <stop offset="1" stopColor="#2392a8" />
        </linearGradient>
      </defs>
      <path d="M78 36 Q68 18 62 8M122 36 Q132 20 138 10" stroke="#1d7f93" strokeWidth="7" strokeLinecap="round" fill="none" />
      <circle cx="62" cy="9" r="10" fill="#ffa94d" />
      <circle cx="138" cy="11" r="10" fill="#ffa94d" />
      <ellipse cx="100" cy="100" rx="82" ry="68" fill="url(#face-g)" />
      <ellipse cx="68" cy="60" rx="26" ry="12" fill="#fff" opacity="0.22" transform="rotate(-20 68 60)" />
      <ellipse cx="68" cy="92" rx="23" ry="27" fill="#fff" />
      <ellipse cx="132" cy="92" rx="23" ry="27" fill="#fff" />
      <circle cx="73" cy="95" r="15" fill="#1b3a57" />
      <circle cx="137" cy="95" r="15" fill="#1b3a57" />
      <circle cx="79" cy="87" r="6" fill="#fff" />
      <circle cx="143" cy="87" r="6" fill="#fff" />
      <ellipse cx="38" cy="125" rx="13" ry="8" fill="#ff8fa3" opacity="0.7" />
      <ellipse cx="162" cy="125" rx="13" ry="8" fill="#ff8fa3" opacity="0.7" />
      <path d="M78 124 Q100 158 122 124Z" fill="#8a2f45" />
      <ellipse cx="100" cy="140" rx="11" ry="6" fill="#ff8fa3" />
    </svg>
  );
}

const PATHS = {
  play: <polygon points="7 4 20 12 7 20" fill="currentColor" />,
  speaker: (
    <>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <path d="M16.5 9a4 4 0 010 6M19 6.5a8 8 0 010 11" />
    </>
  ),
  check: <path d="M4 12.5l5 5L20 6" />,
  redo: <path d="M20 12a8 8 0 11-2.6-5.9M20 4v5h-5" />,
  right: <path d="M4 12h15M13 6l6 6-6 6" />,
  left: <path d="M20 12H5M11 6l-6 6 6 6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <path d="M4 20l1-5L16 4l4 4L9 19l-5 1zM14 6l4 4" />,
  trash: <path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" />,
  sheet: <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7" />,
  ring: <ellipse cx="12" cy="12" rx="9" ry="6" transform="rotate(-12 12 12)" />,
  book: <path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5zM12 6v13.5" />,
  calc: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
    </>
  ),
  grid: <path d="M4 4h16v16H4zM4 12h16M12 4v16" />,
  parent: (
    <>
      <circle cx="9" cy="7.5" r="3.5" />
      <path d="M2.5 20v-1.5A4.5 4.5 0 017 14h4a4.5 4.5 0 014.500 4.500V20" />
      <circle cx="17.500" cy="10.500" r="2.500" />
      <path d="M17.500 15a3.500 3.500 0 013.500 3.500V20" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h7.500M16.500 7H20M4 12h3.500M12.500 12H20M4 17h9.500M18.500 17H20" />
      <circle cx="14" cy="7" r="2.500" />
      <circle cx="10" cy="12" r="2.500" />
      <circle cx="16" cy="17" r="2.500" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
    </>
  ),
  star: <polygon points="12 3 14.8 9 21 9.7 16.3 14 17.7 20.5 12 17.2 6.3 20.5 7.7 14 3 9.7 9.2 9" fill="currentColor" />,
  cards: (
    <>
      <rect x="3.5" y="8" width="12.5" height="12" rx="2.5" />
      <path d="M8 4.5h10.5A2.5 2.5 0 0121 7v9" />
    </>
  ),
  home: <path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" />,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="1.3em" height="1.3em" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

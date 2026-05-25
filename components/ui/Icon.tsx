import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(props: IconProps) {
  const { size = 22, ...rest } = props;
  return { width: size, height: size, viewBox: "0 0 24 24", fill: "none" as const, ...rest };
}

export const Icons = {
  Home: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M3 11L12 3l9 8M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Cards: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="3" y="6" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 3h12a2 2 0 012 2v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Quiz: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2.5-2.5 4M12 17.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Test: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M9 4h6l4 4v12a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1h3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h4M9 9h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  User: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Trophy: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M7 4h10v5a5 5 0 01-10 0V4zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M9 14h6l-1 4h-4l-1-4zM7 21h10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  Flame: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 22c-4 0-7-3-7-7 0-3 2-5 3-6 .5 1 1 1.5 2 1.5 0-2 .5-5 4-8 0 2 1 4 3 6s2 4 2 6c0 4-3 7.5-7 7.5z" fill="currentColor" />
    </svg>
  ),
  Clock: (p: IconProps) => (
    <svg {...base({ size: 18, ...p })}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Arrow: (p: IconProps) => (
    <svg {...base({ size: 18, ...p })}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Close: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Back: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Check: (p: IconProps) => (
    <svg {...base({ size: 20, ...p })}>
      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Bolt: (p: IconProps) => (
    <svg {...base({ size: 18, ...p })}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" />
    </svg>
  ),
  Plus: (p: IconProps) => (
    <svg {...base({ size: 18, ...p })}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Search: (p: IconProps) => (
    <svg {...base({ size: 16, ...p })}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Sun: (p: IconProps) => (
    <svg {...base({ size: 18, ...p })}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Moon: (p: IconProps) => (
    <svg {...base({ size: 18, ...p })}>
      <path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  Logout: (p: IconProps) => (
    <svg {...base({ size: 18, ...p })}>
      <path d="M15 3h4a1 1 0 011 1v16a1 1 0 01-1 1h-4M10 17l-5-5 5-5M5 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

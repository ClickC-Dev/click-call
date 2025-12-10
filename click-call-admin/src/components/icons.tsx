import { SVGProps } from 'react'

const base = { width: 24, height: 24, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const Phone = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.13 1.09.35 2.15.66 3.18a2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 6 6l1-1.12a2 2 0 0 1 2.11-.45c1.03.31 2.09.53 3.18.66A2 2 0 0 1 22 16.92z"/>
  </svg>
)

export const Volume2 = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} viewBox="0 0 24 24">
    <path d="M11 5l-6 4H3v6h2l6 4V5z"/><path d="M19 5a7 7 0 0 1 0 14"/><path d="M15 8a4 4 0 0 1 0 8"/>
  </svg>
)

export const VolumeX = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} viewBox="0 0 24 24">
    <path d="M11 5l-6 4H3v6h2l6 4V5z"/><path d="M22 9l-6 6"/><path d="M16 9l6 6"/>
  </svg>
)

export const Mic = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} viewBox="0 0 24 24">
    <rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 19v3"/>
  </svg>
)

export const MicOff = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} viewBox="0 0 24 24">
    <path d="M9 2h6v11a3 3 0 0 1-6 0V2z"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M1 1l22 22"/>
  </svg>
)

export const Video = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} viewBox="0 0 24 24">
    <rect x="2" y="5" width="14" height="14" rx="2"/><path d="M22 7l-6 4v2l6 4V7z"/>
  </svg>
)

export const VideoOff = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} viewBox="0 0 24 24">
    <rect x="2" y="5" width="14" height="14" rx="2"/><path d="M22 7l-6 4v2l6 4V7z"/><path d="M1 1l22 22"/>
  </svg>
)

export const Check = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} viewBox="0 0 24 24">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
)

export const XIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} viewBox="0 0 24 24">
    <path d="M18 6 6 18"/><path d="M6 6l12 12"/>
  </svg>
)

export const Clock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v5l3 3"/>
  </svg>
)

export const ThumbUp = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} viewBox="0 0 24 24">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v10h8a4 4 0 0 0 4-4v-5a3 3 0 0 0-3-3h-2z"/>
  </svg>
)

export const ThumbDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p} viewBox="0 0 24 24">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V3H9a4 4 0 0 0-4 4v5a3 3 0 0 0 3 3h2z"/>
  </svg>
)

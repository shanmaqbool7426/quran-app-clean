import React from "react";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  Rect,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

export function QiblaIcon({ size = 32, color = "#C8972A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="20" stroke={color} strokeWidth="2.5" strokeDasharray="4 2" />
      <Circle cx="24" cy="24" r="12" stroke={color} strokeWidth="2" opacity="0.5" />
      <Circle cx="24" cy="24" r="3" fill={color} />
      <Path d="M24 4 L27 20 L24 17 L21 20 Z" fill={color} />
      <Path d="M24 44 L21 28 L24 31 L27 28 Z" fill={color} opacity="0.3" />
      <Line x1="4" y1="24" x2="44" y2="24" stroke={color} strokeWidth="1" opacity="0.2" />
      <Path d="M20 9 L22 15 L26 12 Z" fill={color} opacity="0.7" />
    </Svg>
  );
}

export function TasbeehIcon({ size = 32, color = "#8B5CF6" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="8" r="5" fill={color} />
      <Circle cx="38" cy="16" r="4" fill={color} opacity="0.85" />
      <Circle cx="40" cy="32" r="4" fill={color} opacity="0.7" />
      <Circle cx="28" cy="43" r="4" fill={color} opacity="0.6" />
      <Circle cx="14" cy="43" r="4" fill={color} opacity="0.5" />
      <Circle cx="8" cy="31" r="4" fill={color} opacity="0.4" />
      <Circle cx="10" cy="16" r="4" fill={color} opacity="0.35" />
      <Path d="M24 13 Q32 12 36.5 19" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M39 20 Q41 28 38 35" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M36 38 Q31 44 20 44" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M12 44 Q7 38 7 30" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M8 24 Q9 15 15 12" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M20 12 L24 13" stroke={color} strokeWidth="2" fill="none" />
      <Rect x="21" y="3" width="6" height="5" rx="2" fill={color} />
    </Svg>
  );
}

export function DuasIcon({ size = 32, color = "#0D5C3A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M14 28 C14 28 10 24 10 18 C10 12 14 8 20 8 C22 8 23.5 8.5 24 9"
        stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"
      />
      <Path
        d="M34 28 C34 28 38 24 38 18 C38 12 34 8 28 8 C26 8 24.5 8.5 24 9"
        stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"
      />
      <Path
        d="M14 28 L12 36 C11 39 13 42 16 42 L24 40 L32 42 C35 42 37 39 36 36 L34 28"
        fill={color} opacity="0.15" stroke={color} strokeWidth="2" strokeLinejoin="round"
      />
      <Path
        d="M18 28 L17 34 C16.5 36 18 38 20 38 L24 37 L28 38 C30 38 31.5 36 31 34 L30 28"
        fill={color} opacity="0.3"
      />
      <Path d="M20 8 C20 6 21.5 4 24 4 C26.5 4 28 6 28 8" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <Path d="M22 4 L26 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function HadithIcon({ size = 32, color = "#2563EB" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M10 6 C10 4.9 10.9 4 12 4 L36 4 C37.1 4 38 4.9 38 6 L38 42 C38 43.1 37.1 44 36 44 L12 44 C10.9 44 10 43.1 10 42 Z"
        fill={color} opacity="0.1" stroke={color} strokeWidth="2"
      />
      <Path d="M10 12 L38 12" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <Path d="M10 8 L10 42" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <Path d="M16 20 L32 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M16 26 L32 26" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M16 32 L26 32" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="34" cy="36" r="8" fill={color} />
      <Path d="M31 36 L33 38 L37 34" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ZakatIcon({ size = 32, color = "#D97706" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path d="M8 20 L24 8 L40 20 L40 44 L8 44 Z" fill={color} opacity="0.1" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <Circle cx="24" cy="30" r="9" fill={color} opacity="0.2" stroke={color} strokeWidth="2" />
      <Circle cx="24" cy="30" r="5" fill={color} opacity="0.5" />
      <Path d="M22 28 L22 32 M26 28 L26 32" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M21 28 L27 28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M21 32 L27 32" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M24 8 L24 4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="24" cy="4" r="2" fill={color} />
    </Svg>
  );
}

export function MosqueIcon({ size = 32, color = "#DC2626" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path d="M4 44 L44 44" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path
        d="M12 44 L12 26 C12 22 16 18 24 18 C32 18 36 22 36 26 L36 44"
        fill={color} opacity="0.12" stroke={color} strokeWidth="2"
      />
      <Path d="M18 44 L18 32 C18 29.8 20.7 28 24 28 C27.3 28 30 29.8 30 32 L30 44" fill={color} opacity="0.2" />
      <Path d="M20 28 C20 26.3 21.8 25 24 25 C26.2 25 28 26.3 28 28" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M24 18 L24 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="24" cy="8" r="4" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
      <Path d="M21 8 L24 5 L27 8" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M8 26 L8 44" stroke={color} strokeWidth="2" />
      <Path d="M40 26 L40 44" stroke={color} strokeWidth="2" />
      <Path d="M6 20 C6 14 8 10 8 10 C8 10 10 14 10 20 Z" fill={color} opacity="0.6" />
      <Path d="M38 20 C38 14 40 10 40 10 C40 10 42 14 42 20 Z" fill={color} opacity="0.6" />
    </Svg>
  );
}

export function AIScholarIcon({ size = 32, color = "#8B5CF6" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="20" r="13" fill={color} opacity="0.15" stroke={color} strokeWidth="2" />
      <Circle cx="24" cy="20" r="7" fill={color} opacity="0.3" />
      <Path d="M18 20 L22 24 L30 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M24 7 L24 4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M35 11 L37 9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M37 20 L40 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M11 11 L9 9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M11 20 L8 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path
        d="M17 32 L14 44 M31 32 L34 44"
        stroke={color} strokeWidth="2" strokeLinecap="round"
      />
      <Path d="M13 40 L35 40" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M15 36 L33 36" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

export function HifzIcon({ size = 32, color = "#22C55E" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M24 6 C16 6 10 12 10 20 C10 27 14 32 20 34 L20 40 L28 40 L28 34 C34 32 38 27 38 20 C38 12 32 6 24 6 Z"
        fill={color} opacity="0.15" stroke={color} strokeWidth="2"
      />
      <Path d="M20 40 L28 40 L28 44 L20 44 Z" fill={color} opacity="0.5" stroke={color} strokeWidth="1.5" />
      <Path d="M18 20 L22 24 L30 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 22 C14 20 14 17 16 15 C18 13 21 13 23 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
      <Path d="M32 22 C34 20 34 17 32 15 C30 13 27 13 25 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
      <Path d="M17 30 L31 30" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function QuranReadIcon({ size = 32, color = "#0D5C3A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M6 8 C6 6.3 7.3 5 9 5 L24 5 L39 5 C40.7 5 42 6.3 42 8 L42 40 C42 41.7 40.7 43 39 43 L9 43 C7.3 43 6 41.7 6 40 Z"
        fill={color} opacity="0.1" stroke={color} strokeWidth="2"
      />
      <Path d="M24 5 L24 43" stroke={color} strokeWidth="2" />
      <Path d="M6 8 C6 6.3 7.3 5 9 5 L24 5 L24 43 L9 43 C7.3 43 6 41.7 6 40 Z" fill={color} opacity="0.06" />
      <Path d="M29 14 L37 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M29 20 L37 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M29 26 L34 26" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M11 14 L21 14" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Path d="M11 20 L21 20" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Path d="M11 26 L18 26" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Path d="M34 32 L37 29 L37 38 L34 38 Z" fill={color} opacity="0.7" />
    </Svg>
  );
}

export function ListenIcon({ size = 32, color = "#2563EB" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="22" r="10" fill={color} opacity="0.15" stroke={color} strokeWidth="2" />
      <Circle cx="24" cy="22" r="5" fill={color} opacity="0.4" />
      <Circle cx="24" cy="22" r="2" fill={color} />
      <Path d="M24 32 L24 40" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M18 40 L30 40" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M15 12 C12 15 10 18.5 10 22 C10 25.5 12 29 15 32" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <Path d="M33 12 C36 15 38 18.5 38 22 C38 25.5 36 29 33 32" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <Path d="M10 8 C6 13 4 17.5 4 22 C4 26.5 6 31 10 36" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35" />
      <Path d="M38 8 C42 13 44 17.5 44 22 C44 26.5 42 31 38 36" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35" />
    </Svg>
  );
}

export function MoonStarIcon({ size = 32, color = "#FFFFFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M28 8 C20 10 14 18 14 26 C14 35.9 22.1 44 32 44 C37.5 44 42.4 41.4 45.5 37.3 C42.3 38.4 38.8 39 35 39 C23.4 39 14 29.6 14 18 C14 14.4 15 11 16.7 8 C13.5 8 10.5 9 8 11 C6 14 5 18 5 22 C5 33.6 14.4 43 26 43"
        fill={color} opacity="0.9"
      />
      <Path d="M34 6 L35.5 10 L40 10 L36.5 13 L38 17 L34 14.5 L30 17 L31.5 13 L28 10 L32.5 10 Z" fill={color} />
      <Path d="M41 20 L42 22 L44 22 L42.5 23.5 L43 26 L41 25 L39 26 L39.5 23.5 L38 22 L40 22 Z" fill={color} opacity="0.7" />
    </Svg>
  );
}

export function HomeIcon({ size = 32, color = "#0D5C3A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path d="M6 22 L24 6 L42 22 L42 44 L30 44 L30 32 L18 32 L18 44 L6 44 Z"
        fill={color} opacity="0.15" stroke={color} strokeWidth="2.5" strokeLinejoin="round"
      />
      <Path d="M18 44 L18 32 L30 32 L30 44" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <Circle cx="24" cy="26" r="4" fill={color} opacity="0.4" />
    </Svg>
  );
}

export function QuranTabIcon({ size = 32, color = "#0D5C3A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path d="M8 6 C8 4.9 8.9 4 10 4 L24 4 C24 4 24 4 24 4 L38 4 C39.1 4 40 4.9 40 6 L40 42 C40 43.1 39.1 44 38 44 L10 44 C8.9 44 8 43.1 8 42 Z"
        fill={color} opacity="0.1" stroke={color} strokeWidth="2"
      />
      <Path d="M24 4 L24 44" stroke={color} strokeWidth="2.5" />
      <Path d="M16 14 C14 16 14 20 16 22 C18 24 22 24 24 22" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
      <Path d="M32 14 C34 16 34 20 32 22 C30 24 26 24 24 22" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
      <Path d="M18 28 L22 28" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Path d="M26 28 L30 28" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

export function LearnIcon({ size = 32, color = "#0D5C3A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path d="M24 6 L44 16 L24 26 L4 16 Z" fill={color} opacity="0.2" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <Path d="M44 16 L44 30" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M12 22 L12 36 C12 36 16 42 24 42 C32 42 36 36 36 36 L36 22" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx="44" cy="32" r="3" fill={color} />
    </Svg>
  );
}

export function ProfileIcon({ size = 32, color = "#0D5C3A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="16" r="10" fill={color} opacity="0.2" stroke={color} strokeWidth="2.5" />
      <Path d="M6 44 C6 34 14 28 24 28 C34 28 42 34 42 44" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

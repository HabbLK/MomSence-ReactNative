import React from 'react';
import Svg, { Circle, Path, Rect, Line, Polyline } from 'react-native-svg';

// Mirrors the Flutter app's widgets/illustrations.dart (heartPulse, insight,
// privacyShield) path-for-path, so the onboarding slides look identical.
function Blob({ hex, opacity = 0.14 }: { hex: string; opacity?: number }) {
  return (
    <>
      <Circle cx={100} cy={100} r={92} fill={hex} fillOpacity={opacity} />
      <Circle cx={150} cy={55} r={26} fill={hex} fillOpacity={opacity + 0.08} />
    </>
  );
}

export function HeartPulseIllustration({ size = 200 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Blob hex="#7C5CBF" />
      <Path
        d="M100 150 C40 112 46 66 82 62 C96 60 100 74 100 74 C100 74 104 60 118 62 C154 66 160 112 100 150 Z"
        fill="#FF9AAE"
      />
      <Polyline
        points="55,100 80,100 90,80 105,118 115,95 145,95"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function InsightIllustration({ size = 200 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Blob hex="#3FCDC7" />
      <Rect x={70} y={105} width={14} height={35} rx={3} fill="#7C5CBF" />
      <Rect x={90} y={90} width={14} height={50} rx={3} fill="#3FCDC7" />
      <Rect x={110} y={75} width={14} height={65} rx={3} fill="#FF9AAE" />
      <Circle cx={100} cy={95} r={42} fill="none" stroke="#5B3E96" strokeWidth={6} />
      <Line x1={131} y1={126} x2={152} y2={147} stroke="#5B3E96" strokeWidth={7} strokeLinecap="round" />
    </Svg>
  );
}

export function PrivacyShieldIllustration({ size = 200 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Blob hex="#FF9AAE" />
      <Path
        d="M100 45 L145 62 C145 108 128 138 100 155 C72 138 55 108 55 62 Z"
        fill="#7C5CBF"
      />
      <Rect x={84} y={90} width={32} height={26} rx={6} fill="#FFFFFF" />
      <Path d="M90 90 V78 a10 10 0 0 1 20 0 V90" fill="none" stroke="#FFFFFF" strokeWidth={5} />
      <Circle cx={100} cy={103} r={4} fill="#7C5CBF" />
    </Svg>
  );
}

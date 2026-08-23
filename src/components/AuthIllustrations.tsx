import React from 'react';
import Svg, { Circle, Rect, Line } from 'react-native-svg';

// Mirrors widgets/illustrations.dart's login() and register() illustrations
// path-for-path, matching the Flutter app exactly.
function Blob({ hex, opacity = 0.14 }: { hex: string; opacity?: number }) {
  return (
    <>
      <Circle cx={100} cy={100} r={92} fill={hex} fillOpacity={opacity} />
      <Circle cx={150} cy={55} r={26} fill={hex} fillOpacity={opacity + 0.08} />
    </>
  );
}

export function LoginIllustration({ size = 170 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Blob hex="#7C5CBF" />
      <Circle cx={100} cy={80} r={34} fill="#7C5CBF" />
      <Rect x={82} y={118} width={36} height={14} rx={7} fill="#7C5CBF" />
      <Rect x={70} y={120} width={60} height={45} rx={18} fill="#3FCDC7" />
      <Circle cx={100} cy={140} r={9} fill="#FFFFFF" />
      <Rect x={97} y={140} width={6} height={14} rx={3} fill="#FFFFFF" />
    </Svg>
  );
}

export function RegisterIllustration({ size = 160 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Blob hex="#3FCDC7" />
      <Circle cx={80} cy={75} r={28} fill="#F4C9A8" />
      <Rect x={50} y={105} width={60} height={50} rx={18} fill="#7C5CBF" />
      <Circle cx={140} cy={120} r={26} fill="#FF9AAE" />
      <Line x1={140} y1={108} x2={140} y2={132} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
      <Line x1={128} y1={120} x2={152} y2={120} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
    </Svg>
  );
}

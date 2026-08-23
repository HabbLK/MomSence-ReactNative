import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Mirrors widgets/illustrations.dart path-for-path: motherAndBaby, book,
// calendarSparkle, successBadge -- the illustrations the Flutter app uses
// on its hero card, resources header, empty states, and Happy result.
function Blob({ hex, opacity = 0.14 }: { hex: string; opacity?: number }) {
  return (
    <>
      <Circle cx={100} cy={100} r={92} fill={hex} fillOpacity={opacity} />
      <Circle cx={150} cy={55} r={26} fill={hex} fillOpacity={opacity + 0.08} />
    </>
  );
}

export function MotherAndBabyIllustration({ size = 90 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Blob hex="#7C5CBF" />
      <Circle cx={40} cy={150} r={6} fill="#3FCDC7" fillOpacity={0.5} />
      <Circle cx={165} cy={150} r={4} fill="#FF9AAE" fillOpacity={0.6} />
      <Circle cx={30} cy={60} r={4} fill="#FF9AAE" fillOpacity={0.6} />
      <Path d="M60 175 C60 130 78 108 108 108 C138 108 156 130 156 175 Z" fill="#7C5CBF" />
      <Circle cx={108} cy={82} r={30} fill="#F4C9A8" />
      <Path d="M78 78 C76 48 140 48 138 78 C138 55 76 55 78 78 Z" fill="#5B3E96" />
      <Path d="M92 150 C92 120 100 108 118 112 C136 116 138 140 132 158 Z" fill="#3FCDC7" />
      <Circle cx={112} cy={126} r={15} fill="#F9D8BC" />
      <Path d="M104 122 C103 112 121 112 120 122 C120 116 104 116 104 122 Z" fill="#5B3E96" />
      <Path
        d="M126 96 C126 90 134 90 134 96 C138 96 138 102 134 102 C134 108 126 108 126 102 C122 102 122 96 126 96 Z"
        fill="#FF9AAE"
      />
    </Svg>
  );
}

export function BookIllustration({ size = 90 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Blob hex="#FF9AAE" opacity={0.12} />
      <Path d="M100 70 C88 60 60 58 45 64 V138 C60 132 88 134 100 144 Z" fill="#7C5CBF" />
      <Path d="M100 70 C112 60 140 58 155 64 V138 C140 132 112 134 100 144 Z" fill="#8A6BD1" />
      <Path
        d="M100 100 C93 90 78 90 78 100 C78 108 90 116 100 122 C110 116 122 108 122 100 C122 90 107 90 100 100 Z"
        fill="#FF9AAE"
      />
    </Svg>
  );
}

export function CalendarSparkleIllustration({ size = 180 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Blob hex="#7C5CBF" opacity={0.1} />
      <Rect x={55} y={70} width={90} height={80} rx={12} fill="#EDE7F9" />
      <Rect x={55} y={70} width={90} height={26} rx={12} fill="#7C5CBF" />
      <Rect x={70} y={58} width={8} height={20} rx={4} fill="#5B3E96" />
      <Rect x={122} y={58} width={8} height={20} rx={4} fill="#5B3E96" />
      <Rect x={70} y={108} width={16} height={14} rx={3} fill="#3FCDC7" />
      <Rect x={92} y={108} width={16} height={14} rx={3} fill="#FF9AAE" />
      <Rect x={114} y={108} width={16} height={14} rx={3} fill="#D9CFF0" />
      <Rect x={70} y={128} width={16} height={14} rx={3} fill="#D9CFF0" />
      <Rect x={92} y={128} width={16} height={14} rx={3} fill="#3FCDC7" />
      <Path d="M150 55 L154 65 L164 69 L154 73 L150 83 L146 73 L136 69 L146 65 Z" fill="#FF9AAE" />
    </Svg>
  );
}

export function SuccessBadgeIllustration({ size = 130 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Blob hex="#3FB68B" opacity={0.16} />
      <Circle cx={100} cy={95} r={46} fill="#3FB68B" />
      <Path
        d="M78 96 L94 112 L124 78"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

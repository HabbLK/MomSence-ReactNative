import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

type Props = { color: string; size?: number };

export function HomeIcon({ color, size = 22 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 11L12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EditIcon({ color, size = 22 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 19h3.5L18 9.5a1.8 1.8 0 0 0 0-2.5l-1-1a1.8 1.8 0 0 0-2.5 0L5 15.5V19Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M13 6.5 17 10.5" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function ChartIcon({ color, size = 22 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={13} width={3.4} height={7} rx={1} fill={color} />
      <Rect x={10.3} y={9} width={3.4} height={11} rx={1} fill={color} />
      <Rect x={16.6} y={5} width={3.4} height={15} rx={1} fill={color} />
    </Svg>
  );
}

export function LeafIcon({ color, size = 22 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 5C10 5 5 10 5 19c9 0 14-5 14-14Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M8 19c2-4 6-8 10-11" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function ProfileIcon({ color, size = 22 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={3.4} stroke={color} strokeWidth={1.8} />
      <Path d="M5 20c1-4 4-6 7-6s6 2 7 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

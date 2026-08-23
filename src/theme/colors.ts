// Matches the original Flutter prototype's palette 1:1, light and dark --
// see ppd_risk_app/lib/theme/app_theme.dart (AppColors).
export type ThemeColors = typeof lightColors;

export const lightColors = {
  primary: '#7C5CBF',
  primaryDark: '#5B3E96',
  secondary: '#FF9AAE',
  accent: '#3FCDC7',
  background: '#FAF7FD',
  surface: '#FFFFFF',
  surfaceAlt: '#F4EFFB',
  textPrimary: '#352A4D',
  textSecondary: '#7C7391',
  border: '#ECE6F7',
  success: '#3FB68B',
  warning: '#F6A93B',
  danger: '#EF6C6C',
  deepOrange: '#E8763C',
  critical: '#C0293B',
  white: '#FFFFFF',
};

export const darkColors: ThemeColors = {
  primary: '#AD93E8',
  primaryDark: '#7C5CBF',
  secondary: '#FF9AAE',
  accent: '#3FCDC7',
  background: '#1B1626',
  surface: '#262035',
  surfaceAlt: '#2E2740',
  textPrimary: '#F1EDFA',
  textSecondary: '#AFA6C7',
  border: '#372F4D',
  success: '#3FB68B',
  warning: '#F6A93B',
  danger: '#EF6C6C',
  deepOrange: '#E8763C',
  critical: '#C0293B',
  white: '#FFFFFF',
};

export function bandColor(band: string, colors: ThemeColors = lightColors): string {
  switch (band) {
    case 'Happy':
      return colors.success;
    case 'OK':
      return colors.accent;
    case 'Sad':
      return colors.warning;
    case 'Tearful':
      return colors.deepOrange;
    case 'Extreme':
    case 'Extreme - consult immediately':
      return colors.critical;
    default:
      return colors.danger;
  }
}

// The backend's raw band values ("Happy"/"OK"/"Sad"/"Tearful"/"Extreme -
// consult immediately") are historical labels kept for DB/API consistency --
// shown to users with softer, more caring wording instead. Only affects
// display text; bandColor() and any band-based logic keep using the raw value.
export function politeBand(band: string): string {
  switch (band) {
    case 'Happy':
      return 'Feeling good';
    case 'OK':
      return 'Doing okay';
    case 'Sad':
      return 'Feeling low';
    case 'Tearful':
      return 'Feeling overwhelmed';
    case 'Extreme':
    case 'Extreme - consult immediately':
      return 'Could use some extra support';
    default:
      return band;
  }
}

// Kept for any lingering static references during the theming migration.
export const Colors = lightColors;

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
export const Radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

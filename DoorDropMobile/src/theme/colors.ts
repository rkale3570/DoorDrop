// Converted from CSS variables in index.css
// Light theme = blue-primary palette, Dark theme = gold/amber palette

export const lightColors = {
  background: '#F2F3F7',
  foreground: '#181C24',
  card: '#EAEDF3',
  primary: '#2F5FBD',
  primaryForeground: '#F2F3F7',
  muted: '#E6E8F0',
  mutedForeground: '#677080',
  border: '#D0D4E0',
  surface: '#ECEEF4',
  surfaceElevated: '#E2E4ED',
  destructive: '#F23F3F',
  destructiveForeground: '#F8F9FC',
  gradientGold: ['#2F5FBD', '#4D7AD4'] as const,
  green: '#22C55E',
  blue: '#60A5FA',
  orange: '#FB923C',
};

export const darkColors = {
  background: '#0D1017',
  foreground: '#E8E0D4',
  card: '#171D2B',
  primary: '#BF8A5E',
  primaryForeground: '#0D1017',
  muted: '#1A2030',
  mutedForeground: '#737A87',
  border: '#28303D',
  surface: '#131720',
  surfaceElevated: '#1C2232',
  destructive: '#F23F3F',
  destructiveForeground: '#F8F9FC',
  gradientGold: ['#BF8A5E', '#D4A87A'] as const,
  green: '#4ADE80',
  blue: '#60A5FA',
  orange: '#FB923C',
};

export type Colors = typeof lightColors;

// Curated menu themes. Each preset is a fixed set of the structured design
// tokens already consumed by menu-theme.tsx — picking one can never inject
// arbitrary CSS (the freeform customCss box this replaces could).

export type ThemeTokens = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textMuted: string;
  headingFont: string;
  bodyFont: string;
  borderRadiusSm: string;
  borderRadiusMd: string;
  borderRadiusLg: string;
  shadow: string;
};

export type ThemePreset = {
  id: string;
  labelKey: string;
  tokens: ThemeTokens;
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const INTER = "Inter, system-ui, sans-serif";
const AMIRI_HEADING = "'Amiri', Georgia, serif";
const AMIRI_BODY = "'Amiri', serif";

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'valley',
    labelKey: 'presetValley',
    tokens: {
      primaryColor: '#e74c3c',
      secondaryColor: '#2c3e50',
      accentColor: '#f39c12',
      backgroundColor: '#fdf5e6',
      surfaceColor: '#ffffff',
      textColor: '#1a1a2e',
      textMuted: '#64748b',
      headingFont: SERIF,
      bodyFont: INTER,
      borderRadiusSm: '4px',
      borderRadiusMd: '8px',
      borderRadiusLg: '16px',
      shadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
  },
  {
    id: 'dark',
    labelKey: 'presetDark',
    tokens: {
      primaryColor: '#e74c3c',
      secondaryColor: '#8b98a9',
      accentColor: '#f39c12',
      backgroundColor: '#14141f',
      surfaceColor: '#1f1f2e',
      textColor: '#f5f1e8',
      textMuted: '#a8a29e',
      headingFont: SERIF,
      bodyFont: INTER,
      borderRadiusSm: '4px',
      borderRadiusMd: '8px',
      borderRadiusLg: '16px',
      shadow: '0 4px 16px rgba(0,0,0,0.4)',
    },
  },
  {
    id: 'minimal',
    labelKey: 'presetMinimal',
    tokens: {
      primaryColor: '#1a1a2e',
      secondaryColor: '#6b7280',
      accentColor: '#b45309',
      backgroundColor: '#ffffff',
      surfaceColor: '#f9fafb',
      textColor: '#111827',
      textMuted: '#6b7280',
      headingFont: SANS,
      bodyFont: SANS,
      borderRadiusSm: '4px',
      borderRadiusMd: '8px',
      borderRadiusLg: '12px',
      shadow: 'none',
    },
  },
  {
    id: 'warm',
    labelKey: 'presetWarm',
    tokens: {
      primaryColor: '#9c7638',
      secondaryColor: '#78716c',
      accentColor: '#c2410c',
      backgroundColor: '#fdf5e6',
      surfaceColor: '#fffbeb',
      textColor: '#451a03',
      textMuted: '#92600f',
      headingFont: AMIRI_HEADING,
      bodyFont: AMIRI_BODY,
      borderRadiusSm: '8px',
      borderRadiusMd: '12px',
      borderRadiusLg: '24px',
      shadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
  },
];

export const DEFAULT_TOKENS: ThemeTokens = THEME_PRESETS[0].tokens;

// Constrained override options (selects, never free text).
export const HEADING_FONT_OPTIONS = [
  { value: SERIF, labelKey: 'fontSerif' },
  { value: SANS, labelKey: 'fontSans' },
  { value: AMIRI_HEADING, labelKey: 'fontArabic' },
];

export const BODY_FONT_OPTIONS = [
  { value: INTER, labelKey: 'fontSans' },
  { value: SANS, labelKey: 'fontSystem' },
  { value: AMIRI_BODY, labelKey: 'fontArabic' },
  { value: SERIF, labelKey: 'fontSerif' },
];

export const RADIUS_OPTIONS = [
  {
    value: 'sharp',
    labelKey: 'radiusSharp',
    tokens: { borderRadiusSm: '2px', borderRadiusMd: '4px', borderRadiusLg: '8px' },
  },
  {
    value: 'soft',
    labelKey: 'radiusSoft',
    tokens: { borderRadiusSm: '4px', borderRadiusMd: '8px', borderRadiusLg: '16px' },
  },
  {
    value: 'round',
    labelKey: 'radiusRound',
    tokens: { borderRadiusSm: '12px', borderRadiusMd: '16px', borderRadiusLg: '24px' },
  },
];

export const SHADOW_ON = '0 2px 8px rgba(0,0,0,0.08)';
export const SHADOW_OFF = 'none';

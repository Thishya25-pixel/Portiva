/**
 * Portiva theme system.
 *
 * One source of truth for every visual decision a creator can make.
 * Both the live site and the editor preview resolve their styles from here,
 * so what someone sees while editing is exactly what visitors get.
 *
 * Backwards compatible: older rows only stored { primaryColor, fontFamily }.
 */

export type ThemeMode = "dark" | "light";
export type FontId = "sans" | "serif" | "mono" | "display" | "slab";
export type RadiusId = "sharp" | "soft" | "round";
export type SurfaceId = "plain" | "halo" | "grid" | "mesh";

export interface ThemeConfig {
  preset?: string;
  primaryColor?: string;
  fontFamily?: FontId;
  mode?: ThemeMode;
  radius?: RadiusId;
  surface?: SurfaceId;
}

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export const FONT_OPTIONS: {
  id: FontId;
  name: string;
  note: string;
  heading: string;
  body: string;
}[] = [
  {
    id: "sans",
    name: "Clean sans",
    note: "Reads well everywhere. Safe default.",
    heading:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
    body: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  {
    id: "display",
    name: "Bold display",
    note: "Wide headlines, quiet body text.",
    heading:
      '"Avenir Next", Futura, "Trebuchet MS", ui-sans-serif, system-ui, sans-serif',
    body: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  {
    id: "serif",
    name: "Editorial serif",
    note: "Warm and literary. Good for writers.",
    heading: 'ui-serif, Georgia, "Iowan Old Style", "Times New Roman", serif',
    body: 'ui-serif, Georgia, "Iowan Old Style", "Times New Roman", serif',
  },
  {
    id: "slab",
    name: "Serif headline",
    note: "Serif headings paired with a plain body.",
    heading: '"Roboto Slab", Rockwell, Georgia, ui-serif, serif',
    body: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  {
    id: "mono",
    name: "Technical mono",
    note: "Terminal energy. Popular with engineers.",
    heading:
      'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
    body: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
  },
];

/* ------------------------------------------------------------------ */
/* Shape + background                                                  */
/* ------------------------------------------------------------------ */

export const RADIUS_OPTIONS: {
  id: RadiusId;
  name: string;
  lg: string;
  md: string;
  sm: string;
}[] = [
  { id: "sharp", name: "Squared", lg: "6px", md: "5px", sm: "4px" },
  { id: "soft", name: "Rounded", lg: "18px", md: "14px", sm: "10px" },
  { id: "round", name: "Pillowy", lg: "30px", md: "22px", sm: "999px" },
];

export const SURFACE_OPTIONS: { id: SurfaceId; name: string; note: string }[] = [
  { id: "plain", name: "Plain", note: "Flat background, nothing behind it." },
  { id: "halo", name: "Halo", note: "Soft glow of your colour behind the name." },
  { id: "grid", name: "Grid", note: "Faint blueprint grid." },
  { id: "mesh", name: "Mesh", note: "Two-tone wash across the top." },
];

/* ------------------------------------------------------------------ */
/* Presets — a whole look in one tap                                   */
/* ------------------------------------------------------------------ */

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: Required<Omit<ThemeConfig, "preset">>;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark, indigo, the Portiva classic",
    config: {
      primaryColor: "#6366f1",
      fontFamily: "sans",
      mode: "dark",
      radius: "soft",
      surface: "halo",
    },
  },
  {
    id: "paper",
    name: "Paper",
    description: "Light and editorial, ink on off-white",
    config: {
      primaryColor: "#1f2937",
      fontFamily: "serif",
      mode: "light",
      radius: "sharp",
      surface: "plain",
    },
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Monospace and green, for builders",
    config: {
      primaryColor: "#22c55e",
      fontFamily: "mono",
      mode: "dark",
      radius: "sharp",
      surface: "grid",
    },
  },
  {
    id: "studio",
    name: "Studio",
    description: "Warm light background, amber accents",
    config: {
      primaryColor: "#d97706",
      fontFamily: "display",
      mode: "light",
      radius: "round",
      surface: "mesh",
    },
  },
  {
    id: "cobalt",
    name: "Cobalt",
    description: "Deep blue with a crisp grid",
    config: {
      primaryColor: "#2563eb",
      fontFamily: "sans",
      mode: "dark",
      radius: "soft",
      surface: "grid",
    },
  },
  {
    id: "rosewood",
    name: "Rosewood",
    description: "Dark with a rose accent and serif headlines",
    config: {
      primaryColor: "#f43f5e",
      fontFamily: "slab",
      mode: "dark",
      radius: "round",
      surface: "mesh",
    },
  },
  {
    id: "mint",
    name: "Mint",
    description: "Light, airy, teal highlights",
    config: {
      primaryColor: "#0d9488",
      fontFamily: "sans",
      mode: "light",
      radius: "round",
      surface: "halo",
    },
  },
  {
    id: "violet",
    name: "Violet",
    description: "Dark violet with a soft glow",
    config: {
      primaryColor: "#8b5cf6",
      fontFamily: "display",
      mode: "dark",
      radius: "soft",
      surface: "halo",
    },
  },
  {
    id: "graphite",
    name: "Graphite",
    description: "Neutral grey, nothing shouting",
    config: {
      primaryColor: "#64748b",
      fontFamily: "sans",
      mode: "light",
      radius: "sharp",
      surface: "plain",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Dark base, orange heat at the top",
    config: {
      primaryColor: "#fb7185",
      fontFamily: "display",
      mode: "dark",
      radius: "round",
      surface: "mesh",
    },
  },
];

export const COLOR_PRESETS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Blue", value: "#2563eb" },
  { name: "Teal", value: "#0d9488" },
  { name: "Green", value: "#22c55e" },
  { name: "Amber", value: "#d97706" },
  { name: "Orange", value: "#f97316" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Slate", value: "#64748b" },
  { name: "Ink", value: "#1f2937" },
];

/* ------------------------------------------------------------------ */
/* Colour helpers                                                      */
/* ------------------------------------------------------------------ */

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isValidHex(value: string): boolean {
  return HEX.test(value.trim());
}

function toRgb(hex: string): [number, number, number] {
  const match = HEX.exec(hex.trim());
  if (!match) return [99, 102, 241];
  let raw = match[1];
  if (raw.length === 3) {
    raw = raw
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return [
    parseInt(raw.slice(0, 2), 16),
    parseInt(raw.slice(2, 4), 16),
    parseInt(raw.slice(4, 6), 16),
  ];
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Relative luminance, used to keep button labels readable on any accent. */
function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function readableOn(hex: string): string {
  return luminance(hex) > 0.55 ? "#0b1220" : "#ffffff";
}

/** Nudge an accent so it stays legible as text on its own background. */
export function accentOnBackground(hex: string, mode: ThemeMode): string {
  const l = luminance(hex);
  if (mode === "dark" && l < 0.12) return mixWithWhite(hex, 0.45);
  if (mode === "light" && l > 0.62) return mixWithBlack(hex, 0.3);
  return hex;
}

function mixWithWhite(hex: string, amount: number): string {
  const [r, g, b] = toRgb(hex);
  const m = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}

function mixWithBlack(hex: string, amount: number): string {
  const [r, g, b] = toRgb(hex);
  const m = (c: number) => Math.round(c * (1 - amount));
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}

/* ------------------------------------------------------------------ */
/* Resolver                                                            */
/* ------------------------------------------------------------------ */

export interface ResolvedTheme {
  mode: ThemeMode;
  primary: string;
  fontId: FontId;
  radiusId: RadiusId;
  surface: SurfaceId;
  /** CSS custom properties to spread onto the root element. */
  vars: Record<string, string>;
  /** Background layer for the hero area, or null for a plain background. */
  backdrop: string | null;
}

const PALETTES: Record<
  ThemeMode,
  {
    bg: string;
    surface: string;
    surfaceStrong: string;
    text: string;
    muted: string;
    border: string;
    shadow: string;
  }
> = {
  dark: {
    bg: "#080b12",
    surface: "rgba(255, 255, 255, 0.045)",
    surfaceStrong: "rgba(255, 255, 255, 0.09)",
    text: "#f1f5f9",
    muted: "#94a3b8",
    border: "rgba(255, 255, 255, 0.11)",
    shadow: "0 24px 60px -32px rgba(0, 0, 0, 0.9)",
  },
  light: {
    bg: "#fbfbfd",
    surface: "rgba(15, 23, 42, 0.035)",
    surfaceStrong: "rgba(15, 23, 42, 0.07)",
    text: "#0f172a",
    muted: "#64748b",
    border: "rgba(15, 23, 42, 0.1)",
    shadow: "0 24px 60px -40px rgba(15, 23, 42, 0.45)",
  },
};

export function resolveTheme(config?: ThemeConfig | null): ResolvedTheme {
  const preset = THEME_PRESETS.find((p) => p.id === config?.preset)?.config;

  const mode: ThemeMode = config?.mode ?? preset?.mode ?? "dark";
  const rawPrimary = config?.primaryColor ?? preset?.primaryColor ?? "#6366f1";
  const primary = isValidHex(rawPrimary) ? rawPrimary : "#6366f1";
  const fontId: FontId = config?.fontFamily ?? preset?.fontFamily ?? "sans";
  const radiusId: RadiusId = config?.radius ?? preset?.radius ?? "soft";
  const surface: SurfaceId = config?.surface ?? preset?.surface ?? "halo";

  const font = FONT_OPTIONS.find((f) => f.id === fontId) ?? FONT_OPTIONS[0];
  const radius = RADIUS_OPTIONS.find((r) => r.id === radiusId) ?? RADIUS_OPTIONS[1];
  const palette = PALETTES[mode];

  const vars: Record<string, string> = {
    "--p-bg": palette.bg,
    "--p-surface": palette.surface,
    "--p-surface-strong": palette.surfaceStrong,
    "--p-text": palette.text,
    "--p-muted": palette.muted,
    "--p-border": palette.border,
    "--p-shadow": palette.shadow,
    "--p-accent": primary,
    "--p-accent-text": accentOnBackground(primary, mode),
    "--p-accent-contrast": readableOn(primary),
    "--p-accent-soft": withAlpha(primary, mode === "dark" ? 0.18 : 0.12),
    "--p-accent-line": withAlpha(primary, 0.45),
    "--p-radius-lg": radius.lg,
    "--p-radius-md": radius.md,
    "--p-radius-sm": radius.sm,
    "--p-font-heading": font.heading,
    "--p-font-body": font.body,
  };

  const gridLine = withAlpha(mode === "dark" ? "#ffffff" : "#0f172a", 0.06);

  const backdrop =
    surface === "halo"
      ? `radial-gradient(60% 45% at 50% 0%, ${withAlpha(primary, 0.28)} 0%, transparent 70%)`
      : surface === "mesh"
        ? `linear-gradient(160deg, ${withAlpha(primary, 0.24)} 0%, transparent 45%), radial-gradient(50% 40% at 85% 5%, ${withAlpha(primary, 0.16)} 0%, transparent 70%)`
        : surface === "grid"
          ? `linear-gradient(${gridLine} 1px, transparent 1px) 0 0 / 56px 56px, linear-gradient(90deg, ${gridLine} 1px, transparent 1px) 0 0 / 56px 56px`
          : null;

  return { mode, primary, fontId, radiusId, surface, vars, backdrop };
}
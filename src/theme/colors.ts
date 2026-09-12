export type ThemeName = "default" | "gold" | "brown" | "white";

export const THEME_NAMES: ThemeName[] = ["default", "gold", "brown", "white"];

export const THEME_LABELS: Record<ThemeName, string> = {
  default: "기본",
  gold: "골드",
  brown: "브라운",
  white: "화이트",
};

export interface ColorPalette {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  primary: string;
  primaryMuted: string;
  /** 강조색(primary) 위에 올라가는 텍스트 색 */
  onPrimary: string;
  text: string;
  textMuted: string;
  success: string;
  danger: string;
}

const palettes: Record<ThemeName, ColorPalette> = {
  default: {
    background: "#0F1220",
    surface: "#1A1E33",
    surfaceAlt: "#242A47",
    border: "#2E3557",
    primary: "#FFC94D",
    primaryMuted: "#8A7024",
    onPrimary: "#0F1220",
    text: "#F4F5FA",
    textMuted: "#9AA0BE",
    success: "#4DD68A",
    danger: "#FF6B6B",
  },
  gold: {
    background: "#1A1408",
    surface: "#2B2210",
    surfaceAlt: "#3D3016",
    border: "#4F3F1D",
    primary: "#FFD700",
    primaryMuted: "#9C7A0A",
    onPrimary: "#1A1408",
    text: "#FFF8E7",
    textMuted: "#C9B180",
    success: "#4DD68A",
    danger: "#FF6B6B",
  },
  brown: {
    background: "#1F1712",
    surface: "#2E241C",
    surfaceAlt: "#3E3226",
    border: "#54432F",
    primary: "#D8975B",
    primaryMuted: "#8C6339",
    onPrimary: "#1F1712",
    text: "#F5EDE3",
    textMuted: "#BBA48D",
    success: "#8BC48A",
    danger: "#E2695A",
  },
  white: {
    background: "#FAFAFA",
    surface: "#FFFFFF",
    surfaceAlt: "#F0F1F5",
    border: "#E1E3EA",
    primary: "#B8860B",
    primaryMuted: "#E8D8B0",
    onPrimary: "#FFFFFF",
    text: "#1B1D28",
    textMuted: "#6B7086",
    success: "#2E9E5B",
    danger: "#D6453D",
  },
};

export function getColors(theme: ThemeName): ColorPalette {
  return palettes[theme];
}

/** 테마 스토어에 접근하기 애매한 곳(스토어 파일 등)에서 쓰는 기본 테마 색상 */
export const colors = palettes.default;

import { useThemeStore } from "@/store/useThemeStore";
import { ColorPalette, getColors } from "@/theme/colors";

/** 현재 선택된 테마의 색상 팔레트. 테마가 바뀌면 이 값도 바뀌어 화면이 다시 그려진다 */
export function useColors(): ColorPalette {
  const theme = useThemeStore((s) => s.theme);
  return getColors(theme);
}

import Svg, { Path } from "react-native-svg";

// Logotipo de Chía: corazón que se abre en globo de mensaje.
export function LogoMark({ size = 32, color = "#5A3E85" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={(size * 60) / 64} viewBox="0 0 64 60" accessibilityLabel="Chía">
      <Path
        d="M32 54 L8.5 30.5 C2.5 24.5 2.5 14.8 8.5 8.8 C14.4 2.9 23.9 2.9 29.8 8.8 L32 11 L34.2 8.8 C40.1 2.9 49.6 2.9 55.5 8.8 C61.5 14.8 61.5 24.5 55.5 30.5 L50 36 L56 44 L44 41.5 Z"
        fill="none"
        stroke={color}
        strokeWidth={4.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

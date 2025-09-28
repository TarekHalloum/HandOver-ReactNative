// src/components/Logo.tsx
// HandOver ▸ Re‑usable logo component (uniform sizing + TS‑safe)
// -----------------------------------------------------------------------------
import React from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  ImageStyle,
} from 'react-native';

/* ------------------------------------------------------------------
 * Static asset + ratio
 * ---------------------------------------------------------------- */
const LOGO_SRC = require('../assets/logo.png');
const LOGO_RATIO = 2.8; // width / height of the exported PNG/SVG

interface LogoProps {
  /**
   * Fraction of the current screen width the logo should occupy (default 35 %).
   * Provide a fixed pixel width instead if you need an absolute size.
   */
  fraction?: number;
  style?: StyleProp<ImageStyle>; // 🟢 use ImageStyle to satisfy Image component
}

export default function Logo({ fraction = 0.35, style }: LogoProps) {
  const { width } = useWindowDimensions();
  const logoWidth = width * fraction;

  return (
    <Image
      source={LOGO_SRC}
      style={[styles.logo, { width: logoWidth, aspectRatio: LOGO_RATIO }, style]}
      resizeMode="contain"
    />
  );
}

/* ------------------------------------------------------------------
 * Styles
 * ---------------------------------------------------------------- */
const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});

export const fontFamily = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
} as const;

export const fontSize = {
  xxs: 12,
  xs: 14,
  small: 16,
  medium: 18,
  large: 20,
  xl: 24,
  xxl: 28,
} as const;

export const lineHeight = {
  xxs: 16,
  xs: 18,
  small: 22,
  medium: 24,
  large: 26,
  xl: 30,
  xxl: 34,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

export const typography = {
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.xxl,
    fontWeight: fontWeight.bold,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontWeight: fontWeight.bold,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.small,
    lineHeight: lineHeight.small,
    fontWeight: fontWeight.regular,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xxs,
    lineHeight: lineHeight.xxs,
    fontWeight: fontWeight.regular,
  },
} as const;

export type Typography = typeof typography;
export const spacing = {
  xs: 5,
  s: 10,
  m: 15,
  l: 20,
  xl: 25,
  xxl: 30,
} as const;

export const borders = {
  radius: 12,
  radiusSmall: 8,
  radiusLarge: 16,
  radiusCircle: 50,
  width: {
    thin: 1,
    base: 2,
    thick: 4,
  },
} as const;

export const shadows = {
  sm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  base: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
} as const;

export type Spacing = typeof spacing;
export type Borders = typeof borders;
export type Shadows = typeof shadows;
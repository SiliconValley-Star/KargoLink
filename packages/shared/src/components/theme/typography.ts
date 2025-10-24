// CargoLink Design System - Typography Scale
export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
    mono: ['Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },
  
  // Font sizes
  fontSize: {
    xs: '12px',     // 0.75rem
    sm: '14px',     // 0.875rem
    base: '16px',   // 1rem
    lg: '18px',     // 1.125rem
    xl: '20px',     // 1.25rem
    '2xl': '24px',  // 1.5rem
    '3xl': '30px',  // 1.875rem
    '4xl': '36px',  // 2.25rem
    '5xl': '48px',  // 3rem
    '6xl': '60px',  // 3.75rem
    '7xl': '72px',  // 4.5rem
    '8xl': '96px',  // 6rem
    '9xl': '128px', // 8rem
  },
  
  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // Text styles
  heading: {
    h1: {
      fontSize: '48px',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '36px',
      fontWeight: '700',
      lineHeight: '1.25',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '30px',
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '1.35',
      letterSpacing: '0em',
    },
    h5: {
      fontSize: '20px',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '1.45',
      letterSpacing: '0em',
    },
  },
  
  // Body text styles
  body: {
    large: {
      fontSize: '18px',
      fontWeight: '400',
      lineHeight: '1.625',
    },
    base: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    small: {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    xs: {
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
  },
  
  // Caption and label styles
  caption: {
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '1.5',
    letterSpacing: '0.025em',
    textTransform: 'uppercase' as const,
  },
  
  // Button text styles
  button: {
    large: {
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0.025em',
    },
    medium: {
      fontSize: '14px',
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0.025em',
    },
    small: {
      fontSize: '12px',
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0.025em',
    },
  },
} as const;

export type Typography = typeof typography;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type LineHeight = keyof typeof typography.lineHeight;
// CargoLink Design System - Spacing Scale
export const spacing = {
  // Base unit: 4px
  0: '0px',
  1: '4px',    // 0.25rem
  2: '8px',    // 0.5rem
  3: '12px',   // 0.75rem
  4: '16px',   // 1rem
  5: '20px',   // 1.25rem
  6: '24px',   // 1.5rem
  7: '28px',   // 1.75rem
  8: '32px',   // 2rem
  9: '36px',   // 2.25rem
  10: '40px',  // 2.5rem
  11: '44px',  // 2.75rem
  12: '48px',  // 3rem
  14: '56px',  // 3.5rem
  16: '64px',  // 4rem
  20: '80px',  // 5rem
  24: '96px',  // 6rem
  28: '112px', // 7rem
  32: '128px', // 8rem
  36: '144px', // 9rem
  40: '160px', // 10rem
  44: '176px', // 11rem
  48: '192px', // 12rem
  52: '208px', // 13rem
  56: '224px', // 14rem
  60: '240px', // 15rem
  64: '256px', // 16rem
  72: '288px', // 18rem
  80: '320px', // 20rem
  96: '384px', // 24rem
} as const;

// Semantic spacing for layouts
export const layout = {
  container: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  section: {
    xs: spacing[8],   // 32px
    sm: spacing[12],  // 48px
    md: spacing[16],  // 64px
    lg: spacing[20],  // 80px
    xl: spacing[24],  // 96px
  },
  
  component: {
    xs: spacing[2],   // 8px
    sm: spacing[3],   // 12px
    md: spacing[4],   // 16px
    lg: spacing[6],   // 24px
    xl: spacing[8],   // 32px
  }
} as const;

// Border radius scale
export const radius = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;
export type Radius = typeof radius;
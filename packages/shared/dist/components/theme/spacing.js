"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.radius = exports.layout = exports.spacing = void 0;
exports.spacing = {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
    36: '144px',
    40: '160px',
    44: '176px',
    48: '192px',
    52: '208px',
    56: '224px',
    60: '240px',
    64: '256px',
    72: '288px',
    80: '320px',
    96: '384px',
};
exports.layout = {
    container: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },
    section: {
        xs: exports.spacing[8],
        sm: exports.spacing[12],
        md: exports.spacing[16],
        lg: exports.spacing[20],
        xl: exports.spacing[24],
    },
    component: {
        xs: exports.spacing[2],
        sm: exports.spacing[3],
        md: exports.spacing[4],
        lg: exports.spacing[6],
        xl: exports.spacing[8],
    }
};
exports.radius = {
    none: '0px',
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
};
//# sourceMappingURL=spacing.js.map
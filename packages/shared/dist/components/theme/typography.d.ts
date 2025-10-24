export declare const typography: {
    readonly fontFamily: {
        readonly sans: readonly ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"];
        readonly serif: readonly ["Georgia", "Cambria", "Times New Roman", "Times", "serif"];
        readonly mono: readonly ["Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"];
    };
    readonly fontSize: {
        readonly xs: "12px";
        readonly sm: "14px";
        readonly base: "16px";
        readonly lg: "18px";
        readonly xl: "20px";
        readonly '2xl': "24px";
        readonly '3xl': "30px";
        readonly '4xl': "36px";
        readonly '5xl': "48px";
        readonly '6xl': "60px";
        readonly '7xl': "72px";
        readonly '8xl': "96px";
        readonly '9xl': "128px";
    };
    readonly fontWeight: {
        readonly thin: "100";
        readonly extralight: "200";
        readonly light: "300";
        readonly normal: "400";
        readonly medium: "500";
        readonly semibold: "600";
        readonly bold: "700";
        readonly extrabold: "800";
        readonly black: "900";
    };
    readonly lineHeight: {
        readonly none: "1";
        readonly tight: "1.25";
        readonly snug: "1.375";
        readonly normal: "1.5";
        readonly relaxed: "1.625";
        readonly loose: "2";
    };
    readonly letterSpacing: {
        readonly tighter: "-0.05em";
        readonly tight: "-0.025em";
        readonly normal: "0em";
        readonly wide: "0.025em";
        readonly wider: "0.05em";
        readonly widest: "0.1em";
    };
    readonly heading: {
        readonly h1: {
            readonly fontSize: "48px";
            readonly fontWeight: "700";
            readonly lineHeight: "1.2";
            readonly letterSpacing: "-0.025em";
        };
        readonly h2: {
            readonly fontSize: "36px";
            readonly fontWeight: "700";
            readonly lineHeight: "1.25";
            readonly letterSpacing: "-0.025em";
        };
        readonly h3: {
            readonly fontSize: "30px";
            readonly fontWeight: "600";
            readonly lineHeight: "1.3";
            readonly letterSpacing: "-0.025em";
        };
        readonly h4: {
            readonly fontSize: "24px";
            readonly fontWeight: "600";
            readonly lineHeight: "1.35";
            readonly letterSpacing: "0em";
        };
        readonly h5: {
            readonly fontSize: "20px";
            readonly fontWeight: "600";
            readonly lineHeight: "1.4";
            readonly letterSpacing: "0em";
        };
        readonly h6: {
            readonly fontSize: "18px";
            readonly fontWeight: "600";
            readonly lineHeight: "1.45";
            readonly letterSpacing: "0em";
        };
    };
    readonly body: {
        readonly large: {
            readonly fontSize: "18px";
            readonly fontWeight: "400";
            readonly lineHeight: "1.625";
        };
        readonly base: {
            readonly fontSize: "16px";
            readonly fontWeight: "400";
            readonly lineHeight: "1.5";
        };
        readonly small: {
            readonly fontSize: "14px";
            readonly fontWeight: "400";
            readonly lineHeight: "1.5";
        };
        readonly xs: {
            readonly fontSize: "12px";
            readonly fontWeight: "400";
            readonly lineHeight: "1.5";
        };
    };
    readonly caption: {
        readonly fontSize: "12px";
        readonly fontWeight: "500";
        readonly lineHeight: "1.5";
        readonly letterSpacing: "0.025em";
        readonly textTransform: "uppercase";
    };
    readonly button: {
        readonly large: {
            readonly fontSize: "16px";
            readonly fontWeight: "600";
            readonly lineHeight: "1.5";
            readonly letterSpacing: "0.025em";
        };
        readonly medium: {
            readonly fontSize: "14px";
            readonly fontWeight: "600";
            readonly lineHeight: "1.5";
            readonly letterSpacing: "0.025em";
        };
        readonly small: {
            readonly fontSize: "12px";
            readonly fontWeight: "600";
            readonly lineHeight: "1.5";
            readonly letterSpacing: "0.025em";
        };
    };
};
export type Typography = typeof typography;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type LineHeight = keyof typeof typography.lineHeight;
//# sourceMappingURL=typography.d.ts.map
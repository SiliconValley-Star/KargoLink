export declare const animations: {
    readonly duration: {
        readonly instant: "0ms";
        readonly fast: "150ms";
        readonly normal: "250ms";
        readonly slow: "400ms";
        readonly slower: "600ms";
    };
    readonly easing: {
        readonly linear: "linear";
        readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
        readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
        readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
        readonly spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        readonly bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
        readonly smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    };
    readonly fadeIn: {
        readonly animation: "cargolink-fade-in 250ms cubic-bezier(0, 0, 0.2, 1)";
    };
    readonly fadeOut: {
        readonly animation: "cargolink-fade-out 250ms cubic-bezier(0.4, 0, 1, 1)";
    };
    readonly slideUp: {
        readonly animation: "cargolink-slide-up 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    };
    readonly slideDown: {
        readonly animation: "cargolink-slide-down 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    };
    readonly scaleIn: {
        readonly animation: "cargolink-scale-in 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    };
    readonly scaleOut: {
        readonly animation: "cargolink-scale-out 200ms cubic-bezier(0.4, 0, 1, 1)";
    };
    readonly buttonHover: {
        readonly transform: "translateY(-1px)";
        readonly transition: "all 150ms cubic-bezier(0, 0, 0.2, 1)";
        readonly boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)";
    };
    readonly buttonActive: {
        readonly transform: "translateY(0px) scale(0.98)";
        readonly transition: "all 100ms cubic-bezier(0.4, 0, 1, 1)";
    };
    readonly cardHover: {
        readonly transform: "translateY(-2px)";
        readonly transition: "all 250ms cubic-bezier(0, 0, 0.2, 1)";
        readonly boxShadow: "0 8px 25px rgba(0, 0, 0, 0.12)";
    };
    readonly spin: {
        readonly animation: "cargolink-spin 1000ms linear infinite";
    };
    readonly pulse: {
        readonly animation: "cargolink-pulse 2000ms cubic-bezier(0.4, 0, 0.6, 1) infinite";
    };
    readonly bounce: {
        readonly animation: "cargolink-bounce 1000ms infinite";
    };
    readonly progressFill: {
        readonly transition: "width 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    };
    readonly themeTransition: {
        readonly transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)";
    };
};
export declare const keyframes = "\n  @keyframes cargolink-fade-in {\n    from {\n      opacity: 0;\n    }\n    to {\n      opacity: 1;\n    }\n  }\n  \n  @keyframes cargolink-fade-out {\n    from {\n      opacity: 1;\n    }\n    to {\n      opacity: 0;\n    }\n  }\n  \n  @keyframes cargolink-slide-up {\n    from {\n      opacity: 0;\n      transform: translateY(16px);\n    }\n    to {\n      opacity: 1;\n      transform: translateY(0);\n    }\n  }\n  \n  @keyframes cargolink-slide-down {\n    from {\n      opacity: 0;\n      transform: translateY(-16px);\n    }\n    to {\n      opacity: 1;\n      transform: translateY(0);\n    }\n  }\n  \n  @keyframes cargolink-scale-in {\n    from {\n      opacity: 0;\n      transform: scale(0.95);\n    }\n    to {\n      opacity: 1;\n      transform: scale(1);\n    }\n  }\n  \n  @keyframes cargolink-scale-out {\n    from {\n      opacity: 1;\n      transform: scale(1);\n    }\n    to {\n      opacity: 0;\n      transform: scale(0.95);\n    }\n  }\n  \n  @keyframes cargolink-spin {\n    from {\n      transform: rotate(0deg);\n    }\n    to {\n      transform: rotate(360deg);\n    }\n  }\n  \n  @keyframes cargolink-pulse {\n    0%, 100% {\n      opacity: 1;\n    }\n    50% {\n      opacity: 0.5;\n    }\n  }\n  \n  @keyframes cargolink-bounce {\n    0%, 100% {\n      transform: translateY(-25%);\n      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);\n    }\n    50% {\n      transform: translateY(0);\n      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);\n    }\n  }\n";
export declare const animationUtils: {
    injectKeyframes: () => void;
    transition: (properties: string | string[], duration?: keyof typeof animations.duration, easing?: keyof typeof animations.easing) => string;
    combineAnimations: (...animationObjects: Record<string, any>[]) => Record<string, any>;
};
export type AnimationDuration = keyof typeof animations.duration;
export type AnimationEasing = keyof typeof animations.easing;
//# sourceMappingURL=index.d.ts.map
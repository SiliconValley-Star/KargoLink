// CargoLink Advanced Animation System
export const animations = {
  // Duration scales
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    slower: '600ms',
  },
  
  // Easing functions - Premium feel
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Premium spring-like animations
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    // Smooth professional transitions
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  
  // Pre-built animation classes
  fadeIn: {
    animation: 'cargolink-fade-in 250ms cubic-bezier(0, 0, 0.2, 1)',
  },
  
  fadeOut: {
    animation: 'cargolink-fade-out 250ms cubic-bezier(0.4, 0, 1, 1)',
  },
  
  slideUp: {
    animation: 'cargolink-slide-up 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  
  slideDown: {
    animation: 'cargolink-slide-down 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  
  scaleIn: {
    animation: 'cargolink-scale-in 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  
  scaleOut: {
    animation: 'cargolink-scale-out 200ms cubic-bezier(0.4, 0, 1, 1)',
  },
  
  // Micro-interactions
  buttonHover: {
    transform: 'translateY(-1px)',
    transition: 'all 150ms cubic-bezier(0, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  
  buttonActive: {
    transform: 'translateY(0px) scale(0.98)',
    transition: 'all 100ms cubic-bezier(0.4, 0, 1, 1)',
  },
  
  cardHover: {
    transform: 'translateY(-2px)',
    transition: 'all 250ms cubic-bezier(0, 0, 0.2, 1)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
  },
  
  // Loading animations
  spin: {
    animation: 'cargolink-spin 1000ms linear infinite',
  },
  
  pulse: {
    animation: 'cargolink-pulse 2000ms cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  
  bounce: {
    animation: 'cargolink-bounce 1000ms infinite',
  },
  
  // Progress animations
  progressFill: {
    transition: 'width 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  
  // Theme transition
  themeTransition: {
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// CSS Keyframes - to be injected into document
export const keyframes = `
  @keyframes cargolink-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes cargolink-fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  
  @keyframes cargolink-slide-up {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes cargolink-slide-down {
    from {
      opacity: 0;
      transform: translateY(-16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes cargolink-scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes cargolink-scale-out {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }
  
  @keyframes cargolink-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes cargolink-pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @keyframes cargolink-bounce {
    0%, 100% {
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }
`;

// Animation utility functions
export const animationUtils = {
  // Inject keyframes into document
  injectKeyframes: () => {
    const styleId = 'cargolink-animations';
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement('style');
      styleSheet.id = styleId;
      styleSheet.textContent = keyframes;
      document.head.appendChild(styleSheet);
    }
  },
  
  // Create transition string
  transition: (
    properties: string | string[],
    duration: keyof typeof animations.duration = 'normal',
    easing: keyof typeof animations.easing = 'easeOut'
  ) => {
    const props = Array.isArray(properties) ? properties.join(', ') : properties;
    return `${props} ${animations.duration[duration]} ${animations.easing[easing]}`;
  },
  
  // Combine multiple animations
  combineAnimations: (...animationObjects: Record<string, any>[]) => {
    return animationObjects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
  },
};

export type AnimationDuration = keyof typeof animations.duration;
export type AnimationEasing = keyof typeof animations.easing;
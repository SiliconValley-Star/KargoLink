import React from 'react';
export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    style?: React.CSSProperties;
}
export declare const Badge: React.FC<BadgeProps>;
export default Badge;
//# sourceMappingURL=Badge.d.ts.map
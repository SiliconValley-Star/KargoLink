import React from 'react';
export interface TypographyProps {
    children: React.ReactNode;
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption';
    color?: 'primary' | 'secondary' | 'text' | 'textSecondary' | 'error' | 'success' | 'warning';
    align?: 'left' | 'center' | 'right' | 'justify';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    className?: string;
    style?: React.CSSProperties;
    as?: keyof JSX.IntrinsicElements;
}
export declare const Typography: React.FC<TypographyProps>;
export default Typography;
//# sourceMappingURL=Typography.d.ts.map
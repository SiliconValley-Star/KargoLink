import React from 'react';
export interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    hover?: boolean;
}
export declare const Card: React.FC<CardProps>;
export default Card;
//# sourceMappingURL=Card.d.ts.map
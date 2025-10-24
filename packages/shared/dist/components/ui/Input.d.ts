import React from 'react';
export interface InputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    required?: boolean;
    error?: boolean;
    errorMessage?: string;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onChange?: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}
export declare const Input: React.FC<InputProps>;
export default Input;
//# sourceMappingURL=Input.d.ts.map
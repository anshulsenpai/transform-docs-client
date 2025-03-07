import React, { forwardRef, JSX } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: JSX.Element;
    className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, icon, className = "", ...props }, ref) => {
        return (
            <div className="w-full mb-2">
                {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
                <div className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-300 transition-all ${className}`}>
                    {icon && <span className="text-gray-500">{icon}</span>}
                    <input
                        ref={ref}
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
                        {...props}
                    />
                </div>
            </div>
        );
    }
);

Input.displayName = "Input";
export default Input;

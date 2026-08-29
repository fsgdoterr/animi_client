"use client";

import {
    forwardRef,
    type InputHTMLAttributes,
    type ReactNode,
    useState,
} from "react";

import { Eye, EyeOff } from "lucide-react";

import cn from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: ReactNode;
    wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            icon,
            type = "text",
            className,
            wrapperClassName,
            disabled,
            ...props
        },
        ref,
    ) => {
        const [passwordVisible, setPasswordVisible] = useState(false);

        const isPassword = type === "password";

        return (
            <div className={cn("relative block", wrapperClassName)}>
                {icon && (
                    <div className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-white/42">
                        {icon}
                    </div>
                )}

                <input
                    ref={ref}
                    {...props}
                    type={isPassword && passwordVisible ? "text" : type}
                    disabled={disabled}
                    className={cn(
                        "h-11 w-full rounded-lg border border-white/[0.035] bg-[#171d22]",
                        "text-[16px] text-white/90 outline-none transition",
                        "placeholder:text-white/32",
                        "focus:border-white/14 focus:bg-[#1a2026]",
                        "disabled:cursor-not-allowed disabled:opacity-50",

                        icon ? "pl-11" : "pl-4",
                        isPassword ? "pr-11" : "pr-4",

                        className,
                    )}
                />

                {isPassword && (
                    <button
                        type="button"
                        tabIndex={-1}
                        disabled={disabled}
                        onClick={() => setPasswordVisible((value) => !value)}
                        aria-label={
                            passwordVisible
                                ? "Приховати пароль"
                                : "Показати пароль"
                        }
                        className={cn(
                            "absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center",
                            "text-white/42 transition hover:text-white/75",
                            "disabled:pointer-events-none",
                        )}
                    >
                        {passwordVisible ? (
                            <EyeOff size={19} strokeWidth={1.8} />
                        ) : (
                            <Eye size={19} strokeWidth={1.8} />
                        )}
                    </button>
                )}
            </div>
        );
    },
);

Input.displayName = "Input";

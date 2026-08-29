import type {
    ButtonHTMLAttributes,
    ReactNode,
} from "react";

import Link, { type LinkProps } from "next/link";

import cn from "@/lib/utils/cn";

import {
    buttonColorClasses,
    type ButtonColor,
} from "@/lib/types/ui/button-colors";

export type ButtonVariant = "solid" | "soft" | "secondary";

interface BaseButtonProps {
    children: ReactNode;
    color?: ButtonColor;
    variant?: ButtonVariant;
    className?: string;
}

type ButtonAsButtonProps = BaseButtonProps &
    ButtonHTMLAttributes<HTMLButtonElement> & {
        href?: undefined;
    };

type ButtonAsLinkProps = BaseButtonProps &
    LinkProps & {
        href: LinkProps["href"];
        disabled?: boolean;
    };

export type ButtonProps =
    | ButtonAsButtonProps
    | ButtonAsLinkProps;

function isLinkButton(
    props: ButtonProps,
): props is ButtonAsLinkProps {
    return props.href !== undefined;
}

const variantClasses: Record<ButtonVariant, string> = {
    solid: "bg-(--button-color) text-white hover:brightness-110",
    soft: "border [border-color:color-mix(in_srgb,var(--button-color)_28%,transparent)] [background-color:color-mix(in_srgb,var(--button-color)_9%,transparent)] text-(--button-color) hover:[background-color:color-mix(in_srgb,var(--button-color)_15%,transparent)]",
    secondary: "border border-white/[0.07] bg-white/[0.035] text-white/65 hover:bg-white/[0.07] hover:text-white/85",
};

export function Button(props: ButtonProps) {
    const color = props.color ?? "primary";
    const variant = props.variant ?? "solid";

    const classes = cn(
        "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-[15px] font-medium transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        buttonColorClasses[color],
        variantClasses[variant],
        props.className,
    );

    if (isLinkButton(props)) {
        const {
            children,
            color: _color,
            variant: _variant,
            className: _className,
            disabled,
            ...linkProps
        } = props;

        return (
            <Link
                {...linkProps}
                className={cn(
                    classes,
                    disabled && "pointer-events-none opacity-50",
                )}
                aria-disabled={disabled || undefined}
            >
                {children}
            </Link>
        );
    }

    const {
        children,
        color: _color,
        variant: _variant,
        className: _className,
        ...buttonProps
    } = props;

    return (
        <button
            {...buttonProps}
            className={classes}
        >
            {children}
        </button>
    );
}

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

export type IconButtonVariant = "soft" | "secondary" | "ghost";

interface BaseIconButtonProps {
    children: ReactNode;
    color?: ButtonColor;
    variant?: IconButtonVariant;
    className?: string;
}

type IconButtonAsButtonProps = BaseIconButtonProps &
    ButtonHTMLAttributes<HTMLButtonElement> & {
        href?: undefined;
    };

type IconButtonAsLinkProps = BaseIconButtonProps &
    LinkProps & {
        href: LinkProps["href"];
        disabled?: boolean;
    };

export type IconButtonProps =
    | IconButtonAsButtonProps
    | IconButtonAsLinkProps;

function isLinkButton(
    props: IconButtonProps,
): props is IconButtonAsLinkProps {
    return props.href !== undefined;
}

const variantClasses: Record<IconButtonVariant, string> = {
    soft: "border text-(--button-color) [border-color:color-mix(in_srgb,var(--button-color)_55%,transparent)] [background-color:color-mix(in_srgb,var(--button-color)_12%,transparent)] hover:[background-color:color-mix(in_srgb,var(--button-color)_20%,transparent)]",
    secondary: "border border-white/[0.07] bg-white/[0.035] text-white/60 hover:bg-white/[0.07] hover:text-white/85",
    ghost: "border border-transparent bg-transparent text-white/45 hover:bg-white/[0.06] hover:text-white/80",
};

export function IconButton(props: IconButtonProps) {
    const color = props.color ?? "primary";
    const variant = props.variant ?? "soft";

    const classes = cn(
        "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition",
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

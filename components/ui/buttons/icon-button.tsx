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

interface BaseIconButtonProps {
    children: ReactNode;
    color?: ButtonColor;
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

export function IconButton(props: IconButtonProps) {
    const color = props.color ?? "primary";

    const classes = cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg border cursor-pointer",

        buttonColorClasses[color],

        "text-(--button-color)",
        "[border-color:color-mix(in_srgb,var(--button-color)_55%,transparent)]",
        "[background-color:color-mix(in_srgb,var(--button-color)_12%,transparent)]",

        "transition",
        "hover:[background-color:color-mix(in_srgb,var(--button-color)_20%,transparent)]",

        "disabled:cursor-not-allowed disabled:opacity-50",

        props.className,
    );

    if (isLinkButton(props)) {
        const {
            children,
            color: _color,
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
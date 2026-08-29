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

interface BaseButtonProps {
    children: ReactNode;
    color?: ButtonColor;
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

export function Button(props: ButtonProps) {
    const color = props.color ?? "primary";

    const classes = cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md cursor-pointer",
        "bg-(--button-color) px-4 text-[15px] font-medium text-white",
        "transition hover:brightness-110",
        "disabled:cursor-not-allowed disabled:opacity-50",

        buttonColorClasses[color],

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
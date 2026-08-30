"use client";

import { useEffect, useRef, useState } from "react";

import useDocumentScrollLock from "@/lib/hooks/use-document-scroll-lock";
import cn from "@/lib/utils/cn";

const EXIT_DURATION = 180;

export default function PublicModal({
    open,
    onClose,
    children,
    busy = false,
    closeOnEscape = true,
    className,
    panelClassName,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    busy?: boolean;
    closeOnEscape?: boolean;
    className?: string;
    panelClassName?: string;
}) {
    const [mounted, setMounted] = useState(open);
    const [shown, setShown] = useState(false);
    const onCloseRef = useRef(onClose);
    const busyRef = useRef(busy);
    const closeOnEscapeRef = useRef(closeOnEscape);

    onCloseRef.current = onClose;
    busyRef.current = busy;
    closeOnEscapeRef.current = closeOnEscape;

    useEffect(() => {
        if (open) {
            setMounted(true);

            let secondFrame = 0;
            const firstFrame = window.requestAnimationFrame(() => {
                secondFrame = window.requestAnimationFrame(() => setShown(true));
            });

            return () => {
                window.cancelAnimationFrame(firstFrame);
                if (secondFrame) window.cancelAnimationFrame(secondFrame);
            };
        }

        setShown(false);
        const timeout = window.setTimeout(() => setMounted(false), EXIT_DURATION);
        return () => window.clearTimeout(timeout);
    }, [open]);

    useDocumentScrollLock(mounted);

    useEffect(() => {
        if (!mounted) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && closeOnEscapeRef.current && !busyRef.current) {
                onCloseRef.current();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [mounted]);

    if (!mounted) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-[130] flex items-end justify-center bg-black/70 p-3 transition-[opacity,backdrop-filter] duration-200 ease-out motion-reduce:transition-none sm:items-center sm:p-6",
                shown ? "opacity-100 backdrop-blur-md" : "opacity-0 backdrop-blur-none",
                className,
            )}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !busy) onClose();
            }}
        >
            <div
                className={cn(
                    "w-full transition-[opacity,transform] duration-200 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none",
                    shown
                        ? "translate-y-0 scale-100 opacity-100"
                        : "translate-y-2 scale-[0.92] opacity-0",
                    panelClassName,
                )}
            >
                {children}
            </div>
        </div>
    );
}

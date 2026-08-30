import Link from "next/link";
import cn from "@/lib/utils/cn";

export default function PublicLogo({ className }: { className?: string }) {
    return (
        <Link
            href="/"
            aria-label="Animi — на головну"
            className={cn(
                "inline-flex items-center text-[24px] font-semibold tracking-[0.055em] text-white transition-opacity hover:opacity-80",
                className,
            )}
        >
            Animi
        </Link>
    );
}

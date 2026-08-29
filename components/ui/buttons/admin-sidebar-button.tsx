import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import cn from "@/lib/utils/cn";

interface Props {
    active?: boolean;
    label: string;
    href: string;
    icon: LucideIcon;
}

export default function AdminSidebarButton({
    active = false,
    label,
    href,
    icon: Icon,
}: Props) {
    return (
        <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
                "flex h-10 shrink-0 items-center gap-2.5 rounded-md px-3 text-[15px] transition lg:w-full lg:gap-3",
                active
                    ? "bg-white/55 text-white shadow-sm hover:bg-white/60"
                    : "text-white/78 hover:bg-white/[0.045] hover:text-white",
            )}
        >
            <Icon size={18} strokeWidth={1.7} />
            <span className="whitespace-nowrap">{label}</span>
        </Link>
    );
}

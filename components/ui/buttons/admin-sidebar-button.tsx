import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface Props {
    active?: boolean;
    label: string;
    href: string;
    icon: LucideIcon;
}

export default function AdminSidebarButton({
    active,
    label,
    href,
    icon,
}: Props) {
    const Icon = icon;
    if (active) {
        return (
            <Link
                href="/admin"
                aria-current="page"
                className="flex h-10 items-center gap-3 rounded-md bg-white/55 px-3 text-[15px] text-white shadow-sm transition hover:bg-white/60"
            >
                <Icon size={18} strokeWidth={1.7} />
                <span>{label}</span>
            </Link>
        );
    }

    return (
        <Link
            href={href}
            aria-disabled="true"
            className="flex h-10 items-center gap-3 rounded-md px-3 text-[15px] text-white/78 transition hover:bg-white/[0.045] hover:text-white"
        >
            <Icon size={18} strokeWidth={1.7} />
            <span>{label}</span>
        </Link>
    );
}

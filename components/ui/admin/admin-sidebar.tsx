"use client";
import AdminSidebarButton from "@/components/ui/buttons/admin-sidebar-button";
import { adminSidebarRoutes } from "@/lib/constants/admin-sidebar-routes";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex shrink-0 flex-col rounded-xl border border-white/[0.02] bg-[#11171c] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)] lg:w-[260px] lg:p-5">
            <Link
                href="/"
                className="mb-6 inline-flex w-fit items-center text-[28px] font-semibold tracking-[0.02em] text-white transition-opacity hover:opacity-80"
            >
                Animi
            </Link>

            <nav className="space-y-4" aria-label="Адмін-навігація">
                {adminSidebarRoutes.map((section) => (
                    <div key={section.label}>
                        <p className="mb-2 text-[14px] text-white/35">
                            {section.label}
                        </p>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const active =
                                    pathname === item.href ||
                                    (item.href !== "/admin" &&
                                        pathname.startsWith(item.href));

                                return (
                                    <AdminSidebarButton
                                        key={item.label}
                                        {...item}
                                        active={active}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    );
}

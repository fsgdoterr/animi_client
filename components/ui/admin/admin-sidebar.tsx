"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import AdminSidebarButton from "@/components/ui/buttons/admin-sidebar-button";
import { adminSidebarRoutes } from "@/lib/constants/admin-sidebar-routes";

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex min-h-0 shrink-0 flex-col rounded-xl border border-white/[0.02] bg-[#11171c] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.12)] lg:w-[260px] lg:p-5">
            <Link
                href="/"
                className="mb-3 inline-flex w-fit items-center text-[24px] font-semibold tracking-[0.02em] text-white transition-opacity hover:opacity-80 lg:mb-6 lg:text-[28px]"
            >
                Animi
            </Link>

            <nav
                className="no-scrollbar flex min-w-0 gap-1 overflow-x-auto pb-0.5 lg:block lg:min-h-0 lg:flex-1 lg:space-y-4 lg:overflow-y-auto lg:pb-0"
                aria-label="Адмін-навігація"
            >
                {adminSidebarRoutes.map((section) => (
                    <div key={section.label} className="contents lg:block">
                        <p className="mb-2 hidden text-[14px] text-white/35 lg:block">
                            {section.label}
                        </p>
                        <div className="contents lg:block lg:space-y-1">
                            {section.items.map((item) => {
                                const active =
                                    pathname === item.href ||
                                    (item.href !== "/admin" &&
                                        pathname.startsWith(`${item.href}/`));

                                return (
                                    <AdminSidebarButton
                                        key={item.href}
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

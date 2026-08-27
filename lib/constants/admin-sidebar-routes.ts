import {
    Clapperboard,
    Hash,
    LayoutDashboard,
    Mic2,
    Play,
    Tags,
    Users,
} from "lucide-react";

export const adminSidebarRoutes = [
    {
        label: "Основні",
        items: [
            { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
            { href: "/admin/animes", label: "Аніме", icon: Clapperboard },
            { href: "/admin/users", label: "Користувачі", icon: Users },
        ],
    },
    {
        label: "Додатково",
        items: [
            { href: "/admin/genres", label: "Жанри", icon: Tags },
            { href: "/admin/codes", label: "Коди", icon: Hash },
            { href: "/admin/players", label: "Плеєри", icon: Play },
            {
                href: "/admin/dub-teams",
                label: "Команди озвучення",
                icon: Mic2,
            },
        ],
    },
];

import CodeList from "@/components/ui/admin/codes/code-list";
import type { AnimeCodeSortMode } from "@/lib/types/entites/code";

const sortModes: AnimeCodeSortMode[] = ["new", "old", "code", "anime", "views"];

export default async function CodesPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string }>;
}) {
    const { sort } = await searchParams;
    const initialSort = sortModes.includes(sort as AnimeCodeSortMode)
        ? (sort as AnimeCodeSortMode)
        : "new";

    return <CodeList initialSort={initialSort} />;
}

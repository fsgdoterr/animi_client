import AnimeList from "@/components/ui/admin/animes/anime-list";
import { AnimeStatus, type AnimeIssue, type AnimeSortMode } from "@/lib/types/entites/anime";

const sortModes: AnimeSortMode[] = ["new", "old", "title", "release", "views"];
const statusModes = Object.values(AnimeStatus);
const issueModes: AnimeIssue[] = [
    "missingPoster",
    "missingDescription",
    "withoutEpisodes",
    "withoutActiveVariant",
];

export default async function AnimesPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string; issue?: string; status?: string }>;
}) {
    const { sort, issue, status } = await searchParams;
    const initialSort = sortModes.includes(sort as AnimeSortMode)
        ? (sort as AnimeSortMode)
        : "new";

    const initialIssue = issueModes.includes(issue as AnimeIssue)
        ? (issue as AnimeIssue)
        : undefined;
    const initialStatus = statusModes.includes(status as AnimeStatus)
        ? (status as AnimeStatus)
        : undefined;

    return (
        <AnimeList
            initialSort={initialSort}
            initialIssue={initialIssue}
            initialStatus={initialStatus}
        />
    );
}

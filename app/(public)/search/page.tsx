import PublicAnimeCatalog from "@/components/ui/public/catalog/public-anime-catalog";
import PublicUserSearch from "@/components/ui/public/catalog/public-user-search";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q = "" } = await searchParams;
    const query = q.trim();

    if (query.startsWith("@")) return <PublicUserSearch query={query} />;
    return <PublicAnimeCatalog initialSearch={query} />;
}

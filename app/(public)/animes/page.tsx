import PublicAnimeCatalog from "@/components/ui/public/catalog/public-anime-catalog";

export default async function AnimesPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; q?: string }>;
}) {
    const { status, q } = await searchParams;
    return <PublicAnimeCatalog initialStatus={status} initialSearch={q ?? ""} />;
}

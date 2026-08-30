import PublicAnimeCatalog from "@/components/ui/public/catalog/public-anime-catalog";

function toQueryString(searchParams: Record<string, string | string[] | undefined>) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item) => params.append(key, item));
            return;
        }

        if (value !== undefined) params.set(key, value);
    });

    return params.toString();
}

export default async function AnimesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    return (
        <PublicAnimeCatalog
            initialQueryString={toQueryString(await searchParams)}
        />
    );
}

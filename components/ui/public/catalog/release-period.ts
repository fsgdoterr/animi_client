import type { ReleaseFilterMode } from "@/components/ui/public/catalog/catalog-types";

export type ReleaseSeason = "winter" | "spring" | "summer" | "autumn";

interface ReleasePeriod {
    value: string;
    label: string;
    start: string;
    end: string;
}

export const releaseSeasons: { value: ReleaseSeason; label: string; startMonth: number }[] = [
    { value: "winter", label: "Зима", startMonth: 1 },
    { value: "spring", label: "Весна", startMonth: 4 },
    { value: "summer", label: "Літо", startMonth: 7 },
    { value: "autumn", label: "Осінь", startMonth: 10 },
];

function dateKey(year: number, month: number) {
    return `${year}-${String(month).padStart(2, "0")}-01`;
}

function nextSeasonBoundary(year: number, startMonth: number) {
    if (startMonth === 10) return dateKey(year + 1, 1);
    return dateKey(year, startMonth + 3);
}

export function getReleaseYears(years: number[]) {
    const unique = [...new Set(years)].sort((a, b) => b - a);
    if (unique.length < 2) return unique;

    const max = unique[0];
    const min = unique[unique.length - 1];
    return Array.from({ length: max - min + 1 }, (_, index) => max - index);
}

export function getReleasePeriods(years: number[]): ReleasePeriod[] {
    return getReleaseYears(years).flatMap((year) => {
        const yearPeriod: ReleasePeriod = {
            value: `year:${year}`,
            label: `${year} рік`,
            start: dateKey(year, 1),
            end: dateKey(year + 1, 1),
        };

        const seasonPeriods = releaseSeasons.map(({ value, label, startMonth }) => ({
            value: `season:${year}:${value}`,
            label: `${label} ${year}`,
            start: dateKey(year, startMonth),
            end: nextSeasonBoundary(year, startMonth),
        }));

        return [yearPeriod, ...seasonPeriods];
    });
}

export function getReleaseLabel(value: string, years: number[]) {
    return getReleasePeriods(years).find((period) => period.value === value)?.label ?? "";
}

export function getReleaseQueryRange({
    mode,
    from,
    to,
    years,
}: {
    mode: ReleaseFilterMode;
    from: string;
    to: string;
    years: number[];
}) {
    const periods = getReleasePeriods(years);
    const byValue = new Map(periods.map((period) => [period.value, period]));
    const first = byValue.get(from);

    if (mode === "single") {
        return first
            ? { releaseFrom: first.start, releaseTo: first.end }
            : { releaseFrom: undefined, releaseTo: undefined };
    }

    const second = byValue.get(to);
    if (!first && !second) {
        return { releaseFrom: undefined, releaseTo: undefined };
    }
    if (first && !second) {
        return { releaseFrom: first.start, releaseTo: undefined };
    }
    if (!first && second) {
        return { releaseFrom: undefined, releaseTo: second.end };
    }

    const [startPeriod, endPeriod] = first!.start <= second!.start
        ? [first!, second!]
        : [second!, first!];

    return {
        releaseFrom: startPeriod.start,
        releaseTo: endPeriod.end,
    };
}

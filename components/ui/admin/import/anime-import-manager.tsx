"use client";

import {
    AlertTriangle,
    ArchiveRestore,
    CheckCircle2,
    ChevronRight,
    Database,
    ExternalLink,
    FileArchive,
    FileWarning,
    Filter,
    Import,
    Link2,
    Loader2,
    Pause,
    Play,
    Plus,
    RefreshCw,
    Search,
    Upload,
    Wand2,
    X,
} from "lucide-react";
import { type ReactNode, type RefObject, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/buttons/button";
import { Select } from "@/components/ui/dropdowns/select";
import { Input } from "@/components/ui/inputs/input";
import Pagination from "@/components/ui/pagination/pagination";
import {
    useAddAnimeImportManualEpisodesMutation,
    useGetAnimeImportOverviewQuery,
    useGetAnimeImportRecordQuery,
    useImportAnimeImportRecordMutation,
    useImportReadyAnimeMutation,
    useProcessAnimeImportMutation,
    useResolveAnimeImportEpisodeReviewMutation,
    useResolveAnimeImportRecordMutation,
    useRestoreAnimeImportArchivesMutation,
    useUpdateAnimeImportMetadataMutation,
    useUploadAnimeImportZipMutation,
} from "@/lib/store/animi/anime-import-endpoints";
import { useGetDubTeamsQuery } from "@/lib/store/animi/dub-team-endpoints";
import { useGetPlayersQuery } from "@/lib/store/animi/player-endpoints";
import type {
    AnimeImportManualVideo,
    AnimeImportOverview,
    AnimeImportRecordDetail,
    AnimeImportRecordSummary,
    AnimeImportReviewBlock,
    AnimeImportStatus,
    EpisodeReviewBlockRole,
} from "@/lib/types/anime-import";
import { DubType } from "@/lib/types/entites/anime";
import cn from "@/lib/utils/cn";

type ViewTab = "ALL" | "READY" | "REVIEW" | "UNRESOLVED" | "IMPORTED" | "EPISODES";
type EpisodeQueue = "workable" | "no-ashdi";
type EpisodeBlocksFilter = "" | "3plus" | "2" | "1" | "0";

const statusLabels: Record<AnimeImportStatus, string> = {
    PENDING: "У черзі",
    READY: "Готово",
    REVIEW: "Потрібна перевірка",
    UNRESOLVED: "Не знайдено",
    IMPORTED: "Імпортовано",
    FAILED: "Помилка",
};

const statusClasses: Record<AnimeImportStatus, string> = {
    PENDING: "border-white/10 bg-white/[0.05] text-white/55",
    READY: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    REVIEW: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    UNRESOLVED: "border-orange-400/20 bg-orange-400/10 text-orange-200",
    IMPORTED: "border-sky-400/20 bg-sky-400/10 text-sky-200",
    FAILED: "border-red-400/20 bg-red-400/10 text-red-200",
};

const reviewReasonLabels: Record<string, string> = {
    "description-en": "Опис англійською",
    description: "Проблема з описом",
    poster: "Немає постера",
    rating: "Немає рейтингу",
    type: "Не визначено тип",
    status: "Не визначено статус",
    "external-links": "Немає MAL / AniList",
    "original-title": "Немає originalTitle",
    title: "Проблема з назвою",
    "main-episodes": "Немає main.json серій",
    "provider-error": "Помилка зовнішнього API",
    other: "Інша причина",
};

const episodeCategoryLabels: Record<string, string> = {
    "ambiguous-blocks": "Неоднозначні блоки",
    "missing-team": "Не визначена команда",
    "missing-metadata": "Немає типу та команди",
    "episode-or-type-label": "Дивний label серії / типу",
    "missing-type": "Не визначено тип",
    "request-failure": "Помилка запиту",
    "strange-layout": "Нестандартна структура",
    "unknown-player": "Невідомий плеєр",
};

const episodeCategoryOrder = [
    "ambiguous-blocks",
    "missing-team",
    "missing-metadata",
    "episode-or-type-label",
    "missing-type",
    "request-failure",
    "strange-layout",
    "unknown-player",
];

export default function AnimeImportManager() {
    const [tab, setTab] = useState<ViewTab>("ALL");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [autoProcess, setAutoProcess] = useState(false);
    const [autoImport, setAutoImport] = useState(false);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const [reviewReason, setReviewReason] = useState("");
    const [reviewCategory, setReviewCategory] = useState("");
    const [episodeQueue, setEpisodeQueue] = useState<EpisodeQueue>("workable");
    const [reviewBlocks, setReviewBlocks] = useState<EpisodeBlocksFilter>("");

    const statusParam = tab === "REVIEW" ? "REVIEW,FAILED" : tab;
    const overviewQuery = useGetAnimeImportOverviewQuery({
        status: statusParam,
        search,
        page,
        limit: 40,
        reviewReason: tab === "REVIEW" ? reviewReason : undefined,
        reviewCategory: tab === "EPISODES" ? reviewCategory : undefined,
        episodeQueue: tab === "EPISODES" ? episodeQueue : undefined,
        reviewBlocks: tab === "EPISODES" ? reviewBlocks : undefined,
    });
    const overview = overviewQuery.data;

    const [uploadZip, uploadState] = useUploadAnimeImportZipMutation();
    const [processPending, processState] = useProcessAnimeImportMutation();
    const [importReady, importReadyState] = useImportReadyAnimeMutation();

    useEffect(() => {
        setPage(1);
    }, [tab, search, reviewReason, reviewCategory, episodeQueue, reviewBlocks]);

    useEffect(() => {
        if (!autoProcess || !overview || overviewQuery.isFetching || processState.isLoading) return;
        if (overview.progress.pending <= 0) {
            setAutoProcess(false);
            return;
        }
        void processPending({ limit: 5 })
            .unwrap()
            .catch((error) => {
                setLocalError(getErrorMessage(error));
                setAutoProcess(false);
            });
    }, [autoProcess, overview, overviewQuery.isFetching, processState.isLoading, processPending]);

    useEffect(() => {
        if (!autoImport || !overview || overviewQuery.isFetching || importReadyState.isLoading) return;
        if (overview.counts.READY <= 0) {
            setAutoImport(false);
            return;
        }
        void importReady({ limit: 5 })
            .unwrap()
            .catch((error) => {
                setLocalError(getErrorMessage(error));
                setAutoImport(false);
            });
    }, [autoImport, overview, overviewQuery.isFetching, importReadyState.isLoading, importReady]);

    const visibleRecords = useMemo(() => overview?.records ?? [], [overview]);

    const handleFile = async (file: File) => {
        setLocalError(null);
        if (!file.name.toLowerCase().endsWith(".zip")) {
            setLocalError("Потрібен саме results.zip з парсера.");
            return;
        }
        try {
            await uploadZip(file).unwrap();
            setTab("ALL");
            setPage(1);
            setSelectedKey(null);
            setAutoProcess(true);
        } catch (error) {
            setLocalError(getErrorMessage(error));
        }
    };

    return (
        <div className="flex min-h-full min-w-0 flex-col gap-4 pb-4">
            <header className="flex flex-col gap-3 px-0.5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-1 flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em] text-(--primary)">
                        <Database size={14} />
                        Import pipeline
                    </div>
                    <h1 className="text-[26px] leading-tight text-white/95 sm:text-[30px]">Масовий імпорт аніме</h1>
                    <p className="mt-1 max-w-3xl text-[14px] leading-6 text-white/43">
                        Метадані та довірені серії з main.json живуть окремо від черги ручного review серій.
                    </p>
                    {overview?.importerVersion && (
                        <div className="mt-1 text-[11px] text-white/25">
                            importer v{overview.importerVersion} · resolver v{overview.resolverVersion ?? "?"}
                        </div>
                    )}
                </div>
                {overview?.uploadedAt && (
                    <div className="text-left text-[12px] leading-5 text-white/32 sm:text-right">
                        <div>{overview.sourceFilename}</div>
                        <div>Оновлено {formatDate(overview.updatedAt)}</div>
                    </div>
                )}
            </header>

            <UploadPanel filename={overview?.sourceFilename ?? null} busy={uploadState.isLoading} onFile={handleFile} />
            <StorageRecoveryPanel onError={setLocalError} />

            {localError && (
                <div className="rounded-xl border border-red-400/15 bg-red-400/[0.055] px-4 py-3 text-[13px] leading-5 text-red-100/75">
                    {localError}
                </div>
            )}

            {overview ? (
                <>
                    <SummaryGrid overview={overview} onTab={setTab} />
                    <section className="min-w-0 rounded-xl border border-white/[0.035] bg-[#11171c]">
                        <div className="flex flex-col gap-3 border-b border-white/[0.05] p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 gap-1 overflow-x-auto pb-1 xl:pb-0">
                                <Tab active={tab === "ALL"} onClick={() => setTab("ALL")} label="Усі" count={sumCounts(overview.counts)} />
                                <Tab active={tab === "READY"} onClick={() => setTab("READY")} label="Готові" count={overview.counts.READY} />
                                <Tab active={tab === "REVIEW"} onClick={() => setTab("REVIEW")} label="Перевірка" count={overview.counts.REVIEW + overview.counts.FAILED} />
                                <Tab active={tab === "UNRESOLVED"} onClick={() => setTab("UNRESOLVED")} label="Не знайдені" count={overview.counts.UNRESOLVED} />
                                <Tab active={tab === "EPISODES"} onClick={() => setTab("EPISODES")} label="Серії" count={overview.facets?.episodeReview?.workable ?? 0} />
                                <Tab active={tab === "IMPORTED"} onClick={() => setTab("IMPORTED")} label="Імпортовані" count={overview.counts.IMPORTED} />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setAutoProcess((value) => !value)}
                                    disabled={overview.progress.pending === 0}
                                >
                                    {autoProcess ? <Pause size={16} /> : <Wand2 size={16} />}
                                    {autoProcess ? "Пауза" : `Обробити чергу (${overview.progress.pending})`}
                                </Button>
                                <Button
                                    color="green"
                                    onClick={() => setAutoImport((value) => !value)}
                                    disabled={overview.counts.READY === 0}
                                >
                                    {importReadyState.isLoading || autoImport ? <Loader2 className="animate-spin" size={16} /> : <Import size={16} />}
                                    {autoImport ? "Імпортую…" : `Імпортувати готові (${overview.counts.READY})`}
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-3 border-b border-white/[0.05] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-4">
                            <Input
                                icon={<Search size={18} />}
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Назва, originalTitle або AniTube URL…"
                            />
                            <Button variant="secondary" onClick={() => overviewQuery.refetch()} disabled={overviewQuery.isFetching}>
                                <RefreshCw className={cn(overviewQuery.isFetching && "animate-spin")} size={16} />
                                Оновити
                            </Button>
                        </div>

                        {tab === "REVIEW" && (
                            <ReviewReasonFilters overview={overview} value={reviewReason} onChange={setReviewReason} />
                        )}

                        {tab === "EPISODES" && (
                            <EpisodeReviewFilters
                                overview={overview}
                                queue={episodeQueue}
                                onQueue={setEpisodeQueue}
                                category={reviewCategory}
                                onCategory={setReviewCategory}
                                blocks={reviewBlocks}
                                onBlocks={setReviewBlocks}
                            />
                        )}

                        <div className="min-h-[360px] p-3 sm:p-4">
                            {overviewQuery.isLoading ? (
                                <LoadingBlock label="Завантажую чергу імпорту…" />
                            ) : visibleRecords.length === 0 ? (
                                <EmptyState tab={tab} />
                            ) : (
                                <div className="grid gap-2.5">
                                    {visibleRecords.map((record) => (
                                        <RecordCard
                                            key={record.key}
                                            record={record}
                                            selected={selectedKey === record.key}
                                            episodeMode={tab === "EPISODES"}
                                            onOpen={() => setSelectedKey(record.key)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <Pagination
                            page={overview.pagination.page}
                            totalPages={overview.pagination.pages}
                            totalCount={overview.pagination.total}
                            isLoading={overviewQuery.isFetching}
                            onPageChange={setPage}
                        />
                    </section>
                </>
            ) : !overviewQuery.isLoading ? (
                <EmptyWorkspace />
            ) : (
                <LoadingBlock label="Перевіряю попередню чергу…" />
            )}

            {selectedKey && (
                <RecordDrawer
                    key={`${selectedKey}:${tab}`}
                    recordKey={selectedKey}
                    episodeMode={tab === "EPISODES"}
                    onClose={() => setSelectedKey(null)}
                    onError={setLocalError}
                />
            )}
        </div>
    );
}

function UploadPanel({ filename, busy, onFile }: { filename: string | null; busy: boolean; onFile: (file: File) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [drag, setDrag] = useState(false);

    return (
        <section
            onDragEnter={(event) => { event.preventDefault(); setDrag(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDrag(false)}
            onDrop={(event) => {
                event.preventDefault();
                setDrag(false);
                const file = event.dataTransfer.files?.[0];
                if (file) onFile(file);
            }}
            className={cn(
                "relative overflow-hidden rounded-xl border bg-[#11171c] p-4 transition sm:p-5",
                drag ? "border-(--primary)/50 bg-[color-mix(in_srgb,var(--primary)_8%,#11171c)]" : "border-white/[0.035]",
            )}
        >
            <div className="pointer-events-none absolute -right-10 -top-16 size-44 rounded-full bg-(--primary)/[0.06] blur-3xl" />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3.5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.035] text-(--primary)">
                        {busy ? <Loader2 className="animate-spin" size={21} /> : <FileArchive size={21} />}
                    </div>
                    <div className="min-w-0">
                        <div className="text-[16px] font-medium text-white/90">results.zip з парсера</div>
                        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-white/40">
                            main.json вважається довіреним. manual-review.json використовується лише для окремої черги проблемних серій.
                        </p>
                        {filename && <div className="mt-2 truncate text-[12px] text-emerald-300/75">Активний пакет: {filename}</div>}
                    </div>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".zip,application/zip"
                    className="hidden"
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) onFile(file);
                        event.currentTarget.value = "";
                    }}
                />
                <Button onClick={() => inputRef.current?.click()} disabled={busy} className="w-full lg:w-auto">
                    <Upload size={17} />
                    {filename ? "Завантажити новий пакет" : "Обрати ZIP"}
                </Button>
            </div>
        </section>
    );
}

function StorageRecoveryPanel({ onError }: { onError: (value: string | null) => void }) {
    const [open, setOpen] = useState(false);
    const [storage, setStorage] = useState<File | null>(null);
    const [results, setResults] = useState<File | null>(null);
    const storageRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLInputElement>(null);
    const [restore, restoreState] = useRestoreAnimeImportArchivesMutation();

    const runRestore = async () => {
        if (!storage || !results) return;
        onError(null);
        try {
            await restore({ storage, results }).unwrap();
            setOpen(false);
        } catch (error) {
            onError(getErrorMessage(error));
        }
    };

    return (
        <section className="rounded-xl border border-white/[0.035] bg-[#10161b]">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
                <div className="flex items-center gap-3">
                    <ArchiveRestore size={17} className="text-white/35" />
                    <div>
                        <div className="text-[13px] font-medium text-white/65">Аварійне відновлення без повторних запитів Hikka</div>
                        <div className="mt-0.5 text-[11px] text-white/28">Старий storage.zip + актуальний results.zip</div>
                    </div>
                </div>
                <span className="text-[12px] text-white/30">{open ? "Сховати" : "Відкрити"}</span>
            </button>
            {open && (
                <div className="grid gap-3 border-t border-white/[0.05] p-4">
                    <div className="rounded-lg border border-amber-400/10 bg-amber-400/[0.035] p-3 text-[12px] leading-5 text-amber-50/55">
                        Metadata, Hikka/MAL/AniList ID, статуси та вже зроблені ручні рішення беруться зі старого storage. Parser data оновлюються з results.zip. Зовнішні API під час цього відновлення не викликаються.
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <ZipPickCard
                            title="1. Старий storage.zip"
                            file={storage}
                            inputRef={storageRef}
                            onFile={setStorage}
                        />
                        <ZipPickCard
                            title="2. Новий results.zip"
                            file={results}
                            inputRef={resultsRef}
                            onFile={setResults}
                        />
                    </div>
                    <Button onClick={runRestore} disabled={!storage || !results || restoreState.isLoading} className="w-full md:w-fit">
                        {restoreState.isLoading ? <Loader2 className="animate-spin" size={16} /> : <ArchiveRestore size={16} />}
                        Відновити чергу без Hikka
                    </Button>
                </div>
            )}
        </section>
    );
}

function ZipPickCard({ title, file, inputRef, onFile }: { title: string; file: File | null; inputRef: RefObject<HTMLInputElement | null>; onFile: (file: File | null) => void }) {
    return (
        <div className="rounded-xl border border-white/[0.045] bg-white/[0.018] p-3">
            <div className="text-[12px] font-medium text-white/55">{title}</div>
            <div className="mt-1 truncate text-[11px] text-white/28">{file?.name ?? "ZIP ще не обрано"}</div>
            <input
                ref={inputRef}
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                onChange={(event) => {
                    onFile(event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                }}
            />
            <Button variant="secondary" className="mt-3 w-full" onClick={() => inputRef.current?.click()}>
                <FileArchive size={15} /> Обрати ZIP
            </Button>
        </div>
    );
}

function SummaryGrid({ overview, onTab }: { overview: AnimeImportOverview; onTab: (tab: ViewTab) => void }) {
    const total = sumCounts(overview.counts);
    const processed = overview.progress.metadataDone;
    const percent = total ? Math.round((processed / total) * 100) : 0;
    const cards = [
        { label: "У пакеті", value: total, detail: `${percent}% метаданих оброблено`, icon: FileArchive, tab: "ALL" as ViewTab },
        { label: "Готові", value: overview.counts.READY, detail: "можна імпортувати без DRAFT", icon: CheckCircle2, tab: "READY" as ViewTab },
        { label: "Потребують уваги", value: overview.counts.REVIEW + overview.counts.FAILED, detail: "метадані потребують перевірки", icon: AlertTriangle, tab: "REVIEW" as ViewTab },
        { label: "Не знайдені", value: overview.counts.UNRESOLVED, detail: "потрібен Hikka / MAL / AniList", icon: FileWarning, tab: "UNRESOLVED" as ViewTab },
    ];
    return (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <button key={card.label} onClick={() => onTab(card.tab)} className="group rounded-xl border border-white/[0.035] bg-[#11171c] p-4 text-left transition hover:border-white/[0.08] hover:bg-[#131a20]">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="text-[13px] text-white/38">{card.label}</div>
                            <div className="mt-1 text-[27px] font-medium leading-none text-white/92">{card.value}</div>
                        </div>
                        <card.icon size={19} className="text-white/28 transition group-hover:text-(--primary)" />
                    </div>
                    <div className="mt-3 text-[12px] text-white/30">{card.detail}</div>
                </button>
            ))}
        </div>
    );
}

function Tab({ active, label, count, onClick }: { active: boolean; label: string; count?: number; onClick: () => void }) {
    return (
        <button onClick={onClick} className={cn("flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] transition", active ? "bg-white/[0.09] text-white" : "text-white/45 hover:bg-white/[0.04] hover:text-white/75") }>
            {label}
            {count !== undefined && <span className={cn("rounded px-1.5 py-0.5 text-[11px]", active ? "bg-white/10 text-white/65" : "bg-white/[0.04] text-white/30")}>{count}</span>}
        </button>
    );
}

function ReviewReasonFilters({ overview, value, onChange }: { overview: AnimeImportOverview; value: string; onChange: (value: string) => void }) {
    const options = [
        { value: "", label: "Усі причини перевірки" },
        ...(overview.facets?.reviewReasons ?? []).map((item) => ({
            value: item.code,
            label: `${reviewReasonLabels[item.code] ?? item.code} · ${item.count}`,
        })),
    ];
    return (
        <div className="flex flex-col gap-2 border-b border-white/[0.05] bg-amber-400/[0.02] p-3 sm:flex-row sm:items-center sm:p-4">
            <div className="flex items-center gap-2 text-[12px] text-white/38"><Filter size={14} />Причина перевірки</div>
            <Select value={value} options={options} onChange={onChange} className="w-full sm:w-[320px]" />
            {value && <Button variant="secondary" onClick={() => onChange("")}>Скинути</Button>}
        </div>
    );
}

function EpisodeReviewFilters({ overview, queue, onQueue, category, onCategory, blocks, onBlocks }: { overview: AnimeImportOverview; queue: EpisodeQueue; onQueue: (value: EpisodeQueue) => void; category: string; onCategory: (value: string) => void; blocks: EpisodeBlocksFilter; onBlocks: (value: EpisodeBlocksFilter) => void }) {
    const counts = new Map((overview.facets?.episodeCategories ?? []).map((item) => [
        item.category,
        queue === "no-ashdi" ? item.noAshdi : item.workable,
    ]));
    const blockCounts = new Map((overview.facets?.episodeBlockCounts ?? []).map((item) => [
        item.blockCount,
        queue === "no-ashdi" ? item.noAshdi : item.workable,
    ]));
    const blockOptions: Array<{ value: EpisodeBlocksFilter; label: string; hint?: string }> = [
        { value: "", label: "Усі" },
        { value: "3plus", label: "3+ блоки", hint: "найлегше" },
        { value: "2", label: "2 блоки" },
        { value: "1", label: "1 блок" },
        { value: "0", label: "0 блоків", hint: "найскладніше" },
    ];
    return (
        <div className="grid gap-4 border-b border-white/[0.05] bg-violet-400/[0.02] p-3 sm:p-4">
            <div>
                <div className="text-[14px] font-medium text-violet-100/85">Review серій</div>
                <p className="mt-1 max-w-4xl text-[12px] leading-5 text-white/36">
                    Серії з main.json вже правильні та не редагуються тут. Ця вкладка показує лише нерозв’язані частини manual-review.json.
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => onQueue("workable")}
                    className={cn("rounded-lg border px-3 py-2 text-[12px] transition", queue === "workable" ? "border-violet-400/25 bg-violet-400/10 text-violet-100" : "border-white/[0.05] bg-white/[0.02] text-white/40 hover:text-white/70")}
                >
                    Є ASHDI-відео · {overview.facets?.episodeReview?.workable ?? 0}
                </button>
                <button
                    type="button"
                    onClick={() => onQueue("no-ashdi")}
                    className={cn("rounded-lg border px-3 py-2 text-[12px] transition", queue === "no-ashdi" ? "border-orange-400/25 bg-orange-400/10 text-orange-100" : "border-white/[0.05] bg-white/[0.02] text-white/40 hover:text-white/70")}
                >
                    Без ASHDI-відео · {overview.facets?.episodeReview?.noAshdi ?? 0}
                </button>
            </div>
            <div className="grid gap-2">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-white/28">
                    <Filter size={12} /> Складність за кількістю блоків
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {blockOptions.map((item) => {
                        const count = item.value ? (blockCounts.get(item.value) ?? 0) : null;
                        return (
                            <FilterChip
                                key={item.value || "all"}
                                active={blocks === item.value}
                                label={`${item.label}${count !== null ? ` · ${count}` : ""}${item.hint ? ` · ${item.hint}` : ""}`}
                                disabled={Boolean(item.value) && !count}
                                onClick={() => onBlocks(item.value)}
                            />
                        );
                    })}
                </div>
                <div className="text-[11px] leading-4 text-white/25">
                    Рекомендований порядок: 3+ блоки → 2 → 1 → 0. Фільтр працює разом із категоріями нижче.
                </div>
            </div>
            <div className="grid gap-2">
                <div className="text-[11px] uppercase tracking-[0.08em] text-white/28">Категорія проблеми</div>
                <div className="flex flex-wrap gap-1.5">
                    <FilterChip active={!category} label="Усі категорії" onClick={() => onCategory("")} />
                    {episodeCategoryOrder.map((item) => (
                        <FilterChip
                            key={item}
                            active={category === item}
                            label={`${episodeCategoryLabels[item]} · ${counts.get(item) ?? 0}`}
                            disabled={!counts.get(item)}
                            onClick={() => onCategory(item)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function FilterChip({ active, label, disabled, onClick }: { active: boolean; label: string; disabled?: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "rounded-md border px-2.5 py-1.5 text-[11px] transition disabled:cursor-not-allowed disabled:opacity-25",
                active ? "border-(--primary)/25 bg-(--primary)/10 text-white/85" : "border-white/[0.045] bg-white/[0.02] text-white/38 hover:bg-white/[0.05] hover:text-white/65",
            )}
        >
            {label}
        </button>
    );
}

function RecordCard({ record, selected, episodeMode, onOpen }: { record: AnimeImportRecordSummary; selected: boolean; episodeMode: boolean; onOpen: () => void }) {
    return (
        <button onClick={onOpen} className={cn("grid w-full gap-3 rounded-xl border p-3 text-left transition sm:grid-cols-[58px_minmax(0,1fr)_auto] sm:items-center", selected ? "border-(--primary)/30 bg-(--primary)/[0.055]" : "border-white/[0.045] bg-white/[0.018] hover:border-white/[0.09] hover:bg-white/[0.035]") }>
            <div className="hidden size-[58px] overflow-hidden rounded-lg bg-white/[0.04] sm:block">
                {record.poster ? <img src={record.poster} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-white/20"><FileWarning size={19} /></div>}
            </div>
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-[15px] font-medium text-white/90">{record.title}</span>
                    <StatusBadge status={record.status} />
                    {record.importedAsDraft && <span className="rounded-md border border-amber-400/15 bg-amber-400/[0.07] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-amber-200/75">DRAFT</span>}
                </div>
                <div className="mt-1 truncate text-[12px] text-white/34">{record.originalTitle || `AniTube #${record.anitubeId}`}</div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/36">
                    <span>{record.episodes.numbers} серій · {record.episodes.variants} варіантів</span>
                    {record.episodes.trustedVariants > 0 && <span className="text-emerald-200/65">main.json: {record.episodes.trustedVariants}</span>}
                    {episodeMode && record.episodes.ashdiVideos > 0 && <span className="text-violet-200/65">ASHDI review: {record.episodes.ashdiVideos}</span>}
                    {episodeMode && record.episodes.manualRemaining > 0 && <span className="text-amber-200/65">залишилось: {record.episodes.manualRemaining}</span>}
                </div>
                {!episodeMode && (record.issues[0] || record.lastError) && <div className="mt-2 line-clamp-1 text-[12px] text-amber-100/55">{record.lastError || record.issues[0]}</div>}
                {episodeMode && record.episodes.reviewCategories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {record.episodes.reviewCategories.slice(0, 5).map((category) => <CategoryBadge key={category} category={category} />)}
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
                <SourceDots record={record} />
                <ChevronRight size={17} className="text-white/25" />
            </div>
        </button>
    );
}

function CategoryBadge({ category }: { category: string }) {
    return <span className="rounded bg-violet-400/[0.08] px-1.5 py-0.5 text-[10px] text-violet-200/65">{episodeCategoryLabels[category] ?? category}</span>;
}

function StatusBadge({ status }: { status: AnimeImportStatus }) {
    return <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide", statusClasses[status])}>{statusLabels[status]}</span>;
}

function SourceDots({ record }: { record: AnimeImportRecordSummary }) {
    return (
        <div className="flex items-center gap-1 text-[10px] text-white/32">
            <span className="rounded bg-white/[0.04] px-1.5 py-1">AT</span>
            <span className={cn("rounded px-1.5 py-1", record.resolution.hikkaSlug ? "bg-emerald-400/10 text-emerald-200/65" : "bg-white/[0.04]")}>H</span>
            <span className={cn("rounded px-1.5 py-1", record.resolution.malId ? "bg-sky-400/10 text-sky-200/65" : "bg-white/[0.04]")}>MAL</span>
            <span className={cn("rounded px-1.5 py-1", record.resolution.anilistId ? "bg-violet-400/10 text-violet-200/65" : "bg-white/[0.04]")}>AL</span>
        </div>
    );
}

function RecordDrawer({ recordKey, episodeMode, onClose, onError }: { recordKey: string; episodeMode: boolean; onClose: () => void; onError: (value: string | null) => void }) {
    const query = useGetAnimeImportRecordQuery(recordKey);
    const record = query.data;
    const [resolveRecord, resolveState] = useResolveAnimeImportRecordMutation();
    const [importRecord, importState] = useImportAnimeImportRecordMutation();
    const [refs, setRefs] = useState<{ hikka: string; mal: string; al: string }>({ hikka: "", mal: "", al: "" });

    const handleResolve = async () => {
        try {
            await resolveRecord({ key: recordKey, ...refs }).unwrap();
            setRefs({ hikka: "", mal: "", al: "" });
        } catch (error) { onError(getErrorMessage(error)); }
    };
    const handleImport = async () => {
        try { await importRecord(recordKey).unwrap(); }
        catch (error) { onError(getErrorMessage(error)); }
    };

    return (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm" onMouseDown={onClose}>
            <aside className="absolute bottom-0 right-0 top-0 w-full overflow-y-auto border-l border-white/[0.06] bg-[#0d1216] shadow-2xl sm:max-w-[760px]" onMouseDown={(event) => event.stopPropagation()}>
                <div className="sticky top-0 z-[70] flex items-center justify-between border-b border-white/[0.06] bg-[#0d1216]/95 px-4 py-3 backdrop-blur sm:px-5">
                    <div><div className="text-[12px] text-white/32">AniTube #{recordKey}</div><div className="mt-0.5 text-[17px] font-medium text-white/90">{record?.title ?? "Завантаження…"}</div></div>
                    <button onClick={onClose} className="flex size-9 items-center justify-center rounded-lg bg-white/[0.04] text-white/45 hover:bg-white/[0.08] hover:text-white"><X size={18} /></button>
                </div>
                {query.isLoading || !record ? <LoadingBlock label="Завантажую деталі…" /> : (
                    <div className="grid gap-4 p-4 sm:p-5">
                        <RecordHero record={record} />

                        {episodeMode && <EpisodeReviewEditor record={record} onError={onError} />}

                        {(record.status === "UNRESOLVED" || record.status === "FAILED" || !record.metadata) && (
                            <section className="rounded-xl border border-orange-400/12 bg-orange-400/[0.045] p-4">
                                <div className="flex items-center gap-2 text-[14px] font-medium text-orange-100/90"><Link2 size={16} />Ручне зіставлення метаданих</div>
                                <p className="mt-1 text-[12px] leading-5 text-white/38">Встав Hikka slug/URL, MAL ID/URL або AniList ID/URL. Достатньо одного поля.</p>
                                <div className="mt-3 grid gap-2">
                                    <Input value={refs.hikka} onChange={(e) => setRefs((v) => ({ ...v, hikka: e.target.value }))} placeholder="Hikka slug або https://hikka.io/anime/..." />
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <Input value={refs.mal} onChange={(e) => setRefs((v) => ({ ...v, mal: e.target.value }))} placeholder="MAL ID або URL" />
                                        <Input value={refs.al} onChange={(e) => setRefs((v) => ({ ...v, al: e.target.value }))} placeholder="AniList ID або URL" />
                                    </div>
                                </div>
                                <Button className="mt-3 w-full" onClick={handleResolve} disabled={resolveState.isLoading || !([refs.hikka, refs.mal, refs.al] as string[]).some((value) => value.trim())}>
                                    {resolveState.isLoading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />} Отримати дані повторно
                                </Button>
                            </section>
                        )}

                        <IssuesBlock record={record} hideEpisodeIssues={episodeMode} />
                        {record.metadata && <MetadataBlock record={record} onError={onError} />}

                        <section className="rounded-xl border border-white/[0.045] bg-white/[0.018] p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div><div className="text-[14px] font-medium text-white/82">Створення / оновлення в базі</div><p className="mt-1 text-[12px] leading-5 text-white/35">Review серій сам по собі не переводить аніме у DRAFT, якщо main.json вже містить довірені серії. DRAFT визначається проблемами метаданих.</p></div>
                                <Button color={record.status === "READY" ? "green" : "primary"} onClick={handleImport} disabled={!record.canImport || importState.isLoading} className="w-full sm:w-auto">
                                    {importState.isLoading ? <Loader2 className="animate-spin" size={16} /> : <Import size={16} />}
                                    {record.status === "READY" ? "Імпортувати" : "Імпортувати як DRAFT"}
                                </Button>
                            </div>
                        </section>
                    </div>
                )}
            </aside>
        </div>
    );
}

function RecordHero({ record }: { record: AnimeImportRecordDetail }) {
    return (
        <div className="flex gap-3 rounded-xl border border-white/[0.045] bg-[#11171c] p-3">
            <div className="h-[112px] w-[78px] shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">{record.poster ? <img src={record.poster} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-white/20"><FileWarning /></div>}</div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2"><StatusBadge status={record.status} /><SourceDots record={record} /></div>
                <div className="mt-2 text-[16px] font-medium text-white/90">{record.title}</div>
                <div className="mt-1 text-[12px] text-white/35">{record.originalTitle || "originalTitle відсутній"}</div>
                <a href={record.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-(--primary) hover:underline">AniTube <ExternalLink size={12} /></a>
            </div>
        </div>
    );
}

function IssuesBlock({ record, hideEpisodeIssues }: { record: AnimeImportRecordDetail; hideEpisodeIssues?: boolean }) {
    if (!record.issues.length && !record.warnings.length && !record.episodeIssues.length && !record.lastError) return null;
    return (
        <div className="grid gap-3">
            {(record.issues.length > 0 || record.warnings.length > 0 || record.lastError) && (
                <section className="rounded-xl border border-amber-400/12 bg-amber-400/[0.04] p-4">
                    <div className="flex items-center gap-2 text-[14px] font-medium text-amber-100/90"><AlertTriangle size={16} />Проблеми метаданих</div>
                    <div className="mt-3 grid gap-1.5">
                        {record.lastError && <Issue text={record.lastError} danger />}
                        {record.issues.map((issue) => <Issue key={issue} text={issue} />)}
                        {record.warnings.map((warning) => <Issue key={warning} text={warning} warning />)}
                    </div>
                </section>
            )}
            {!hideEpisodeIssues && record.episodeIssues.length > 0 && (
                <section className="rounded-xl border border-violet-400/12 bg-violet-400/[0.035] p-4">
                    <div className="flex items-center gap-2 text-[14px] font-medium text-violet-100/90"><Play size={16} />Окрема перевірка серій</div>
                    <p className="mt-1 text-[12px] leading-5 text-white/35">Ці проблеми не блокують публікацію, якщо в main.json вже є довірені серії.</p>
                    <div className="mt-3 grid gap-1.5">{record.episodeIssues.map((issue) => <Issue key={issue} text={issue} warning />)}</div>
                </section>
            )}
        </div>
    );
}

function Issue({ text, danger, warning }: { text: string; danger?: boolean; warning?: boolean }) {
    return <div className={cn("rounded-lg border px-3 py-2 text-[12px] leading-5", danger ? "border-red-400/10 bg-red-400/[0.04] text-red-100/70" : warning ? "border-sky-400/10 bg-sky-400/[0.035] text-sky-100/60" : "border-white/[0.04] bg-black/[0.08] text-white/55")}>{text}</div>;
}

function MetadataBlock({ record, onError }: { record: AnimeImportRecordDetail; onError?: (value: string | null) => void }) {
    const meta = record.metadata!;
    const [updateMetadata, updateState] = useUpdateAnimeImportMetadataMutation();
    const [editing, setEditing] = useState(false);
    const [description, setDescription] = useState(meta.description ?? "");

    useEffect(() => {
        if (!editing) setDescription(meta.description ?? "");
    }, [meta.description, editing]);

    const rows = [
        ["Тип", meta.type], ["Статус", meta.status], ["Рейтинг", meta.rating], ["Країна", meta.country],
        ["Студія", meta.studio], ["Серій", meta.episodesTotal], ["Тривалість", meta.duration ? `${meta.duration} хв` : null],
    ];

    const saveDescription = async () => {
        try {
            await updateMetadata({ key: record.key, description }).unwrap();
            setEditing(false);
        } catch (error) {
            onError?.(getErrorMessage(error));
        }
    };

    return (
        <section className="rounded-xl border border-white/[0.045] bg-white/[0.018] p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="text-[14px] font-medium text-white/82">Зібрані метадані</div>
                {!editing && <Button variant="secondary" onClick={() => setEditing(true)}>Редагувати опис</Button>}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {rows.map(([label, value]) => <div key={String(label)} className="rounded-lg bg-black/[0.09] p-2.5"><div className="text-[10px] uppercase tracking-wide text-white/25">{label}</div><div className="mt-1 truncate text-[12px] text-white/65">{value ?? "—"}</div></div>)}
            </div>
            {editing ? (
                <div className="mt-3">
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={10}
                        className="w-full resize-y rounded-xl border border-white/[0.07] bg-black/[0.14] px-3 py-2.5 text-[13px] leading-6 text-white/80 outline-none transition placeholder:text-white/20 focus:border-(--primary)/45"
                        placeholder="Український опис аніме…"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => { setDescription(meta.description ?? ""); setEditing(false); }} disabled={updateState.isLoading}>Скасувати</Button>
                        <Button onClick={saveDescription} disabled={updateState.isLoading}>
                            {updateState.isLoading && <Loader2 className="animate-spin" size={16} />}
                            Зберегти опис
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="mt-3 whitespace-pre-wrap text-[12px] leading-5 text-white/42">{meta.description || "Опис відсутній"}</div>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">{meta.genres.map((genre) => <span key={genre} className="rounded-md bg-white/[0.04] px-2 py-1 text-[11px] text-white/45">{genre}</span>)}</div>
        </section>
    );
}

function EpisodeReviewEditor({ record, onError }: { record: AnimeImportRecordDetail; onError: (value: string | null) => void }) {
    const review = record.manualReview;
    if (!review) return (
        <section className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.035] p-4 text-[12px] leading-5 text-emerald-100/60">
            Для цього аніме немає manual-review. Серії з main.json вже готові.
        </section>
    );

    const categories = new Set(review.categories);
    const noAshdi = review.ashdiVideoCount === 0;

    if (review.reviewDone || (!noAshdi && review.unresolvedVideos.length === 0)) {
        return (
            <section className="rounded-xl border border-emerald-400/12 bg-emerald-400/[0.04] p-4">
                <div className="flex items-center gap-2 text-[14px] font-medium text-emerald-100/85"><CheckCircle2 size={16} />Review серій вирішено</div>
                <div className="mt-1 text-[12px] text-white/35">Нерозмічених ASHDI-відео більше немає.</div>
            </section>
        );
    }

    if (noAshdi && categories.has("request-failure")) {
        return <ManualEpisodeAdder record={record} onError={onError} />;
    }

    if (noAshdi) {
        return (
            <section className="rounded-xl border border-orange-400/12 bg-orange-400/[0.04] p-4">
                <div className="flex items-center gap-2 text-[14px] font-medium text-orange-100/85"><FileWarning size={16} />ASHDI-відео відсутні</div>
                <div className="mt-2 flex flex-wrap gap-1.5">{review.categories.map((category) => <CategoryBadge key={category} category={category} />)}</div>
                <p className="mt-3 text-[12px] leading-5 text-white/38">
                    Цей запис винесений в окрему чергу «Без ASHDI-відео». {categories.has("unknown-player") ? "Парсер не визначив плеєр, тому автоматично виправити його неможливо." : "Автоматична розмітка неможлива, поки немає ASHDI endpoint'ів."}
                </p>
            </section>
        );
    }

    return <StructuredEpisodeResolver record={record} onError={onError} />;
}

function StructuredEpisodeResolver({ record, onError }: { record: AnimeImportRecordDetail; onError: (value: string | null) => void }) {
    const review = record.manualReview!;
    const blocks = review.blocks ?? [];
    const { data: teamData } = useGetDubTeamsQuery({ limit: 100, sort: "title" });
    const [resolveReview, resolveState] = useResolveAnimeImportEpisodeReviewMutation();
    const [blockRoles, setBlockRoles] = useState<Record<string, EpisodeReviewBlockRole | "">>(() => defaultBlockRoles(blocks));
    const [fallbackType, setFallbackType] = useState<"" | DubType>("");
    const [fallbackTeamId, setFallbackTeamId] = useState("");
    const [fallbackTeamTitle, setFallbackTeamTitle] = useState("");
    const [typeOverrides, setTypeOverrides] = useState<Record<string, "" | DubType>>({});
    const [teamOverrides, setTeamOverrides] = useState<Record<string, string>>({});
    const [episodeOverrides, setEpisodeOverrides] = useState<Record<string, string>>({});
    const [partSequenceModes, setPartSequenceModes] = useState<Record<string, boolean>>({});
    const [partSequenceStarts, setPartSequenceStarts] = useState<Record<string, string>>({});
    const [duplicateKeep, setDuplicateKeep] = useState<Record<string, string>>({});

    useEffect(() => {
        setBlockRoles(defaultBlockRoles(blocks));
        setFallbackType("");
        setFallbackTeamId("");
        setFallbackTeamTitle("");
        setTypeOverrides({});
        setTeamOverrides({});
        setEpisodeOverrides({});
        setPartSequenceModes({});
        setPartSequenceStarts({});
        setDuplicateKeep({});
    }, [record.key]);

    const setRole = (index: number, role: EpisodeReviewBlockRole | "") => {
        setBlockRoles((current) => {
            const next = { ...current };
            if (role === "type" || role === "team" || role === "player") {
                for (const key of Object.keys(next)) {
                    if (next[key] === role) next[key] = "";
                }
            }
            next[String(index)] = role;
            return next;
        });
    };

    const typeBlock = blocks.find((block) => blockRoles[String(block.index)] === "type") ?? null;
    const teamBlock = blocks.find((block) => blockRoles[String(block.index)] === "team") ?? null;
    const guide = episodeGuide(review.categories, blocks.length);

    const preview = useMemo(() => buildEpisodePreview({
        videos: review.unresolvedVideos,
        blocks,
        blockRoles,
        fallbackType,
        fallbackTeam: fallbackTeamTitle.trim() || teamData?.items.find((item) => String(item.id) === fallbackTeamId)?.title || "",
        typeOverrides,
        teamOverrides,
        episodeOverrides,
        partSequenceModes,
        partSequenceStarts,
    }), [review.unresolvedVideos, blocks, blockRoles, fallbackType, fallbackTeamTitle, fallbackTeamId, teamData, typeOverrides, teamOverrides, episodeOverrides, partSequenceModes, partSequenceStarts]);

    const unresolvedDuplicateSelection = preview.duplicates.some((group) => !duplicateKeep[group.key] || !group.videos.some((video) => video.key === duplicateKeep[group.key]));
    const unresolvedPartSequence = preview.partTracks.some((track) => !track.enabled);
    const canApply = preview.missing.length === 0 && !unresolvedDuplicateSelection && !unresolvedPartSequence && preview.resolved.length > 0;

    const apply = async () => {
        const excludedVideoKeys: string[] = [];
        for (const group of preview.duplicates) {
            const keep = duplicateKeep[group.key];
            for (const video of group.videos) if (video.key !== keep) excludedVideoKeys.push(video.key);
        }
        const normalizedRoles: Record<string, EpisodeReviewBlockRole | null> = {};
        for (const block of blocks) normalizedRoles[String(block.index)] = blockRoles[String(block.index)] || null;
        const normalizedTypes: Record<string, DubType | null> = {};
        for (const [key, value] of Object.entries(typeOverrides)) normalizedTypes[key] = value || null;
        const normalizedTeams: Record<string, { title: string } | null> = {};
        for (const [key, value] of Object.entries(teamOverrides)) { const title = String(value ?? "").trim(); if (title) normalizedTeams[key] = { title }; }
        const normalizedEpisodeOverrides: Record<string, number | null> = {};
        // Send the final preview numbering, not only manually entered numbers. This
        // makes part expansion (1 ч.1 -> 1, 1 ч.2 -> 2, 2 ч.1 -> 3...) identical
        // on the backend and keeps the transformation scoped to this type/team track.
        for (const item of preview.resolved) normalizedEpisodeOverrides[item.key] = item.episode;

        try {
            await resolveReview({
                key: record.key,
                blockRoles: normalizedRoles,
                typeOverrides: normalizedTypes,
                teamOverrides: normalizedTeams,
                fallbackType: fallbackType || null,
                fallbackTeamId: fallbackTeamTitle.trim() ? null : (fallbackTeamId ? Number(fallbackTeamId) : null),
                fallbackTeamTitle: fallbackTeamTitle.trim() || null,
                episodeOverrides: normalizedEpisodeOverrides,
                excludedVideoKeys,
            }).unwrap();
        } catch (error) {
            onError(getErrorMessage(error));
        }
    };

    return (
        <section className="rounded-xl border border-violet-400/14 bg-violet-400/[0.035] p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[15px] font-medium text-violet-50/90">Розв’язання review серій</div>
                    <p className="mt-1 text-[12px] leading-5 text-white/40">{guide}</p>
                </div>
                <span className="shrink-0 rounded-md bg-violet-400/[0.08] px-2 py-1 text-[11px] text-violet-100/65">{review.unresolvedVideos.length} відео</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">{review.categories.map((category) => <CategoryBadge key={category} category={category} />)}</div>
            {review.teamHints.length > 0 && <div className="mt-2 text-[11px] leading-5 text-white/34">Підказки команд: <span className="text-white/55">{review.teamHints.join(", ")}</span></div>}

            {blocks.length === 0 ? (
                <div className="mt-4 rounded-xl border border-white/[0.045] bg-black/[0.08] p-3 text-[12px] leading-5 text-white/42">
                    Parser blocks відсутні. Просто задайте загальний тип та команду для всіх ASHDI-відео нижче.
                </div>
            ) : (
                <div className="mt-4 grid gap-3">
                    {blocks.map((block) => (
                        <ReviewBlockCard
                            key={block.index}
                            block={block}
                            role={blockRoles[String(block.index)] ?? ""}
                            onRole={(value) => setRole(block.index, value)}
                            typeOverrides={typeOverrides}
                            onTypeOverride={(key, value) => setTypeOverrides((current) => ({ ...current, [key]: value }))}
                            teamOverrides={teamOverrides}
                            onTeamOverride={(key, value) => setTeamOverrides((current) => ({ ...current, [key]: value }))}
                        />
                    ))}
                </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {!typeBlock && (
                    <FieldCard title="Тип для всіх нерозмічених відео" hint="Потрібно, якщо немає блока типу.">
                        <Select
                            value={fallbackType}
                            options={[
                                { value: "", label: "Оберіть DUB / SUB" },
                                { value: DubType.DUB, label: "Озвучення (DUB)" },
                                { value: DubType.SUB, label: "Субтитри (SUB)" },
                            ]}
                            onChange={setFallbackType}
                            className="w-full"
                        />
                    </FieldCard>
                )}
                {!teamBlock && (
                    <FieldCard title="Команда для всіх нерозмічених відео" hint="Можна вибрати існуючу або ввести нову назву.">
                        <div className="grid gap-2">
                            <Select
                                value={fallbackTeamId}
                                options={[
                                    { value: "", label: "Оберіть існуючу команду" },
                                    ...(teamData?.items ?? []).map((item) => ({ value: String(item.id), label: item.title })),
                                ]}
                                onChange={(value) => { setFallbackTeamId(value); if (value) setFallbackTeamTitle(""); }}
                                className="w-full"
                            />
                            <Input
                                value={fallbackTeamTitle}
                                onChange={(event) => { setFallbackTeamTitle(event.target.value); if (event.target.value) setFallbackTeamId(""); }}
                                placeholder="Або введіть назву нової команди"
                            />
                        </div>
                    </FieldCard>
                )}
            </div>

            {preview.needsEpisodeNumber.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-400/12 bg-amber-400/[0.035] p-3">
                    <div className="text-[13px] font-medium text-amber-100/80">Не вдалося прочитати номер серії</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/32">Для цих label номер потрібно вказати вручну. Дробові номери, SPECIAL та labels-діапазони навмисно не обрізаються до першого цілого числа.</p>
                    <div className="mt-3 grid gap-2">
                        {preview.needsEpisodeNumber.map((video) => (
                            <div key={video.key} className="grid gap-2 rounded-lg bg-black/[0.08] p-2.5 sm:grid-cols-[minmax(0,1fr)_120px] sm:items-center">
                                <div className="min-w-0"><div className="truncate text-[12px] text-white/62">{video.label || "без label"}</div><div className="truncate text-[10px] text-white/25">{video.file}</div></div>
                                <EpisodeNumberEditor
                                    value={episodeOverrides[video.key] ?? ""}
                                    onCommit={(value) => setEpisodeOverrides((current) => {
                                        const next = { ...current };
                                        if (value) next[video.key] = value;
                                        else delete next[video.key];
                                        return next;
                                    })}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {preview.partTracks.length > 0 && (
                <div className="mt-4 rounded-xl border border-sky-400/14 bg-sky-400/[0.035] p-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="text-[13px] font-medium text-sky-100/85">Знайдено серії, розбиті на частини</div>
                            <p className="mt-1 text-[11px] leading-4 text-white/34">
                                Позначки на кшталт «1 серія (ч.1)» і «1 серія (ч.2)» — не дублікати. Для кожної команди/типу вони розгортаються у власну послідовність, не змінюючи інші доріжки.
                            </p>
                        </div>
                        <span className="shrink-0 rounded-md bg-sky-400/[0.08] px-2 py-1 text-[10px] text-sky-100/60">{preview.partTracks.length} доріжок</span>
                    </div>

                    <div className="mt-3 grid gap-3">
                        {preview.partTracks.map((track) => (
                            <div key={track.key} className="rounded-lg border border-white/[0.045] bg-black/[0.09] p-3">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="text-[12px] font-medium text-white/65">{track.type} · {track.team}</div>
                                        <div className="mt-1 text-[10px] leading-4 text-white/30">
                                            {track.partVideos} відео з частинами · частини трапляються до серії {track.splitThroughEpisode} · після розгортання {track.outputEpisodes} серій
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setPartSequenceModes((current) => ({ ...current, [track.key]: !track.enabled }))}
                                        className={cn(
                                            "shrink-0 rounded-lg border px-3 py-2 text-[11px] transition",
                                            track.enabled
                                                ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-200/80"
                                                : "border-amber-400/20 bg-amber-400/[0.07] text-amber-100/70",
                                        )}
                                    >
                                        {track.enabled ? "Розгортання увімкнено" : "Увімкнути розгортання"}
                                    </button>
                                </div>

                                {track.enabled && (
                                    <div className="mt-3 grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
                                        <div>
                                            <div className="mb-1.5 text-[10px] text-white/30">Почати з серії</div>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={partSequenceStarts[track.key] ?? "1"}
                                                onChange={(event) => setPartSequenceStarts((current) => ({ ...current, [track.key]: event.target.value }))}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="mb-1.5 text-[10px] text-white/30">Попередній перегляд нової нумерації</div>
                                            <div className="max-h-36 overflow-y-auto rounded-lg border border-white/[0.035] bg-black/[0.08] p-2">
                                                <div className="grid gap-1">
                                                    {track.mapping.map((item, index) => (
                                                        <div key={`${track.key}-${index}-${item.label}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-[10px] leading-4">
                                                            <span className="truncate text-white/38">{item.label || `Серія ${item.originalEpisode}${item.part ? ` · ч.${item.part}` : ""}`}</span>
                                                            <span className="whitespace-nowrap text-sky-100/65">→ {item.episode} серія</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {track.mapping.length < track.outputEpisodes && (
                                                <div className="mt-1 text-[10px] text-white/23">Показано перші {track.mapping.length} з {track.outputEpisodes} позицій.</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {!track.enabled && (
                                    <div className="mt-2 text-[10px] leading-4 text-amber-100/55">
                                        Застосування заблоковано, доки для цієї доріжки не ввімкнено розгортання частин.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {preview.duplicates.length > 0 && (
                <div className="mt-4 rounded-xl border border-red-400/12 bg-red-400/[0.035] p-3">
                    <div className="text-[13px] font-medium text-red-100/80">Справжній дубль одного варіанта серії</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/32">Частини серій сюди більше не потрапляють. Тут показуються лише кілька endpoint'ів з однаковими номером, типом, командою та тією самою частиною. Виберіть один, решта будуть пропущені.</p>
                    <div className="mt-3 grid gap-3">
                        {preview.duplicates.map((group) => (
                            <div key={group.key} className="rounded-lg border border-white/[0.04] bg-black/[0.08] p-3">
                                <div className="text-[12px] font-medium text-white/60">Серія {group.episode} · {group.type} · {group.team}</div>
                                <div className="mt-2 grid gap-1.5">
                                    {group.videos.map((video) => (
                                        <label key={video.key} className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/[0.035] bg-white/[0.015] p-2.5 hover:bg-white/[0.035]">
                                            <input
                                                type="radio"
                                                name={`dup-${group.key}`}
                                                checked={duplicateKeep[group.key] === video.key}
                                                onChange={() => setDuplicateKeep((current) => ({ ...current, [group.key]: video.key }))}
                                                className="mt-0.5"
                                            />
                                            <span className="min-w-0"><span className="block text-[11px] text-white/55">{video.label}</span><span className="block break-all text-[10px] text-white/27">{video.file}</span></span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-4 grid gap-2 rounded-xl border border-white/[0.045] bg-black/[0.08] p-3 sm:grid-cols-3">
                <PreviewStat label="Готові до створення" value={preview.resolved.length} good />
                <PreviewStat label="Не вистачає даних" value={preview.missing.length} bad={preview.missing.length > 0} />
                <PreviewStat label="Груп дублікатів" value={preview.duplicates.length} bad={preview.duplicates.length > 0} />
            </div>
            {preview.missing.length > 0 && (
                <div className="mt-2 text-[11px] leading-5 text-amber-100/50">
                    Перші проблеми: {preview.missing.slice(0, 4).map((item) => item.reason).join("; ")}
                </div>
            )}

            <Button className="mt-4 w-full" onClick={apply} disabled={!canApply || resolveState.isLoading}>
                {resolveState.isLoading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                Автоматично побудувати варіанти серій
            </Button>
        </section>
    );
}

function ReviewBlockCard({ block, role, onRole, typeOverrides, onTypeOverride, teamOverrides, onTeamOverride }: {
    block: AnimeImportReviewBlock;
    role: EpisodeReviewBlockRole | "";
    onRole: (value: EpisodeReviewBlockRole | "") => void;
    typeOverrides: Record<string, "" | DubType>;
    onTypeOverride: (key: string, value: "" | DubType) => void;
    teamOverrides: Record<string, string>;
    onTeamOverride: (key: string, value: string) => void;
}) {
    const confidence = typeof block.confidence === "number" ? `${Math.round(block.confidence * 100)}%` : "—";
    return (
        <div className="rounded-xl border border-white/[0.05] bg-[#11171c] p-3">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-start">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-medium text-white/70">Блок #{block.index + 1}</span>
                        {block.role && <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/35">parser: {block.role} · {confidence}</span>}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {block.options.map((option) => <span key={option.id} className="rounded-md border border-white/[0.04] bg-black/[0.08] px-2 py-1 text-[11px] text-white/48">{option.label}</span>)}
                    </div>
                </div>
                <Select
                    value={role}
                    options={[
                        { value: "", label: "Оберіть роль блока" },
                        { value: "type", label: "Тип: DUB / SUB" },
                        { value: "team", label: "Команда озвучення" },
                        { value: "player", label: "Плеєр" },
                        { value: "range", label: "Діапазон серій" },
                        { value: "ignore", label: "Ігнорувати блок" },
                    ]}
                    onChange={onRole}
                    className="w-full"
                />
            </div>

            {role === "type" && (
                <div className="mt-3 grid gap-2 border-t border-white/[0.04] pt-3">
                    <div className="text-[11px] text-white/32">Для кожної опції уточніть DUB/SUB. Нормальні назви підставляються автоматично.</div>
                    {block.options.map((option) => {
                        const key = reviewOptionKey(block.index, option.id);
                        const recognized = classifyClientTypeLabel(option.label);
                        const value = typeOverrides[key] ?? recognized ?? "";
                        return (
                            <div key={option.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_210px] sm:items-center">
                                <div className="truncate text-[12px] text-white/55">{option.label}</div>
                                <Select
                                    value={value}
                                    options={[
                                        { value: "", label: "Уточнити тип" },
                                        { value: DubType.DUB, label: "Озвучення (DUB)" },
                                        { value: DubType.SUB, label: "Субтитри (SUB)" },
                                    ]}
                                    onChange={(next) => onTypeOverride(key, next)}
                                    className="w-full"
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {role === "team" && (
                <div className="mt-3 grid gap-2 border-t border-white/[0.04] pt-3">
                    <div className="text-[11px] leading-4 text-white/32">Кожна опція стане командою озвучення. Якщо назва неправильна — введіть заміну; якщо поле порожнє, команда буде знайдена/створена за label.</div>
                    {block.options.map((option) => {
                        const key = reviewOptionKey(block.index, option.id);
                        return (
                            <div key={option.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_260px] sm:items-center">
                                <div className="truncate text-[12px] text-white/55">{option.label}</div>
                                <Input value={teamOverrides[key] ?? ""} onChange={(event) => onTeamOverride(key, event.target.value)} placeholder={`Залишити «${option.label}»`} />
                            </div>
                        );
                    })}
                </div>
            )}

            {role === "player" && <div className="mt-3 border-t border-white/[0.04] pt-3 text-[11px] leading-4 text-white/30">Для ashdiVideos плеєр уже відомий: Ashdi. Цей блок потрібен лише щоб правильно відокремити його від type/team.</div>}
            {role === "range" && (
                <div className="mt-3 border-t border-sky-400/[0.08] pt-3 text-[11px] leading-4 text-sky-100/45">
                    Це навігаційний блок AniTube з діапазонами серій. Він не створює тип, команду чи плеєр, але залишається частиною ієрархії ID, тому resolver враховує його позицію при зіставленні video з іншими блоками.
                </div>
            )}
        </div>
    );
}

function EpisodeNumberEditor({ value, onCommit }: { value: string; onCommit: (value: string) => void }) {
    const [draft, setDraft] = useState(value);

    useEffect(() => {
        setDraft(value);
    }, [value]);

    const commit = () => {
        const parsed = Math.trunc(Number(draft));
        onCommit(Number.isFinite(parsed) && parsed > 0 ? String(parsed) : "");
    };

    return (
        <Input
            type="number"
            min={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
                if (event.key === "Escape") {
                    event.preventDefault();
                    setDraft(value);
                }
            }}
            placeholder="№ серії"
            title="Номер застосовується після Enter або виходу з поля"
        />
    );
}

function FieldCard({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
    return (
        <div className="rounded-xl border border-white/[0.045] bg-[#11171c] p-3">
            <div className="text-[12px] font-medium text-white/58">{title}</div>
            <div className="mt-0.5 text-[10px] leading-4 text-white/28">{hint}</div>
            <div className="mt-3">{children}</div>
        </div>
    );
}

function PreviewStat({ label, value, good, bad }: { label: string; value: number; good?: boolean; bad?: boolean }) {
    return <div><div className="text-[10px] uppercase tracking-wide text-white/25">{label}</div><div className={cn("mt-1 text-[18px] font-medium text-white/70", good && "text-emerald-200/75", bad && "text-red-200/75")}>{value}</div></div>;
}

function ManualEpisodeAdder({ record, onError }: { record: AnimeImportRecordDetail; onError: (value: string | null) => void }) {
    const { data: playerData } = useGetPlayersQuery({ limit: 100, sort: "title" });
    const { data: teamData } = useGetDubTeamsQuery({ limit: 100, sort: "title" });
    const [addEpisodes, addState] = useAddAnimeImportManualEpisodesMutation();
    const [playerId, setPlayerId] = useState("");
    const [teamId, setTeamId] = useState("");
    const [teamTitle, setTeamTitle] = useState("");
    const [dubType, setDubType] = useState<DubType>(DubType.DUB);
    const [startEpisode, setStartEpisode] = useState("1");
    const [text, setText] = useState("");

    useEffect(() => {
        if (playerId || !playerData?.items?.length) return;
        const ashdi = playerData.items.find((item) => item.title.trim().toLowerCase() === "ashdi");
        if (ashdi) setPlayerId(String(ashdi.id));
    }, [playerData, playerId]);

    const parsed = useMemo(() => parseManualEpisodeLines(text, Number(startEpisode) || 1), [text, startEpisode]);

    const submit = async (markReviewDone: boolean) => {
        try {
            await addEpisodes({
                key: record.key,
                dubType,
                playerId: playerId ? Number(playerId) : null,
                playerTitle: playerId ? null : "Ashdi",
                dubTeamId: teamTitle.trim() ? null : (teamId ? Number(teamId) : null),
                dubTeamTitle: teamTitle.trim() || null,
                episodes: parsed,
                markReviewDone,
            }).unwrap();
            setText("");
        } catch (error) {
            onError(getErrorMessage(error));
        }
    };

    return (
        <section className="rounded-xl border border-orange-400/14 bg-orange-400/[0.035] p-4">
            <div className="text-[15px] font-medium text-orange-50/90">request-failure: додати серії вручну</div>
            <p className="mt-1 text-[12px] leading-5 text-white/38">Парсер не отримав playlist. Встав знайдені endpoint'и вручну. Один URL на рядок або формат <code className="text-white/55">12 https://...</code>.</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{record.manualReview?.categories.map((category) => <CategoryBadge key={category} category={category} />)}</div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Select value={dubType} options={[{ value: DubType.DUB, label: "Озвучення (DUB)" }, { value: DubType.SUB, label: "Субтитри (SUB)" }]} onChange={setDubType} className="w-full" />
                <Input type="number" min={1} value={startEpisode} onChange={(event) => setStartEpisode(event.target.value)} placeholder="Перша серія" />
                <Select value={playerId} options={[{ value: "", label: "Ashdi / створити автоматично" }, ...(playerData?.items ?? []).map((item) => ({ value: String(item.id), label: item.title }))]} onChange={setPlayerId} className="w-full" />
                <Select value={teamId} options={[{ value: "", label: "Оберіть існуючу команду" }, ...(teamData?.items ?? []).map((item) => ({ value: String(item.id), label: item.title }))]} onChange={(value) => { setTeamId(value); if (value) setTeamTitle(""); }} className="w-full" />
            </div>
            <Input className="mt-2" value={teamTitle} onChange={(event) => { setTeamTitle(event.target.value); if (event.target.value) setTeamId(""); }} placeholder="Або введіть нову команду озвучення" />
            <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={8}
                className="mt-2 w-full resize-y rounded-xl border border-white/[0.07] bg-black/[0.14] px-3 py-2.5 font-mono text-[12px] leading-5 text-white/75 outline-none transition placeholder:text-white/20 focus:border-(--primary)/45"
                placeholder={'https://ashdi.vip/vod/123\nhttps://ashdi.vip/vod/124\nабо\n15 https://ashdi.vip/vod/999'}
            />
            <div className="mt-2 text-[11px] text-white/30">Розпізнано серій: {parsed.length}</div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => submit(false)} disabled={!parsed.length || (!teamId && !teamTitle.trim()) || addState.isLoading} className="flex-1">
                    {addState.isLoading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Додати серії
                </Button>
                <Button color="green" onClick={() => submit(true)} disabled={!parsed.length || (!teamId && !teamTitle.trim()) || addState.isLoading} className="flex-1">
                    <CheckCircle2 size={16} /> Додати й закрити review
                </Button>
            </div>
        </section>
    );
}

type EpisodePreviewCandidate = {
    key: string;
    label: string;
    file: string;
    episode: number;
    originalEpisode: number;
    part: number | null;
    type: DubType;
    team: string;
    trackKey: string;
};

type EpisodePartTrack = {
    key: string;
    type: DubType;
    team: string;
    enabled: boolean;
    startEpisode: number;
    partVideos: number;
    splitThroughEpisode: number;
    outputEpisodes: number;
    mapping: Array<{
        label: string;
        originalEpisode: number;
        part: number | null;
        episode: number;
    }>;
};

type EpisodePreview = {
    resolved: EpisodePreviewCandidate[];
    missing: Array<{ key: string; reason: string }>;
    needsEpisodeNumber: AnimeImportManualVideo[];
    duplicates: Array<{ key: string; episode: number; type: DubType; team: string; videos: EpisodePreviewCandidate[] }>;
    partTracks: EpisodePartTrack[];
};

function buildEpisodePreview(input: {
    videos: AnimeImportManualVideo[];
    blocks: AnimeImportReviewBlock[];
    blockRoles: Record<string, EpisodeReviewBlockRole | "">;
    fallbackType: "" | DubType;
    fallbackTeam: string;
    typeOverrides: Record<string, "" | DubType>;
    teamOverrides: Record<string, string>;
    episodeOverrides: Record<string, string>;
    partSequenceModes: Record<string, boolean>;
    partSequenceStarts: Record<string, string>;
}): EpisodePreview {
    const typeBlock = input.blocks.find((block) => input.blockRoles[String(block.index)] === "type") ?? null;
    const teamBlock = input.blocks.find((block) => input.blockRoles[String(block.index)] === "team") ?? null;
    const rangeBlocks = input.blocks.filter((block) => input.blockRoles[String(block.index)] === "range");
    const baseResolved: EpisodePreviewCandidate[] = [];
    const missing: Array<{ key: string; reason: string }> = [];
    const needsEpisodeNumber: AnimeImportManualVideo[] = [];

    for (const video of input.videos) {
        let type: DubType | null = input.fallbackType || null;
        let team = input.fallbackTeam.trim();

        const unmatchedRangeBlock = rangeBlocks.find((block) => !findVideoOption(video, block));
        if (unmatchedRangeBlock) {
            missing.push({ key: video.key, reason: `${video.label || video.key}: не знайдено діапазон у блоці #${unmatchedRangeBlock.index + 1}` });
            continue;
        }

        if (typeBlock) {
            const option = findVideoOption(video, typeBlock);
            if (!option) {
                missing.push({ key: video.key, reason: `${video.label || video.key}: не знайдено опцію блока типу` });
                continue;
            }
            type = input.typeOverrides[reviewOptionKey(typeBlock.index, option.id)] || classifyClientTypeLabel(option.label);
            if (!type) {
                missing.push({ key: video.key, reason: `Уточни DUB/SUB для «${option.label}»` });
                continue;
            }
        }

        if (teamBlock) {
            const option = findVideoOption(video, teamBlock);
            if (!option) {
                missing.push({ key: video.key, reason: `${video.label || video.key}: не знайдено опцію блока команд` });
                continue;
            }
            team = input.teamOverrides[reviewOptionKey(teamBlock.index, option.id)]?.trim() || option.label;
        }

        if (!type) {
            missing.push({ key: video.key, reason: "Не вибрано тип DUB/SUB" });
            continue;
        }
        if (!team) {
            missing.push({ key: video.key, reason: "Не вибрано команду озвучення" });
            continue;
        }

        const explicitEpisode = Number(input.episodeOverrides[video.key] ?? 0);
        const originalEpisode = explicitEpisode > 0 ? explicitEpisode : parseEpisodeNumber(video.label);
        if (!originalEpisode) {
            needsEpisodeNumber.push(video);
            missing.push({ key: video.key, reason: `Не визначено номер для «${video.label || "без label"}»` });
            continue;
        }

        const normalizedTeam = normalizeSimple(team);
        const trackKey = `${type}:${normalizedTeam}`;
        baseResolved.push({
            key: video.key,
            label: String(video.label ?? ""),
            file: String(video.file ?? ""),
            episode: originalEpisode,
            originalEpisode,
            part: parseEpisodePart(video.label),
            type,
            team,
            trackKey,
        });
    }

    const resolved = baseResolved.map((item) => ({ ...item }));
    const byTrack = new Map<string, EpisodePreviewCandidate[]>();
    for (const item of resolved) {
        const group = byTrack.get(item.trackKey) ?? [];
        group.push(item);
        byTrack.set(item.trackKey, group);
    }

    const partTracks: EpisodePartTrack[] = [];
    for (const [trackKey, items] of byTrack) {
        const partItems = items.filter((item) => item.part !== null);
        if (!partItems.length) continue;

        // A slot is one logical output episode. Different parts of the same source
        // episode are different slots, while two endpoints with exactly the same
        // source episode + part stay in one slot and remain a real duplicate.
        const slots = new Map<string, EpisodePreviewCandidate[]>();
        for (const item of items) {
            const slotKey = `${item.originalEpisode}:${item.part ?? "full"}`;
            const slot = slots.get(slotKey) ?? [];
            slot.push(item);
            slots.set(slotKey, slot);
        }
        const orderedSlots = [...slots.values()].sort((left, right) => {
            const a = left[0];
            const b = right[0];
            if (a.originalEpisode !== b.originalEpisode) return a.originalEpisode - b.originalEpisode;
            // If a malformed layout contains both a full episode and parts for the
            // same number, keep the full item first and parts in their numeric order.
            const aPart = a.part ?? 0;
            const bPart = b.part ?? 0;
            return aPart - bPart;
        });

        // Part expansion is enabled by default when parser labels explicitly contain
        // "ч." / "частина" / "part". The admin can turn it off to inspect the raw
        // numbering, but applying is blocked until the track is expanded.
        const enabled = input.partSequenceModes[trackKey] !== false;
        const configuredStart = Number(input.partSequenceStarts[trackKey] ?? 1);
        const startEpisode = configuredStart > 0 ? configuredStart : 1;

        if (enabled) {
            orderedSlots.forEach((slot, index) => {
                const episode = startEpisode + index;
                for (const item of slot) item.episode = episode;
            });
        }

        const splitThroughEpisode = Math.max(...partItems.map((item) => item.originalEpisode));
        partTracks.push({
            key: trackKey,
            type: items[0].type,
            team: items[0].team,
            enabled,
            startEpisode,
            partVideos: partItems.length,
            splitThroughEpisode,
            outputEpisodes: orderedSlots.length,
            mapping: orderedSlots.slice(0, 14).map((slot, index) => ({
                label: slot[0].label,
                originalEpisode: slot[0].originalEpisode,
                part: slot[0].part,
                episode: enabled ? startEpisode + index : slot[0].originalEpisode,
            })),
        });
    }

    const groups = new Map<string, EpisodePreviewCandidate[]>();
    for (const item of resolved) {
        const key = `${item.episode}:${item.type}:${normalizeSimple(item.team)}`;
        const group = groups.get(key) ?? [];
        group.push(item);
        groups.set(key, group);
    }
    const duplicates = [...groups.entries()]
        .filter(([, items]) => {
            if (items.length <= 1) return false;
            // When expansion is disabled, 1 ч.1 + 1 ч.2 must not be called a
            // duplicate. It is an unresolved part-sequence and is handled by the
            // dedicated card above. Same part/full label twice is still a duplicate.
            const parts = new Set(items.map((item) => item.part).filter((part): part is number => part !== null));
            return parts.size <= 1;
        })
        .map(([key, items]) => ({ key, episode: items[0].episode, type: items[0].type, team: items[0].team, videos: items }));

    return { resolved, missing, needsEpisodeNumber, duplicates, partTracks };
}

function defaultBlockRoles(blocks: AnimeImportReviewBlock[]): Record<string, EpisodeReviewBlockRole | ""> {
    const result: Record<string, EpisodeReviewBlockRole | ""> = {};
    const bestByRole = new Map<string, AnimeImportReviewBlock>();
    for (const block of blocks) {
        const role = block.role;
        const confidence = Number(block.confidence ?? 0);
        if (!role || !["type", "team", "player"].includes(role) || confidence < 0.75) continue;
        const previous = bestByRole.get(role);
        if (!previous || Number(previous.confidence ?? 0) < confidence) bestByRole.set(role, block);
    }
    for (const block of blocks) {
        result[String(block.index)] = looksLikeEpisodeRangeBlock(block) ? "range" : "";
    }
    for (const [role, block] of bestByRole) {
        const key = String(block.index);
        // Navigation/range blocks are structural. Do not let a mistaken parser role
        // override an obvious episode-range block (One Piece is a common example).
        if (result[key] !== "range") result[key] = role as EpisodeReviewBlockRole;
    }
    return result;
}

function normalizeRangeLabel(value: string) {
    return value
        .normalize("NFKC")
        .replace(/[\u00A0\u202F]/g, " ")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/[‐‑‒–—―−﹘﹣－]/g, "-")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

function looksLikeEpisodeRangeBlock(block: AnimeImportReviewBlock) {
    const labels = (block.options ?? [])
        .map((option) => normalizeRangeLabel(String(option.label ?? "")))
        .filter(Boolean);
    if (labels.length < 2) return false;

    // Keep the suffix intentionally tolerant: AniTube contains spelling variants
    // such as «серія», «серії», «серій», Russian variants and occasional dots.
    const episodeWord = String.raw`(?:сер(?:\p{L}+)?\.?|епізод(?:\p{L}+)?\.?|episode(?:s)?\.?|ep\.?)`;
    const rangePattern = new RegExp(String.raw`^\d{1,4}\s*-\s*\d{1,4}(?:\s*${episodeWord})?$`, "iu");
    const singlePattern = new RegExp(String.raw`^\d{1,4}\s*${episodeWord}$`, "iu");

    const rangeCount = labels.filter((label) => rangePattern.test(label)).length;
    const matching = labels.filter((label) => rangePattern.test(label) || singlePattern.test(label)).length;

    // A range block may contain a few malformed/legacy labels, so requiring 60%
    // was too strict for some long-running titles. Multiple explicit intervals are
    // already strong evidence that the block is pagination/navigation.
    return rangeCount >= 3 || matching >= Math.max(2, Math.ceil(labels.length * 0.45));
}

function findVideoOption(video: AnimeImportManualVideo, block: AnimeImportReviewBlock) {
    const ancestor = video.ancestors?.find((item) => Number(item.blockIndex) === Number(block.index));
    if (ancestor?.optionId) {
        return block.options.find((option) => String(option.id) === String(ancestor.optionId)) ?? { id: String(ancestor.optionId), label: ancestor.label ?? String(ancestor.optionId) };
    }
    const id = String(video.id ?? "");
    if (!id) return null;
    return [...block.options]
        .filter((option) => id === option.id || id.startsWith(`${option.id}_`))
        .sort((a, b) => b.id.length - a.id.length)[0] ?? null;
}

function classifyClientTypeLabel(label: string): DubType | null {
    const value = normalizeSimple(label).replace(/[()[\]{}.,:;!?"'`]/g, " ").replace(/\s+/g, " ").trim();
    const dub = new Set(["озвучення", "озвучка", "дубляж", "дуб", "dub", "dubbed", "voice", "озвучення українською"]);
    const sub = new Set(["субтитри", "субтитры", "субтитр", "sub", "subs", "subtitle", "subtitles", "українські субтитри"]);
    if (dub.has(value)) return DubType.DUB;
    if (sub.has(value)) return DubType.SUB;
    return null;
}

function parseEpisodeNumber(label: string | null | undefined) {
    const value = String(label ?? "").replace(/\u00a0/g, " ").trim();
    if (!value) return null;

    // Do not silently truncate fractional/special/range labels. One Piece contains
    // labels such as `1004.5 серія`, `1061,5 серія`, `SPECIAL 4` and `602-625`.
    // Treating them as 1004/1061/4/602 creates fake duplicate groups and can make
    // the admin accidentally discard a valid endpoint. These cases must be given
    // an explicit integer number by the admin because Episode.number is an Int.
    if (/\d+[.,]\d+/u.test(value)) return null;
    if (/^\d{1,5}\s*[-–—−]\s*\d{1,5}(?:\s+.*)?$/u.test(value)) return null;
    if (/\bspecial\b/iu.test(value)) return null;

    // Normal parser labels start with the episode number. Keep support for labels
    // such as `1 серія (ч.2)` while refusing to fish a random number out of text.
    const match = value.match(/^(\d{1,5})(?=\s|$)/u);
    const number = match ? Number(match[1]) : 0;
    return Number.isInteger(number) && number > 0 ? number : null;
}

function parseEpisodePart(label: string | null | undefined) {
    const value = String(label ?? "");
    const patterns = [
        /(?:\(|)ч\.?\s*[:№#.-]?\s*(\d{1,3})(?:\)|)/iu,
        /част(?:ина|ь)?\s*[:№#.-]?\s*(\d{1,3})/iu,
        /part\s*[:№#.-]?\s*(\d{1,3})/iu,
        /pt\.?\s*[:№#.-]?\s*(\d{1,3})/iu,
    ];
    for (const pattern of patterns) {
        const match = value.match(pattern);
        const part = match ? Number(match[1]) : 0;
        if (part > 0) return part;
    }
    return null;
}

function reviewOptionKey(blockIndex: number, optionId: string) {
    return `${blockIndex}:${optionId}`;
}

function episodeGuide(categories: string[], blockCount: number) {
    const set = new Set(categories);
    if (set.has("strange-layout")) {
        if (blockCount === 0) return "Немає blocks: вкажи загальний DUB/SUB та команду. Після цього номери серій будуть взяті з label автоматично.";
        if (blockCount === 1) return "Визнач, чим є єдиний блок — типом, командою або плеєром. Те, чого не вистачає, з’явиться нижче як ручне поле.";
        return "Вкажи, який блок є типом, а який — командами. Для дивних опцій типу (наприклад «СУБТИТИ») явно вибери SUB. Далі endpoint'и зіставляться по префіксах id автоматично.";
    }
    if (set.has("episode-or-type-label")) return "Признач блоки type/team. Невідомі labels типу уточни як DUB/SUB, а для labels серій без числа введи номер вручну. Дублікати одного номера будуть показані окремо.";
    if (set.has("missing-metadata")) {
        if (blockCount === 0) return "Парсер не визначив ані тип, ані команду. Задай обидва значення вручну для всіх ASHDI-відео.";
        if (blockCount === 1) return "Визнач роль єдиного блока. Якщо це player — тип і команду задай вручну; якщо type/team — вручну залишиться тільки друге значення.";
        return "Вкажи блок type та блок team. Якщо потрібного блока немає, не призначай його — нижче з’явиться ручне поле.";
    }
    if (set.has("missing-type")) return "Командний блок з високою впевненістю вже підставлений, якщо parser його знав. Залишається вибрати блок типу або один загальний DUB/SUB для всіх відео.";
    if (set.has("missing-team")) return blockCount === 1
        ? "Визнач роль єдиного блока та вкажи відсутню команду вручну."
        : "Вкажи, який блок є type, а який team. Якщо team-блока насправді немає — задай одну команду вручну нижче.";
    if (set.has("ambiguous-blocks")) return blockCount === 1
        ? "Parser не впевнений у ролі єдиного блока. Вкажи його роль, а відсутні type/team заповни вручну."
        : "Parser не зміг однозначно призначити ролі blocks. Вибери один type та один team; player для ashdiVideos вже відомий як Ashdi.";
    return "Вкажи ролі blocks та заповни лише ті значення, яких parser не зміг визначити. Endpoint'и будуть розкладені по блоках автоматично.";
}

function parseManualEpisodeLines(text: string, startEpisode: number) {
    let autoEpisode = Math.max(1, startEpisode || 1);
    const result: Array<{ episode: number; link: string }> = [];
    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line) continue;
        const explicit = line.match(/^(\d+)\s*(?:[|;,\t]\s*|\s+)(https?:\/\/\S+)$/i);
        if (explicit) {
            result.push({ episode: Number(explicit[1]), link: explicit[2] });
            autoEpisode = Number(explicit[1]) + 1;
            continue;
        }
        const url = line.match(/https?:\/\/\S+/i)?.[0];
        if (url) {
            result.push({ episode: autoEpisode, link: url });
            autoEpisode += 1;
        }
    }
    return result;
}

function normalizeSimple(value: string) {
    return value.toLowerCase().replace(/ё/g, "е").replace(/’/g, "'").trim();
}

function LoadingBlock({ label }: { label: string }) {
    return <div className="flex min-h-[220px] items-center justify-center gap-2 text-[13px] text-white/38"><Loader2 className="animate-spin" size={18} />{label}</div>;
}
function EmptyWorkspace() {
    return <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.07] bg-[#11171c] p-8 text-center"><FileArchive size={30} className="text-white/18" /><div className="mt-3 text-[15px] text-white/60">Черга імпорту порожня</div><div className="mt-1 max-w-md text-[13px] leading-5 text-white/30">Завантаж results.zip або віднови чергу зі старого storage.</div></div>;
}
function EmptyState({ tab }: { tab: ViewTab }) {
    return <div className="flex min-h-[300px] flex-col items-center justify-center text-center"><CheckCircle2 size={28} className="text-white/15" /><div className="mt-3 text-[14px] text-white/50">Тут поки немає записів</div><div className="mt-1 text-[12px] text-white/28">{tab === "EPISODES" ? "Для поточного фільтра немає review серій." : "Змініть вкладку, фільтр або пошук."}</div></div>;
}

function sumCounts(counts: Record<AnimeImportStatus, number>) { return Object.values(counts).reduce((sum, value) => sum + value, 0); }
function formatDate(value: string) { try { return new Intl.DateTimeFormat("uk-UA", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)); } catch { return value; } }
function getErrorMessage(error: unknown) {
    const data = (error as { data?: unknown })?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
        const message = (data as { message?: unknown }).message;
        if (Array.isArray(message)) return message.join(" ");
        if (typeof message === "string") return message;
    }
    return "Сталася помилка. Перевірте backend logs і повторіть дію.";
}

import type { AnimeRating, AnimeStatus, AnimeType, DubType } from '@/lib/types/entites/anime';

export type AnimeImportStatus =
    | 'PENDING'
    | 'READY'
    | 'REVIEW'
    | 'UNRESOLVED'
    | 'IMPORTED'
    | 'FAILED';

export type EpisodeReviewBlockRole = 'type' | 'team' | 'player' | 'range' | 'ignore';

export interface AnimeImportMappingItem {
    label: string;
    count: number;
    id: number | null;
}

export interface AnimeImportRecordSummary {
    key: string;
    anitubeId: number;
    link: string;
    title: string;
    originalTitle: string | null;
    poster: string | null;
    status: AnimeImportStatus;
    issues: string[];
    warnings: string[];
    episodeIssues: string[];
    reviewReasons: string[];
    resolution: {
        method?: string | null;
        hikkaSlug?: string | null;
        malId?: number | null;
        anilistId?: number | null;
    };
    animeId: number | null;
    importedAsDraft: boolean;
    episodes: {
        variants: number;
        numbers: number;
        trustedVariants: number;
        reviewResolvedVariants: number;
        manualVariants: number;
        manualRemaining: number;
        reviewCategories: string[];
        reviewProblems: unknown[];
        ashdiVideos: number;
        reviewDone: boolean;
    };
    mapped: {
        unresolvedPlayers: number;
        unresolvedDubTeams: number;
    };
    lastError: string | null;
    canImport: boolean;
}

export interface AnimeImportOverview {
    importerVersion?: string;
    resolverVersion?: number;
    uploadedAt: string | null;
    updatedAt: string;
    sourceFilename: string | null;
    counts: Record<AnimeImportStatus, number>;
    progress: {
        metadataDone: number;
        metadataTotal: number;
        pending: number;
    };
    mappings: {
        players: AnimeImportMappingItem[];
        dubTeams: AnimeImportMappingItem[];
    };
    facets: {
        reviewReasons: Array<{ code: string; count: number }>;
        episodeCategories: Array<{ category: string; count: number; workable: number; noAshdi: number; done: number }>;
        episodeBlockCounts: Array<{ blockCount: '3plus' | '2' | '1' | '0'; count: number; workable: number; noAshdi: number; done: number }>;
        episodeReview: {
            workable: number;
            noAshdi: number;
            done: number;
        };
    };
    records: AnimeImportRecordSummary[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface AnimeImportMetadata {
    title: string | null;
    originalTitle: string | null;
    engTitle: string | null;
    poster: string | null;
    rating: AnimeRating | null;
    description: string | null;
    descriptionLanguage: 'uk' | 'en' | null;
    country: string | null;
    genres: string[];
    producers: string[];
    releaseDate: string | null;
    endDate: string | null;
    episodesTotal: number | null;
    duration: number | null;
    type: AnimeType | null;
    status: AnimeStatus | null;
    studio: string | null;
    mal: string | null;
    al: string | null;
}

export interface AnimeImportReviewOption {
    id: string;
    label: string;
    descendantProviders?: string[];
    descendantCount?: number;
    ashdiDescendantCount?: number;
}

export interface AnimeImportReviewBlock {
    index: number;
    role?: 'type' | 'team' | 'player' | 'range' | null;
    confidence?: number | null;
    reason?: string | null;
    scores?: Record<string, number> | null;
    providers?: string[];
    options: AnimeImportReviewOption[];
}

export interface AnimeImportManualVideo {
    key: string;
    id?: string | number;
    label?: string | null;
    file?: string | null;
    provider?: string | null;
    ancestors?: Array<{
        blockIndex?: number;
        optionId?: string;
        label?: string;
        role?: string | null;
        confidence?: number;
    }>;
}

export interface AnimeImportRecordDetail extends AnimeImportRecordSummary {
    parserTitle: string | null;
    metadata: AnimeImportMetadata | null;
    parserEpisodes: Array<{
        episode: number;
        type: DubType;
        link: string;
        player?: string | null;
        dubteam?: string | null;
        source?: 'main' | 'review' | 'manual';
        playerId?: number | null;
        dubTeamId?: number | null;
    }>;
    manualReview: null | {
        source?: string | null;
        playlistError?: unknown;
        categories: string[];
        problems: unknown[];
        ambiguity: unknown[];
        teamHints: string[];
        blocks: AnimeImportReviewBlock[];
        ashdiVideoCount: number;
        reviewDone: boolean;
        unresolvedVideos: AnimeImportManualVideo[];
    };
}

export interface EpisodeReviewResolvePayload {
    key: string;
    blockRoles?: Record<string, EpisodeReviewBlockRole | null>;
    typeOverrides?: Record<string, DubType | null>;
    teamOverrides?: Record<string, { id?: number | null; title?: string | null } | null>;
    fallbackType?: DubType | null;
    fallbackTeamId?: number | null;
    fallbackTeamTitle?: string | null;
    episodeOverrides?: Record<string, number | null>;
    excludedVideoKeys?: string[];
}

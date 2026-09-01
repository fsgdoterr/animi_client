import { animiApi } from '@/lib/store/api/animi';
import type {
    AnimeImportOverview,
    AnimeImportRecordDetail,
    EpisodeReviewResolvePayload,
} from '@/lib/types/anime-import';
import type { DubType } from '@/lib/types/entites/anime';

export interface AnimeImportListParams {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    reviewReason?: string;
    reviewCategory?: string;
    episodeQueue?: 'workable' | 'no-ashdi';
    reviewBlocks?: '' | '3plus' | '2' | '1' | '0';
}

const animeImportEndpoints = animiApi.injectEndpoints({
    endpoints: (builder) => ({
        getAnimeImportOverview: builder.query<AnimeImportOverview, AnimeImportListParams | void>({
            query: (params) => ({
                url: '/anime-import',
                params: {
                    status: params?.status && params.status !== 'ALL' ? params.status : undefined,
                    search: params?.search || undefined,
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 50,
                    reviewReason: params?.reviewReason || undefined,
                    reviewCategory: params?.reviewCategory || undefined,
                    episodeQueue: params?.episodeQueue || undefined,
                    reviewBlocks: params?.reviewBlocks || undefined,
                },
            }),
            providesTags: [{ type: 'AnimeImport' as const, id: 'STATE' }],
        }),
        getAnimeImportRecord: builder.query<AnimeImportRecordDetail, string>({
            query: (key) => `/anime-import/records/${key}`,
            providesTags: (_result, _error, key) => [{ type: 'AnimeImport' as const, id: key }],
        }),
        uploadAnimeImportZip: builder.mutation<AnimeImportOverview, File>({
            query: (file) => {
                const body = new FormData();
                body.append('file', file);
                return { url: '/anime-import/upload', method: 'POST', body };
            },
            invalidatesTags: [{ type: 'AnimeImport' as const, id: 'STATE' }],
        }),
        restoreAnimeImportArchives: builder.mutation<AnimeImportOverview, { storage: File; results: File }>({
            query: ({ storage, results }) => {
                const body = new FormData();
                body.append('storage', storage);
                body.append('results', results);
                return { url: '/anime-import/restore', method: 'POST', body };
            },
            invalidatesTags: [{ type: 'AnimeImport' as const, id: 'STATE' }],
        }),
        processAnimeImport: builder.mutation<AnimeImportOverview, { limit?: number } | void>({
            query: (body) => ({ url: '/anime-import/process', method: 'POST', body: body ?? {} }),
            invalidatesTags: [{ type: 'AnimeImport' as const, id: 'STATE' }],
        }),
        importReadyAnime: builder.mutation<unknown, { limit?: number } | void>({
            query: (body) => ({ url: '/anime-import/import-ready', method: 'POST', body: body ?? {} }),
            invalidatesTags: [
                { type: 'AnimeImport' as const, id: 'STATE' },
                { type: 'Anime' as const, id: 'LIST' },
                { type: 'Episode' as const, id: 'LIST' },
                { type: 'Stats' as const },
            ],
        }),
        resolveAnimeImportRecord: builder.mutation<
            AnimeImportRecordDetail,
            { key: string; hikka?: string; mal?: string; al?: string }
        >({
            query: ({ key, ...body }) => ({
                url: `/anime-import/records/${key}/resolve`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { key }) => [
                { type: 'AnimeImport' as const, id: 'STATE' },
                { type: 'AnimeImport' as const, id: key },
            ],
        }),
        updateAnimeImportMetadata: builder.mutation<
            AnimeImportRecordDetail,
            { key: string; description?: string | null }
        >({
            query: ({ key, ...body }) => ({
                url: `/anime-import/records/${key}/metadata`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { key }) => [
                { type: 'AnimeImport' as const, id: 'STATE' },
                { type: 'AnimeImport' as const, id: key },
            ],
        }),
        importAnimeImportRecord: builder.mutation<AnimeImportRecordDetail, string>({
            query: (key) => ({ url: `/anime-import/records/${key}/import`, method: 'POST' }),
            invalidatesTags: (_result, _error, key) => [
                { type: 'AnimeImport' as const, id: 'STATE' },
                { type: 'AnimeImport' as const, id: key },
                { type: 'Anime' as const, id: 'LIST' },
                { type: 'Stats' as const },
            ],
        }),
        setAnimeImportMapping: builder.mutation<
            unknown,
            { kind: 'player' | 'dubTeam'; label: string; id: number | null }
        >({
            query: ({ kind, label, id }) => ({
                url: `/anime-import/mappings/${kind}`,
                method: 'PATCH',
                body: { label, id },
            }),
            invalidatesTags: [{ type: 'AnimeImport' as const, id: 'STATE' }],
        }),
        applyAnimeImportEpisodeRule: builder.mutation<
            AnimeImportRecordDetail,
            {
                key: string;
                match?: string;
                dubType: DubType;
                playerId: number;
                dubTeamId: number;
                startEpisode: number;
            }
        >({
            query: ({ key, ...body }) => ({
                url: `/anime-import/records/${key}/episodes/rule`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { key }) => [
                { type: 'AnimeImport' as const, id: 'STATE' },
                { type: 'AnimeImport' as const, id: key },
            ],
        }),
        resolveAnimeImportEpisodeReview: builder.mutation<AnimeImportRecordDetail, EpisodeReviewResolvePayload>({
            query: ({ key, ...body }) => ({
                url: `/anime-import/records/${key}/episodes/review/resolve`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { key }) => [
                { type: 'AnimeImport' as const, id: 'STATE' },
                { type: 'AnimeImport' as const, id: key },
            ],
        }),
        addAnimeImportManualEpisodes: builder.mutation<
            AnimeImportRecordDetail,
            {
                key: string;
                dubType: DubType;
                playerId?: number | null;
                playerTitle?: string | null;
                dubTeamId?: number | null;
                dubTeamTitle?: string | null;
                episodes: Array<{ episode: number; link: string }>;
                markReviewDone?: boolean;
            }
        >({
            query: ({ key, ...body }) => ({
                url: `/anime-import/records/${key}/episodes/manual`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { key }) => [
                { type: 'AnimeImport' as const, id: 'STATE' },
                { type: 'AnimeImport' as const, id: key },
            ],
        }),
    }),
});

export const {
    useGetAnimeImportOverviewQuery,
    useGetAnimeImportRecordQuery,
    useUploadAnimeImportZipMutation,
    useRestoreAnimeImportArchivesMutation,
    useProcessAnimeImportMutation,
    useImportReadyAnimeMutation,
    useResolveAnimeImportRecordMutation,
    useUpdateAnimeImportMetadataMutation,
    useImportAnimeImportRecordMutation,
    useSetAnimeImportMappingMutation,
    useApplyAnimeImportEpisodeRuleMutation,
    useResolveAnimeImportEpisodeReviewMutation,
    useAddAnimeImportManualEpisodesMutation,
} = animeImportEndpoints;

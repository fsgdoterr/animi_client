import { animiApi } from "@/lib/store/api/animi";
import { toPaginatedResult } from "@/lib/store/utils/paginated-response";
import type { PaginatedResult } from "@/lib/types/pagination";
import type {
    PublicAnimeCard,
    PublicAnimeMeta,
    PublicHomeData,
    PublicSearchResult,
} from "@/lib/types/public";

export type PublicAnimeSort = "new" | "old" | "title" | "release" | "views";

export interface PublicAnimeListParams {
    search?: string;
    status?: string;
    type?: string;
    genres?: string;
    excludeGenres?: string;
    ratings?: string;
    countries?: string;
    studios?: string;
    producers?: string;
    dubTeams?: string;
    dubTypes?: string;
    releaseFrom?: string;
    releaseTo?: string;
    sort?: PublicAnimeSort;
    page?: number;
    limit?: number;
}

const publicEndpoints = animiApi.injectEndpoints({
    endpoints: (builder) => ({
        getPublicHome: builder.query<PublicHomeData, void>({
            query: () => "/public/anime/home",
        }),
        getPublicAnimeMeta: builder.query<PublicAnimeMeta, void>({
            query: () => "/public/anime/meta",
        }),
        getPublicAnimes: builder.query<PaginatedResult<PublicAnimeCard>, PublicAnimeListParams | void>({
            query: (params) => ({
                url: "/public/anime",
                params: {
                    mode: "page",
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 24,
                    search: params?.search || undefined,
                    status: params?.status || undefined,
                    type: params?.type || undefined,
                    genres: params?.genres || undefined,
                    excludeGenres: params?.excludeGenres || undefined,
                    ratings: params?.ratings || undefined,
                    countries: params?.countries || undefined,
                    studios: params?.studios || undefined,
                    producers: params?.producers || undefined,
                    dubTeams: params?.dubTeams || undefined,
                    dubTypes: params?.dubTypes || undefined,
                    releaseFrom: params?.releaseFrom || undefined,
                    releaseTo: params?.releaseTo || undefined,
                    sort: params?.sort || undefined,
                },
            }),
            transformResponse: (
                response: PublicAnimeCard[],
                meta: { response?: Response } | undefined,
            ) => toPaginatedResult(response, meta, 24),
        }),
        getRandomAnime: builder.query<{ id: number; slug: string; title: string }, void>({
            query: () => "/public/anime/random",
        }),
        searchPublic: builder.query<PublicSearchResult, { query: string; limit?: number }>({
            query: ({ query, limit = 5 }) => ({
                url: "/public/search",
                params: { query, limit },
            }),
        }),
    }),
});

export const {
    useGetPublicHomeQuery,
    useGetPublicAnimeMetaQuery,
    useGetPublicAnimesQuery,
    useLazyGetRandomAnimeQuery,
    useLazySearchPublicQuery,
} = publicEndpoints;

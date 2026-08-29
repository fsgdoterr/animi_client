import { animiApi } from "@/lib/store/api/animi";
import { toPaginatedResult } from "@/lib/store/utils/paginated-response";
import type {
    AnimeEpisode,
    AnimeEpisodePayload,
} from "@/lib/types/entites/anime";
import type { PaginatedResult } from "@/lib/types/pagination";

type EpisodeListParams = {
    animeId: number;
    page?: number;
    limit?: number;
};

const episodeEndpoints = animiApi.injectEndpoints({
    endpoints: (builder) => ({
        getEpisodes: builder.query<PaginatedResult<AnimeEpisode>, EpisodeListParams>({
            query: ({ animeId, page = 1, limit = 25 }) => ({
                url: "/episode",
                params: { animeId, page, limit },
            }),
            transformResponse: (
                response: AnimeEpisode[],
                meta: { response?: Response } | undefined,
            ) => toPaginatedResult(response, meta, 25),
            providesTags: (result, _error, { animeId }) => [
                { type: "Episode", id: `ANIME-${animeId}` },
                ...(result?.items.map((episode) => ({
                    type: "Episode" as const,
                    id: episode.id,
                })) ?? []),
            ],
        }),
        getAnimeEpisodesForEditor: builder.query<AnimeEpisode[], number>({
            query: (animeId) => `/episode/anime/${animeId}/editor`,
            providesTags: (_result, _error, animeId) => [
                { type: "Episode", id: `ANIME-${animeId}` },
            ],
        }),
        replaceAnimeEpisodes: builder.mutation<
            AnimeEpisode[],
            { animeId: number; episodes: AnimeEpisodePayload[] }
        >({
            query: ({ animeId, episodes }) => ({
                url: `/episode/anime/${animeId}`,
                method: "PUT",
                body: { episodes },
            }),
            invalidatesTags: (_result, _error, { animeId }) => [
                { type: "Episode", id: `ANIME-${animeId}` },
                { type: "Anime", id: animeId },
                { type: "Anime", id: "LIST" },
                { type: "Stats" },
            ],
        }),
    }),
});

export const {
    useGetEpisodesQuery,
    useGetAnimeEpisodesForEditorQuery,
    useReplaceAnimeEpisodesMutation,
} = episodeEndpoints;

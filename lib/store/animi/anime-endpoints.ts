import { animiApi } from "@/lib/store/api/animi";
import { toPaginatedResult } from "@/lib/store/utils/paginated-response";
import type {
    Anime,
    AnimeListItem,
    AnimeListParams,
    AnimeListResult,
    AnimePayload,
} from "@/lib/types/entites/anime";
import type { AdminHomeSliderItem } from "@/lib/types/public";

const animiAnimeEndpoints = animiApi.injectEndpoints({
    endpoints: (builder) => ({
        getHomeSlider: builder.query<AdminHomeSliderItem[], void>({
            query: () => "/anime/home-slider",
            providesTags: ["HomeSlider"],
        }),
        updateHomeSlider: builder.mutation<
            AdminHomeSliderItem[],
            { items: { animeId: number; imageId?: number | null }[] }
        >({
            query: (body) => ({
                url: "/anime/home-slider",
                method: "PUT",
                body,
            }),
            invalidatesTags: ["HomeSlider"],
        }),
        getAnimes: builder.query<AnimeListResult, AnimeListParams | void>({
            query: (params) => ({
                url: "/anime",
                params: {
                    mode: "page",
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 20,
                    search: params?.search || undefined,
                    genres: params?.genres || undefined,
                    status: params?.status || undefined,
                    type: params?.type || undefined,
                    sort: params?.sort || undefined,
                    issue: params?.issue || undefined,
                },
            }),
            transformResponse: (
                response: AnimeListItem[],
                meta: { response?: Response } | undefined,
            ) => toPaginatedResult(response, meta, 20),
            providesTags: (result) => [
                { type: "Anime", id: "LIST" },
                ...(result?.items.map((anime) => ({
                    type: "Anime" as const,
                    id: anime.id,
                })) ?? []),
            ],
        }),
        getAnime: builder.query<Anime, number>({
            query: (id) => `/anime/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Anime", id }],
        }),
        createAnime: builder.mutation<Anime, AnimePayload>({
            query: (body) => ({
                url: "/anime",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Anime", id: "LIST" }, { type: "Stats" }],
        }),
        updateAnime: builder.mutation<
            Anime,
            { id: number; body: Partial<AnimePayload> }
        >({
            query: ({ id, body }) => ({
                url: `/anime/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Anime", id },
                { type: "Anime", id: "LIST" },
                { type: "Stats" },
                "HomeSlider",
            ],
        }),
        deleteAnime: builder.mutation<void, number>({
            query: (id) => ({
                url: `/anime/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Anime", id },
                { type: "Anime", id: "LIST" },
                { type: "Stats" },
                "HomeSlider",
            ],
        }),
    }),
});

export const {
    useGetHomeSliderQuery,
    useUpdateHomeSliderMutation,
    useGetAnimesQuery,
    useGetAnimeQuery,
    useLazyGetAnimeQuery,
    useCreateAnimeMutation,
    useUpdateAnimeMutation,
    useDeleteAnimeMutation,
} = animiAnimeEndpoints;

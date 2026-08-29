import { animiApi } from "@/lib/store/api/animi";
import { toPaginatedResult } from "@/lib/store/utils/paginated-response";
import type {
    Genre,
    GenreListResult,
    GenrePayload,
} from "@/lib/types/entites/genre";

type GenreListParams = {
    search?: string;
    sort?: "new" | "old" | "title" | "anime";
    page?: number;
    limit?: number;
};


const animiGenreEndpoints = animiApi.injectEndpoints({
    endpoints: (builder) => ({
        getGenres: builder.query<GenreListResult, GenreListParams | void>({
            query: (params) => ({
                url: "/genre",
                params: {
                    mode: "page",
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 25,
                    search: params?.search || undefined,
                    sort: params?.sort || undefined,
                },
            }),
            transformResponse: (
                response: Genre[],
                meta: { response?: Response } | undefined,
            ) => toPaginatedResult(response, meta, 25),
            providesTags: (result) => [
                { type: "Genre", id: "LIST" },
                ...(result?.items.map((genre) => ({
                    type: "Genre" as const,
                    id: genre.id,
                })) ?? []),
            ],
        }),
        getGenre: builder.query<Genre, number>({
            query: (id) => `/genre/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Genre", id }],
        }),
        createGenre: builder.mutation<Genre, GenrePayload>({
            query: (body) => ({
                url: "/genre",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Genre", id: "LIST" }, { type: "Stats" }],
        }),
        updateGenre: builder.mutation<
            Genre,
            { id: number; body: Partial<GenrePayload> }
        >({
            query: ({ id, body }) => ({
                url: `/genre/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Genre", id },
                { type: "Genre", id: "LIST" },
                { type: "Stats" },
            ],
        }),
        deleteGenre: builder.mutation<void, number>({
            query: (id) => ({
                url: `/genre/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Genre", id },
                { type: "Genre", id: "LIST" },
                { type: "Stats" },
            ],
        }),
    }),
});

export const {
    useGetGenresQuery,
    useGetGenreQuery,
    useCreateGenreMutation,
    useUpdateGenreMutation,
    useDeleteGenreMutation,
} = animiGenreEndpoints;

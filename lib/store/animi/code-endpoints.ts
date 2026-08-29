import { animiApi } from "@/lib/store/api/animi";
import { toPaginatedResult } from "@/lib/store/utils/paginated-response";
import type {
    AnimeCode,
    AnimeCodeListParams,
    AnimeCodeListResult,
    AnimeCodePayload,
} from "@/lib/types/entites/code";

const animiCodeEndpoints = animiApi.injectEndpoints({
    endpoints: (builder) => ({
        getCodes: builder.query<AnimeCodeListResult, AnimeCodeListParams | void>({
            query: (params) => ({
                url: "/code",
                params: {
                    mode: "page",
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 20,
                    search: params?.search || undefined,
                    sort: params?.sort || undefined,
                },
            }),
            transformResponse: (
                response: AnimeCode[],
                meta: { response?: Response } | undefined,
            ) => toPaginatedResult(response, meta, 20),
            providesTags: (result) => [
                { type: "Code", id: "LIST" },
                ...(result?.items.map((code) => ({
                    type: "Code" as const,
                    id: code.id,
                })) ?? []),
            ],
        }),
        getCode: builder.query<AnimeCode, number>({
            query: (id) => `/code/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Code", id }],
        }),
        createCode: builder.mutation<AnimeCode, AnimeCodePayload>({
            query: (body) => ({
                url: "/code",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Code", id: "LIST" }],
        }),
        updateCode: builder.mutation<
            AnimeCode,
            { id: number; body: Partial<AnimeCodePayload> }
        >({
            query: ({ id, body }) => ({
                url: `/code/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Code", id },
                { type: "Code", id: "LIST" },
            ],
        }),
        deleteCode: builder.mutation<void, number>({
            query: (id) => ({
                url: `/code/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Code", id },
                { type: "Code", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetCodesQuery,
    useGetCodeQuery,
    useCreateCodeMutation,
    useUpdateCodeMutation,
    useDeleteCodeMutation,
} = animiCodeEndpoints;

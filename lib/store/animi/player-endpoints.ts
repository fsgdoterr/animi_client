import { animiApi } from "@/lib/store/api/animi";
import { toPaginatedResult } from "@/lib/store/utils/paginated-response";
import type {
    Player,
    PlayerListResult,
    PlayerPayload,
} from "@/lib/types/entites/player";

type PlayerListParams = {
    search?: string;
    page?: number;
    limit?: number;
};


const animiPlayerEndpoints = animiApi.injectEndpoints({
    endpoints: (builder) => ({
        getPlayers: builder.query<PlayerListResult, PlayerListParams | void>({
            query: (params) => ({
                url: "/player",
                params: {
                    mode: "page",
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 25,
                    search: params?.search || undefined,
                },
            }),
            transformResponse: (
                response: Player[],
                meta: { response?: Response } | undefined,
            ) => toPaginatedResult(response, meta, 25),
            providesTags: (result) => [
                { type: "Player", id: "LIST" },
                ...(result?.items.map((player) => ({
                    type: "Player" as const,
                    id: player.id,
                })) ?? []),
            ],
        }),
        getPlayer: builder.query<Player, number>({
            query: (id) => `/player/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Player", id }],
        }),
        createPlayer: builder.mutation<Player, PlayerPayload>({
            query: (body) => ({ url: "/player", method: "POST", body }),
            invalidatesTags: [{ type: "Player", id: "LIST" }],
        }),
        updatePlayer: builder.mutation<Player, { id: number; body: Partial<PlayerPayload> }>({
            query: ({ id, body }) => ({ url: `/player/${id}`, method: "PATCH", body }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Player", id },
                { type: "Player", id: "LIST" },
            ],
        }),
        deletePlayer: builder.mutation<void, number>({
            query: (id) => ({ url: `/player/${id}`, method: "DELETE" }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Player", id },
                { type: "Player", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetPlayersQuery,
    useGetPlayerQuery,
    useCreatePlayerMutation,
    useUpdatePlayerMutation,
    useDeletePlayerMutation,
} = animiPlayerEndpoints;

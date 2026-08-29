import { animiApi } from "@/lib/store/api/animi";
import { toPaginatedResult } from "@/lib/store/utils/paginated-response";
import type {
    DubTeam,
    DubTeamListResult,
    DubTeamPayload,
} from "@/lib/types/entites/dub-team";

type DubTeamListParams = {
    search?: string;
    sort?: "new" | "old" | "title";
    page?: number;
    limit?: number;
};


const animiDubTeamEndpoints = animiApi.injectEndpoints({
    endpoints: (builder) => ({
        getDubTeams: builder.query<DubTeamListResult, DubTeamListParams | void>({
            query: (params) => ({
                url: "/dubteam",
                params: {
                    mode: "page",
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 25,
                    search: params?.search || undefined,
                    sort: params?.sort || undefined,
                },
            }),
            transformResponse: (
                response: DubTeam[],
                meta: { response?: Response } | undefined,
            ) => toPaginatedResult(response, meta, 25),
            providesTags: (result) => [
                { type: "DubTeam", id: "LIST" },
                ...(result?.items.map((team) => ({
                    type: "DubTeam" as const,
                    id: team.id,
                })) ?? []),
            ],
        }),
        getDubTeam: builder.query<DubTeam, number>({
            query: (id) => `/dubteam/${id}`,
            providesTags: (_result, _error, id) => [{ type: "DubTeam", id }],
        }),
        createDubTeam: builder.mutation<DubTeam, DubTeamPayload>({
            query: (body) => ({ url: "/dubteam", method: "POST", body }),
            invalidatesTags: [{ type: "DubTeam", id: "LIST" }],
        }),
        updateDubTeam: builder.mutation<DubTeam, { id: number; body: Partial<DubTeamPayload> }>({
            query: ({ id, body }) => ({ url: `/dubteam/${id}`, method: "PATCH", body }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "DubTeam", id },
                { type: "DubTeam", id: "LIST" },
            ],
        }),
        deleteDubTeam: builder.mutation<void, number>({
            query: (id) => ({ url: `/dubteam/${id}`, method: "DELETE" }),
            invalidatesTags: (_result, _error, id) => [
                { type: "DubTeam", id },
                { type: "DubTeam", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetDubTeamsQuery,
    useGetDubTeamQuery,
    useCreateDubTeamMutation,
    useUpdateDubTeamMutation,
    useDeleteDubTeamMutation,
} = animiDubTeamEndpoints;

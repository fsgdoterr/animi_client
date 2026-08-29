import { animiApi } from "@/lib/store/api/animi";
import type {
    AnimeStats,
    CodeStats,
    DashboardStats,
    DubTeamStats,
    GenreStats,
    PlayerStats,
    UserStats,
} from "@/lib/types/admin-stats";

const adminStatsEndpoints = animiApi.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardStats: builder.query<DashboardStats, void>({
            query: () => "/admin/stats/dashboard",
            providesTags: [{ type: "Stats", id: "DASHBOARD" }],
        }),
        getAnimeStats: builder.query<AnimeStats, number>({
            query: (id) => `/admin/stats/anime/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Stats", id: `ANIME-${id}` }],
        }),
        getUserStats: builder.query<UserStats, number>({
            query: (id) => `/admin/stats/user/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Stats", id: `USER-${id}` }],
        }),
        getGenreStats: builder.query<GenreStats, number>({
            query: (id) => `/admin/stats/genre/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Stats", id: `GENRE-${id}` }],
        }),
        getPlayerStats: builder.query<PlayerStats, number>({
            query: (id) => `/admin/stats/player/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Stats", id: `PLAYER-${id}` }],
        }),
        getDubTeamStats: builder.query<DubTeamStats, number>({
            query: (id) => `/admin/stats/dub-team/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Stats", id: `DUBTEAM-${id}` }],
        }),
        getCodeStats: builder.query<CodeStats, number>({
            query: (id) => `/admin/stats/code/${id}`,
            providesTags: (_result, _error, id) => [{ type: "Stats", id: `CODE-${id}` }],
        }),
    }),
});

export const {
    useGetDashboardStatsQuery,
    useGetAnimeStatsQuery,
    useGetUserStatsQuery,
    useGetGenreStatsQuery,
    useGetPlayerStatsQuery,
    useGetDubTeamStatsQuery,
    useGetCodeStatsQuery,
} = adminStatsEndpoints;

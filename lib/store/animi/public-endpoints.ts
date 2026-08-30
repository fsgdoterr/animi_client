import { animiApi } from "@/lib/store/api/animi";
import { toPaginatedResult } from "@/lib/store/utils/paginated-response";
import type { PaginatedResult } from "@/lib/types/pagination";
import type {
    PublicAnimeCard,
    PublicAnimeComment,
    PublicAnimeCommentsResult,
    PublicAnimeMeta,
    PublicBookmark,
    PublicBookmarksResult,
    PublicHomeData,
    PublicPlaylistDetail,
    PublicPlaylistImagesResult,
    PublicPlaylistItem,
    PublicPlaylistSummary,
    PublicSearchResult,
    PublicUserActivityResult,
    PublicUserProfile,
} from "@/lib/types/public";

export type PublicAnimeSort = "new" | "old" | "title" | "release" | "popular";

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
        getPublicAnimeComments: builder.query<
            PublicAnimeCommentsResult,
            { slug: string; page?: number; limit?: number; sort?: "new" | "old" | "top" }
        >({
            query: ({ slug, page = 1, limit = 20, sort = "new" }) => ({
                url: `/public/anime/${encodeURIComponent(slug)}/comments`,
                params: { page, limit, sort },
            }),
            providesTags: (_result, _error, { slug }) => [{ type: "PublicComments", id: slug }],
        }),
        createPublicAnimeComment: builder.mutation<
            PublicAnimeComment,
            { slug: string; text: string; parentId?: number }
        >({
            query: ({ slug, ...body }) => ({
                url: `/public/anime/${encodeURIComponent(slug)}/comments`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { slug }) => [{ type: "PublicComments", id: slug }],
        }),
        reactPublicAnimeComment: builder.mutation<
            { likes: number; dislikes: number; reaction: "LIKE" | "DISLIKE" | null },
            { slug: string; commentId: number; type: "LIKE" | "DISLIKE" }
        >({
            query: ({ slug, commentId, type }) => ({
                url: `/public/anime/${encodeURIComponent(slug)}/comments/${commentId}/reaction`,
                method: "POST",
                body: { type },
            }),
            invalidatesTags: (_result, _error, { slug }) => [{ type: "PublicComments", id: slug }],
        }),
        recordPublicAnimeView: builder.mutation<{ recorded: boolean }, string>({
            query: (slug) => ({
                url: `/public/anime/${encodeURIComponent(slug)}/view`,
                method: "POST",
            }),
        }),
        getPublicBookmarks: builder.query<
            PublicBookmarksResult,
            { page?: number; limit?: number } | void
        >({
            query: (params) => ({
                url: "/public/bookmarks",
                params: { page: params?.page ?? 1, limit: params?.limit ?? 30 },
            }),
            providesTags: [{ type: "PublicBookmarks", id: "LIST" }],
        }),
        getPublicBookmarkIds: builder.query<number[], void>({
            query: () => "/public/bookmarks/ids",
            providesTags: [{ type: "PublicBookmarks", id: "LIST" }],
        }),
        addPublicBookmark: builder.mutation<PublicBookmark, number>({
            query: (animeId) => ({
                url: `/public/bookmarks/${animeId}`,
                method: "POST",
            }),
            invalidatesTags: [{ type: "PublicBookmarks", id: "LIST" }],
        }),
        removePublicBookmark: builder.mutation<void, number>({
            query: (animeId) => ({
                url: `/public/bookmarks/${animeId}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "PublicBookmarks", id: "LIST" }],
        }),
        getPublicUserProfile: builder.query<PublicUserProfile, string>({
            query: (username) => `/public/users/${encodeURIComponent(username)}`,
            providesTags: (_result, _error, username) => [{ type: "PublicUser", id: username }],
        }),
        getPublicUserActivity: builder.query<
            PublicUserActivityResult,
            { username: string; page?: number; limit?: number }
        >({
            query: ({ username, page = 1, limit = 20 }) => ({
                url: `/public/users/${encodeURIComponent(username)}/activity`,
                params: { page, limit },
            }),
            providesTags: (_result, _error, { username }) => [{ type: "PublicUser", id: `activity-${username}` }],
        }),
        getPublicPlaylist: builder.query<PublicPlaylistDetail, { username: string; slug: string }>({
            query: ({ username, slug }) =>
                `/public/users/${encodeURIComponent(username)}/lists/${encodeURIComponent(slug)}`,
            providesTags: (_result, _error, { username, slug }) => [
                { type: "PublicPlaylist", id: `${username}/${slug}` },
            ],
        }),
        getPublicPlaylistImages: builder.query<
            PublicPlaylistImagesResult,
            { username: string; page?: number; limit?: number; search?: string }
        >({
            query: ({ username, page = 1, limit = 18, search }) => ({
                url: `/public/users/${encodeURIComponent(username)}/playlist-images`,
                params: { page, limit, search: search || undefined },
            }),
        }),
        createPublicPlaylist: builder.mutation<
            PublicPlaylistSummary,
            { username: string; title: string; description?: string; imageId?: number; isPrivate?: boolean }
        >({
            query: ({ username, ...body }) => ({
                url: `/public/users/${encodeURIComponent(username)}/lists`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { username }) => [
                { type: "PublicUser", id: username },
                { type: "PublicUser", id: `activity-${username}` },
            ],
        }),
        updatePublicPlaylist: builder.mutation<
            PublicPlaylistSummary,
            { username: string; slug: string; isPrivate: boolean }
        >({
            query: ({ username, slug, ...body }) => ({
                url: `/public/users/${encodeURIComponent(username)}/lists/${encodeURIComponent(slug)}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { username, slug }) => [
                { type: "PublicPlaylist", id: `${username}/${slug}` },
                { type: "PublicUser", id: username },
                { type: "PublicUser", id: `activity-${username}` },
            ],
        }),
        addPublicPlaylistItem: builder.mutation<
            PublicPlaylistItem,
            { username: string; slug: string; animeId: number; description?: string; removeFromBookmarks?: boolean }
        >({
            query: ({ username, slug, ...body }) => ({
                url: `/public/users/${encodeURIComponent(username)}/lists/${encodeURIComponent(slug)}/items`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { username, slug, removeFromBookmarks }) => [
                { type: "PublicPlaylist", id: `${username}/${slug}` },
                { type: "PublicUser", id: username },
                { type: "PublicUser", id: `activity-${username}` },
                ...(removeFromBookmarks ? [{ type: "PublicBookmarks" as const, id: "LIST" }] : []),
            ],
        }),
        updatePublicPlaylistItem: builder.mutation<
            PublicPlaylistItem,
            { username: string; slug: string; itemId: number; description?: string }
        >({
            query: ({ username, slug, itemId, ...body }) => ({
                url: `/public/users/${encodeURIComponent(username)}/lists/${encodeURIComponent(slug)}/items/${itemId}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { username, slug }) => [
                { type: "PublicPlaylist", id: `${username}/${slug}` },
            ],
        }),
        reorderPublicPlaylistItems: builder.mutation<
            { orderedItemIds: number[] },
            { username: string; slug: string; orderedItemIds: number[] }
        >({
            query: ({ username, slug, orderedItemIds }) => ({
                url: `/public/users/${encodeURIComponent(username)}/lists/${encodeURIComponent(slug)}/items/order`,
                method: "PUT",
                body: { orderedItemIds },
            }),
            invalidatesTags: (_result, _error, { username, slug }) => [
                { type: "PublicPlaylist", id: `${username}/${slug}` },
            ],
        }),
        removePublicPlaylistItem: builder.mutation<
            void,
            { username: string; slug: string; itemId: number }
        >({
            query: ({ username, slug, itemId }) => ({
                url: `/public/users/${encodeURIComponent(username)}/lists/${encodeURIComponent(slug)}/items/${itemId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { username, slug }) => [
                { type: "PublicPlaylist", id: `${username}/${slug}` },
                { type: "PublicUser", id: username },
            ],
        }),
        getMyPublicAnimeReview: builder.query<{ rating: number | null }, string>({
            query: (slug) => `/public/anime/${encodeURIComponent(slug)}/review/me`,
            providesTags: (_result, _error, slug) => [{ type: "PublicReview", id: slug }],
        }),
        ratePublicAnime: builder.mutation<
            { rating: number; averageReviewRating: number | null; reviewsCount: number },
            { slug: string; rating: number }
        >({
            query: ({ slug, rating }) => ({
                url: `/public/anime/${encodeURIComponent(slug)}/review`,
                method: "PUT",
                body: { rating },
            }),
            invalidatesTags: (_result, _error, { slug }) => [{ type: "PublicReview", id: slug }],
        }),
    }),
});

export const {
    useGetPublicHomeQuery,
    useGetPublicAnimeMetaQuery,
    useGetPublicAnimesQuery,
    useLazyGetRandomAnimeQuery,
    useLazySearchPublicQuery,
    useGetPublicAnimeCommentsQuery,
    useCreatePublicAnimeCommentMutation,
    useReactPublicAnimeCommentMutation,
    useGetMyPublicAnimeReviewQuery,
    useRatePublicAnimeMutation,
    useRecordPublicAnimeViewMutation,
    useGetPublicBookmarksQuery,
    useGetPublicBookmarkIdsQuery,
    useAddPublicBookmarkMutation,
    useRemovePublicBookmarkMutation,
    useGetPublicUserProfileQuery,
    useGetPublicUserActivityQuery,
    useLazyGetPublicUserActivityQuery,
    useGetPublicPlaylistImagesQuery,
    useGetPublicPlaylistQuery,
    useCreatePublicPlaylistMutation,
    useUpdatePublicPlaylistMutation,
    useAddPublicPlaylistItemMutation,
    useUpdatePublicPlaylistItemMutation,
    useReorderPublicPlaylistItemsMutation,
    useRemovePublicPlaylistItemMutation,
} = publicEndpoints;

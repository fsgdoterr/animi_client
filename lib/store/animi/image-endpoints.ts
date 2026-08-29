import { animiApi } from "@/lib/store/api/animi";
import { toPaginatedResult } from "@/lib/store/utils/paginated-response";
import type { PrivateImage } from "@/lib/types/entites/image-type";
import type { PaginatedResult } from "@/lib/types/pagination";

export type ImageUsageFilter = "all" | "anime" | "genre" | "avatar" | "unused";
export type ImageSort = "new" | "old";

export type ImageListParams = {
    search?: string;
    page?: number;
    limit?: number;
    usage?: ImageUsageFilter;
    avatarAllowed?: boolean;
    sort?: ImageSort;
};

export type ImageListResult = PaginatedResult<PrivateImage>;

export type CreateImagePayload = {
    url: string;
    isAvatarAllowed?: boolean;
};

const animiImageEndpoints = animiApi.injectEndpoints({
    endpoints: (builder) => ({
        getImages: builder.query<ImageListResult, ImageListParams | void>({
            query: (params) => ({
                url: "/image",
                params: {
                    mode: "page",
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 24,
                    search: params?.search || undefined,
                    usage:
                        params?.usage && params.usage !== "all"
                            ? params.usage
                            : undefined,
                    avatarAllowed:
                        params?.avatarAllowed === undefined
                            ? undefined
                            : String(params.avatarAllowed),
                    sort: params?.sort ?? "new",
                },
            }),
            transformResponse: (
                response: PrivateImage[],
                meta: { response?: Response } | undefined,
            ) => toPaginatedResult(response, meta, 24),
            providesTags: (result) => [
                { type: "Image" as const, id: "LIST" },
                ...(result?.items.map((image) => ({
                    type: "Image" as const,
                    id: image.id,
                })) ?? []),
            ],
        }),
        createImage: builder.mutation<PrivateImage, CreateImagePayload>({
            query: (body) => ({ url: "/image", method: "POST", body }),
            invalidatesTags: [{ type: "Image", id: "LIST" }],
        }),
        updateImage: builder.mutation<
            PrivateImage,
            { id: number; isAvatarAllowed: boolean }
        >({
            query: ({ id, isAvatarAllowed }) => ({
                url: `/image/${id}`,
                method: "PATCH",
                body: { isAvatarAllowed },
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Image", id },
                { type: "Image", id: "LIST" },
                { type: "User", id: "LIST" },
            ],
        }),
        deleteImage: builder.mutation<void, number>({
            query: (id) => ({ url: `/image/${id}`, method: "DELETE" }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Image", id },
                { type: "Image", id: "LIST" },
                { type: "User", id: "LIST" },
                { type: "Anime", id: "LIST" },
                { type: "Genre", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetImagesQuery,
    useCreateImageMutation,
    useUpdateImageMutation,
    useDeleteImageMutation,
} = animiImageEndpoints;

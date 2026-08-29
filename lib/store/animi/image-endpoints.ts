import { animiApi } from "@/lib/store/api/animi";
import { toPaginatedResult } from "@/lib/store/utils/paginated-response";
import type { PrivateImage } from "@/lib/types/entites/image-type";
import type { PaginatedResult } from "@/lib/types/pagination";

export type ImageListParams = {
    search?: string;
    page?: number;
    limit?: number;
};

export type ImageListResult = PaginatedResult<PrivateImage>;


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
                },
            }),
            transformResponse: (
                response: PrivateImage[],
                meta: { response?: Response } | undefined,
            ) => toPaginatedResult(response, meta, 24),
        }),
    }),
});

export const { useGetImagesQuery } = animiImageEndpoints;

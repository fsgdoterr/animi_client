import { animiApi } from "@/lib/store/api/animi";
import { toPaginatedResult } from "@/lib/store/utils/paginated-response";
import type {
    Producer,
    ProducerListResult,
} from "@/lib/types/entites/producer";

type ProducerListParams = {
    search?: string;
    page?: number;
    limit?: number;
};

const producerEndpoints = animiApi.injectEndpoints({
    endpoints: (builder) => ({
        getProducers: builder.query<ProducerListResult, ProducerListParams | void>({
            query: (params) => ({
                url: "/producer",
                params: {
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 100,
                    search: params?.search || undefined,
                },
            }),
            transformResponse: (
                response: Producer[],
                meta: { response?: Response } | undefined,
            ) => toPaginatedResult(response, meta, 100),
            providesTags: [{ type: "Producer", id: "LIST" }],
        }),
    }),
});

export const { useGetProducersQuery } = producerEndpoints;

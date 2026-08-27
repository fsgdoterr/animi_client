import { API_URL } from "@/lib/constants/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const animiApi = createApi({
    reducerPath: "animiApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL + "/api",
        credentials: "include",
    }),
    tagTypes: [],
    endpoints: () => ({}),
});

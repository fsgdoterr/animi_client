import { API_URL } from "@/lib/constants/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const animiApi = createApi({
    reducerPath: "animiApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        credentials: "include",
    }),
    tagTypes: ["Me", "Genre", "Player", "DubTeam", "User", "Anime", "Episode", "Producer", "Code", "Image", "Stats"],
    endpoints: () => ({}),
});

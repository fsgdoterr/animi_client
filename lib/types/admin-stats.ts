import type { AnimeStatus } from "@/lib/types/entites/anime";
import type { UserRole } from "@/lib/constants/permissions";

export interface DashboardStats {
    overview: {
        anime: number;
        users: number;
        views: number;
        reviews: number;
        subscriptions: number;
        comments: number;
        episodes: number;
        activeVariants: number;
        codes: number;
    };
    recent: {
        views7: number;
        views30: number;
        newUsers7: number;
        newUsers30: number;
        newAnime7: number;
        newAnime30: number;
        reviews30: number;
        subscriptions30: number;
    };
    contentHealth: {
        missingPoster: number;
        missingDescription: number;
        withoutEpisodes: number;
        episodesWithoutActiveVariant: number;
    };
    status: Record<AnimeStatus, number>;
    engagement: { averageRating: number | null };
    activity: { date: string; views: number; users: number }[];
    topAnime: {
        id: number;
        title: string;
        status: AnimeStatus;
        views: number;
        reviews: number;
        subscriptions: number;
        averageRating: number | null;
    }[];
    topCodes: {
        id: number;
        code: string;
        anime: { id: number; title: string };
        views: number;
    }[];
    recentUsers: {
        id: number;
        username: string;
        displayName: string | null;
        role: UserRole;
        createdAt: string;
    }[];
    recentAnime: {
        id: number;
        title: string;
        status: AnimeStatus;
        createdAt: string;
    }[];
}

export interface AnimeStats {
    views: number;
    views7: number;
    views30: number;
    reviews: number;
    averageRating: number | null;
    subscriptions: number;
    comments: number;
    playlistAdds: number;
    codes: number;
    episodes: number;
    variants: number;
    activeVariants: number;
}

export interface UserStats {
    views: number;
    views30: number;
    reviews: number;
    averageRating: number | null;
    subscriptions: number;
    comments: number;
    playlists: number;
    createdAnime: number;
    sessions: number;
    activeSessions: number;
    lastViewAt: string | null;
}

export interface GenreStats {
    anime: number;
    views: number;
    reviews: number;
    averageRating: number | null;
    ongoing: number;
    completed: number;
    announced: number;
}

export interface PlayerStats {
    variants: number;
    activeVariants: number;
    episodes: number;
    anime: number;
    dubTeams: number;
}

export interface DubTeamStats {
    variants: number;
    activeVariants: number;
    episodes: number;
    anime: number;
    players: number;
}

export interface CodeStats {
    views: number;
    views7: number;
    views30: number;
    authorizedViews: number;
    lastViewedAt: string | null;
}

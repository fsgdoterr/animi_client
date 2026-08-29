export interface Image {
    id: number;
    alt: string | null;
    path: string;
    isAvatarAllowed: boolean;
}

export interface ImageUsageUser {
    id: number;
    username: string;
    displayName: string | null;
}

export interface ImageUsageEntity {
    id: number;
    title: string;
}

export interface PrivateImage extends Image {
    sourceUrl: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: {
        avatars: number;
        genres: number;
        animes: number;
        animeAdditionalImages: number;
    };
    avatars?: ImageUsageUser[];
    genres?: ImageUsageEntity[];
    animes?: ImageUsageEntity[];
    animeAdditionalImages?: ImageUsageEntity[];
}

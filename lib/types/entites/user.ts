import type { PaginatedResult } from "@/lib/types/pagination";
import { Permissions, UserRole } from "@/lib/constants/permissions";
import { Image, PrivateImage } from "@/lib/types/entites/image-type";

export interface User {
    id: number;
    username: string;
    permissions: Permissions[];
    role: UserRole;
    displayName: string | null;
    avatar: Image | PrivateImage | null;
}

export interface PrivateUser extends User {
    email: string;
    createdAt: string;
    updatedAt?: string;
    _count?: { views: number; reviews: number; comments: number; subscriptions: number };
}

export interface UserPayload {
    username: string;
    email: string;
    password?: string;
    displayName?: string | null;
    avatar?: number | null;
    role?: UserRole;
    permissions?: Permissions[];
}

export type UserListResult = PaginatedResult<PrivateUser>;

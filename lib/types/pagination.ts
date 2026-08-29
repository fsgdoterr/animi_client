export interface PaginatedResult<T> {
    items: T[];
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
}

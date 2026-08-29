export const getVisiblePages = (currentPage: number, totalPages: number) => {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.min(Math.max(currentPage - 2, 1), totalPages - 4);
    return Array.from({ length: 5 }, (_, index) => start + index);
}
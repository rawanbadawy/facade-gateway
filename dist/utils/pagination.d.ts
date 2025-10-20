export type PageResult<T> = {
    items: T[];
    nextCursor?: string | null;
};
export declare function autoPage<T>(fetchPage: (cursor?: string | null) => Promise<PageResult<T>>, maxItems?: number): Promise<T[]>;

export type PageResult<T> = { items: T[]; nextCursor?: string | null };

export async function autoPage<T>(
  fetchPage: (cursor?: string | null) => Promise<PageResult<T>>,
  maxItems = Infinity,
): Promise<T[]> {
  const out: T[] = [];
  let cursor: string | null | undefined = null;
  do {
    const { items, nextCursor } = await fetchPage(cursor);
    out.push(...items);
    cursor = nextCursor ?? null;
  } while (cursor && out.length < maxItems);
  return out.slice(0, maxItems);
}

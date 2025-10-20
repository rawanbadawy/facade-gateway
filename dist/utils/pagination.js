"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoPage = autoPage;
async function autoPage(fetchPage, maxItems = Infinity) {
    const out = [];
    let cursor = null;
    do {
        const { items, nextCursor } = await fetchPage(cursor);
        out.push(...items);
        cursor = nextCursor ?? null;
    } while (cursor && out.length < maxItems);
    return out.slice(0, maxItems);
}
//# sourceMappingURL=pagination.js.map
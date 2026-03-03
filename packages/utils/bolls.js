/** /bolls/ => https://bolls.life/ */
export const BOLLS_TRANSLATIONS = 'https://bolls.life/static/bolls/app/views/languages.json';
export const BOLLS_EDITIONSBOOKS = 'https://bolls.life/static/bolls/app/views/translations_books.json';
export async function fetchBollsTranslations() {
    const resp = await fetch(BOLLS_TRANSLATIONS);
    const result = await resp.json();
    return result;
}
export async function fetchBollsEditionBooks() {
    const resp = await fetch(BOLLS_EDITIONSBOOKS);
    const result = await resp.json();
    return result;
}
export async function fetchBollsChapter({ edition, book, chapter }) {
    const resp = await fetch(`https://bolls.life/get-chapter/${edition}/${book}/${chapter}/`);
    const result = await resp.json();
    return result;
}
export function getBollsChapterUrl({ edition, book, chapter, verse }) {
    return `https://bolls.life/${edition}/${book}/${chapter}/${verse ? verse + "/" : ""}`;
}

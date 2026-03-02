/** /bolls/ => https://bolls.life/ */
export const BOLLS_TRANSLATIONS = '/bolls/static/bolls/app/views/languages.json';
export const BOLLS_EDITIONSBOOKS = '/bolls/static/bolls/app/views/translations_books.json';
export async function fetchBollsTranslations() {
    const resp = await fetch(BOLLS_TRANSLATIONS, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', }
    });
    const result = await resp.json();
    return result;
}
export async function fetchBollsEditionBooks() {
    const resp = await fetch(BOLLS_EDITIONSBOOKS, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', }
    });
    const result = await resp.json();
    return result;
}
export async function fetchBollsChapter({ edition, book, chapter }) {
    const resp = await fetch(`/bolls/get-chapter/${edition}/${book}/${chapter}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', }
    });
    const result = await resp.json();
    return result;
}
export function getBollsChapterUrl({ edition, book, chapter, verse }) {
    return `https://bolls.life/${edition}/${book}/${chapter}/${verse ? verse + "/" : ""}`;
}

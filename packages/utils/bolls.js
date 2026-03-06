export const BOLLS_TRANSLATIONS = 'https://bolls.life/static/bolls/app/views/languages.json';
export const BOLLS_EDITIONSBOOKS = 'https://bolls.life/static/bolls/app/views/translations_books.json';
export async function fetchBollsTranslations() {
    try {
        const resp = await fetch(BOLLS_TRANSLATIONS);
        if (!resp.ok) {
            throw new Error(`Fetch failed with status: ${resp.status}`);
        }
        const result = await resp.json();
        return result;
    }
    catch (error) {
        console.error(error);
        return [];
    }
}
export async function fetchBollsEditionBooks() {
    try {
        const resp = await fetch(BOLLS_EDITIONSBOOKS);
        if (!resp.ok) {
            throw new Error(`Fetch failed with status: ${resp.status}`);
        }
        const result = await resp.json();
        return result;
    }
    catch (error) {
        console.error(error);
        return {};
    }
}
export async function fetchBollsChapter({ edition, book, chapter }) {
    try {
        if (book) {
            const resp = await fetch(`https://bolls.life/get-chapter/${edition}/${book}/${chapter}/`);
            if (!resp.ok) {
                throw new Error(`Fetch failed with status: ${resp.status}`);
            }
            const result = await resp.json();
            return result;
        }
        else
            throw Error(`Cannot fetch chapter of unknown book.`);
    }
    catch (error) {
        console.error(error);
        return [];
    }
}
export function getBollsChapterUrl({ edition, book, chapter, verse }) {
    return `https://bolls.life/${edition}/${book ? book : 1}/${book ? chapter : 1}/${(book && verse) ? verse + "/" : ""}`;
}

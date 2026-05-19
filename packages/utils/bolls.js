import { spreadNumbers } from "./spreadNumbers";
export const BOLLS_HOSTNAME = 'https://bolls.life';
export const API_ROOT = BOLLS_HOSTNAME;
export const TRANSLATIONSINDEX_URL = API_ROOT + '/static/bolls/app/views/languages.json';
export const TRANSLATIONSBOOKS_URL = API_ROOT + '/static/bolls/app/views/translations_books.json';
export const allEditions = fetchTranslationsBooks()
    .then(books => fetchTranslationsIndex().then(translations => compileEditions(books, translations)));
export function getBollsHomepage(translation) {
    return `${API_ROOT}/${translation}/`;
}
export async function fetchTranslationsIndex() {
    try {
        const resp = await fetch(TRANSLATIONSINDEX_URL);
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
export async function fetchTranslationsBooks() {
    try {
        const resp = await fetch(TRANSLATIONSBOOKS_URL);
        if (!resp.ok)
            throw new Error(`Fetch failed with status: ${resp.status}`);
        const result = await resp.json();
        return result;
    }
    catch (error) {
        console.error(error);
        return {};
    }
}
export function compileEditions(booksIndex, translationsIndex) {
    return translationsIndex
        .map(ln => ln.translations.map(tr => {
        return {
            ...tr,
            language: ln.language,
            books: booksIndex[tr.short_name]
        };
    })).flat();
}
export async function getEditions(filterOptions) {
    return (await allEditions)
        .filter(edition => ((filterOptions?.languages ? filterOptions.languages.some(sellang => edition.language.includes(sellang)) : true)
        && (filterOptions?.translations ? filterOptions.translations.includes(edition.short_name) : true)));
}
export async function fetchTranslationBooks(translationShortName) {
    try {
        const resp = await fetch(`${API_ROOT}/get-books/${translationShortName}/`);
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
export async function fetchChapter(translation, book, chapter) {
    try {
        const resp = await fetch(`${API_ROOT}/get-chapter/${translation}/${book}/${chapter}/`);
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
export function getChapterUrl(translation, book, chapter, verse) {
    return `${API_ROOT}/${translation}/${book}/${chapter}/${verse ? verse + "/" : ""}`;
}
export function parseReferenses(refs, context) {
    return refs.split(',')
        .reduce((result, ref, i, _originalRefs) => {
        let translation, foundtranslations = ref.trim().match(/\([A-Z0-9]+\)/);
        if (foundtranslations && foundtranslations.length) {
            ref = ref.replace(foundtranslations[0], '').trim();
            translation = foundtranslations[0].replace(/[\(\)]/g, '');
        }
        else {
            translation = i == 0 ? context?.translation : result[i - 1].translation;
            ref = ref.trim();
        }
        let stances = ref.split(':'), chapters, bookName;
        let chapterspreads = stances[0].match(/[0-9 -]+$/);
        if (chapterspreads && chapterspreads.length) {
            chapters = spreadNumbers(chapterspreads[0]);
            bookName = stances[0].replace(chapterspreads[0], '').trim();
        }
        else {
            chapters = [i == 0 ? context?.chapter || 1 : result[i - 1].chapter];
            bookName = stances[0].trim();
        }
        ;
        if (bookName === '') {
            bookName = i == 0 ? context?.bookName || '' : result[i - 1].bookName;
        }
        if (bookName)
            chapters.forEach((chapter, i) => {
                let verses = [];
                if (i === chapters.length - 1) {
                    if (stances.length == 2) {
                        verses = spreadNumbers(stances[1].trim());
                    }
                }
                let excerpt = {
                    translation: translation,
                    reference: `${bookName} ${chapter}${verses.length ? `:${stances[1]}` : ''}${translation ? ` (${translation})` : ''}`,
                    bookName,
                    chapter,
                    verses
                };
                result.push(excerpt);
            });
        return result;
    }, []);
}

export class BollsController {
    static { this.BOLLS_HOSTNAME = 'https://bolls.life'; }
    static { this.BOLLS_TRANSLATIONSINDEX = this.BOLLS_HOSTNAME + '/static/bolls/app/views/languages.json'; }
    static { this.BOLLS_TRANSLATIONSBOOKS = this.BOLLS_HOSTNAME + '/static/bolls/app/views/translations_books.json'; }
    static { this.DEFAULT_TRANSLATION = 'UBIO'; }
    constructor({ languages = [], translations = [] }) {
        if (languages.length)
            this.selectedLanguages = languages;
        if (translations.length)
            this.selectedTranslations = translations;
        this.library = BollsController.fetchBollsTranslationsBooks({ languages, translations });
    }
    static getBollsHomepage(translation = this.DEFAULT_TRANSLATION) {
        return `${this.BOLLS_HOSTNAME}/${translation}/`;
    }
    static async fetchBollsTranslationsIndex() {
        try {
            const resp = await fetch(this.BOLLS_TRANSLATIONSINDEX);
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
    static async fetchBollsTranslationsBooks({ languages = [], translations = [] }) {
        try {
            let translationsIndex = await this.fetchBollsTranslationsIndex(), selectedTranslations = translationsIndex;
            if (!(languages.length && translations.length)) {
                return await fetch(this.BOLLS_TRANSLATIONSBOOKS)
                    .then(res => {
                    if (!res.ok)
                        throw new Error(`Fetch failed with status: ${res.status}`);
                    return res.json();
                }).then((booksIndex) => selectedTranslations.map(ln => {
                    return ln.translations.map(tr => {
                        return {
                            ...tr,
                            language: ln.language,
                            books: booksIndex[tr.short_name]
                        };
                    });
                }).flat());
            }
            else {
                if (languages.length) {
                    selectedTranslations = selectedTranslations
                        .filter(ln => languages.some(lang => ln.language.includes(lang)));
                }
                if (translations.length) {
                    selectedTranslations = selectedTranslations
                        .filter(ln => {
                        ln.translations = ln.translations.filter(tr => translations.includes(tr.short_name));
                        return ln.translations.length > 0;
                    });
                }
                return Promise.all(selectedTranslations
                    .map(ln => ln.translations.map(async (tr) => {
                    return {
                        ...tr,
                        language: ln.language,
                        books: await this.fetchBollsTranslationBooks(tr.short_name)
                    };
                })).flat());
            }
        }
        catch (error) {
            console.error(error);
            return [];
        }
    }
    static async fetchBollsTranslationBooks(translationShortName) {
        try {
            const resp = await fetch(`https://bolls.life/get-books/${translationShortName}/`);
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
    static async fetchBollsChapter({ translation, bookNum, chapter }) {
        try {
            const resp = await fetch(`https://bolls.life/get-chapter/${translation}/${bookNum}/${chapter}/`);
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
    static getBollsChapterUrl({ translation, bookNum, chapter, verse }) {
        return `https://bolls.life/${translation}/${bookNum}/${chapter}/${verse ? verse + "/" : ""}`;
    }
    async bookSearch(query) {
        let selectedBooks = (await this.library)
            .map(e => e.books.map(b => {
            return {
                ...b,
                translation: e.short_name,
                searchWeight: 0
            };
        })).flat();
        let subqueries = query.split(" ");
        return selectedBooks.reduce((matches, book) => {
            let matchWeight = 0;
            let match = subqueries.filter((subQ) => {
                if (/[0-9]/.test(subQ)) {
                    if (RegExp(subQ.replace(/[^0-9]/g, "")).test(book.name)) {
                        matchWeight += 3;
                        return true;
                    }
                    else
                        return false;
                }
                else {
                    let matchLength = 0;
                    var len = 1;
                    for (; len <= subQ.length; len++) {
                        let exp = new RegExp(`(?<=\\s|^)${subQ.slice(0, len).replace(/(і|й|и)/gi, "(і|и|й)")}${len == subQ.length ? '(?=\\s|$)' : ''}`, "ig");
                        if (exp.test(book.name)) {
                            matchLength = len;
                            if (len == subQ.length)
                                matchLength += 2;
                        }
                        else
                            break;
                    }
                    if (matchLength) {
                        matchWeight += matchLength;
                        return true;
                    }
                    else
                        return false;
                }
            });
            if (match.length && matchWeight) {
                let searchWeight = matchWeight * match.length + (book.name.split(" ").length == match.length ? 2 : -3);
                if (searchWeight > 3) {
                    book.searchWeight = searchWeight;
                    matches.push(book);
                }
            }
            return matches;
        }, [])
            .sort((b1, b2) => b2.searchWeight - b1.searchWeight);
    }
    async getBook(bookName) {
        let searchInEdition = (await this.bookSearch(bookName.toString()))
            .filter(sr => sr.searchWeight >= bookName.length * 0.7);
        if (searchInEdition.length)
            return searchInEdition[0];
        else
            throw new Error(`Cannot find the book's number. Check the book's name spelling if it exists in selected Bible's edition(s).`);
    }
    async getExcerpt(ref) {
        let book = await this.getBook(ref.bookName);
        var versesData = await BollsController.fetchBollsChapter({
            translation: ref.translation || book.translation,
            bookNum: book.bookid,
            chapter: ref.chapter
        });
        if (ref.verses && ref.verses.length) {
            versesData = versesData.filter(verse => ref.verses.includes(verse.verse));
        }
        return {
            ...ref,
            translation: ref.translation || book.translation,
            bookNum: book.bookid,
            versesData
        };
    }
}

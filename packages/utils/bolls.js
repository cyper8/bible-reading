export class BollsController {
    static { this.API_ROOT = 'https://bolls.life'; }
    static { this.TRANSLATIONSINDEX_URL = this.API_ROOT + '/static/bolls/app/views/languages.json'; }
    static { this.TRANSLATIONSBOOKS_URL = this.API_ROOT + '/static/bolls/app/views/translations_books.json'; }
    static { this.DEFAULT_TRANSLATION = 'UBIO'; }
    constructor(defaultTranslation, languages = [], translations = []) {
        this.defaultTranslation = defaultTranslation;
        this.selectedLanguages = languages;
        this.selectedTranslations = translations;
        this.library = this.getBibleEditions({ languages, translations });
    }
    static getBollsHomepage(translation = this.DEFAULT_TRANSLATION) {
        return `${this.API_ROOT}/${translation}/`;
    }
    static async fetchTranslationsIndex() {
        try {
            const resp = await fetch(this.TRANSLATIONSINDEX_URL);
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
    static async fetchTranslationsBooks() {
        try {
            const resp = await fetch(this.TRANSLATIONSBOOKS_URL);
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
    async getBibleEditions({ languages = [], translations = [] }) {
        try {
            const booksIndex = await BollsController.fetchTranslationsBooks();
            var translationsIndex = await BollsController.fetchTranslationsIndex();
            if (languages.length) {
                translationsIndex = translationsIndex
                    .filter(ln => languages.some(lang => ln.language.includes(lang)));
            }
            else
                this.selectedLanguages = languages = translationsIndex.map(ln => ln.language);
            if (translations.length) {
                translationsIndex = translationsIndex
                    .filter(ln => {
                    ln.translations = ln.translations.filter(tr => translations.includes(tr.short_name));
                    return ln.translations.length > 0;
                });
            }
            else
                this.selectedTranslations = translations = Object.keys(booksIndex);
            return translationsIndex
                .map(ln => ln.translations.map(tr => {
                return {
                    ...tr,
                    language: ln.language,
                    books: booksIndex[tr.short_name]
                };
            })).flat();
        }
        catch (error) {
            console.error(error);
            return [];
        }
    }
    static async fetchTranslationBooks(translationShortName) {
        try {
            const resp = await fetch(`${this.API_ROOT}/get-books/${translationShortName}/`);
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
    static async fetchChapter(translation, book, chapter) {
        try {
            const resp = await fetch(`${this.API_ROOT}/get-chapter/${translation}/${book}/${chapter}/`);
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
    async fetchChapter(ref) {
        let bookNum = (await this.getBook(ref.bookName)).bookid;
        return BollsController.fetchChapter(ref.translation || this.defaultTranslation || BollsController.DEFAULT_TRANSLATION, bookNum, ref.chapter);
    }
    static getChapterUrl(translation, book, chapter, verse) {
        return `${this.API_ROOT}/${translation}/${book}/${chapter}/${verse ? verse + "/" : ""}`;
    }
    async getChapterUrl(ref) {
        let bookNum = (await this.getBook(ref.bookName)).bookid;
        return BollsController.getChapterUrl(ref.translation || this.defaultTranslation || BollsController.DEFAULT_TRANSLATION, bookNum, ref.chapter, ref.verses?.length ? ref.verses[0] : undefined);
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
        let translation = ref.translation || book.translation;
        let bookNum = book.bookid;
        let chapter = ref.chapter;
        var versesData = await BollsController.fetchChapter(translation, bookNum, chapter);
        if (ref.verses && ref.verses.length) {
            versesData = versesData.filter(verse => ref.verses.includes(verse.verse));
        }
        return {
            ...ref,
            translation,
            reference: ref.reference + (ref.translation ? '' : ` (${translation})`),
            bookNum,
            versesData,
            url: BollsController.getChapterUrl(translation, bookNum, ref.chapter, ref.verses?.length ? ref.verses[0] : undefined)
        };
    }
}

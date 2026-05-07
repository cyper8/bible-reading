import { BibleLibrary } from "./BibleLibrary.js";
export class BollsBibleService {
    static { this.API_ROOT = 'https://bolls.life'; }
    static { this.TRANSLATIONSINDEX_URL = this.API_ROOT + '/static/bolls/app/views/languages.json'; }
    static { this.TRANSLATIONSBOOKS_URL = this.API_ROOT + '/static/bolls/app/views/translations_books.json'; }
    static { this.allEditions = this.getEditions(); }
    static getBollsHomepage(translation) {
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
    static compileEditions(booksIndex, translationsIndex) {
        return translationsIndex
            .map(ln => ln.translations.map(tr => {
            return {
                ...tr,
                language: ln.language,
                books: booksIndex[tr.short_name]
            };
        })).flat();
    }
    static async getEditions() {
        const booksIndex = await BollsBibleService.fetchTranslationsBooks();
        var translationsIndex = await BollsBibleService.fetchTranslationsIndex();
        return this.compileEditions(booksIndex, translationsIndex);
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
    static getChapterUrl(translation, book, chapter, verse) {
        return `${this.API_ROOT}/${translation}/${book}/${chapter}/${verse ? verse + "/" : ""}`;
    }
    get selectedLanguages() { return this._selectedLanguages; }
    get selectedTranslations() { return this._selectedTranslations; }
    constructor() {
        this._selectedLanguages = [];
        this._selectedTranslations = [];
        this.library = BollsBibleService.allEditions.then(editions => new BibleLibrary(editions));
    }
    selectLanguages(languages) {
        return this.library.then(library => {
            let lib = library.setLanguages(languages);
            this._selectedLanguages = lib.selectedLanguages;
            return lib;
        });
    }
    selectTranslations(translations) {
        return this.library.then(editions => {
            let lib = editions.setTranslations(translations);
            this._selectedTranslations = lib.selectedTranslations;
            return lib;
        });
    }
    async bookSearch(query) {
        return (await this.library).bookSearch(query);
    }
    async getBook(bookName, translation) {
        let searchInEdition = (await this.bookSearch(bookName.toString()))
            .filter(sr => sr.searchWeight >= 60), result = searchInEdition;
        if (searchInEdition.length) {
            if (translation) {
                result = searchInEdition.filter(book => book.translation == translation);
                if (result.length)
                    return searchInEdition[0];
                else {
                    let bookid = searchInEdition[0].bookid;
                    let books = (await BollsBibleService.allEditions).find(ed => ed.short_name === translation)?.books;
                    if (books?.length) {
                        result = books.filter(b => b.bookid == bookid);
                        if (result.length)
                            return result[0];
                    }
                }
            }
        }
        throw new Error(`Cannot find the book. Check the book's name spelling if it exists in selected Bible's edition(s).`);
    }
}

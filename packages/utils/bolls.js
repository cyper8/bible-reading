export class BollsBibleService {
    static { this.API_ROOT = 'https://bolls.life'; }
    static { this.TRANSLATIONSINDEX_URL = this.API_ROOT + '/static/bolls/app/views/languages.json'; }
    static { this.TRANSLATIONSBOOKS_URL = this.API_ROOT + '/static/bolls/app/views/translations_books.json'; }
    static { this.allEditions = this.getLibrary(); }
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
    static async getLibrary() {
        const booksIndex = await BollsBibleService.fetchTranslationsBooks();
        var translationsIndex = await BollsBibleService.fetchTranslationsIndex();
        return translationsIndex
            .map(ln => ln.translations.map(tr => {
            return {
                ...tr,
                language: ln.language,
                books: booksIndex[tr.short_name]
            };
        })).flat();
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
        this.library = BollsBibleService.allEditions.then(editions => {
            this._selectedLanguages = editions.map(edition => edition.language);
            this._selectedTranslations = editions.map(edition => edition.short_name);
            return editions;
        });
    }
    selectLanguages(languages) {
        return this.library = BollsBibleService.allEditions.then(editions => {
            this._selectedLanguages = languages;
            return editions.filter(ln => languages.some(lang => ln.language.includes(lang)));
        });
    }
    selectTranslations(translations) {
        return this.library = BollsBibleService.allEditions.then(editions => {
            this._selectedTranslations = translations;
            return editions
                .filter(edition => translations.includes(edition.short_name));
        });
    }
    async bookSearch(query) {
        const MAX_SKIPS = 1;
        const MIN_MATCHES = 3;
        let selectedBooks = (await this.library)
            .map(e => e.books.map(b => {
            return {
                ...b,
                translation: e.short_name,
                searchWeight: 0
            };
        })).flat();
        let qwords = query.split(" ");
        return selectedBooks.reduce((matches, book) => {
            let name = book.name;
            let matchWeight = 0;
            let match = qwords.filter((qword) => {
                if (/[0-9]/.test(qword)) {
                    let numtest = qword.replace(/[^0-9]/g, "");
                    if (RegExp(numtest).test(name)) {
                        matchWeight += 2;
                        return true;
                    }
                    else
                        return false;
                }
                else {
                    let matchLength = 0;
                    var test = "";
                    var skipcount = 0;
                    var matchcount = 0;
                    var len = 0;
                    const compileExpr = (q) => new RegExp(`(\\s|^)${q.replace(/(?<=\s|^)(ів|йо|іо)/ig, "(ів|іо|йо)")}${len == qword.length - 1 ? '(\\s|$)' : ''}`, "igu");
                    var expr;
                    for (; len < qword.length; len++) {
                        test += qword[len];
                        expr = compileExpr(test);
                        if (!(expr.test(name))) {
                            if (skipcount < MAX_SKIPS && matchcount >= MIN_MATCHES) {
                                skipcount++;
                                if (skipcount == MAX_SKIPS)
                                    matchcount = 0;
                                test = test.slice(0, len) + ".";
                                expr = compileExpr(test);
                                if (!(expr.test(name))) {
                                    break;
                                }
                            }
                            else
                                break;
                        }
                        else {
                            skipcount = 0;
                            matchcount++;
                        }
                        matchLength = len + 1;
                        if (len == qword.length - 1)
                            matchLength += 1;
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
                let searchWeight = Math.round((matchWeight / name.length) * 100);
                if (searchWeight > 30) {
                    book.searchWeight = searchWeight;
                    matches.push(book);
                }
            }
            return matches;
        }, [])
            .sort((b1, b2) => b2.searchWeight - b1.searchWeight);
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

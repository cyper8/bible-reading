import { quzzySearch } from "./quzzySearch.js";
export class BibleLibrary {
    get allBooks() { return this._index; }
    get selectedLanguages() { return this._selectedLanguages; }
    get selectedEditions() { return this._selectedEditions; }
    constructor(editions) {
        this._index = [];
        this._selectedLanguages = [];
        this._selectedEditions = [];
        this._index = editions;
        this._selectedLanguages = editions.map(edition => edition.language);
        this._selectedEditions = editions.map(edition => edition.short_name);
    }
    selectLanguages(languages) {
        return new BibleLibrary(this._index.filter(edition => languages.some(lang => edition.language.includes(lang))));
    }
    setLanguages(languages) {
        this._index = this._index.filter(edition => languages.some(lang => edition.language.includes(lang)));
        this._selectedLanguages = languages;
        return this;
    }
    selectEditions(editions) {
        return new BibleLibrary(this._index.filter(edition => editions.includes(edition.short_name)));
    }
    setEditions(editions) {
        this._index = this._index.filter(edition => editions.includes(edition.short_name));
        this._selectedEditions = editions;
        return this;
    }
    getEdition(shortName) {
        return this.allBooks.find(ed => ed.short_name == shortName);
    }
    searchBookName(query, options) {
        let selectedBooks = this._index.map(e => e.books.map(b => {
            return {
                ...b,
                translation: e.short_name,
                searchWeight: 0
            };
        })).flat();
        return quzzySearch(query, ["name"], selectedBooks, options);
    }
    getBook(query, edition, options) {
        if (typeof query == 'number') {
            if (!edition)
                throw new Error('You must provide translation short name to retrieve a book by id.');
            else {
                let book = this.getEdition(edition)?.books.find(book => book.bookid == query);
                if (book)
                    return book;
            }
        }
        else {
            let bookNameSearchResult = this.searchBookName(query, options);
            if (bookNameSearchResult.length) {
                if (edition) {
                    let result = bookNameSearchResult.filter(book => book.translation == edition);
                    if (result.length)
                        return result[0];
                    else {
                        let bookid = bookNameSearchResult[0].bookid;
                        let books = (this.allBooks).find(ed => ed.short_name === edition)?.books;
                        if (books?.length) {
                            result = books.filter(b => b.bookid == bookid);
                            if (result.length)
                                return result[0];
                        }
                    }
                }
                else
                    return bookNameSearchResult[0];
            }
        }
        throw new Error(`Cannot find the book "${query}". Check the book's name spelling if it exists in selected Bible editions (${this.selectedEditions.join(',')}).`);
    }
}

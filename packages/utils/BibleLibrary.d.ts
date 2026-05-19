import { type BibleEdition, type BollsBible, type BookSearchResult } from "./bolls.js";
import { QuzzySearchOptions } from "./quzzySearch.js";
export declare class BibleLibrary {
    private _index;
    get allBooks(): BibleEdition[];
    private _selectedLanguages;
    get selectedLanguages(): string[];
    private _selectedEditions;
    get selectedEditions(): string[];
    constructor(editions: BibleEdition[]);
    selectLanguages(languages: string[]): BibleLibrary;
    setLanguages(languages: string[]): this;
    selectEditions(editions: BollsBible.Translation['short_name'][]): BibleLibrary;
    setEditions(editions: BollsBible.Translation['short_name'][]): this;
    getEdition(shortName: BollsBible.Translation['short_name']): BibleEdition | undefined;
    searchBookName(query: string, options?: QuzzySearchOptions): BookSearchResult[];
    getBook(bookid: number, edition: BollsBible.Translation['short_name'], options?: QuzzySearchOptions): BollsBible.Book;
    getBook(bookName: string, edition?: BollsBible.Translation['short_name'], options?: QuzzySearchOptions): BollsBible.Book;
}
//# sourceMappingURL=BibleLibrary.d.ts.map
import { BibleEdition, BollsBible, BookSearchResult } from "./bolls";
export declare class BibleLibrary {
    private _index;
    get all(): BibleEdition[];
    private _selectedLanguages;
    get selectedLanguages(): string[];
    private _selectedTranslations;
    get selectedTranslations(): string[];
    constructor(editions: BibleEdition[]);
    getLanguages(languages: string[]): BibleLibrary;
    setLanguages(languages: string[]): this;
    getTranslations(translations: BollsBible.Translation['short_name'][]): BibleLibrary;
    setTranslations(translations: BollsBible.Translation['short_name'][]): this;
    bookSearch(query: string): BookSearchResult[];
}
//# sourceMappingURL=BibleLibrary.d.ts.map
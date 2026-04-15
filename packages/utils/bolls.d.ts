export declare namespace BollsBible {
    interface Verse {
        pk: number;
        chapter: number;
        verse: number;
        text: string;
    }
    interface SingleVerse extends Verse {
        translation: string;
        book: number;
    }
    interface ChapterVerse extends Verse {
        comment?: string;
    }
    interface Translation {
        short_name: string;
        full_name: string;
        commentaries?: boolean;
        updated: number;
        info?: string;
        dir?: 'rtl' | 'ltr';
    }
    interface L10n {
        language: string;
        translations: Translation[];
    }
    interface Book {
        bookid: number;
        chronorder: number;
        name: string;
        chapter: number;
    }
    type BooksIndex = {
        [edition in Translation["short_name"]]: Book[];
    };
}
export interface BookSearchResult extends BollsBible.Book {
    translation: BollsBible.Translation['short_name'];
    searchWeight: number;
}
export interface BibleEdition extends BollsBible.Translation {
    language: string;
    books: BollsBible.Book[];
}
export interface BibleReference {
    translation?: BollsBible.Translation["short_name"];
    reference: string;
    bookName: string;
    chapter: number;
    verses?: number[];
}
export interface BibleExcerptData extends BibleReference {
    translation: BollsBible.Translation["short_name"];
    bookNum: number;
    versesData: BollsBible.ChapterVerse[];
    url: string;
}
export declare class BollsBibleService {
    static API_ROOT: string;
    static TRANSLATIONSINDEX_URL: string;
    static TRANSLATIONSBOOKS_URL: string;
    static allEditions: Promise<BibleEdition[]>;
    static getBollsHomepage(translation: BollsBible.Translation['short_name']): string;
    static fetchTranslationsIndex(): Promise<BollsBible.L10n[]>;
    static fetchTranslationsBooks(): Promise<BollsBible.BooksIndex>;
    static getLibrary(): Promise<BibleEdition[]>;
    static fetchTranslationBooks(translationShortName: string): Promise<BollsBible.Book[]>;
    static fetchChapter(translation: string, book: number, chapter: number): Promise<BollsBible.ChapterVerse[]>;
    static getChapterUrl(translation: string, book: number, chapter: number, verse?: number): string;
    private _selectedLanguages;
    get selectedLanguages(): string[];
    private _selectedTranslations;
    get selectedTranslations(): string[];
    library: Promise<BibleEdition[]>;
    constructor();
    selectLanguages(languages: string[]): Promise<BibleEdition[]>;
    selectTranslations(translations: BollsBible.Translation['short_name'][]): Promise<BibleEdition[]>;
    bookSearch(query: string): Promise<BookSearchResult[]>;
    getBook(bookName: string, translation?: BollsBible.Translation['short_name']): Promise<BollsBible.Book>;
}
//# sourceMappingURL=bolls.d.ts.map
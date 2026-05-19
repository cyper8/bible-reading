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
        chapters: number;
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
export interface BibleEditionsFilterOptions {
    languages?: string[];
    translations?: BollsBible.Translation['short_name'][];
}
export interface BibleReference {
    translation?: BollsBible.Translation["short_name"];
    reference: string;
    bookName: string;
    chapter: number;
    verses?: number[];
}
export type BibleReferenceContext = Partial<BibleReference>;
export interface BibleExcerptData extends BibleReference {
    translation: BollsBible.Translation["short_name"];
    bookNum: number;
    versesData: BollsBible.ChapterVerse[];
    url: string;
}
export declare const BOLLS_HOSTNAME = "https://bolls.life";
export declare const API_ROOT = "https://bolls.life";
export declare const TRANSLATIONSINDEX_URL: string;
export declare const TRANSLATIONSBOOKS_URL: string;
export declare const allEditions: Promise<BibleEdition[]>;
export declare function getBollsHomepage(translation: BollsBible.Translation['short_name']): string;
export declare function fetchTranslationsIndex(): Promise<BollsBible.L10n[]>;
export declare function fetchTranslationsBooks(): Promise<BollsBible.BooksIndex>;
export declare function compileEditions(booksIndex: BollsBible.BooksIndex, translationsIndex: BollsBible.L10n[]): BibleEdition[];
export declare function getEditions(filterOptions?: BibleEditionsFilterOptions): Promise<BibleEdition[]>;
export declare function fetchTranslationBooks(translationShortName: string): Promise<BollsBible.Book[]>;
export declare function fetchChapter(translation: string, book: number, chapter: number): Promise<BollsBible.ChapterVerse[]>;
export declare function getChapterUrl(translation: string, book: number, chapter: number, verse?: number): string;
export declare function parseReferenses(refs: string, context?: BibleReferenceContext): BibleReference[];
//# sourceMappingURL=bolls.d.ts.map
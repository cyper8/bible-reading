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
    translation: string;
    bookNum: number;
    versesData: BollsBible.ChapterVerse[];
}
export declare class BollsController {
    static BOLLS_HOSTNAME: string;
    static BOLLS_TRANSLATIONSINDEX: string;
    static BOLLS_TRANSLATIONSBOOKS: string;
    static DEFAULT_TRANSLATION: string;
    readonly selectedLanguages?: string[];
    readonly selectedTranslations?: string[];
    library: Promise<BibleEdition[]>;
    constructor({ languages, translations }: {
        languages?: string[];
        translations?: string[];
    });
    static getBollsHomepage(translation?: string): string;
    static fetchBollsTranslationsIndex(): Promise<BollsBible.L10n[]>;
    static fetchBollsTranslationsBooks({ languages, translations }: {
        languages: string[];
        translations: BollsBible.Translation['short_name'][];
    }): Promise<BibleEdition[]>;
    static fetchBollsTranslationBooks(translationShortName: string): Promise<BollsBible.Book[]>;
    static fetchBollsChapter({ translation, bookNum, chapter }: {
        translation: BollsBible.Translation['short_name'];
        bookNum: number;
        chapter: number;
    }): Promise<BollsBible.ChapterVerse[]>;
    static getBollsChapterUrl({ translation, bookNum, chapter, verse }: {
        translation: BollsBible.Translation['short_name'];
        bookNum: number;
        chapter: number;
        verse?: number;
    }): string;
    bookSearch(query: string): Promise<BookSearchResult[]>;
    getBook(bookName: string): Promise<BookSearchResult>;
    getExcerpt(ref: BibleReference): Promise<BibleExcerptData>;
}
//# sourceMappingURL=bolls.d.ts.map
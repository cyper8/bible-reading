/** /bolls/ => https://bolls.life/ */
export declare const BOLLS_TRANSLATIONS = "/bolls/static/bolls/app/views/languages.json";
export declare const BOLLS_EDITIONSBOOKS = "/bolls/static/bolls/app/views/translations_books.json";
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
    interface Edition {
        short_name: string;
        full_name: string;
        commentaries?: boolean;
        updated: number;
        info?: string;
        dir?: 'rtl' | 'ltr';
    }
    interface Translation {
        language: string;
        translations: Edition[];
    }
    interface Book {
        bookid: number;
        chronorder: number;
        name: string;
        chapter: number;
    }
    type Translations = Translation[];
    type EditionBooks = {
        [edition in Edition["short_name"]]: Book[];
    };
    type ChapterVerses = ChapterVerse[];
}
export declare function fetchBollsTranslations(): Promise<BollsBible.Translations>;
export declare function fetchBollsEditionBooks(): Promise<BollsBible.EditionBooks>;
export declare function fetchBollsChapter({ edition, book, chapter }: {
    edition: BollsBible.Edition['short_name'];
    book: number;
    chapter: number;
}): Promise<BollsBible.ChapterVerses>;
export declare function getBollsChapterUrl({ edition, book, chapter, verse }: {
    edition: BollsBible.Edition['short_name'];
    book: number;
    chapter: number;
    verse?: number;
}): string;
//# sourceMappingURL=bolls.d.ts.map
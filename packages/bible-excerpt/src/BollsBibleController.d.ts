import { ReactiveController, ReactiveControllerHost } from "lit";
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
        editions: Edition[];
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
export declare class BollsBibleController implements ReactiveController {
    private static fetchBolls;
    static translations: Promise<BollsBible.Translations>;
    static editions: Promise<BollsBible.EditionBooks>;
    getChapter(editionName: string, bookNum: number, chapter: number): Promise<BollsBible.ChapterVerses>;
    host: ReactiveControllerHost;
    translations: BollsBible.Translations;
    editions: BollsBible.EditionBooks;
    constructor(host: ReactiveControllerHost);
    hostConnected(): void;
    hostDisconnected(): void;
    hostUpdate(): void;
    hostUpdated(): void;
}
//# sourceMappingURL=BollsBibleController.d.ts.map
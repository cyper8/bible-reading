import { ReactiveController, ReactiveControllerHost } from "lit";
import { BollsBible } from "../../utils/bolls.js";
export interface BibleReference {
    edition: BollsBible.Edition["short_name"];
    reference: string;
    bookName: string;
    book: number | undefined;
    chapter: number;
    selectedVerses: number[];
}
export interface BibleExcerptData extends BibleReference {
    book: number;
    verses: BollsBible.ChapterVerses;
}
export interface BookSearchResult extends BollsBible.Book {
    edition: BollsBible.Edition['short_name'];
    searchWeight: number;
}
export interface BibleEdition extends BollsBible.Edition {
    language: string;
    books: BollsBible.Book[];
}
export declare function isBibleExcerpt(reference: BibleReference | BibleExcerptData): reference is BibleExcerptData;
export declare class BibleController implements ReactiveController {
    static editions: Promise<BibleEdition[]>;
    static bookSearch(query: string, editions?: Promise<BibleEdition[]>): Promise<BookSearchResult[]>;
    static getBookNum(bookName: string, editions?: Promise<BibleEdition[]>): Promise<number | undefined>;
    static parseReferenses(refs: string, editions?: Promise<BibleEdition[]>): Promise<BibleReference[]>;
    private static getBibleEditions;
    parseReferenses(refs: string): Promise<BibleReference[]>;
    static refAnchor(ref: {
        edition: BollsBible.Edition['short_name'];
        book: number | undefined;
        chapter: number;
        selectedVerses: number[];
        reference: string;
    }): string;
    host: ReactiveControllerHost;
    get editions(): Promise<BibleEdition[]>;
    private languages;
    private _reference;
    get reference(): string;
    set reference(ref: string);
    excerpts: (BibleReference | BibleExcerptData)[];
    init(ref: string): void;
    constructor(host: ReactiveControllerHost);
    hostConnected(): void;
    hostDisconnected(): void;
    hostUpdate(): void;
    hostUpdated(): void;
}
//# sourceMappingURL=BibleController.d.ts.map
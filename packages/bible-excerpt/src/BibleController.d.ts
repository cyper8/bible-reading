import { ReactiveController, ReactiveControllerHost } from "lit";
import { BollsBible } from "../../utils/bolls.js";
export interface BibleReference {
    edition: BollsBible.Edition["short_name"];
    reference: string;
    bookName: string;
    book: number;
    chapter: number;
    selectedVerses: number[];
}
export interface BibleExcerptData extends BibleReference {
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
export declare class BibleController implements ReactiveController {
    static editions: Promise<BibleEdition[]>;
    static bookSearch(query: string, editions: BibleEdition[]): BookSearchResult[];
    static getBookNum(bookName: string, editions: BibleEdition[]): number | undefined;
    static parseReferenses(refs: string, editions: BibleEdition[]): BibleReference[];
    static getBibleEditions(bollsTranslations: BollsBible.Translations, bollsEditions: BollsBible.EditionBooks): BibleEdition[];
    selectLanguages(languages: string[]): Promise<void>;
    parseReferenses(refs: string, editions?: BibleEdition[]): BibleReference[];
    static refAnchor(ref: {
        edition: BollsBible.Edition['short_name'];
        book: number;
        chapter: number;
        selectedVerses: number[];
        reference: string;
    }): string;
    host: ReactiveControllerHost;
    translations: BollsBible.Translations;
    editions: BibleEdition[];
    private _languages;
    get languages(): string[];
    set languages(langs: string[]);
    private _reference;
    get reference(): string;
    set reference(ref: string);
    excerpts: BibleExcerptData[];
    init(ref: string): void;
    constructor(host: ReactiveControllerHost);
    hostConnected(): void;
    hostDisconnected(): void;
    hostUpdate(): void;
    hostUpdated(): void;
}
//# sourceMappingURL=BibleController.d.ts.map
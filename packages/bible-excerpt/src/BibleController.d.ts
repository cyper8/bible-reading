import { ReactiveController, ReactiveControllerHost } from "lit";
import { BibleExcerptData, BibleReference, BollsBible, BollsController } from "../../utils/bolls.js";
import { type BibleDataSource } from './bible-excerpt.js';
export declare class BibleController implements ReactiveController, BibleDataSource {
    remote: BollsController;
    static parseReferenses(refs: string): BibleReference[];
    static refAnchor({ translation, bookNum, chapter, verse, reference }: {
        translation: BollsBible.Translation['short_name'];
        bookNum: number;
        chapter: number;
        verse?: number;
        reference: string;
    }): string;
    host: ReactiveControllerHost;
    private _reference;
    get reference(): string;
    set reference(ref: string);
    excerpts: BibleExcerptData[];
    constructor(host: ReactiveControllerHost);
    hostConnected(): void;
    hostDisconnected(): void;
    hostUpdate(): void;
    hostUpdated(): void;
}
//# sourceMappingURL=BibleController.d.ts.map
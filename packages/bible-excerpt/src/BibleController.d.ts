import { ReactiveController, ReactiveControllerHost } from "lit";
import { BibleExcerptData, BibleReference, BollsController } from "../../utils/bolls.js";
import { type BibleDataSource } from './bible-excerpt.js';
export declare class BibleController implements ReactiveController, BibleDataSource {
    static remote: BollsController;
    static parseReferenses(refs: string): BibleReference[];
    static parseExcerpts(refs: string): Promise<BibleExcerptData[]>;
    static refAnchor(ref: BibleReference): Promise<string>;
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
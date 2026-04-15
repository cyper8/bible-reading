import { ReactiveController, ReactiveControllerHost } from "lit";
import { BibleExcerptData, BibleReference, BollsBible, BollsBibleService } from "../../utils/bolls.js";
type BibleReferenceContext = Partial<BibleReference>;
export declare class BibleController implements ReactiveController {
    static parseReferenses(refs: string, context?: BibleReferenceContext): BibleReference[];
    getExcerpts(refs: BibleReference[]): Promise<BibleExcerptData[]>;
    getUrls(refs: BibleReference[]): Promise<string[]>;
    host: ReactiveControllerHost;
    remote: BollsBibleService;
    defaultTranslation: string;
    private _reference;
    get reference(): string;
    set reference(ref: string);
    excerpts: BibleExcerptData[];
    constructor(host: ReactiveControllerHost, defaultTranslation: BollsBible.Translation['short_name'], languages?: string[], translations?: BollsBible.Translation['short_name'][]);
    hostConnected(): void;
    hostDisconnected(): void;
    hostUpdate(): void;
    hostUpdated(): void;
}
export {};
//# sourceMappingURL=BibleController.d.ts.map
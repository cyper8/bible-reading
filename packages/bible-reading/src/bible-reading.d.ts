import { LitElement, PropertyValues } from "lit";
import "../../bible-excerpt/index.js";
import "../../day-selector/index.js";
import { type BollsBible } from '../../utils/bolls.js';
import { DayData } from "../../day-selector/src/day-selector.js";
import { BibleLibrary } from "../../utils/BibleLibrary.js";
export declare interface ReadingDay extends DayData {
    date: Date;
    reading: string;
    questions: string;
    exposition: string;
}
export type RawReadingDay = {
    [key in keyof ReadingDay]: string;
};
export declare function isRawReadingDay(obj: Object): obj is RawReadingDay;
export declare class BibleReading extends LitElement {
    readingUrl: string;
    date: string;
    defaultTranslation: BollsBible.Translation['short_name'];
    static: boolean;
    library: BibleLibrary;
    month: ReadingDay[];
    day?: ReadingDay | Partial<ReadingDay>;
    changed: boolean;
    hilightVerses: string;
    constructor();
    private getReadingData;
    parseReadingFromJSON(json: string): ReadingDay[];
    hilight(verses: string): void;
    loadDay(date: Date): void;
    static get greetings(): string[];
    static get appeals(): string[];
    static greeting(hours24: number): import("lit-html").TemplateResult<1>;
    greeting: import("lit-html").TemplateResult<1>;
    private getUrls;
    activateReferences(text: string, library: BibleLibrary): string;
    protected updated(_changedProperties: PropertyValues<BibleReading>): void;
    connectedCallback(): void;
    private updateReading;
    private uploadReadingDay;
    protected render(): unknown;
    static get styles(): import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-reading': BibleReading;
    }
}
//# sourceMappingURL=bible-reading.d.ts.map
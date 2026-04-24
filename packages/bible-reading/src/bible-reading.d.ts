import { LitElement, PropertyValues } from "lit";
import "../../bible-excerpt/index.js";
import "../../day-selector/index.js";
import { type BollsBible } from '../../utils/bolls.js';
import { BibleController } from "../../bible-excerpt/src/BibleController.js";
import { DayData } from "../../day-selector/src/day-selector.js";
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
    bible: BibleController;
    static: boolean;
    month: ReadingDay[];
    day?: ReadingDay;
    questions: string;
    exposition: string;
    hilightVerses: string;
    private getReadingData;
    parseReadingFromJSON(json: string): ReadingDay[];
    hilight(verses: string): void;
    private activateInnerReferences;
    static get greetings(): string[];
    static get appeals(): string[];
    static greeting(hours24: number): import("lit-html").TemplateResult<1>;
    greeting: import("lit-html").TemplateResult<1>;
    parseLinks(text: string): Promise<string>;
    parseMarkdown(content: string): string;
    protected updated(_changedProperties: PropertyValues<BibleReading>): void;
    protected willUpdate(_changedProperties: PropertyValues<BibleReading>): void;
    connectedCallback(): void;
    protected render(): unknown;
    static get styles(): import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-reading': BibleReading;
    }
}
//# sourceMappingURL=bible-reading.d.ts.map
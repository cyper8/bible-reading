import { LitElement, PropertyValues } from "lit";
import "../../bible-excerpt/index.js";
import "../../day-selector/index.js";
import { ReadingDataProvider, ReadingDay, ReadingMonth } from "./ReadingController.js";
export interface ReadingDataSource {
    date: Date;
    month: ReadingMonth;
    day: ReadingDay;
}
export declare class BibleReading extends LitElement {
    parseReadingDataFromLightDOM: ReadingDataProvider;
    reading: ReadingDataSource;
    questions: string;
    exposititon: string;
    private activateReferences;
    static get greetings(): string[];
    static get appeals(): string[];
    greeting(date: Date): import("lit-html").TemplateResult<1>;
    refsToLinks(text: string): Promise<string>;
    protected willUpdate(_changedProperties: PropertyValues<BibleReading>): void;
    protected updated(_changedProperties: PropertyValues<BibleReading>): void;
    protected render(): unknown;
    static get styles(): import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-reading': BibleReading;
    }
}
//# sourceMappingURL=bible-reading.d.ts.map
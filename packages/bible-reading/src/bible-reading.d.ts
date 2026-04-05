import { LitElement, PropertyValues } from "lit";
import "../../bible-excerpt/index.js";
import "../../day-selector/index.js";
import { ReadingDataProvider, ReadingDay } from "./ReadingController.js";
export interface ReadingDataSource {
    date: Date;
    month: ReadingDay[];
    day?: ReadingDay;
}
export declare class BibleReading extends LitElement {
    getReadingDataFromServer: ReadingDataProvider;
    parseReadingDataFromLightDOM: ReadingDataProvider;
    datasource?: string;
    reading: ReadingDataSource;
    questions: string;
    exposititon: string;
    private activateReferences;
    static get greetings(): string[];
    static get appeals(): string[];
    greeting(date: Date): import("lit-html").TemplateResult<1>;
    parseLinks(text: string): Promise<string>;
    parseMarkdown(content: string): string;
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
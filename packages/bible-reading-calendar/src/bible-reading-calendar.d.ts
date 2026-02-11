import { LitElement, PropertyValueMap } from "lit";
export declare interface ReadingData {
    date: Date;
    reading: string;
}
export declare type ReadingDateSelectedEvent = CustomEvent<ReadingData> & {
    type: 'reading-date-selected';
};
export declare class BibleReadingCalendar extends LitElement {
    monthReading: string[][];
    currentReadingDate?: Date;
    date: Date;
    fetchDataFor(thedate: Date): Promise<string[][]>;
    private genMonth;
    private reportData;
    protected updated(_changedProperties: PropertyValueMap<this> | Map<PropertyKey, unknown>): void;
    protected render(): import("lit-html").TemplateResult<1>;
    static get styles(): import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-reading-calendar': BibleReadingCalendar;
    }
}
//# sourceMappingURL=bible-reading-calendar.d.ts.map
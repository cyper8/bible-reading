import { LitElement } from "lit";
export declare interface ReadingDay {
    date: Date;
    reading: string;
    questions: string;
    exposition: string;
}
export declare type ReadingDateSelectedEvent = CustomEvent<ReadingDay> & {
    type: 'reading-date-selected';
};
export declare class BibleReadingCalendar extends LitElement {
    date: Date;
    reading: ReadingDay[];
    private genMonth;
    private reportData;
    protected render(): import("lit-html").TemplateResult<1>;
    static get styles(): import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-reading-calendar': BibleReadingCalendar;
    }
}
//# sourceMappingURL=bible-reading-calendar.d.ts.map
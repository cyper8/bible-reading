import { LitElement, PropertyValues } from "lit";
export interface DayData {
    date: Date;
}
export declare type DateSelectedEvent<T extends DayData> = CustomEvent<T> & {
    type: 'date-selected';
};
export declare class DaySelector<T extends DayData> extends LitElement {
    date: string;
    month: T[];
    private genMonth;
    private reportData;
    protected updated(_changedProperties: PropertyValues<this>): void;
    protected render(): import("lit-html").TemplateResult<1>;
    static get styles(): import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'day-selector': DaySelector<any>;
    }
}
//# sourceMappingURL=day-selector.d.ts.map
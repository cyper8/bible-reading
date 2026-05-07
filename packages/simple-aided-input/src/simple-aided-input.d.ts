import { LitElement, PropertyValues } from "lit";
export type AidedInputEvent = CustomEvent<string> & {
    type: 'aided-input';
};
export type ValueChangedEvent = CustomEvent<string> & {
    type: 'value-changed';
};
export type ValueUnchangedEvent = CustomEvent<string> & {
    type: 'value-unchanged';
};
export interface InputSuggestion {
    name: string;
    value: string;
}
export declare class SimpleAidedInput extends LitElement {
    value: string;
    input: string;
    mode: 'replace' | 'append';
    selected: number;
    suggestions: InputSuggestion[];
    private handleInput;
    private handleKeys;
    private takeSuggestion;
    protected willUpdate(_changedProperties: PropertyValues<SimpleAidedInput>): void;
    protected updated(changedProperties: PropertyValues<SimpleAidedInput>): void;
    protected render(): unknown;
    static styles: import("lit").CSSResult[];
}
declare global {
    interface HTMLElementTagNameMap {
        "simple-aided-input": SimpleAidedInput;
    }
}
//# sourceMappingURL=simple-aided-input.d.ts.map
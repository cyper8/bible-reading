import { LitElement, PropertyValueMap, TemplateResult } from "lit";
import { BollsBible } from "./BollsBibleController";
export declare class BibleEditionSelector extends LitElement {
    languages: string[];
    translations: BollsBible.Translations;
    editions: BollsBible.Edition[];
    selectedLanguage: BollsBible.Translation['language'];
    selectedEdition: BollsBible.Edition['short_name'];
    static get styles(): import("lit").CSSResult;
    private langs;
    private edits;
    selectLang(event: Event): void;
    selectEdit(event: Event): void;
    protected willUpdate(_changedProperties: PropertyValueMap<this> | Map<PropertyKey, unknown>): void;
    protected render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-edition-selector': BibleEditionSelector;
    }
}
//# sourceMappingURL=bible-edition-selector.d.ts.map
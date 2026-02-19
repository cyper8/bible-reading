import { LitElement, PropertyValues } from 'lit';
import { BollsBibleController } from './BollsBibleController.js';
export declare class BibleExcerpt extends LitElement {
    private excerpt;
    bible: BollsBibleController;
    selectTranslation: boolean;
    translation: string;
    book: string;
    chapter: string;
    verses: string;
    hilightVerses: string;
    private translationSelector;
    private bChapterVerse;
    private bExcerpt;
    protected willUpdate(_changedProperties: Map<PropertyKey, PropertyValues<this>>): void;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-excerpt': BibleExcerpt;
    }
}
//# sourceMappingURL=bible-excerpt.d.ts.map
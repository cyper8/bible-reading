import { LitElement, PropertyValues } from 'lit';
import { BibleController } from './BibleController.js';
export declare class BibleExcerpt extends LitElement {
    defaultTranslation: string;
    bible: BibleController;
    hilightVerses: string;
    reference: string;
    private bChapterVerse;
    protected willUpdate(_changedProperties: PropertyValues<BibleExcerpt>): void;
    render(): import("lit-html").TemplateResult<1> | undefined;
    static styles: import("lit").CSSResult[];
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-excerpt': BibleExcerpt;
    }
}
//# sourceMappingURL=bible-excerpt.d.ts.map
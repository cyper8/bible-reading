import { LitElement, PropertyValues } from 'lit';
import { BibleController } from './BibleController.js';
export declare class BibleExcerpt extends LitElement {
    bible: BibleController;
    hilightVerses: string;
    reference: string;
    private bChapterVerse;
    private bExcerpt;
    protected willUpdate(_changedProperties: PropertyValues<BibleExcerpt>): void;
    render(): import("lit-html").TemplateResult<1>[];
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-excerpt': BibleExcerpt;
    }
}
//# sourceMappingURL=bible-excerpt.d.ts.map
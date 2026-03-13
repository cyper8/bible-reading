import { LitElement, PropertyValues } from 'lit';
import { BibleExcerptData, BibleReference } from './BibleController.js';
export interface BibleDataSource {
    reference: string;
    excerpts: (BibleExcerptData | BibleReference)[];
}
export declare class BibleExcerpt extends LitElement {
    bible: BibleDataSource;
    hilightVerses: string;
    reference: string;
    private bChapterVerse;
    private bExcerpt;
    protected willUpdate(_changedProperties: PropertyValues<BibleExcerpt>): void;
    render(): import("lit-html").TemplateResult<1>[];
    static styles: import("lit").CSSResult[];
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-excerpt': BibleExcerpt;
    }
}
//# sourceMappingURL=bible-excerpt.d.ts.map
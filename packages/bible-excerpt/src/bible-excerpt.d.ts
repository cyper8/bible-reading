import { LitElement, PropertyValues } from 'lit';
import { type BibleExcerptData } from '../../utils/bolls.js';
export interface BibleExcerptsContent {
    reference: string;
    excerpts: BibleExcerptData[];
}
export declare class BibleExcerpt extends LitElement {
    defaultTranslation: string;
    bible: BibleExcerptsContent;
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
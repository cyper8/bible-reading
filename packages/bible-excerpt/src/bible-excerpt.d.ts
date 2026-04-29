import { LitElement, PropertyValues } from 'lit';
import { BibleReference, type BibleExcerptData, type BollsBible } from '../../utils/bolls.js';
import "../../simple-aided-input/index.js";
export interface BibleExcerptsContent {
    reference: string;
    excerpts: (BibleExcerptData | BibleReference)[];
}
export declare class BibleExcerpt extends LitElement {
    defaultTranslation: string;
    bible: BibleExcerptsContent;
    hilightVerses: string;
    reference: string;
    editable: boolean;
    private edit;
    private inputSuggestions;
    private getSuggestions;
    renderExcerpt(excerpt: BibleExcerptData | BibleReference, hilighted: number[]): import("lit-html").TemplateResult<1>;
    static renderChapterVerse(verse: BollsBible.ChapterVerse, hilight?: boolean): import("lit-html").TemplateResult<1>;
    static renderLink(url: string): import("lit-html").TemplateResult<1>;
    renderEdit(): import("lit-html").TemplateResult<1>;
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
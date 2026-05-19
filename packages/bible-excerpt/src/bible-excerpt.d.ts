import { LitElement, PropertyValues } from 'lit';
import { BibleReference, type BibleExcerptData, type BollsBible } from '../../utils/bolls.js';
import "../../simple-aided-input/index.js";
import { BibleLibrary } from '../../utils/BibleLibrary.js';
export type ExcerptsChangeEvent = CustomEvent<BibleExcerptData[]> & {
    type: 'excerpts-changed';
};
export declare class BibleExcerpt extends LitElement {
    defaultTranslation: string;
    library: BibleLibrary;
    hilightVerses: string;
    reference: string;
    editable: boolean;
    excerpts: (BibleExcerptData | BibleReference)[];
    private edit;
    private inputSuggestions;
    constructor();
    private getSuggestions;
    getExcerpts(refs: string): Promise<BibleExcerptData[]>;
    getExcerpts(refs: BibleReference[]): Promise<BibleExcerptData[]>;
    renderExcerpt(excerpt: BibleExcerptData | BibleReference, hilighted: number[]): import("lit-html").TemplateResult<1>;
    static renderChapterVerse(verse: BollsBible.ChapterVerse, hilight?: boolean): import("lit-html").TemplateResult<1>;
    static renderLink(url: string): import("lit-html").TemplateResult<1>;
    renderEdit(): import("lit-html").TemplateResult<1>;
    protected updated(_changedProperties: PropertyValues<BibleExcerpt>): void;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult[];
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-excerpt': BibleExcerpt;
    }
}
//# sourceMappingURL=bible-excerpt.d.ts.map
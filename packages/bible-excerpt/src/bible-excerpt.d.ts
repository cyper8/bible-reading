import { LitElement, PropertyValueMap } from 'lit';
export declare namespace BollsBible {
    interface BibleVerse {
        pk: number;
        chapter: number;
        verse: number;
        text: string;
    }
    interface BibleSingleVerse extends BibleVerse {
        translation: string;
        book: number;
    }
    interface BibleChapterVerse extends BibleVerse {
        comment?: string;
    }
    interface BibleEdition {
        short_name: string;
        full_name: string;
        commentaries?: boolean;
        updated: number;
        info?: string;
        dir?: 'rtl' | 'ltr';
    }
    interface BibleTranslation {
        language: string;
        editions: BibleEdition[];
    }
    interface BibleBook {
        bookid: number;
        chronorder: number;
        name: string;
        chapter: number;
    }
    type BibleTranslations = BibleTranslation[];
    type BibleEditions = {
        [edition in BibleEdition["short_name"]]: BibleBook[];
    };
    type BibleChapterVerses = BibleChapterVerse[];
}
export declare class BibleExcerpt extends LitElement {
    static bBible: Promise<[BollsBible.BibleTranslations, BollsBible.BibleEditions]>;
    private excerpt;
    selectTranslation: boolean;
    translation: string;
    book: string;
    chapter: string;
    verses: string;
    hilightVerses: string;
    private renderManualModeControls;
    private bChapterVerse;
    private bExcerpt;
    protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-excerpt': BibleExcerpt;
    }
}
//# sourceMappingURL=bible-excerpt.d.ts.map
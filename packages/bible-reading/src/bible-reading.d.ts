import { LitElement, PropertyValueMap } from "lit";
import "../../bible-excerpt/index.js";
import "../../bible-reading-calendar/index.js";
/**
 * Custom Element that loads Markdown file with the questions on Bible excerpt
 * and presents the excerpt itself with some extra utility stuff like hilighting
 * verses, referenced in questions.
 * Also it lets user to get month view of readings and load another day's reading
 *
 * @export
 * @class BibleReading
 * @extends {LitElement}
 */
export declare class BibleReading extends LitElement {
    book: string;
    chapter: string;
    verses: string;
    translation: string;
    content: string;
    private processContent;
    connectedCallback(): void;
    protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    protected render(): unknown;
    static get styles(): import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-reading': BibleReading;
    }
}
//# sourceMappingURL=bible-reading.d.ts.map
import { LitElement, PropertyValues } from "lit";
import "../../bible-excerpt/index.js";
import "../../day-selector/index.js";
import { ReadingController, ReadingDataProvider } from "./ReadingController.js";
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
    parseReadingDataFromLightDOM: ReadingDataProvider;
    reading: ReadingController;
    date: Date;
    questions: string;
    exposititon: string;
    private activateReferences;
    static get greetings(): string[];
    static get appeals(): string[];
    greeting(date: Date): import("lit-html").TemplateResult<1>;
    refsToLinks(text: string): Promise<string>;
    protected willUpdate(_changedProperties: PropertyValues<BibleReading>): void;
    protected updated(_changedProperties: PropertyValues<BibleReading>): void;
    protected render(): unknown;
    static get styles(): import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'bible-reading': BibleReading;
    }
}
//# sourceMappingURL=bible-reading.d.ts.map
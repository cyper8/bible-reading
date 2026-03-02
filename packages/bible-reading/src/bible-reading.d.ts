import { LitElement, PropertyValues } from "lit";
import "../../bible-excerpt/index.js";
import "../../bible-reading-calendar/index.js";
import { ReadingController } from "./ReadingController.js";
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
    reading: ReadingController;
    date: Date;
    readingRef: string;
    questions: string;
    exposititon: string;
    private activateReferences;
    static get greetings(): string[];
    static get appeals(): string[];
    greeting(date: Date): string;
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
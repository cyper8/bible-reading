var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BibleReading_1;
import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
// import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { marked } from "marked";
import "../../bible-excerpt/index.js";
import "../../bible-reading-calendar/index.js";
import { ReadingController, stripHours } from "./ReadingController.js";
import { BibleController } from "../../bible-excerpt/src/BibleController.js";
import { pickOneOf } from "../../utils/pickOneOf.js";
// import { until } from "lit/directives/until.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
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
let BibleReading = BibleReading_1 = class BibleReading extends LitElement {
    constructor() {
        super(...arguments);
        this.reading = new ReadingController(this);
        this.date = stripHours(new Date());
        this.questions = '';
        this.exposititon = '';
    }
    activateReferences() {
        if (this.shadowRoot) {
            var node, textIterator = document.createNodeIterator(this.shadowRoot, NodeFilter.SHOW_TEXT, (node) => {
                let search = node.textContent?.match(/([0-9,іта -]*вірш[^)\s]*[0-9,іта -]*)/gmi);
                if (search?.length) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                else {
                    return NodeFilter.FILTER_REJECT;
                }
            });
            while (node = textIterator.nextNode()) {
                if (node.parentElement?.className.includes('ref-verses'))
                    continue;
                var refs = node.textContent?.matchAll(/([0-9,іта -]*вірш[^)\s]*[0-9,іта -]*)/gmi);
                if (refs) {
                    for (const match of refs) {
                        let ref = node.splitText(match.index);
                        let rest = ref.splitText(match[0].length);
                        let a = document.createElement('a');
                        a.appendChild(ref);
                        node.parentElement?.insertBefore(a, rest);
                        a.className = "ref-verses";
                        let vs = match[0].match(/[0-9-]+/g)?.filter(v => v).join(',');
                        a.addEventListener('click', (_event) => {
                            let excerpt = this.shadowRoot?.querySelector('bible-excerpt');
                            if (excerpt)
                                excerpt.hilightVerses = excerpt.hilightVerses ? '' : vs || '';
                        });
                    }
                }
            }
        }
    }
    static get greetings() {
        return [
            "Вітаю",
            "Вітаю",
            "Вітаю",
            "Мир вам",
            "Вітаю",
            "Вітаю",
            "Добрий ранок",
            "Добрий ранок",
            "Вітаю",
            "Добрий ранок",
            "Мир вам",
            "Вітаю",
            "Благословенного дня"
        ];
    }
    static get appeals() {
        return [
            "брати і сестри",
            "дорога церква",
            "брати і сестри",
            "дорога церква",
            "брати і сестри",
            "люба церква",
            "дорога церква",
            "брати і сестри",
            "дорогі брати і сестри",
            "брати і сестри",
        ];
    }
    greeting(date) {
        let hours = date.getHours(), time = hours > 15 ? "вечір" : hours > 10 ? "день" : "ранок";
        return html `<h2>${pickOneOf(BibleReading_1.greetings).replace("ранок", time)}, ${pickOneOf(BibleReading_1.appeals)}!</h2>`;
    }
    async refsToLinks(text) {
        const editions = await BibleController.editions;
        const inlineRef = /\[[^\[\]]+\]/gm;
        var refs = (text.match(inlineRef) || [])
            .map(match => match.substring(1, match.length - 1)) // remove square braces
            .map(refString => BibleController.parseReferenses(refString, editions))
            .map(refs => refs.map(ref => BibleController.refAnchor(ref)))
            .map(refs => refs.length > 1 ? refs.join(", ") : refs[0]);
        return text.split(inlineRef).map((part, index) => refs[index] ? part + refs[index] : part).join("");
    }
    willUpdate(_changedProperties) {
        if (_changedProperties.has("date")) {
            this.reading.setReadingDate(this.date)
                .then(() => {
                if (this.reading.day) {
                    if (this.reading.day.questions) {
                        marked.parse(this.reading.day.questions, { async: true })
                            .then(content => this.refsToLinks(content))
                            .then(content => {
                            this.questions = content;
                        });
                    }
                    else
                        this.questions = '';
                    if (this.reading.day.exposition) {
                        marked.parse(this.reading.day.exposition, { async: true })
                            .then(content => this.refsToLinks(content))
                            .then(content => {
                            this.exposititon = content;
                        });
                    }
                    else
                        this.exposititon = '';
                }
                else {
                    this.questions = '';
                    this.exposititon = '';
                }
            });
        }
    }
    updated(_changedProperties) {
        if (_changedProperties.has("questions") || _changedProperties.has("exposititon")) {
            this.activateReferences();
        }
    }
    render() {
        return html `<bible-reading-calendar .reading=${this.reading.month} @reading-date-selected="${(event) => {
            this.date = event.detail.date;
        }}"></bible-reading-calendar>
    ${this.reading.day
            ? html `${this.greeting(this.date)}
    <p>Сьогодні читаємо:</p>
    <bible-excerpt reference="${this.reading.day.reading}"></bible-excerpt>
    ${unsafeHTML(this.questions)}
    ${unsafeHTML(this.exposititon)}`
            : nothing}`;
    }
    static get styles() {
        return css `
    :host {
      display: block;
      padding: 1em;
    }
    a {
      font-weight: 500;
      color: var(--bible-excerpt-accent);
      text-decoration: inherit;
    }
    a:hover {
      color: var(--bible-excerpt-dark-accent)
    }
    `;
    }
};
__decorate([
    property({ type: Date })
], BibleReading.prototype, "date", void 0);
__decorate([
    property({ type: String })
], BibleReading.prototype, "questions", void 0);
__decorate([
    property({ type: String })
], BibleReading.prototype, "exposititon", void 0);
BibleReading = BibleReading_1 = __decorate([
    customElement('bible-reading')
], BibleReading);
export { BibleReading };

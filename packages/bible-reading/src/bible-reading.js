var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BibleReading_1;
import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { marked } from "marked";
import "../../bible-excerpt/index.js";
import "../../day-selector/index.js";
import { ReadingController, isRawReadingDay } from "./ReadingController.js";
import { BibleController } from "../../bible-excerpt/src/BibleController.js";
import { pickOneOf } from "../../utils/pickOneOf.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { getJSONP } from "../../utils/getJSONP.js";
let BibleReading = BibleReading_1 = class BibleReading extends LitElement {
    constructor() {
        super(...arguments);
        this.getReadingDataFromServer = (date) => this.datasource ? getJSONP(this.datasource, `date=${date.toDateString()}`) : Promise.resolve([]);
        this.parseReadingDataFromLightDOM = (date) => {
            const month = date.getMonth();
            const year = date.getFullYear();
            const request = date.toDateString();
            const content = this.innerHTML;
            if (content) {
                try {
                    let data = JSON.parse(content);
                    if (data instanceof Array) {
                        if (data.length && data[0].date) {
                            let dataDate = new Date(data[0].date);
                            if (dataDate.getMonth() !== month || dataDate.getFullYear() !== year && this.datasource) {
                                let params = new URLSearchParams(location.search);
                                if (params.has("date")) {
                                    if (params.get("date") == request) {
                                        throw Error(`Server responded with wrong data.`);
                                    }
                                }
                                window.location.href = this.datasource + `?date=${request}`;
                            }
                            return data.filter(obj => isRawReadingDay(obj));
                        }
                    }
                }
                catch (error) {
                    console.error(error);
                }
                return [];
            }
            else
                return [];
        };
        this.reading = new ReadingController(this, this.innerHTML !== "" ? this.parseReadingDataFromLightDOM : this.getReadingDataFromServer);
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
    async parseLinks(text) {
        const inlineRef = /\[[^\[\]]+\]/gm;
        var refGroups = await Promise.all((text.match(inlineRef) || [])
            .map(match => match.substring(1, match.length - 1))
            .map(refString => BibleController.parseReferenses(refString))
            .map(async (refs) => {
            let links = await Promise.all(refs.map(ref => BibleController.refAnchor(ref)));
            return links.join(", ");
        }));
        return text.split(inlineRef).map((part, index) => refGroups[index] ? part + refGroups[index] : part).join("");
    }
    parseMarkdown(content) {
        return marked.parse(content, { async: false });
    }
    willUpdate(_changedProperties) {
        if (this.reading.day) {
            if (this.reading.day.questions) {
                this.parseLinks(this.parseMarkdown(this.reading.day.questions))
                    .then(content => {
                    this.questions = content;
                });
            }
            else
                this.questions = '';
            if (this.reading.day.exposition) {
                this.parseLinks(this.parseMarkdown(this.reading.day.exposition))
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
    }
    updated(_changedProperties) {
        if (_changedProperties.has("questions") || _changedProperties.has("exposititon")) {
            this.activateReferences();
        }
    }
    render() {
        return html `<day-selector .month=${this.reading.month} @date-selected="${(event) => {
            this.reading.date = event.detail.date;
        }}"></day-selector>
    ${this.reading.day
            ? html `${this.greeting(this.reading.day.date)}
    <p>Сьогодні читаємо:</p>
    <bible-excerpt reference="${this.reading.day.reading}"></bible-excerpt>
    ${unsafeHTML(this.questions)}
    ${unsafeHTML(this.exposititon)}`
            : nothing}`;
    }
    static get styles() {
        return css `
    :host {
      --_this-color: var(--bible-reading-color, #fafafa);
      --_this-background: var(--bible-reading-background, #242424);
      --_this-accent: var(--bible-reading-accent, #59f);
      --_this-dark-accent: var(--bible-reading-dark-accent, #46e);

      --bible-excerpt-color: var(--_this-color);
      --bible-excerpt-background: var(--_this-background);
      --bible-excerpt-hilight-accent: rgba(200, 225, 255, 0.3);
      --bible-excerpt-hilight: rgba(200, 200, 200, 0.3);
      --bible-excerpt-accent: var(--_this-accent);
      --bible-excerpt-dark-accent: var(--_this-dark-accent);

      --day-selector-background: var(--_this-background);
      --day-selector-color: var(--_this-color);
      --day-selector-hilight: var(--bible-excerpt-hilight);
      --day-selector-hilight-accent: var(--bible-excerpt-hilight-accent);

      box-sizing: border-box;

      font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      font-weight: 400;
    
      color-scheme: light dark;
      color: var(--_this-color);
      background-color: var(--_this-background);
    
      font-synthesis: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;

      display: block;
      padding: 1em;
    }
    @media (prefers-color-scheme: light) {
      :host {
        --_this-color: var(--bible-reading-background,  #242424);
        --_this-background: var(--bible-reading-color, #fafafa);
        --bible-excerpt-color: var(--_this-background);
        --bible-excerpt-background: var(--_this-color);
        --day-selector-color: var(--_this-background);
        --day-selector-background: var(--_this-color);
      }
    }
    a {
      font-weight: 500;
      color: var(--_this-accent);
      text-decoration: inherit;
    }
    a:hover {
      color: var(--_this-dark-accent);
    }
    `;
    }
};
__decorate([
    property({ type: String })
], BibleReading.prototype, "datasource", void 0);
__decorate([
    property({ type: Object })
], BibleReading.prototype, "reading", void 0);
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

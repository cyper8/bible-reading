var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BibleReading_1;
import { LitElement, css, html, nothing } from "lit";
import { state } from 'lit/decorators.js';
import { customElement, property } from "lit/decorators.js";
import { marked } from "marked";
import "../../bible-excerpt/index.js";
import "../../day-selector/index.js";
import { BOLLS_HOSTNAME, getChapterUrl, getEditions, parseReferenses } from '../../utils/bolls.js';
import { pickOneOf } from "../../utils/pickOneOf.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { getJSONP } from "../../utils/getJSONP.js";
import { stripHours } from "../../utils/stripHours.js";
import { BibleLibrary } from "../../utils/BibleLibrary.js";
const objToReadingDay = (object) => {
    return {
        date: new Date(object.date),
        reading: object.reading,
        questions: object.questions,
        exposition: object.exposition
    };
};
export function isRawReadingDay(obj) {
    return ("date" in obj &&
        "reading" in obj &&
        "questions" in obj &&
        "exposition" in obj) && (typeof obj.date === "string" &&
        typeof obj.reading === "string" &&
        typeof obj.questions === "string" &&
        typeof obj.exposition === "string");
}
let BibleReading = BibleReading_1 = class BibleReading extends LitElement {
    constructor() {
        super();
        this.readingUrl = '';
        this.writingUrl = this.readingUrl;
        this.date = stripHours(new Date()).toDateString();
        this.defaultTranslation = 'UBIO';
        this.static = false;
        this.library = new BibleLibrary([]);
        this.month = [];
        this.changed = false;
        this.hilightVerses = '';
        this.getReadingData = async (date) => {
            if (this.readingUrl && date) {
                if (this.static) {
                    try {
                        location.href = encodeURI(this.readingUrl + `?date=${date.toDateString()}`);
                    }
                    catch (error) {
                        console.error(error);
                    }
                    return;
                }
                else {
                    getJSONP(this.readingUrl, `date=${date.toDateString()}`)
                        .then(rdays => {
                        this.month = rdays.map(objToReadingDay);
                    });
                }
            }
            else
                throw new Error('No reading URL or date is specified');
        };
        this.greeting = BibleReading_1.greeting((new Date()).getHours());
        getEditions({ languages: ['Ukrainian'] }).then(editions => {
            this.library = new BibleLibrary(editions);
        });
    }
    parseReadingFromJSON(json) {
        let data = JSON.parse(json);
        if (data instanceof Array) {
            return data
                .filter(obj => isRawReadingDay(obj))
                .map(rday => objToReadingDay(rday));
        }
        else
            return [];
    }
    hilight(verses) {
        this.hilightVerses = verses;
    }
    loadDay(date) {
        this.day = this.month.find(dd => dd.date.getTime() == date.getTime());
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
    static greeting(hours24) {
        let time = hours24 > 15 ? "вечір" : hours24 > 10 ? "день" : "ранок";
        return html `<h2>${pickOneOf(this.greetings).replace("ранок", time)}, ${pickOneOf(this.appeals)}!</h2>`;
    }
    getUrls(refs, library) {
        return refs.map(ref => {
            try {
                let book = library.getBook(ref.bookName, this.defaultTranslation, { wholeWords: true });
                return getChapterUrl(ref.translation || this.defaultTranslation, book.bookid, ref.chapter, ref.verses?.length ? ref.verses[0] : undefined);
            }
            catch (error) {
                console.error(error);
                return BOLLS_HOSTNAME;
            }
        });
    }
    activateReferences(text, library) {
        let parsedMarkdown = marked.parse(text, { async: false });
        const externalBRef = /(?<=\[)[^\[\]]+(?=\])/gm;
        let parsedExternals = parsedMarkdown.replaceAll(externalBRef, (refString, ..._args) => {
            let refs = parseReferenses(refString);
            let urls = this.getUrls(refs, library);
            return refs.map((ref, i) => `<a href="${urls[i]}">${ref.reference}</a>`).join(", ");
        });
        const verseRef = /([0-9 ][0-9,іта -]*[0-9 ])?(?:вірш[^\s]*)([0-9 ][0-9,іта -]*[0-9 ])?/gmi;
        return parsedExternals.replace(verseRef, `<a class="ref-verses" data-ref="$1$2">$&</a>`);
    }
    updated(_changedProperties) {
        if (_changedProperties.has("date") || _changedProperties.has("month")) {
            if (this.date) {
                let date = new Date(this.date);
                if (this.month.length == 0
                    || this.month[0].date.getMonth() !== date.getMonth()
                    || this.month[0].date.getFullYear() !== date.getFullYear()) {
                    this.getReadingData(date);
                }
                else {
                    this.loadDay(date);
                }
            }
        }
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.innerHTML?.trim()) {
            this.static = true;
            this.month = this.parseReadingFromJSON(this.innerHTML);
            let params = new URLSearchParams(location.search);
            if (params.has("date")) {
                this.date = stripHours(new Date(params.get("date"))).toDateString();
            }
        }
        else {
            this.static = false;
            this.getReadingData(new Date(this.date));
        }
        if (this.shadowRoot) {
            this.shadowRoot.addEventListener('click', (e) => {
                let target = e.target;
                if (target.tagName == "A" && target.className.includes('ref-verses')) {
                    let verses = target.dataset.ref?.trim().replace(/і|та/gi, ",") || '';
                    this.hilightVerses = this.hilightVerses == verses ? '' : verses;
                }
            });
        }
    }
    updateReading(changes) {
        var f;
        for (f in changes) {
            if (changes[f] !== this.day?.[f]) {
                this.changed = true;
            }
        }
        let date = new Date(this.date);
        this.day = {
            date,
            ...this.day,
            ...changes
        };
    }
    async uploadReadingDay() {
        let day = this.day;
        if (this.writingUrl && day && day.date && day.reading) {
            this.changed = false;
            let data = {
                ...day,
                date: day.date.toDateString()
            };
            try {
                let response = await fetch(this.writingUrl, {
                    method: "POST",
                    mode: 'no-cors',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });
                if (response.ok) {
                    console.log(await response.json(), response.headers);
                }
                else {
                    throw new Error(`Day wasn't saved. Status: ${response.statusText}`);
                }
            }
            catch (error) {
                this.loadDay(day.date);
                console.error(error);
            }
        }
    }
    render() {
        return html `<day-selector .month=${this.month} date=${this.date} 
    @date-selected="${(event) => {
            this.date = event.detail.date.toDateString();
        }}"></day-selector>
    ${this.day
            ? html `${this.greeting}
    ${this.day.reading ? html `<p>Сьогодні читаємо:</p>
    <bible-excerpt
      defaultTranslation="${this.defaultTranslation}"
      reference=${this.day.reading}
      .library=${this.library}
      .hilightVerses="${this.hilightVerses}"
      @excerpts-changed=${(e) => {
                this.updateReading({
                    reading: e.detail.map(ex => ex.reference).join(", ")
                });
            }}></bible-excerpt>
    ${this.day.questions ? unsafeHTML(this.activateReferences(this.day.questions, this.library)) : nothing}
    ${this.day.exposition ? unsafeHTML(this.activateReferences(this.day.exposition, this.library)) : nothing}` : nothing}${this.changed ? html `<button @click=${this.uploadReadingDay}>Save Changes</button>` : nothing}`
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
], BibleReading.prototype, "readingUrl", void 0);
__decorate([
    property({ type: String })
], BibleReading.prototype, "writingUrl", void 0);
__decorate([
    property({ type: String })
], BibleReading.prototype, "date", void 0);
__decorate([
    property({ type: String })
], BibleReading.prototype, "defaultTranslation", void 0);
__decorate([
    property({ type: Boolean })
], BibleReading.prototype, "static", void 0);
__decorate([
    property({ type: Object })
], BibleReading.prototype, "library", void 0);
__decorate([
    state()
], BibleReading.prototype, "month", void 0);
__decorate([
    state()
], BibleReading.prototype, "day", void 0);
__decorate([
    state()
], BibleReading.prototype, "changed", void 0);
__decorate([
    state()
], BibleReading.prototype, "hilightVerses", void 0);
BibleReading = BibleReading_1 = __decorate([
    customElement('bible-reading')
], BibleReading);
export { BibleReading };

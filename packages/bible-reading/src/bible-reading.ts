import { LitElement, PropertyValues, css, html, nothing } from "lit";
import { state } from 'lit/decorators.js';
import { customElement, property } from "lit/decorators.js";
import { marked } from "marked";
import "../../bible-excerpt/index.js";
import "../../day-selector/index.js";
import { type BollsBible } from '../../utils/bolls.js';
import { BibleController } from "../../bible-excerpt/src/BibleController.js";
import { pickOneOf } from "../../utils/pickOneOf.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { DateSelectedEvent, DayData } from "../../day-selector/src/day-selector.js";
import { getJSONP } from "../../utils/getJSONP.js";
import { stripHours } from "../../utils/stripHours.js";

export declare interface ReadingDay extends DayData {
  date: Date;
  reading: string;
  questions: string;
  exposition: string;
}
export type RawReadingDay = { [key in keyof ReadingDay]: string }
const objToReadingDay: (object: RawReadingDay) => ReadingDay = (object: RawReadingDay) => {
  return {
    date: new Date(object.date),
    reading: object.reading,
    questions: object.questions,
    exposition: object.exposition
  }
}
export function isRawReadingDay(obj: Object): obj is RawReadingDay {
  return (
    "date" in obj &&
    "reading" in obj &&
    "questions" in obj &&
    "exposition" in obj) && (
      typeof obj.date === "string" &&
      typeof obj.reading === "string" &&
      typeof obj.questions === "string" &&
      typeof obj.exposition === "string")
}


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
@customElement('bible-reading')
export class BibleReading extends LitElement {

  @property({ type: String }) readingUrl: string = '';
  @property({ type: String }) date: string = stripHours(new Date()).toDateString();
  @property({ type: String }) defaultTranslation: BollsBible.Translation['short_name'] = 'UBIO';
  bible = new BibleController(this, this.defaultTranslation, ['Ukrainian']);
  @property({ type: Boolean }) static = false;
  @state() month: ReadingDay[] = [];
  @state() day?: ReadingDay;
  @state() questions: string = '';
  @state() exposition: string = '';
  @state() hilightVerses: string = '';

  private getReadingData = async (date: Date) => {
    if (this.readingUrl && date) {
      if (this.static) {
        try {
          //window.location.
          let href = encodeURI(this.readingUrl + `?date=${date.toDateString()}`);
          let link = document.createElement("a");
          link.href = href;
          link.addEventListener("click", () => { this.removeChild(link) })
          this.appendChild(link);
          link.click();
        } catch (error) {
          console.error(error);
        }
        return;
      } else {
        getJSONP<RawReadingDay[]>(this.readingUrl, `date=${date.toDateString()}`)
          .then(rdays => {
            this.month = rdays.map(objToReadingDay);
          });
      }
    } else throw new Error('No reading URL or date is specified');
  }

  parseReadingFromJSON(json: string): ReadingDay[] {
    let data = JSON.parse(json);
    if (data instanceof Array) {
      return data
        .filter(obj => isRawReadingDay(obj))
        .map(rday => objToReadingDay(rday));
    } else return [] as ReadingDay[]
  }

  hilight(verses: string) {
    this.hilightVerses = verses;
  }

  private activateInnerReferences(text: string) {
    let refExpression = /([0-9 ][0-9,іта -]*[0-9 ])?(?:вірш[^\s]*)([0-9 ][0-9,іта -]*[0-9 ])?/gmi;
    return text.replace(refExpression, `<a class="ref-verses" data-ref="$1$2">$&</a>`)
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
    ]
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
    ]
  }

  static greeting(date: Date) {
    let hours = date.getHours(),
      time = hours > 15 ? "вечір" : hours > 10 ? "день" : "ранок";
    return html`<h2>${pickOneOf(this.greetings).replace("ранок", time)}, ${pickOneOf(this.appeals)}!</h2>`
  }

  private greeting = BibleReading.greeting(new Date());

  async parseLinks(text: string): Promise<string> {
    const inlineRef = /\[[^\[\]]+\]/gm;
    var refGroups = (await Promise.all((text.match(inlineRef) || [])
      .map(match => match.substring(1, match.length - 1)) // remove square braces
      .map(async refString => {
        let refs = BibleController.parseReferenses(refString);
        let urls = await this.bible.getUrls(refs);
        return refs.map((ref, i) => `<a href="${urls[i]}">${ref.reference}</a>`).join(", ");
      })))
    return text.split(inlineRef).map((part, index) => refGroups[index] ? part + refGroups[index] : part).join("");
  }

  parseMarkdown(content: string): string {
    return marked.parse(content, { async: false })
  }

  protected updated(_changedProperties: PropertyValues<BibleReading>): void {
    if (_changedProperties.has("date") || _changedProperties.has("month")) {
      if (this.date) {
        let date = new Date(this.date)
        if (this.month.length == 0
          || this.month[0].date.getMonth() !== date.getMonth()
          || this.month[0].date.getFullYear() !== date.getFullYear()) {
          this.getReadingData(date);
        } else {
          this.day = this.month.find(dd => dd.date.getTime() == date.getTime())
        }
      }
    }
  }

  protected willUpdate(_changedProperties: PropertyValues<BibleReading>): void {
    if (_changedProperties.has("day")) {
      if (this.day) {
        if (this.day.questions) {
          this.parseLinks(this.parseMarkdown(this.day.questions))
            .then(content => this.activateInnerReferences(content))
            .then(questions => { this.questions = questions });
        } else this.questions = '';
        if (this.day.exposition) {
          this.parseLinks(this.parseMarkdown(this.day.exposition))
            .then(content => this.activateInnerReferences(content))
            .then(exposition => { this.exposition = exposition });
        } else this.exposition = '';
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.innerHTML?.trim()) { //static data parsing
      this.static = true;
      this.month = this.parseReadingFromJSON(this.innerHTML);
      let params = new URLSearchParams(location.search);
      if (params.has("date")) {
        this.date = stripHours(new Date(params.get("date")!)).toDateString()
      }
    } else { // getting data dynamically
      this.static = false;
      this.getReadingData(new Date(this.date));
    }

    if (this.shadowRoot) {
      this.shadowRoot.addEventListener('click', (e: Event) => {
        let target = e.target as HTMLElement;
        if (target.tagName == "A" && target.className.includes('ref-verses')) {
          let verses = target.dataset.ref?.trim().replace(/і|та/gi, ",") || '';
          this.hilightVerses = this.hilightVerses == verses ? '' : verses;
        }
      })
    }
  }

  protected render(): unknown {
    return html`<day-selector .month=${this.month} date=${this.date} 
    @date-selected="${(event: DateSelectedEvent<ReadingDay>) => {
        this.date = event.detail.date.toDateString();
      }}"></day-selector>
    ${this.day
        ? html`${this.greeting}
    ${this.day.reading ? html`<p>Сьогодні читаємо:</p>
    <bible-excerpt
      defaultTranslation="${this.defaultTranslation}"
      reference="${this.day.reading}" 
      .hilightVerses="${this.hilightVerses}"></bible-excerpt>
    ${unsafeHTML(this.questions)}
    ${unsafeHTML(this.exposition)}` : nothing}`
        : nothing}`
  }

  /**
   * --bible-reading-color
   * --bible-reading-background
   * --bible-reading-accent
   * --bible-reading-dark-accent
   */

  static get styles() {
    return css`
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
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bible-reading': BibleReading;
  }
}

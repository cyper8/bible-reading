import { LitElement, PropertyValues, css, html, state, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { marked } from "marked";
import "../../bible-excerpt/index.js";
import "../../day-selector/index.js";
import { type BollsBible } from '../../utils/bolls.js';
import { BibleController } from "../../bible-excerpt/src/BibleController.js";
import { pickOneOf } from "../../utils/pickOneOf.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { DateSelectedEvent } from "../../day-selector/src/day-selector.js";
import { getJSONP } from "../../utils/getJSONP.js";

export interface ReadingDataSource {
  date: Date;
  month: ReadingDay[];
  day?: ReadingDay
}

export declare interface ReadingDay extends DayData {
  date: Date;
  reading: string;
  questions: string;
  exposition: string;
}
export type RawReadingDay = { [key in keyof ReadingDay]: string }

export const stripHours = (date: Date) => (date.setHours(0, 0, 0, 0), date);
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

  @property({ type: String }) readingUrl: string;
  @property({ type: Date }) date: Date = stripHours(new Date());
  @property({ type: String }) defaultTranslation: BollsBible.Translation['short_name'] = 'UBIO';
  bible = new BibleController()
  private mode: 'static' | 'dynamic' = 'dynamic';
  @state() month: ReadingDay[] = [];
  @state() day?: ReadingDay;

  private getReadingData = (date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    var reading: Promise<ReadingDay[]>;
    if (this.month.length 
      && this.month[0].date.getMonth() == month 
      && this.month[0].date.getFullYear() == year) 
    {
      reading = Promise.resolve(this.month);
    } else {
      if (this.mode == 'static') {
        window.location.href = this.readingUrl + `?date=${request}`;
      } else {
        reading = getJSONP<RawReadingDay[]>(this.readingUrl, `date=${this.date.toDateString()}`)
        .then(rdays => 
          rdays.map(objToReadingDay)
        );
      }
    }
    return reading.then(rdays => {
      this.month = rdays;
      this.day = this.month.find(reading => reading.date.getTime() == date.getTime());
    })
  }

  parseReadingFromJSON(json: string): ReadingDay[] {
    let data = JSON.parse(json);
    if (data instanceof Array) {
      return data
        .filter(obj => isRawReadingDay(obj))
        .map(rday => objToReadingDay(rday));
    } else return [] as ReadingDay[]
  }
  
  private activateReferences() {
    if (this.shadowRoot) {
      var node: Text, textIterator = document.createNodeIterator(
        this.shadowRoot,
        NodeFilter.SHOW_TEXT,
        (node: Node) => {
          let search = node.textContent?.match(/([0-9,іта -]*вірш[^)\s]*[0-9,іта -]*)/gmi);
          if (search?.length) {
            return NodeFilter.FILTER_ACCEPT
          } else {
            return NodeFilter.FILTER_REJECT
          }
        }
      );
      while (node = textIterator.nextNode() as Text) {
        if (node.parentElement?.className.includes('ref-verses')) continue;
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
            })
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

  greeting(date: Date) {
    let hours = date.getHours(),
      time = hours > 15 ? "вечір" : hours > 10 ? "день" : "ранок";
    return html`<h2>${pickOneOf(BibleReading.greetings).replace("ранок", time)}, ${pickOneOf(BibleReading.appeals)}!</h2>`
  }

  async parseLinks(text: string) {
    const inlineRef = /\[[^\[\]]+\]/gm;
    var refGroups = await Promise.all((text.match(inlineRef) || [])
      .map(match => match.substring(1, match.length - 1)) // remove square braces
      .map(refString => BibleController.parseReferenses(refString))
      .map(async refs => {
        let links: string[] = await Promise.all(refs.map(ref => BibleController.refAnchor(ref)))
        return links.join(", ");
      }));
    return text.split(inlineRef).map((part, index) => refGroups[index] ? part + refGroups[index] : part).join("");
  }

  parseMarkdown(content: string) {
    return marked.parse(content, { async: false })
  }

  protected willUpdate(_changedProperties: PropertyValues<BibleReading>): void {
    if (_changedProperties.has("date")) {
      this.getReadingData(this.date).then(this.requestUpdate);
    }
    if (_changedProperties.has("day")) {

    }
    // if (this.reading.day) {
    //   if (this.reading.day.questions) {
    //     this.parseLinks(this.parseMarkdown(this.reading.day.questions))
    //       .then(content => {
    //         this.questions = content;
    //       });
    //   } else this.questions = '';
    //   if (this.reading.day.exposition) {
    //     this.parseLinks(this.parseMarkdown(this.reading.day.exposition))
    //       .then(content => {
    //         this.exposititon = content;
    //       });
    //   } else this.exposititon = '';
    // } else {
    //   this.questions = '';
    //   this.exposititon = '';
    // }
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.innerHTML?.trim()) { //static data parsing
      this.mode = 'static';
      this.month = this.parseReadingFromJSON(this.innerHTML);
      let params = new URLSearchParams(location.search);
      if (params.has("date")) {
        this.date = stripHours(new Date(params.get("date")!))
      }
    } else { // getting data dynamically
      this.mode = 'dynamic';
      getJSONP<RawReadingDay[]>(this.readingUrl, `date=${this.date.toDateString()}`)
      .then(rdays => {this.month = rdays.map(objToReadingDay)})
    }
    
  }

  protected updated(_changedProperties: PropertyValues<BibleReading>): void {
    if (_changedProperties.has("questions") || _changedProperties.has("exposititon")) {
      this.activateReferences();
    }
  }

  protected render(): unknown {
    return html`<day-selector .month=${this.month} @date-selected="${(event: DateSelectedEvent<ReadingDay>) => {
      this.date = event.detail.date;
    }}"></day-selector>
    ${this.day
        ? html`${this.greeting(this.day.date)}
    <p>Сьогодні читаємо:</p>
    <bible-excerpt reference="${this.day.reading}"></bible-excerpt>
    ${unsafeHTML(this.questions)}
    ${unsafeHTML(this.exposititon)}`
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

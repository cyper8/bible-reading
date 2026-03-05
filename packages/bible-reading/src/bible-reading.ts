import { LitElement, PropertyValues, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { marked } from "marked";
import "../../bible-excerpt/index.js";
import "../../day-selector/index.js";
import { RawReadingDay, ReadingController, ReadingDataProvider, ReadingDay, isRawReadingDay, stripHours } from "./ReadingController.js";
import { BibleController } from "../../bible-excerpt/src/BibleController.js";
import { pickOneOf } from "../../utils/pickOneOf.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { DateSelectedEvent } from "../../day-selector/src/day-selector.js";

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

  parseReadingDataFromLightDOM: ReadingDataProvider = (date: Date) => {
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
            if (dataDate.getMonth() !== month || dataDate.getFullYear() !== year) {
              let params = new URLSearchParams(location.search);
              if (params.has("date")) {
                if (params.get("date") == request) {
                  throw Error(`Server responded with wrong data.`)
                }
              }
              window.location.href = window.location.origin + window.location.pathname + `?date=${request}`
            }
            return data.filter(obj => isRawReadingDay(obj)) as RawReadingDay[]
          }
        }
      } catch (error) {
        console.error(error);
      }
      return []
    } else return []
  }


  @property({ type: Date }) date?: Date;
  reading = this.innerHTML !== "" ? new ReadingController(this, this.parseReadingDataFromLightDOM) : new ReadingController(this);
  @property({ type: String }) questions: string = '';
  @property({ type: String }) exposititon: string = '';

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

  async refsToLinks(text: string) {
    const inlineRef = /\[[^\[\]]+\]/gm;
    var refs: string[] = await Promise.all((text.match(inlineRef) || [])
      .map(match => match.substring(1, match.length - 1)) // remove square braces
      .map(refString => BibleController.parseReferenses(refString)
        .then(refs => refs
          .map(ref => BibleController.refAnchor(ref))
        ).then(refs => refs.length > 1 ? refs.join(", ") : refs[0])
      ))
    return text.split(inlineRef).map((part, index) => refs[index] ? part + refs[index] : part).join("");
  }

  protected willUpdate(_changedProperties: PropertyValues<BibleReading>): void {
    if (_changedProperties.has("date")) {
      if (this.date) this.reading.setReadingDate(this.date)
        .then(() => {
          if (this.reading.day) {
            if (this.reading.day.questions) {
              marked.parse(this.reading.day.questions, { async: true })
                .then(content => this.refsToLinks(content))
                .then(content => {
                  this.questions = content;
                });
            } else this.questions = '';
            if (this.reading.day.exposition) {
              marked.parse(this.reading.day.exposition, { async: true })
                .then(content => this.refsToLinks(content))
                .then(content => {
                  this.exposititon = content;
                });
            } else this.exposititon = '';
          } else {
            this.questions = '';
            this.exposititon = '';
          }
        });
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    let params = new URLSearchParams(location.search);
    if (params.has("date")) {
      this.date = stripHours(new Date(params.get("date")!))
    } else this.date = stripHours(new Date());
  }

  protected updated(_changedProperties: PropertyValues<BibleReading>): void {
    if (_changedProperties.has("questions") || _changedProperties.has("exposititon")) {
      this.activateReferences();
    }
  }

  protected render(): unknown {
    return html`<day-selector .month=${this.reading.month} @date-selected="${(event: DateSelectedEvent<ReadingDay>) => {
      this.date = event.detail.date;
    }}"></day-selector>
    ${this.date && this.reading.day
        ? html`${this.greeting(this.date)}
    <p>Сьогодні читаємо:</p>
    <bible-excerpt reference="${this.reading.day.reading}"></bible-excerpt>
    ${unsafeHTML(this.questions)}
    ${unsafeHTML(this.exposititon)}`
        : nothing}`
  }

  static get styles() {
    return css`
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
    * {
    box-sizing: content-box;
  }
  
  :root {
    --bible-excerpt-color: #fafafa;
    --bible-excerpt-background: #242424;
    --bible-excerpt-accent: #59f;
    --bible-excerpt-dark-accent: #46e;
    --bible-excerpt-hilight: rgba(200, 200, 200, 0.5);
    --bible-excerpt-hilight-accent: rgba(200, 225, 255, 0.5);
  
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;
  
    color-scheme: light dark;
    color: var(--bible-excerpt-color);
    background-color: var(--bible-excerpt-background);
  
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  @media (prefers-color-scheme: light) {
    :root {
      --bible-excerpt-color: #242424;
      --bible-excerpt-background: #fafafa;
      --bible-excerpt-accent: #59f;
      --bible-excerpt-dark-accent: #46e;
    }
  }
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bible-reading': BibleReading;
  }
}

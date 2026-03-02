import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
// import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { marked } from "marked";
import "../../bible-excerpt/index.js";
import "../../bible-reading-calendar/index.js";
import { ReadingDateSelectedEvent } from "../../bible-reading-calendar/index.js";
import { ReadingController, stripHours } from "./ReadingController.js";
import { BibleController } from "../../bible-excerpt/src/BibleController.js";
import { pickOneOf } from "../../utils/pickOneOf.js";
import { until } from "lit/directives/until.js";

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

  reading = new ReadingController(this);

  @property({ type: Date }) date: Date = stripHours(new Date());
  @property({ type: String }) readingRef: string = '';
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
    return `<h2>${pickOneOf(BibleReading.greetings).replace("ранок", time)}, ${pickOneOf(BibleReading.appeals)}!</h2>`
  }

  async refsToLinks(text: string) {
    const editions = await BibleController.editions;
    const inlineRef = /\[[^\[\]]+\]/gm;
    var refs: string[] = (text.match(inlineRef) || [])
      .map(match => match.substring(1, match.length - 1)) // remove square braces
      .map(refString => BibleController.parseReferenses(refString, editions))
      .map(refs => refs.map(ref => BibleController.refAnchor(ref)))
      .map(refs => refs.length > 1 ? refs.join(", ") : refs[0]);
    return text.split(inlineRef).map((part, index) => refs[index] ? part + refs[index] : part).join("");
  }

  protected willUpdate(_changedProperties: PropertyValues<BibleReading>): void {
    if (_changedProperties.has("date")) {
      this.reading.setReadingDate(this.date).then(() => {
        if (this.reading.day) {
          if (this.reading.day.questions) {
            this.questions = marked.parse(this.reading.day.questions, { async: false });
          } else this.questions = '';
          if (this.reading.day.exposition) {
            this.exposititon = marked.parse(this.reading.day.exposition, { async: false });
          } else this.exposititon = '';
        }
      });
    }
  }

  protected updated(_changedProperties: PropertyValues<BibleReading>): void {
    if (_changedProperties.has("date")) {

    }
    if (_changedProperties.has("questions") || _changedProperties.has("exposititon")) {
      this.activateReferences();
    }
  }

  protected render(): unknown {
    return html`<bible-reading-calendar .reading=${this.reading.month} @reading-date-selected="${(event: ReadingDateSelectedEvent) => {
      this.date = event.detail.date;
    }}"></bible-reading-calendar>
    ${this.greeting(this.date)}
    <p>Сьогодні читаємо:</p>
    <bible-excerpt reference="${this.reading.day?.reading || ""}"></bible-excerpt>
    ${until(this.refsToLinks(this.questions))}
    ${until(this.refsToLinks(this.exposititon))}`
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
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bible-reading': BibleReading;
  }
}
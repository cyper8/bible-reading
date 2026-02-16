import { LitElement, PropertyValueMap, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { marked } from "marked";
import "../../bible-excerpt/index.js";
import "../../bible-reading-calendar/index.js";
import { ReadingDateSelectedEvent } from "../../bible-reading-calendar/index.js";

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

  @state() book: string = '';
  @state() chapter: string = '';
  @state() verses: string = '';

  @property({ type: String }) translation: string = 'UBIO';
  @property({ type: String }) content: string = '';

  private processContent() {
    if (this.shadowRoot) {
      let header = this.shadowRoot.querySelector('h1');
      if (header) {
        let refText = header.textContent;
        if (refText) {
          let ref = refText.match(/ [0-9, :-]+$/g)?.[0].split(',')[0].trim() || '';
          this.book = refText.replace(ref, '').trim();
          [this.chapter, this.verses] = ref.split(':', 2);
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
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.content = marked.parse(this.innerHTML, { async: false });
  }

  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has("content")) {
      if (this.content) {
        this.content = marked.parse(this.content, { async: false });
      }
    }
  }

  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has("content")) {
      if (this.content) {
        this.processContent();
      }
    }
  }

  protected render(): unknown {
    return html`<bible-reading-calendar @reading-date-selected="${(event: ReadingDateSelectedEvent) => {
      this.content = event.detail.reading;
    }}"></bible-reading-calendar>${this.book && this.chapter
      ? html`
        <bible-excerpt
          translation="${this.translation}" 
          book="${this.book}" 
          chapter="${this.chapter}" 
          verses="${this.verses || ''}">
        </bible-excerpt>`
      : nothing
      }${unsafeHTML(this.content)}`
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
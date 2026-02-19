var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { marked } from "marked";
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
let BibleReading = class BibleReading extends LitElement {
    constructor() {
        super(...arguments);
        this.reading = new ReadingController(this);
        this.book = '';
        this.chapter = '';
        this.verses = '';
        this.translation = 'UBIO';
        this.content = '';
    }
    processContent() {
        if (this.shadowRoot) {
            let header = this.shadowRoot.querySelector('h1');
            if (header) {
                let refText = header.textContent;
                if (refText) {
                    let ref = refText.match(/ [0-9, :-]+$/g)?.[0].split(',')[0].trim() || '';
                    this.book = refText.replace(ref, '').trim();
                    [this.chapter, this.verses] = ref.split(':', 2);
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
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.content = marked.parse(this.innerHTML, { async: false });
    }
    willUpdate(_changedProperties) {
        if (_changedProperties.has("content")) {
            if (this.content) {
                this.content = marked.parse(this.content, { async: false });
            }
        }
    }
    updated(_changedProperties) {
        if (_changedProperties.has("content")) {
            if (this.content) {
                this.processContent();
            }
        }
    }
    render() {
        return html `<bible-reading-calendar .monthReading=${this.reading.reading} @reading-date-selected="${(event) => {
            this.content = event.detail.reading;
        }}"></bible-reading-calendar>${this.book && this.chapter
            ? html `
        <bible-excerpt
          translation="${this.translation}" 
          book="${this.book}" 
          chapter="${this.chapter}" 
          verses="${this.verses || ''}">
        </bible-excerpt>`
            : nothing}${unsafeHTML(this.content)}`;
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
    state()
], BibleReading.prototype, "book", void 0);
__decorate([
    state()
], BibleReading.prototype, "chapter", void 0);
__decorate([
    state()
], BibleReading.prototype, "verses", void 0);
__decorate([
    property({ type: String })
], BibleReading.prototype, "translation", void 0);
__decorate([
    property({ type: String })
], BibleReading.prototype, "content", void 0);
BibleReading = __decorate([
    customElement('bible-reading')
], BibleReading);
export { BibleReading };

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { spreadNumbers } from '../../utils/spreadNumbers.js';
import { BibleController, isBibleExcerpt } from './BibleController.js';
let BibleExcerpt = class BibleExcerpt extends LitElement {
    constructor() {
        super(...arguments);
        this.bible = new BibleController(this);
        this.hilightVerses = '';
        this.reference = '';
    }
    bChapterVerse(verse, hilight = false) {
        return html `<input type=radio name="note" id="verse${verse.verse}" class="note" />
    <label for="verse${verse.verse}">
      <p 
      class="${classMap({ verse: true, hilight })}"
      pk="${verse.pk}" 
      chapter="${verse.chapter}" 
      num="${verse.verse}"
      >
          ${unsafeHTML(verse.text)}
          ${verse.comment
            ? html `<b>&darr;</b>  
            <span class="comment">
            <hr />
              ${unsafeHTML(verse.comment)}
            </span>`
            : nothing}
      </p>
    </label>`;
    }
    bExcerpt(excerpt, hilight = '') {
        let hilighted = hilight ? spreadNumbers(hilight) : [];
        return html `<div class="excerpt"><h3>${unsafeHTML(BibleController.refAnchor(excerpt))}</h3>
    ${isBibleExcerpt(excerpt)
            ? excerpt.verses
                .map(v => this.bChapterVerse(v, hilighted.includes(v?.verse)))
            : html `<i>Не вдалося завантажити текст</i>`}</div>`;
    }
    willUpdate(_changedProperties) {
        if (_changedProperties.has("reference")) {
            if (this.reference !== this.bible.reference) {
                this.bible.init(this.reference);
            }
        }
    }
    render() {
        return this.bible.excerpts
            .map((excerpt) => html `<section class="bible">${this.bExcerpt(excerpt, this.hilightVerses)}</section>`);
    }
    static { this.styles = [css `
  :host {
    --_this-color: var(--bible-excerpt-color, #fafafa);
    --_this-background: var(--bible-excerpt-background, #242424);
    --_this-hilight-accent: var(--bible-excerpt-hilight-accent, rgba(200, 225, 255, 0.5));
    --_this-hilight: var(--bible-excerpt-hilight, rgba(200, 200, 200, 0.5));
    --_this-accent: var(--bible-excerpt-accent, #59f);
    --_this-dark-accent: var(--bible-excerpt-dark-accent, #46e);

    box-sizing: border-box;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    display: block;
    padding: 2.5em;
    border: solid 1px var(--_this-color);
    border-radius: 0.5em;
    color-scheme: light dark;
    color: var(--_this-color);
    background-color: var(--_this-background);
  }
  @media (prefers-color-scheme: light) {
    :host {
      --_this-color: var(--bible-excerpt-background, #242424);
      --_this-background: var(--bible-excerpt-color, #fafafa);
    }
  }
  .verse::before {
    content: attr(num);
    margin-right: 0.5em;
    font-size: 70%;
    font-weight: 700
  }
  .verse {
    max-width: 50em;
    margin: 0.2em 0;
  }
  input.note {
    display: none
  }
  .verse.hilight {
    background-color: var(--_this-hilight-accent);
  } 
  .verse:hover {
    background-color: var(--_this-hilight);
  }
  span.comment {
    display: none;
    background: var(--_this-color);
    color: var(--_this-background);
    position: fixed;
    left: 0px;
    height: auto;
    width: 100%;
    bottom: 0px;
    overflow: hidden;
    padding: 1em;
  }
  input:checked+label span.comment {
    display: inline-block;
  }
  a {
    font-weight: 500;
    color: var(--_this-accent);
    text-decoration: inherit;
  }
  a:hover {
    color: var(--_this-dark-accent)
  }

  `]; }
};
__decorate([
    property({ type: String, attribute: 'hilight-verses' })
], BibleExcerpt.prototype, "hilightVerses", void 0);
__decorate([
    property({ type: String })
], BibleExcerpt.prototype, "reference", void 0);
BibleExcerpt = __decorate([
    customElement('bible-excerpt')
], BibleExcerpt);
export { BibleExcerpt };

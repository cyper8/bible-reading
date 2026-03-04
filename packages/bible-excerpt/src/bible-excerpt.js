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
import { getBollsChapterUrl } from '../../utils/bolls.js';
import { spreadNumbers } from '../../utils/spreadNumbers.js';
import { BibleController } from './BibleController.js';
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
          ${verse.text}
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
        let url = getBollsChapterUrl(excerpt);
        return html `<div class="excerpt"><h3><a href=${url}>${excerpt.reference}</a></h3>
    ${excerpt.verses
            .map(v => this.bChapterVerse(v, hilighted.includes(v?.verse)))}</div>`;
    }
    willUpdate(_changedProperties) {
        if (_changedProperties.has("reference")) {
            if (this.reference !== this.bible.reference) {
                this.bible.init(this.reference);
            }
        }
    }
    render() {
        return this.bible.excerpts.map(excerpt => html `<section class="bible">${this.bExcerpt(excerpt, this.hilightVerses)}</section>`);
    }
    static { this.styles = css `
  * {box-sizing: border-box}
  :host {
    display: block;
    padding: 2.5em;
    border: solid 1px var(--bible-excerpt-color, #555);
    border-radius: 0.5em;
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
    background-color: var(--bible-excerpt-hilight-accent, #765);
  } 
  .verse:hover {
    background-color: var(--bible-excerpt-hilight, #555);
  }
  span.comment {
    display: none;
    background: var(--bible-excerpt-color);
    color: var(--bible-excerpt-background);
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
  `; }
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

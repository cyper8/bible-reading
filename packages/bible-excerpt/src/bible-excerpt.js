var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BibleExcerpt_1;
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { until } from 'lit/directives/until.js';
const TRANSLATIONS_ENDPOINT = 'https://bolls.life/static/bolls/app/views/languages.json';
const BOOKS_ENDPOINT = 'https://bolls.life/static/bolls/app/views/translations_books.json';
const spreadNumbers = (numlist, length) => numlist.split(',')
    .reduce((numRanges, entry) => {
    let boundaries = entry.trim().split('-');
    let first = parseInt(boundaries[0]) || 1;
    let last = parseInt(boundaries[boundaries.length - 1]) || length || first;
    while (entry && first <= last) {
        numRanges.push(first++);
    }
    return numRanges;
}, []);
let BibleExcerpt = BibleExcerpt_1 = class BibleExcerpt extends LitElement {
    constructor() {
        super(...arguments);
        this.excerpt = [];
        this.selectTranslation = false;
        this.translation = 'UBIO';
        this.book = 'Буття';
        this.chapter = '3';
        this.verses = '';
        this.hilightVerses = '';
    }
    renderManualModeControls(langs) {
        return html `<select id="translations" name="translations" @change=${(e) => { let selector = e.target; this.translation = selector.value; }}>
      ${langs.map(lang => lang.editions
            .map(edition => html `<option class="translation" 
            value="${edition.short_name}" 
            ?selected="${edition.short_name === this.translation}">
              ${lang.language} --- ${edition.short_name} --- ${edition.full_name}
            </option>`))}
  </select>`;
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
    bExcerpt(chapter, verses, hilight = '') {
        let hilighted = spreadNumbers(hilight);
        return spreadNumbers(verses ? verses : "1-", chapter.length)
            .map(vnum => chapter[vnum - 1]).filter(v => v)
            .map(v => this.bChapterVerse(v, hilighted.includes(v?.verse)));
    }
    willUpdate(_changedProperties) {
        if (_changedProperties.has("book")
            || _changedProperties.has("chapter")
            || _changedProperties.has("verses")) {
            BibleExcerpt_1.bBible
                .then(([_langs, books]) => {
                if (this.translation in books) {
                    let booknum = books[this.translation].findIndex(book => book.name === this.book) + 1;
                    if (booknum)
                        return fetch(`https://bolls.life/get-chapter/${this.translation}/${booknum}/${this.chapter}/`, {
                            method: 'GET',
                            mode: 'cors',
                            headers: { 'Content-Type': 'application/json', }
                        })
                            .then((res) => res.json())
                            .then(verses => {
                            this.excerpt = verses;
                        });
                    else
                        throw new Error(`помилка запиту`);
                }
                else
                    throw new Error(`Помилка: перекладу не знайдено`);
            })
                .catch(console.error);
        }
    }
    render() {
        return html `<h1>${this.book} ${this.chapter}${this.verses ? `:${this.verses}` : ''}</h1>
    ${until(BibleExcerpt_1.bBible.then(([langs, _books]) => html `${this.selectTranslation ? this.renderManualModeControls(langs) : nothing}`), nothing)}
    ${this.bExcerpt(this.excerpt, this.verses, this.hilightVerses)}`;
    }
};
BibleExcerpt.bBible = Promise.all([
    fetch(TRANSLATIONS_ENDPOINT).then(res => res.json()),
    fetch(BOOKS_ENDPOINT).then(res => res.json())
]);
BibleExcerpt.styles = css `
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
  `;
__decorate([
    state()
], BibleExcerpt.prototype, "excerpt", void 0);
__decorate([
    property({ type: Boolean })
], BibleExcerpt.prototype, "selectTranslation", void 0);
__decorate([
    property({ type: String })
], BibleExcerpt.prototype, "translation", void 0);
__decorate([
    property({ type: String })
], BibleExcerpt.prototype, "book", void 0);
__decorate([
    property({ type: Number })
], BibleExcerpt.prototype, "chapter", void 0);
__decorate([
    property({ type: String })
], BibleExcerpt.prototype, "verses", void 0);
__decorate([
    property({ type: String })
], BibleExcerpt.prototype, "hilightVerses", void 0);
BibleExcerpt = BibleExcerpt_1 = __decorate([
    customElement('bible-excerpt')
], BibleExcerpt);
export { BibleExcerpt };

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
import { fetchChapter, getChapterUrl, getEditions, parseReferenses } from '../../utils/bolls.js';
import { spreadNumbers } from '../../utils/spreadNumbers.js';
import "../../simple-aided-input/index.js";
import { BibleLibrary } from '../../utils/BibleLibrary.js';
import { quzzySearch } from '../../utils/quzzySearch.js';
const linkIcon = html `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.5442 10.4558C11.8385 8.75022 9.07316 8.75022 7.36753 10.4558L4.27922 13.5442C2.57359 15.2498 2.57359 18.0152 4.27922 19.7208C5.98485 21.4264 8.75021 21.4264 10.4558 19.7208L12 18.1766" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.4558 13.5442C12.1614 15.2498 14.9268 15.2498 16.6324 13.5442L19.7207 10.4558C21.4264 8.75021 21.4264 5.98485 19.7207 4.27922C18.0151 2.57359 15.2497 2.57359 13.5441 4.27922L12 5.82338" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
const editIcon = html `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.4745 5.40801L18.5917 7.52524M17.8358 3.54289L12.1086 9.27005C11.8131 9.56562 11.6116 9.94206 11.5296 10.3519L11 13L13.6481 12.4704C14.0579 12.3884 14.4344 12.1869 14.7299 11.8914L20.4571 6.16423C21.181 5.44037 21.181 4.26676 20.4571 3.5429C19.7332 2.81904 18.5596 2.81903 17.8358 3.54289Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19 15V18C19 19.1046 18.1046 20 17 20H6C4.89543 20 4 19.1046 4 18V7C4 5.89543 4.89543 5 6 5H9" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
let BibleExcerpt = class BibleExcerpt extends LitElement {
    static { BibleExcerpt_1 = this; }
    constructor() {
        super();
        this.defaultTranslation = 'UBIO';
        this.library = new BibleLibrary([]);
        this.hilightVerses = '';
        this.reference = '';
        this.editable = true;
        this.excerpts = [];
        this.edit = false;
        this.inputSuggestions = [];
        getEditions({ languages: ['Ukrainian'] })
            .then(editions => {
            this.library = new BibleLibrary(editions);
        });
    }
    getSuggestions(inputRef, library) {
        const translInputTest = /\([A-Z]*$/;
        let translationInput = inputRef.match(translInputTest);
        if (translationInput) {
            return library.allBooks
                .map(edition => (`(${edition.short_name})`))
                .filter(edName => translationInput[0].length ? edName.includes(translationInput[0]) : true)
                .map(item => ({
                name: item,
                value: item.replace(translationInput[0], '')
            }));
        }
        else {
            let refs = parseReferenses(inputRef, {
                translation: this.defaultTranslation,
                bookName: 'unknown',
                chapter: 99
            });
            let ref = refs[refs.length ? refs.length - 1 : 0];
            let books = library
                .selectEditions([ref.translation || this.defaultTranslation])
                .allBooks.map(edition => edition.books).flat();
            let bookQuery = ref.bookName;
            if (bookQuery !== 'unknown') {
                if (ref.chapter != 99) {
                    return [];
                }
                else {
                    let searchbooks = quzzySearch(bookQuery, ["name"], books);
                    if (searchbooks.length) {
                        if (inputRef.endsWith(searchbooks[0].name + ' ')) {
                            return spreadNumbers(`1-${searchbooks[0].chapters}`).map(num => ({
                                name: `${num}`,
                                value: `${num}`
                            }));
                        }
                        else {
                            return searchbooks.map(book => ({
                                name: book.name,
                                value: book.name.replace(bookQuery, '')
                            }));
                        }
                    }
                    else
                        return [];
                }
            }
            else {
                return books.map(book => book.name)
                    .map(item => ({
                    name: item,
                    value: item
                }));
            }
        }
    }
    async getExcerpts(refs) {
        let references;
        if (typeof refs == "string") {
            references = parseReferenses(refs, { translation: this.defaultTranslation });
        }
        else {
            references = refs;
        }
        return Promise.all(references.map(async (ref) => {
            let book = this.library.getBook(ref.bookName, this.defaultTranslation, { wholeWords: true });
            let translation = ref.translation || this.defaultTranslation;
            let bookName = book.name;
            let bookNum = book.bookid;
            let chapter = ref.chapter;
            var versesData = await fetchChapter(translation, bookNum, chapter);
            if (ref.verses && ref.verses.length) {
                versesData = versesData.filter(verse => ref.verses.includes(verse.verse));
            }
            return {
                ...ref,
                translation,
                reference: ref.reference + (ref.translation ? '' : ` (${translation})`),
                bookName,
                bookNum,
                versesData,
                url: getChapterUrl(translation, bookNum, ref.chapter, ref.verses?.length ? ref.verses[0] : undefined)
            };
        }));
    }
    renderExcerpt(excerpt, hilighted) {
        return html `<div class="excerpt">
      <h3>${excerpt.reference}${"url" in excerpt ? BibleExcerpt_1.renderLink(excerpt.url) : nothing}</h3>
      ${"versesData" in excerpt ? excerpt.versesData.map(v => BibleExcerpt_1.renderChapterVerse(v, hilighted.includes(v?.verse))) : nothing}
    </div>`;
    }
    static renderChapterVerse(verse, hilight = false) {
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
    static renderLink(url) {
        return html `<a class="icon" href="${encodeURI(url)}">${linkIcon}</a>`;
    }
    renderEdit() {
        return html `<a class="icon" 
    @click=${() => {
            this.edit = true;
        }}>${editIcon}</a>`;
    }
    updated(_changedProperties) {
        if (_changedProperties.has("reference") || _changedProperties.has("library")) {
            if (this.reference)
                this.getExcerpts(this.reference)
                    .then(excerpts => {
                    this.excerpts = excerpts;
                    if (this.edit) {
                        this.edit = false;
                        this.dispatchEvent(new CustomEvent("excerpts-changed", {
                            composed: true,
                            bubbles: true,
                            cancelable: true,
                            detail: this.excerpts
                        }));
                    }
                });
            else
                this.excerpts = [];
        }
    }
    render() {
        let hilighted = this.hilightVerses ? spreadNumbers(this.hilightVerses) : [];
        return html `<section class="bible">
        ${this.editable && this.edit
            ? html `<simple-aided-input mode="append"
          value="${this.reference}"
          .suggestions=${this.inputSuggestions}
          @aided-input=${(e) => {
                this.inputSuggestions = this.getSuggestions(e.detail, this.library);
            }}
          @value-changed=${(e) => {
                this.reference = e.detail;
            }}
          @value-unchanged=${(_e) => {
                this.edit = false;
            }}
          ></simple-aided-input>`
            : html `${this.editable ? this.renderEdit() : nothing}`}
        ${this.excerpts.map((excerpt) => this.renderExcerpt(excerpt, hilighted))}
      </section>`;
    }
    static { this.styles = [css `
  :host {
    --_this-color: var(--bible-excerpt-color, #fafafa);
    --_this-background: var(--bible-excerpt-background, #242424);
    --_this-hilight-accent: var(--bible-excerpt-hilight-accent, rgba(200, 225, 255, 0.5));
    --_this-hilight: var(--bible-excerpt-hilight, rgba(200, 200, 200, 0.5));
    --_this-accent: var(--bible-excerpt-accent, #59f);
    --_this-dark-accent: var(--bible-excerpt-dark-accent, #46e);

    --aided-input-text-color: var(--_this-color);
    --aided-input-background-color: var(--_this-background);
    --aided-input-suggestions-background: var(--_this-background);
    --aided-input-suggestions-text: var(--_this-color);
    --aided-input-suggestions-hover-background: var(--_this-hilight);
    --aided-input-suggestions-hover-text: var(--_this-color);
    --aided-input-suggestions-selected-background: var(--_this-hilight-accent);
    --aided-input-suggestions-selected-text: var(--_this-color);

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
  .icon svg {
    width: 1em;
    height: 1em;

    path {
      stroke: var(--_this-color);
    }
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
  #suggestion-list {
    max-height: 50em;
    overflow: scroll
  }
  `]; }
};
__decorate([
    property({ type: String })
], BibleExcerpt.prototype, "defaultTranslation", void 0);
__decorate([
    property({ type: Object })
], BibleExcerpt.prototype, "library", void 0);
__decorate([
    property({ type: String, attribute: 'hilight-verses' })
], BibleExcerpt.prototype, "hilightVerses", void 0);
__decorate([
    property({ type: String })
], BibleExcerpt.prototype, "reference", void 0);
__decorate([
    property({ type: Boolean })
], BibleExcerpt.prototype, "editable", void 0);
__decorate([
    property({ type: Array })
], BibleExcerpt.prototype, "excerpts", void 0);
__decorate([
    state()
], BibleExcerpt.prototype, "edit", void 0);
__decorate([
    state()
], BibleExcerpt.prototype, "inputSuggestions", void 0);
BibleExcerpt = BibleExcerpt_1 = __decorate([
    customElement('bible-excerpt')
], BibleExcerpt);
export { BibleExcerpt };

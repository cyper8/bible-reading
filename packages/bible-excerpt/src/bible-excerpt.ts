import { LitElement, PropertyValues, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { BibleReference, fetchChapter, getChapterUrl, getEditions, parseReferenses, type BibleExcerptData, type BollsBible } from '../../utils/bolls.js';
import { spreadNumbers } from '../../utils/spreadNumbers.js';
import { type InputSuggestion, type AidedInputEvent, ValueChangedEvent, ValueUnchangedEvent } from "../../simple-aided-input/index.js";
import "../../simple-aided-input/index.js";

import linkIcon from "./link-chain-svgrepo-com.svg?raw";
import editIcon from "./edit-svgrepo-com.svg?raw";
import { BibleLibrary } from '../../utils/BibleLibrary.js';
import { quzzySearch } from '../../utils/quzzySearch.js';

export type ExcerptsChangeEvent = CustomEvent<BibleExcerptData[]> & {
  type: 'excerpts-changed'
}

@customElement('bible-excerpt')
export class BibleExcerpt extends LitElement {
  @property({ type: String }) defaultTranslation: string = 'UBIO';
  @property({ type: Object }) library: BibleLibrary = new BibleLibrary([]);
  @property({ type: String, attribute: 'hilight-verses' }) hilightVerses: string = '';
  @property({ type: String }) reference: string = '';
  @property({ type: Boolean }) editable: boolean = true;
  @property({ type: Array }) excerpts: (BibleExcerptData | BibleReference)[] = [];
  @state() private edit: boolean = false;
  @state() private inputSuggestions: InputSuggestion[] = [];

  constructor() {
    super();
    getEditions({ languages: ['Ukrainian'] })
      .then(
        editions => {
          this.library = new BibleLibrary(editions);
        }
      )
  }

  private getSuggestions(inputRef: string, library: BibleLibrary): InputSuggestion[] {
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
    } else {
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
        } else {
          let searchbooks = quzzySearch<BollsBible.Book>(bookQuery, ["name"], books); //books.filter(book => book.name.includes(bookQuery));
          if (searchbooks.length) {
            if (inputRef.endsWith(searchbooks[0].name + ' ')) {
              return spreadNumbers(`1-${searchbooks[0].chapters}`).map(num => ({
                name: `${num}`,
                value: `${num}`
              }))
            } else {
              return searchbooks.map(book => ({
                name: book.name,
                value: book.name.replace(bookQuery, '')
              }))
            }
          } else return []
        }
      } else {
        return books.map(book => book.name)
          .map(item => ({
            name: item,
            value: item
          }))
      }
    }
  }

  async getExcerpts(refs: string): Promise<BibleExcerptData[]>
  async getExcerpts(refs: BibleReference[]): Promise<BibleExcerptData[]>
  async getExcerpts(refs: string | BibleReference[]): Promise<BibleExcerptData[]> {
    let references: BibleReference[];
    if (typeof refs == "string") {
      references = parseReferenses(refs, { translation: this.defaultTranslation });
    } else {
      references = refs
    }
    return Promise.all(references.map(async ref => {
      let book = this.library.getBook(ref.bookName, this.defaultTranslation, { wholeWords: true });
      let translation = ref.translation || this.defaultTranslation;
      let bookName = book.name;
      let bookNum = book.bookid;
      let chapter = ref.chapter;
      var versesData = await fetchChapter(translation, bookNum, chapter);
      if (ref.verses && ref.verses.length) {
        versesData = versesData.filter(verse => ref.verses!.includes(verse.verse));
      }
      return {
        ...ref,
        translation,
        reference: ref.reference + (ref.translation ? '' : ` (${translation})`),
        bookName,
        bookNum,
        versesData,
        url: getChapterUrl(translation, bookNum, ref.chapter, ref.verses?.length ? ref.verses[0] : undefined)
      }
    }))
  }

  renderExcerpt(excerpt: BibleExcerptData | BibleReference, hilighted: number[]) {
    return html`<div class="excerpt">
      <h3>${excerpt.reference}${"url" in excerpt ? BibleExcerpt.renderLink(excerpt.url) : nothing}</h3>
      ${"versesData" in excerpt ? excerpt.versesData.map(v => BibleExcerpt.renderChapterVerse(v, hilighted.includes(v?.verse))) : nothing}
    </div>`
  }

  static renderChapterVerse(verse: BollsBible.ChapterVerse, hilight = false) {
    return html`<input type=radio name="note" id="verse${verse.verse}" class="note" />
    <label for="verse${verse.verse}">
      <p 
      class="${classMap({ verse: true, hilight })}"
      pk="${verse.pk}" 
      chapter="${verse.chapter}" 
      num="${verse.verse}"
      >
          ${unsafeHTML(verse.text)}
          ${verse.comment
        ? html`<b>&darr;</b>  
            <span class="comment">
            <hr />
              ${unsafeHTML(verse.comment)}
            </span>`
        : nothing}
      </p>
    </label>`
  }

  static renderLink(url: string) {
    return html`<a class="icon" href="${encodeURI(url)}">${unsafeSVG(linkIcon)}</a>`;
  }

  renderEdit() {
    return html`<a class="icon" 
    @click=${() => {
        this.edit = true;
      }}>${unsafeSVG(editIcon)}</a>`;
  }

  protected updated(_changedProperties: PropertyValues<BibleExcerpt>): void {
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
              }) as ExcerptsChangeEvent)
            }
          });
      else this.excerpts = [];
    }
  }

  render() {
    let hilighted = this.hilightVerses ? spreadNumbers(this.hilightVerses) : [];
    return html`<section class="bible">
        ${this.editable && this.edit
        ? html`<simple-aided-input mode="append"
          value="${this.reference}"
          .suggestions=${this.inputSuggestions}
          @aided-input=${(e: AidedInputEvent) => {
            this.inputSuggestions = this.getSuggestions(e.detail, this.library);
          }}
          @value-changed=${(e: ValueChangedEvent) => {
            this.reference = e.detail;
          }}
          @value-unchanged=${(_e: ValueUnchangedEvent) => {
            this.edit = false;
          }}
          ></simple-aided-input>`
        : html`${this.editable ? this.renderEdit() : nothing}`
      }
        ${this.excerpts.map((excerpt) => this.renderExcerpt(excerpt, hilighted))}
      </section>`;
  }

  /**
   * --bible-excerpt-color
   * --bible-excerpt-background
   * --bible-excerpt-hilight-accent
   * --bible-excerpt-hilight
   * --bible-excerpt-accent
   * --bible-excerpt-dark-accent
   */
  static styles = [css`
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
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    'bible-excerpt': BibleExcerpt;
  }
}
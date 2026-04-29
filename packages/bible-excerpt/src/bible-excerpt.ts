import { LitElement, PropertyValues, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { BibleReference, type BibleExcerptData, type BollsBible } from '../../utils/bolls.js';
import { spreadNumbers } from '../../utils/spreadNumbers.js';
import { BibleController } from './BibleController.js';
import { type InputSuggestion, type AidedInputEvent, ValueChangedEvent, ValueUnchangedEvent } from "../../simple-aided-input/index.js";
import "../../simple-aided-input/index.js";

import linkIcon from "./link-chain-svgrepo-com.svg?raw";
import editIcon from "./edit-svgrepo-com.svg?raw";

export interface BibleExcerptsContent {
  reference: string
  excerpts: (BibleExcerptData | BibleReference)[]
}

@customElement('bible-excerpt')
export class BibleExcerpt extends LitElement {
  @property({ type: String }) defaultTranslation: string = 'UBIO';
  @property({ type: Object }) bible: BibleExcerptsContent = new BibleController(this, this.defaultTranslation);
  @property({ type: String, attribute: 'hilight-vrsees' }) hilightVerses: string = '';
  @property({ type: String }) reference: string = '';
  @property({ type: Boolean }) editable = this.bible instanceof BibleController;
  @state() private edit: boolean = false;
  @state() private inputSuggestions: InputSuggestion[] = [];

  private async getSuggestions(inputRef: string): Promise<InputSuggestion[]> {
    if (!(this.bible instanceof BibleController)) return [];
    const translInputTest = /\([A-Z]*$/;
    let library = await this.bible.remote.library;
    let translationInput = inputRef.match(translInputTest);
    if (translationInput) {
      return library.all
        .map(edition => (`(${edition.short_name})`))
        .filter(edName => translationInput[0].length ? edName.includes(translationInput[0]) : true)
        .map(item => ({
          name: item,
          value: item.replace(translationInput[0], '')
        }));
    } else {
      let refs = BibleController.parseReferenses(inputRef, {
        translation: this.defaultTranslation,
        bookName: 'unknown',
      });
      let ref = refs[refs.length ? refs.length - 1 : 0];
      let books = library
        .getTranslations([ref.translation || this.defaultTranslation])
        .all.map(edition => edition.books.map(book => book.name)).flat();
      let bookQuery = ref.bookName;
      if (bookQuery !== 'unknown') {
        return books
          .filter(bname => bname.includes(bookQuery))
          .map(bname => ({
            name: bname,
            value: bname.replace(bookQuery, '')
          }))
      } else {
        return books
          .map(item => ({
            name: item,
            value: item
          }))
      }
    }
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

  protected willUpdate(_changedProperties: PropertyValues<BibleExcerpt>): void {
    if (_changedProperties.has("reference")) {
      this.bible.reference = this.reference;
    }
    if (_changedProperties.has("bible")) {
      this.editable = this.bible instanceof BibleController;
    }
  }

  render() {
    if (this.bible.excerpts.length) {
      let hilighted = this.hilightVerses ? spreadNumbers(this.hilightVerses) : [];
      return html`<section class="bible">
        ${this.edit
          ? html`<simple-aided-input mode="append"
          value="${this.bible.reference}"
          .suggestions=${this.inputSuggestions}
          @aided-input=${(e: AidedInputEvent) => {
              this.getSuggestions(e.detail).then(suggestions => {
                this.inputSuggestions = suggestions
              })
            }}
          @value-changed=${(e: ValueChangedEvent) => {
              this.edit = false;
              this.bible.reference = e.detail;
            }}
        @value-unchanged=${(_e: ValueUnchangedEvent) => {
              this.edit = false;
            }}
          ></simple-aided-input>`
          : html`${this.editable ? this.renderEdit() : nothing}
            ${this.bible.excerpts.map((excerpt) => this.renderExcerpt(excerpt, hilighted))}`}
      </section>`;
    }
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
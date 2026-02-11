import { LitElement, PropertyValueMap, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { until } from 'lit/directives/until.js';

const TRANSLATIONS_ENDPOINT = 'https://bolls.life/static/bolls/app/views/languages.json';
const BOOKS_ENDPOINT = 'https://bolls.life/static/bolls/app/views/translations_books.json';

export namespace BollsBible {
  export declare interface BibleVerse {
    pk: number;
    chapter: number;
    verse: number;
    text: string;
  }
  
  export declare interface BibleSingleVerse extends BibleVerse {
    translation: string;
    book: number;
  }
  
  export declare interface BibleChapterVerse extends BibleVerse {
    comment?: string;
  }
  
  export declare interface BibleEdition {
    short_name: string
    full_name: string
    commentaries?: boolean
    updated: number
    info?: string
    dir?: 'rtl' | 'ltr'
  }
  
  export declare interface BibleTranslation {
    language: string,
    editions: BibleEdition[]
  }
  
  export declare interface BibleBook {
    bookid: number
    chronorder: number
    name: string
    chapter: number
  }
  
  export declare type BibleTranslations = BibleTranslation[];
  
  export declare type BibleEditions = {
    [edition in BibleEdition["short_name"]]: BibleBook[]
  }
  
  export declare type BibleChapterVerses = BibleChapterVerse[];
}

const spreadNumbers = (numlist: string, length?: number) => numlist.split(',')
  .reduce((numRanges: number[], entry) => {
    let boundaries = entry.trim().split('-');
    let first = parseInt(boundaries[0]) || 1;
    let last = parseInt(boundaries[boundaries.length - 1]) || length || first;
    while (entry && first <= last) {
      numRanges.push(first++);
    }
    return numRanges;
  }, []);

@customElement('bible-excerpt')
export class BibleExcerpt extends LitElement {
  static bBible = Promise.all([
    fetch(TRANSLATIONS_ENDPOINT).then<BollsBible.BibleTranslations>(res => res.json()),
    fetch(BOOKS_ENDPOINT).then<BollsBible.BibleEditions>(res => res.json())
  ]);
  @state() private excerpt: BollsBible.BibleChapterVerses = [];
  @property({ type: Boolean }) selectTranslation: boolean = false;
  @property({ type: String }) translation: string = 'UBIO';
  @property({ type: String }) book: string = 'Буття';
  @property({ type: Number }) chapter: string = '3';
  @property({ type: String }) verses: string = '';
  @property({ type: String }) hilightVerses: string = '';

  private renderManualModeControls(langs: BollsBible.BibleTranslations) {
    return html`<select id="translations" name="translations" @change=${(e: Event) => { let selector = e.target as HTMLSelectElement; this.translation = selector.value }}>
      ${langs.map(lang =>
      lang.editions
        .map(edition =>
          html`<option class="translation" 
            value="${edition.short_name}" 
            ?selected="${edition.short_name === this.translation}">
              ${lang.language} --- ${edition.short_name} --- ${edition.full_name}
            </option>`))}
  </select>`
  }

  private bChapterVerse(verse: BollsBible.BibleChapterVerse, hilight = false) {
    return html`<input type=radio name="note" id="verse${verse.verse}" class="note" />
    <label for="verse${verse.verse}">
      <p 
      class="${classMap({ verse: true, hilight })}"
      pk="${verse.pk}" 
      chapter="${verse.chapter}" 
      num="${verse.verse}"
      >
          ${verse.text}
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

  private bExcerpt(chapter: BollsBible.BibleChapterVerses, verses: string, hilight: string = '') {
    let hilighted = spreadNumbers(hilight);
    return spreadNumbers(verses ? verses : "1-", chapter.length)
      .map(vnum => chapter[vnum - 1]).filter(v => v)
      .map(v => this.bChapterVerse(v, hilighted.includes(v?.verse)))
  }

  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has("book")
      || _changedProperties.has("chapter")
      || _changedProperties.has("verses")) {
      BibleExcerpt.bBible
        .then(([_langs, books]) => {
          if (this.translation in books) {
            let booknum = books[this.translation].findIndex(book => book.name === this.book) + 1;
            if (booknum)
              return fetch(
                `https://bolls.life/get-chapter/${this.translation}/${booknum}/${this.chapter}/`,
                {
                  method: 'GET',
                  mode: 'cors',
                  headers: { 'Content-Type': 'application/json', }
                }
              )
                .then<BollsBible.BibleChapterVerses>((res) => res.json())
                .then(verses => {
                  this.excerpt = verses;
                })
            else throw new Error(`помилка запиту`)
          } else throw new Error(`Помилка: перекладу не знайдено`)
        })
        .catch(console.error);
    }
  }

  render() {
    return html`<h1>${this.book} ${this.chapter}${this.verses ? `:${this.verses}` : ''}</h1>
    ${until(
      BibleExcerpt.bBible.then(([langs, _books]) =>
        html`${this.selectTranslation ? this.renderManualModeControls(langs) : nothing}`),
      nothing)}
    ${this.bExcerpt(this.excerpt, this.verses, this.hilightVerses)}`;
  }

  static styles = css`
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
}

declare global {
  interface HTMLElementTagNameMap {
    'bible-excerpt': BibleExcerpt;
  }
}
import { LitElement, PropertyValueMap, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { BollsBibleController, type BollsBible } from './BollsBibleController.js';

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
  
  @state() private excerpt: BollsBible.ChapterVerses = [];

  bible = new BollsBibleController(this);

  @property({ type: Boolean }) selectTranslation: boolean = false;
  @property({ type: String }) translation: string = 'UBIO';
  @property({ type: String }) book: string = 'Буття';
  @property({ type: Number }) chapter: string = '3';
  @property({ type: String }) verses: string = '';
  @property({ type: String }) hilightVerses: string = '';

  private translationSelector(langs: BollsBible.Translations) {
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

  private bChapterVerse(verse: BollsBible.ChapterVerse, hilight = false) {
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

  private bExcerpt(chapter: BollsBible.ChapterVerses, verses: string, hilight: string = '') {
    let hilighted = spreadNumbers(hilight);
    return spreadNumbers(verses ? verses : "1-", chapter.length)
      .map(vnum => chapter[vnum - 1]).filter(v => v)
      .map(v => this.bChapterVerse(v, hilighted.includes(v?.verse)))
  }

  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has("book")
      || _changedProperties.has("chapter")
      || _changedProperties.has("verses")) {
        if (this.translation in this.bible.editions) {
          let booknum = this.bible.editions[this.translation].findIndex(book => book.name === this.book) + 1;
          if (booknum)
            this.bible.getChapter(this.translation, booknum, parseInt(this.chapter))
              .then(verses => {
                this.excerpt = verses;
              })
          else throw new Error(`помилка запиту`)
        } else throw new Error(`Помилка: перекладу не знайдено`)
    }
  }

  render() {
    return html`<h1>${this.book} ${this.chapter}${this.verses ? `:${this.verses}` : ''}</h1>
    ${this.selectTranslation ? this.translationSelector(this.bible.translations) : nothing}
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
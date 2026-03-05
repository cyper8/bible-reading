import { LitElement, PropertyValues, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { type BollsBible } from '../../utils/bolls.js';
import { spreadNumbers } from '../../utils/spreadNumbers.js';
import { BibleController, BibleExcerptData, BibleReference, isBibleExcerpt } from './BibleController.js';

@customElement('bible-excerpt')
export class BibleExcerpt extends LitElement {
  bible = new BibleController(this);
  @property({ type: String, attribute: 'hilight-verses' }) hilightVerses: string = '';
  @property({ type: String }) reference: string = '';

  private bChapterVerse(verse: BollsBible.ChapterVerse, hilight = false) {
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

  private bExcerpt(excerpt: BibleReference | BibleExcerptData, hilight: string = '') {
    let hilighted = hilight ? spreadNumbers(hilight) : [];
    return html`<div class="excerpt"><h3>${unsafeHTML(BibleController.refAnchor(excerpt))}</h3>
    ${isBibleExcerpt(excerpt)
        ? excerpt.verses
          .map(v => this.bChapterVerse(v, hilighted.includes(v?.verse)))
        : html`<i>Не вдалося завантажити текст</i>`}</div>`
  }

  protected willUpdate(_changedProperties: PropertyValues<BibleExcerpt>): void {
    if (_changedProperties.has("reference")) {
      if (this.reference !== this.bible.reference) {
        this.bible.init(this.reference);
      }
    }
  }

  render() {
    return this.bible.excerpts
      .map((excerpt) => html`<section class="bible">${this.bExcerpt(excerpt, this.hilightVerses)}</section>`);
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
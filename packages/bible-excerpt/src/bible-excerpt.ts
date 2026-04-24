import { LitElement, PropertyValues, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { type BibleExcerptData, type BollsBible } from '../../utils/bolls.js';
import { spreadNumbers } from '../../utils/spreadNumbers.js';
import { BibleController } from './BibleController.js';

export interface BibleExcerptsContent {
  reference: string
  excerpts: BibleExcerptData[]
}

@customElement('bible-excerpt')
export class BibleExcerpt extends LitElement {
  @property({ type: String }) defaultTranslation: string = 'UBIO';
  @property({ type: Object }) bible: BibleExcerptsContent = new BibleController(this, this.defaultTranslation);
  @property({ type: String, attribute: 'hilight-vrsees' }) hilightVerses: string = '';
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

  protected willUpdate(_changedProperties: PropertyValues<BibleExcerpt>): void {
    if (_changedProperties.has("reference")) {
      this.bible.reference = this.reference;
    }
  }

  render() {
    if (this.bible.excerpts.length) {
      let hilighted = this.hilightVerses ? spreadNumbers(this.hilightVerses) : [];
      return html`<section class="bible">
        ${this.bible.excerpts.map(excerpt => html`<div class="excerpt">
          <h3><a class="bible" href="${excerpt.url}">${excerpt.reference}</a></h3>
        ${excerpt.versesData.map(v => this.bChapterVerse(v, hilighted.includes(v?.verse)))}
        </div>`)}
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

  `];
}

declare global {
  interface HTMLElementTagNameMap {
    'bible-excerpt': BibleExcerpt;
  }
}
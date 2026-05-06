import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export type AidedInputEvent = CustomEvent<string> & {
  type: 'aided-input'
};
export type ValueChangedEvent = CustomEvent<string> & {
  type: 'value-changed'
};
export type ValueUnchangedEvent = CustomEvent<string> & {
  type: 'value-unchanged'
};

export interface InputSuggestion {
  name: string,
  value: string
}

@customElement("simple-aided-input")
export class SimpleAidedInput extends LitElement {
  @property({ type: String }) value: string = '';
  @state() input = this.value;
  @property({ type: String }) mode: 'replace' | 'append' = 'replace';
  @state() selected: number = 0;
  @property({ type: Array }) suggestions: InputSuggestion[] = [];

  private handleInput = async (event: KeyboardEvent & { target: HTMLInputElement }) => {
    let value = event.target.value;
    this.input = value;
    this.dispatchEvent(new CustomEvent("aided-input", {
      detail: value,
      bubbles: true,
      composed: true,
      cancelable: true
    }));
  }

  private handleKeys = (e: KeyboardEvent & { target: HTMLInputElement }) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (this.suggestions.length) this.takeSuggestion(this.selected);
        else this.dispatchEvent(new CustomEvent("value-changed", {
          detail: this.value = this.input,
          bubbles: true,
          composed: true,
          cancelable: true
        }) as ValueChangedEvent);
        break;
      case "Escape":
        e.preventDefault();
        if (this.suggestions.length) this.suggestions = [];
        else this.dispatchEvent(new CustomEvent("value-unchanged", {
          detail: this.value,
          bubbles: true,
          composed: true,
          cancelable: true
        }) as ValueUnchangedEvent);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.selected = this.suggestions.length
          ? ((this.suggestions.length + this.selected - 1) % this.suggestions.length)
          : -1;
        break;
      case "ArrowDown":
        e.preventDefault();
        this.selected = this.suggestions.length
          ? (this.selected + 1) % this.suggestions.length
          : -1;
        break;
      default:
    }
  }

  private takeSuggestion(index: number) {
    let suggestion = this.suggestions[index];
    if (suggestion) {
      if (this.mode == 'append') {
        this.input += suggestion.value
      } else {
        this.input = suggestion.value;
      }
      this.suggestions = [];
    }
  }

  protected willUpdate(_changedProperties: PropertyValues<SimpleAidedInput>): void {
    if (_changedProperties.has("suggestions")) {
      if (this.suggestions.length == 0) this.selected = -1;
      else this.selected = 0;
    }
    if (_changedProperties.has("value")) this.input = this.value;
  }

  // protected updated(changedProperties: PropertyValues<SimpleAidedInput>): void {
  //   if (changedProperties.has("value")) {
  //     this.input = this.value;
  //   }
  // }

  protected render(): unknown {
    return html`<label for="ref-input">
      <input id="ref-input" type=text autocomplete="off"
        .value=${this.input} 
        @input=${this.handleInput} 
        @keydown=${this.handleKeys}
      \>
      <div id="suggestions-list" class="input-suggestions">${this.suggestions
        .map((suggestion: InputSuggestion, index: number) =>
          html`<p 
            class="suggested-item"
            ?selected=${this.selected == index}
            @click=${(_e: MouseEvent & { target: HTMLElement }) => {
              this.takeSuggestion(index);
            }}
          >${suggestion.name}</p>`
        )
      }</div>
    </label>`
  }

  /**
   * --aided-input-text-color
   * --aided-input-background-color
   * --aided-input-suggestions-background
   * --aided-input-suggestions-text
   * --aided-input-suggestions-hover-background
   * --aided-input-suggestions-hover-text
   * --aided-input-suggestions-selected-background
   * --aided-input-suggestions-selected-text
   */

  static styles = [css`
    :host{
      --_text-color: var(--aided-input-text-color, #eee);
      --_suggestions-text: var(--aided-input-suggestions-text, --_text-color);
      --_suggestions-hover-text: var(--aided-input-suggestions-hover-text, --_text-color);
      --_suggestions-selected-background: var(--aided-input-suggestions-selected-background, #ddd);
      --_background-color: var(--aided-input-background-color, #222);
      --_suggestions-background: var(--aided-input-suggestions-background, --_background-color); 
      --_suggestions-hover-background: var(--aided-input-suggestions-hover-background, #444);
      --_suggestions-selected-text: var(--aided-input-suggestions-selected-text, #111);

      color: var(--_text-color);
      background-color: var(--_background-color);
    }
    @media (prefers-color-scheme: light) {
      :host {
        --_text-color: var(--aided-input-background-color, #222);
        --_suggestions-text: var(--aided-input-suggestions-background, --_text-color);
        --_suggestions-hover-text: var(--aided-input-suggestions-hover-background, #444);
        --_suggestions-selected-background: var(--aided-input-suggestions-selected-background, #111);
        --_background-color: var(--aided-input-text-color, #eee);
        --_suggestions-background: var(--aided-input-suggestions-text, --_background-color); 
        --_suggestions-hover-background: var(--aided-input-suggestions-hover-text, --_background-color);
        --_suggestions-selected-text: var(--aided-input-suggestions-selected-text, #ddd);
      }
    }
    input {
      font-size: inherit;
      outline: none;
      color: var(--_text-color);
      background: none;
      border-top: none;
      border-left: none;
      border-bottom: solid 1px var(--_text-color);
      border-right: none;
    }
    #suggestions-list {
      background-color: var(--_suggestions-background);
      padding: 0 1em 1em 1em;
      min-width: 50%;
      position: absolute;
      max-height: 50vh;
      overflow: auto scroll;
    }
    #suggestions-list:not(:has(*)) {
      display: none
    }
    .suggested-item{
      color: var(--_suggestions-text);
      line-height: 1.5em;
    }
    .suggested-item[selected] {
      color: var(--_suggestions-selected-text);
      background-color: var(--_suggestions-selected-background);
    }
    .suggested-item:hover {
      color: var(--_suggestions-hover-text);
      background-color: var(--_suggestions-hover-background);
    }
  `];

}

declare global {
  interface HTMLElementTagNameMap {
    "simple-aided-input": SimpleAidedInput;
  }
}
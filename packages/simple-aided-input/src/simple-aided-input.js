var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
let SimpleAidedInput = class SimpleAidedInput extends LitElement {
    constructor() {
        super(...arguments);
        this.value = '';
        this.input = this.value;
        this.mode = 'replace';
        this.selected = 0;
        this.suggestions = [];
        this.handleInput = async (event) => {
            let value = event.target.value;
            this.input = value;
            this.dispatchEvent(new CustomEvent("aided-input", {
                detail: value,
                bubbles: true,
                composed: true,
                cancelable: true
            }));
        };
        this.handleKeys = (e) => {
            switch (e.key) {
                case "Enter":
                    e.preventDefault();
                    if (this.suggestions.length)
                        this.takeSuggestion(this.selected);
                    else
                        this.dispatchEvent(new CustomEvent("value-changed", {
                            detail: this.value = this.input,
                            bubbles: true,
                            composed: true,
                            cancelable: true
                        }));
                    break;
                case "Escape":
                    e.preventDefault();
                    if (this.suggestions.length)
                        this.suggestions = [];
                    else
                        this.dispatchEvent(new CustomEvent("value-unchanged", {
                            detail: this.value,
                            bubbles: true,
                            composed: true,
                            cancelable: true
                        }));
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
        };
    }
    takeSuggestion(index) {
        let suggestion = this.suggestions[index];
        if (suggestion) {
            if (this.mode == 'append') {
                this.input += suggestion.value;
            }
            else {
                this.input = suggestion.value;
            }
            this.suggestions = [];
        }
    }
    willUpdate(_changedProperties) {
        if (_changedProperties.has("suggestions")) {
            if (this.suggestions.length == 0)
                this.selected = -1;
            else
                this.selected = 0;
        }
        if (_changedProperties.has("value"))
            this.input = this.value;
    }
    render() {
        return html `<label for="ref-input">
      <input id="ref-input" type=text autocomplete="off"
        .value=${this.input} 
        @input=${this.handleInput} 
        @keydown=${this.handleKeys}
      \>
      <div id="suggestions-list" class="input-suggestions">${this.suggestions
            .map((suggestion, index) => html `<p 
            class="suggested-item"
            ?selected=${this.selected == index}
            @click=${(_e) => {
            this.takeSuggestion(index);
        }}
          >${suggestion.name}</p>`)}</div>
    </label>`;
    }
    static { this.styles = [css `
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
  `]; }
};
__decorate([
    property({ type: String })
], SimpleAidedInput.prototype, "value", void 0);
__decorate([
    state()
], SimpleAidedInput.prototype, "input", void 0);
__decorate([
    property({ type: String })
], SimpleAidedInput.prototype, "mode", void 0);
__decorate([
    state()
], SimpleAidedInput.prototype, "selected", void 0);
__decorate([
    property({ type: Array })
], SimpleAidedInput.prototype, "suggestions", void 0);
SimpleAidedInput = __decorate([
    customElement("simple-aided-input")
], SimpleAidedInput);
export { SimpleAidedInput };

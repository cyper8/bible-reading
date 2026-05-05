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
                    this.selected = this.suggestions.length
                        ? ((this.suggestions.length + this.selected - 1) % this.suggestions.length)
                        : -1;
                    break;
                case "ArrowDown":
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
      --aided-input-text-color: #eee;
      --aided-input-suggestions-text: #eee;
      --aided-input-suggestions-hover-text: #eeeeee;
      --aided-input-suggestions-selected-background: #ddd;
      --aided-input-background-color: #222;
      --aided-input-suggestions-background: #222; 
      --aided-input-suggestions-hover-background: #444;
      --aided-input-suggestions-selected-text: #111;

      color: var(--aided-input-text-color);
      background-color: var(--aided-input-background-color);
    }
    @media (prefers-color-scheme: light) {
      :host {
        --aided-input-background-color: #eee;
        --aided-input-suggestions-background:  #eee;
        --aided-input-suggestions-hover-background: #eeeeee;
        --aided-input-suggestions-selected-background: #ddd;
        --aided-input-text-color: #222;
        --aided-input-suggestions-text: #222; 
        --aided-input-suggestions-hover-text: #444
        --aided-input-suggestions-selected-text: #111;
      }
    }
    input {
      color: var(--aided-input-text-color);
      background: none;
      border-top: none;
      border-left: none;
      border-bottom: solid 1px var(--aided-input-text-color);
      border-right: none;
    }
    #suggestions-list:not(:has(*)) {
      display: none
    }
    .suggested-item{
      color: var(--aided-input-suggestions-text);
      background-color: var(--aided-input-suggestions-background);
    }
    .suggested-item[selected] {
      color: var(--aided-input-suggestions-selected-text);
      background-color: var(--aided-input-suggestions-selected-background);
    }
    .suggested-item:hover {
      color: var(--aided-input-suggestions-hover-text);
      background-color: var(--aided-input-suggestions-hover-background);
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

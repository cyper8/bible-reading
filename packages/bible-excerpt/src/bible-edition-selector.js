var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
let BibleEditionSelector = class BibleEditionSelector extends LitElement {
    constructor() {
        super(...arguments);
        this.languages = [];
        this.translations = [];
        this.editions = [];
        this.selectedLanguage = '';
        this.selectedEdition = '';
    }
    static get styles() {
        return css `
        :host option {}
        .lng-item {}
        .edit-item {}
        :host select {}
        #lang-selector {}
        #edition-selector {}
        `;
    }
    langs(languages, selectedLang) {
        return languages.map((lang, index) => html `<option value=${lang}
             class="lang-item" 
             id="lang${index}" 
             ?selected=${lang === selectedLang}>${lang}</option>`);
    }
    edits(editions, selectedEdit) {
        return editions.map((edit, index) => html `<option value=${edit.short_name}
             class="edit-item"
             id="edit${index}" 
             ?selected="${selectedEdit === edit.short_name}">${edit.short_name}</option>`);
    }
    selectLang(event) {
        event.stopImmediatePropagation();
        let target = event.target;
        this.selectedLanguage = target.value;
    }
    selectEdit(event) {
        let target = event.target;
        this.selectedEdition = target.value;
    }
    willUpdate(_changedProperties) {
        if (_changedProperties.has('selectedLanguage')) {
            this.editions = this.translations.find(tr => tr.language === this.selectedLanguage)?.editions || [];
        }
    }
    render() {
        return html `<select id="lang-selector" @change="${this.selectLang}">${this.langs(this.languages, this.selectedLanguage)}</select>
        <select id="edition-selector" @change="${this.selectEdit}">${this.edits(this.editions, this.selectedEdition)}</select>`;
    }
};
__decorate([
    state()
], BibleEditionSelector.prototype, "languages", void 0);
__decorate([
    property({ type: Array })
], BibleEditionSelector.prototype, "translations", void 0);
__decorate([
    property({ type: Array })
], BibleEditionSelector.prototype, "editions", void 0);
__decorate([
    property({ type: String })
], BibleEditionSelector.prototype, "selectedLanguage", void 0);
__decorate([
    property({ type: String })
], BibleEditionSelector.prototype, "selectedEdition", void 0);
BibleEditionSelector = __decorate([
    customElement("bible-edition-selector")
], BibleEditionSelector);
export { BibleEditionSelector };

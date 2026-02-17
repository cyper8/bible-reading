import { LitElement, PropertyValueMap, TemplateResult, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BollsBible } from "./BollsBibleController";

@customElement("bible-edition-selector")
export class BibleEditionSelector extends LitElement {
    @state() languages: string[] = [];
    @property({type: Array})
    translations: BollsBible.Translations = [];
    @property({type: Array})
    editions: BollsBible.Edition[] = [];
    @property({type: String})
    selectedLanguage: BollsBible.Translation['language'] = '';
    @property({type: String})
    selectedEdition: BollsBible.Edition['short_name'] = '';

    static get styles() {
        return css`
        :host option {}
        .lng-item {}
        .edit-item {}
        :host select {}
        #lang-selector {}
        #edition-selector {}
        `
    }

    private langs(languages: string[], selectedLang: string): TemplateResult[] {
        return languages.map((lang,index) => 
            html`<option value=${lang}
             class="lang-item" 
             id="lang${index}" 
             ?selected=${lang === selectedLang}>${lang}</option>`)
    }

    private edits(editions: BollsBible.Edition[], selectedEdit: BollsBible.Edition['short_name']): TemplateResult[] {
        return editions.map((edit, index) => 
            html`<option value=${edit.short_name}
             class="edit-item"
             id="edit${index}" 
             ?selected="${selectedEdit === edit.short_name}">${edit.short_name}</option>`)
    }

    selectLang(event: Event) {
        event.stopImmediatePropagation();
        let target = event.target as HTMLSelectElement;
        this.selectedLanguage = target.value;
    }

    selectEdit(event: Event) {
        let target = event.target as HTMLSelectElement;
        this.selectedEdition = target.value;
    }

    protected willUpdate(_changedProperties: PropertyValueMap<this> | Map<PropertyKey, unknown>): void {
        if (_changedProperties.has('selectedLanguage')) {
            this.editions = this.translations.find(tr => tr.language === this.selectedLanguage)?.editions || [];
        }
    }

    protected render(): TemplateResult {
        return html`<select id="lang-selector" @change="${this.selectLang}">${this.langs(this.languages, this.selectedLanguage)}</select>
        <select id="edition-selector" @change="${this.selectEdit}">${this.edits(this.editions, this.selectedEdition)}</select>`
    }
}

declare global {
    interface HTMLElementTagNameMap {
      'bible-edition-selector': BibleEditionSelector;
    }
  }
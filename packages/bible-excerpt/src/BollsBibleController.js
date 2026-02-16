var _a;
const TRANSLATIONS_ENDPOINT = 'https://bolls.life/static/bolls/app/views/languages.json';
const BOOKS_ENDPOINT = 'https://bolls.life/static/bolls/app/views/translations_books.json';
export class BollsBibleController {
    static fetchBolls(endpoint, init) {
        return fetch(endpoint, {
            method: 'GET',
            ...init,
            mode: 'cors',
            headers: { 'Content-Type': 'application/json', }
        });
    }
    async getChapter(editionName, bookNum, chapter) {
        return _a.fetchBolls(`https://bolls.life/get-chapter/${editionName}/${bookNum}/${chapter}/`).then(response => response.json());
    }
    constructor(host) {
        this.translations = [];
        this.editions = {};
        this.host = host;
        _a.translations.then(translations => { this.translations = translations; this.host.requestUpdate(); });
        _a.editions.then(editions => { this.editions = editions; this.host.requestUpdate(); });
    }
    hostConnected() {
    }
    hostDisconnected() {
    }
    hostUpdate() {
    }
    hostUpdated() {
    }
}
_a = BollsBibleController;
BollsBibleController.translations = _a.fetchBolls(TRANSLATIONS_ENDPOINT).then(resp => resp.json());
BollsBibleController.editions = _a.fetchBolls(BOOKS_ENDPOINT).then(resp => resp.json());

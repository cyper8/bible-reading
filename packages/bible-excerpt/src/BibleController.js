import { BollsController } from "../../utils/bolls.js";
import { spreadNumbers } from "../../utils/spreadNumbers.js";
const DEFAULT_TRANSLATION = 'UBIO';
export class BibleController {
    static { this.remote = new BollsController(DEFAULT_TRANSLATION, ['Ukrainian']); }
    static parseReferenses(refs) {
        return refs.split(',')
            .reduce((result, ref, i, _originalRefs) => {
            let translation, foundtranslations = ref.trim().match(/\([A-Z0-9]+\)/);
            if (foundtranslations && foundtranslations.length) {
                ref = ref.replace(foundtranslations[0], '').trim();
                translation = foundtranslations[0].replace(/[\(\)]/g, '');
            }
            else {
                translation = i > 0 ? result[i - 1].translation : undefined;
                ref = ref.trim();
            }
            let stances = ref.split(':'), chapters, bookName;
            let chapterspreads = stances[0].match(/[0-9 -]+$/);
            if (chapterspreads && chapterspreads.length) {
                chapters = spreadNumbers(chapterspreads[0]);
                bookName = stances[0].replace(chapterspreads[0], '').trim();
            }
            else {
                chapters = i > 0 ? [result[i - 1].chapter] : [1];
                bookName = stances[0].trim();
            }
            ;
            if (bookName === '') {
                bookName = i > 0 ? result[i - 1].bookName : '';
            }
            if (bookName)
                chapters.forEach((chapter, i) => {
                    let verses = [];
                    if (i === chapters.length - 1) {
                        if (stances.length == 2) {
                            verses = spreadNumbers(stances[1].trim());
                        }
                    }
                    let excerpt = {
                        translation: translation,
                        reference: `${bookName} ${chapter}${verses.length ? `:${stances[1]}` : ''}${translation ? ` (${translation})` : ''}`,
                        bookName,
                        chapter,
                        verses
                    };
                    result.push(excerpt);
                });
            return result;
        }, []);
    }
    static async parseExcerpts(refs) {
        return Promise.all(this.parseReferenses(refs).map(ref => this.remote.getExcerpt(ref)));
    }
    static async refAnchor(ref) {
        let url = await this.remote.getChapterUrl(ref);
        return `<a href="${url}">${ref.reference}</a>`;
    }
    get reference() { return this._reference; }
    ;
    set reference(ref) {
        BibleController.parseExcerpts(ref)
            .then(excerpts => this.excerpts = excerpts)
            .finally(() => { this.host.requestUpdate(); });
    }
    constructor(host) {
        this._reference = '';
        this.excerpts = [];
        this.host = host;
    }
    hostConnected() { }
    hostDisconnected() { }
    hostUpdate() { }
    hostUpdated() { }
}

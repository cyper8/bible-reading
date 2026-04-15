import { BollsBibleService } from "../../utils/bolls.js";
import { spreadNumbers } from "../../utils/spreadNumbers.js";
export class BibleController {
    static parseReferenses(refs, context) {
        return refs.split(',')
            .reduce((result, ref, i, _originalRefs) => {
            let refContext = (context ? [context] : []).concat(result);
            let translation, foundtranslations = ref.trim().match(/\([A-Z0-9]+\)/);
            if (foundtranslations && foundtranslations.length) {
                ref = ref.replace(foundtranslations[0], '').trim();
                translation = foundtranslations[0].replace(/[\(\)]/g, '');
            }
            else {
                translation = refContext.at(i - 1)?.translation || undefined;
                ref = ref.trim();
            }
            let stances = ref.split(':'), chapters, bookName;
            let chapterspreads = stances[0].match(/[0-9 -]+$/);
            if (chapterspreads && chapterspreads.length) {
                chapters = spreadNumbers(chapterspreads[0]);
                bookName = stances[0].replace(chapterspreads[0], '').trim();
            }
            else {
                chapters = [refContext.at(i - 1)?.chapter || 1];
                bookName = stances[0].trim();
            }
            ;
            if (bookName === '') {
                bookName = refContext.at(i - 1)?.bookName || '';
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
    async getExcerpts(refs) {
        return Promise.all(refs.map(async (ref) => {
            let book = await this.remote.getBook(ref.bookName, this.defaultTranslation);
            let translation = ref.translation || this.defaultTranslation;
            let bookNum = book.bookid;
            let chapter = ref.chapter;
            var versesData = await BollsBibleService.fetchChapter(translation, bookNum, chapter);
            if (ref.verses && ref.verses.length) {
                versesData = versesData.filter(verse => ref.verses.includes(verse.verse));
            }
            return {
                ...ref,
                translation,
                reference: ref.reference + (ref.translation ? '' : ` (${translation})`),
                bookNum,
                versesData,
                url: BollsBibleService.getChapterUrl(translation, bookNum, ref.chapter, ref.verses?.length ? ref.verses[0] : undefined)
            };
        }));
    }
    async getUrls(refs) {
        return Promise.all(refs.map(async (ref) => {
            let book = await this.remote.getBook(ref.bookName, this.defaultTranslation);
            return BollsBibleService.getChapterUrl(ref.translation || this.defaultTranslation, book.bookid, ref.chapter, ref.verses?.length ? ref.verses[0] : undefined);
        }));
    }
    get reference() { return this._reference; }
    ;
    set reference(ref) {
        this.getExcerpts(BibleController.parseReferenses(ref))
            .then(excerpts => this.excerpts = excerpts)
            .finally(() => { this.host.requestUpdate(); });
    }
    constructor(host, defaultTranslation, languages, translations) {
        this.remote = new BollsBibleService();
        this._reference = '';
        this.excerpts = [];
        this.host = host;
        if (languages && languages.length)
            this.remote.selectLanguages(languages);
        if (translations && translations.length)
            this.remote.selectTranslations(translations);
        this.defaultTranslation = defaultTranslation;
    }
    hostConnected() { }
    hostDisconnected() { }
    hostUpdate() { }
    hostUpdated() { }
}

var _a;
import { fetchBollsTranslations, fetchBollsEditionBooks, fetchBollsChapter, getBollsChapterUrl } from "../../utils/bolls.js";
import { spreadNumbers } from "../../utils/spreadNumbers.js";
const DEFAULT_TRANSLATION = 'UBIO';
export class BibleController {
    static bookSearch(query, editions) {
        //const MIN_MATCH_LENGTH = 1;
        let selectedBooks = editions.map(e => e.books.map(b => {
            return {
                ...b,
                edition: e.short_name,
                searchWeight: 0
            };
        })).flat();
        let subqueries = query.split(" ");
        return selectedBooks.reduce((matches, book) => {
            let matchWeight = 0;
            let match = subqueries.filter((subQ) => {
                if (/[0-9]/.test(subQ)) { // numbers matched completely as they come
                    if (RegExp(subQ.replace(/[^0-9]/g, "")).test(book.name)) {
                        matchWeight += 3;
                        return true;
                    }
                    else
                        return false;
                }
                else {
                    //if (subQ.length < MIN_MATCH_LENGTH) return true;
                    let matchLength = 0;
                    var len = 1; //Math.max(Math.floor(subQ.length*0.7), MIN_MATCH_LENGTH);
                    for (; len <= subQ.length; len++) {
                        let exp = new RegExp(`(?<=\\s|^)${subQ.slice(0, len).replace(/(і|й|и)/gi, "(і|и|й)")}${len == subQ.length ? '(?=\\s|$)' : ''}`, "ig");
                        if (exp.test(book.name)) {
                            matchLength = len;
                            if (len == subQ.length)
                                matchLength += 2;
                        }
                        else
                            break;
                    }
                    if (matchLength) {
                        matchWeight += matchLength;
                        return true;
                    }
                    else
                        return false;
                }
            });
            if (match.length && matchWeight) {
                let searchWeight = matchWeight * match.length + (book.name.split(" ").length == match.length ? 2 : -3);
                if (searchWeight > 3) {
                    book.searchWeight = searchWeight;
                    matches.push(book);
                }
            }
            return matches;
        }, [])
            .sort((b1, b2) => b2.searchWeight - b1.searchWeight);
    }
    static getBookNum(bookName, editions) {
        let searchInEdition = (this.bookSearch(bookName.toString(), editions))
            .filter(sr => sr.searchWeight >= bookName.length * 0.7);
        if (searchInEdition.length)
            return searchInEdition[0].bookid;
        else {
            let searchInAll = this.bookSearch(bookName.toString(), editions)
                .filter(sr => sr.searchWeight >= bookName.length * 0.7)
                .filter(book => book !== undefined)
                .sort((b1, b2) => b2.bookid - b1.bookid);
            let collapsed = [];
            while (searchInAll.length) {
                let bid = searchInAll[0].bookid;
                let count = searchInAll.findIndex(book => book.bookid !== bid);
                collapsed.push([searchInAll[0], count]);
                searchInAll.splice(0, count);
            }
            let top = collapsed.sort((b1, b2) => b1[1] - b2[1]).pop();
            return top ? top[0].bookid : undefined;
        }
    }
    static parseReferenses(refs, editions) {
        return refs.split(',')
            .reduce((result, ref, i, _originalRefs) => {
            let translation, foundtranslations = ref.trim().match(/\([A-Z0-9]+\)/);
            if (foundtranslations && foundtranslations.length) {
                ref = ref.replace(foundtranslations[0], '').trim();
                translation = foundtranslations[0].replace(/[\(\)]/g, '');
            }
            else {
                translation = i > 0 ? result[i - 1].edition : DEFAULT_TRANSLATION;
                ref = ref.trim();
            }
            let stances = ref.split(':'), chapters, bookNum = 0, bookName;
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
                bookNum = i > 0 ? result[i - 1].book : 0;
            }
            else {
                bookNum = this.getBookNum(bookName, editions) || 0;
            }
            if (bookName && bookNum)
                chapters.forEach((chapter, i) => {
                    let verses = [];
                    if (i === chapters.length - 1) {
                        if (stances.length == 2) {
                            verses = spreadNumbers(stances[1].trim());
                        }
                    }
                    let excerpt = {
                        edition: translation,
                        reference: `${bookName} ${chapter}${verses.length ? `:${stances[1]}` : ''} (${translation})`,
                        bookName,
                        book: bookNum,
                        chapter,
                        selectedVerses: verses
                    };
                    result.push(excerpt);
                });
            return result;
        }, []);
    }
    static getBibleEditions(bollsTranslations, bollsEditions) {
        return bollsTranslations.map(translation => translation.translations
            .map(edition => {
            return {
                ...edition,
                language: translation.language,
                books: bollsEditions[edition.short_name]
            };
        })).flat();
    }
    async selectLanguages(languages) {
        _a.editions
            .then(editions => {
            this.editions = editions.filter(edition => languages.some(lang => edition.language.includes(lang)));
        });
    }
    parseReferenses(refs, editions = this.editions) {
        return _a.parseReferenses(refs, editions);
    }
    static refAnchor(ref) {
        return `<a href="${getBollsChapterUrl(ref)}">${ref.reference}</a>`;
    }
    get languages() { return this._languages; }
    set languages(langs) {
        this.selectLanguages(this._languages = langs);
    }
    get reference() { return this._reference; }
    ;
    set reference(ref) { this.init(ref); }
    init(ref) {
        Promise.all(this.parseReferenses(this._reference = ref)
            .map(ex => fetchBollsChapter(ex)
            .then(verses => {
            return {
                ...ex,
                verses
            };
        })))
            .then(ex => {
            this.excerpts = ex;
        }).finally(() => { this.host.requestUpdate(); });
    }
    constructor(host) {
        this.translations = [];
        this.editions = [];
        this._languages = [];
        this._reference = '';
        this.excerpts = [];
        this.host = host;
        this.languages = ['Ukrainian', 'English'];
    }
    hostConnected() { }
    hostDisconnected() { }
    hostUpdate() { }
    hostUpdated() { }
}
_a = BibleController;
BibleController.editions = Promise.all([fetchBollsTranslations(), fetchBollsEditionBooks()]).then(([translations, editions]) => {
    return _a.getBibleEditions(translations, editions);
});

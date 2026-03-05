import { fetchBollsTranslations, fetchBollsEditionBooks, fetchBollsChapter, getBollsChapterUrl } from "../../utils/bolls.js";
import { spreadNumbers } from "../../utils/spreadNumbers.js";
const DEFAULT_TRANSLATION = 'UBIO';
export function isBibleExcerpt(reference) {
    return reference.book !== undefined &&
        typeof reference.book === "number" &&
        "verses" in reference &&
        reference.verses instanceof Array;
}
export class BibleController {
    static { this.editions = Promise.all([fetchBollsTranslations(), fetchBollsEditionBooks()]).then(([translations, editions]) => {
        return this.getBibleEditions(translations, editions);
    }); }
    static async bookSearch(query, editions = this.editions) {
        //const MIN_MATCH_LENGTH = 1;
        let selectedBooks = (await editions)
            .map(e => e.books.map(b => {
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
    static async getBookNum(bookName, editions = this.editions) {
        let searchInEdition = (await this.bookSearch(bookName.toString(), editions))
            .filter(sr => sr.searchWeight >= bookName.length * 0.7);
        if (searchInEdition.length)
            return searchInEdition[0].bookid;
    }
    static async parseReferenses(refs, editions = this.editions) {
        return Promise.all(refs.split(',')
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
                bookNum = i > 0 ? result[i - 1].book : undefined;
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
        }, []).map(async (br) => {
            let bn = await this.getBookNum(br.bookName, editions);
            br.book = bn;
            return br;
        }));
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
    async parseReferenses(refs) {
        return BibleController.parseReferenses(refs, this.editions);
    }
    static refAnchor(ref) {
        if (ref.book) {
            return `<a href="${getBollsChapterUrl({ edition: ref.edition, book: ref.book, chapter: ref.chapter, verse: ref.selectedVerses[0] })}">${ref.reference}</a>`;
        }
        else
            return ref.reference;
    }
    get editions() {
        return BibleController.editions
            .then(editions => editions.filter(edition => this.languages.some(lang => edition.language.includes(lang))));
    }
    get reference() { return this._reference; }
    ;
    set reference(ref) { this.init(ref); }
    init(ref) {
        this.parseReferenses(this._reference = ref)
            .then(exerpts => exerpts.map(excerpt => fetchBollsChapter(excerpt)
            .then(verses => {
            if (excerpt.book && verses.length) {
                return {
                    ...excerpt,
                    verses
                };
            }
            else {
                return excerpt;
            }
        })))
            .then(async (ex) => {
            this.excerpts = await Promise.all(ex);
        })
            .finally(() => { this.host.requestUpdate(); });
    }
    constructor(host) {
        this.languages = [];
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

export class BibleLibrary {
    get all() { return this._index; }
    get selectedLanguages() { return this._selectedLanguages; }
    get selectedTranslations() { return this._selectedTranslations; }
    constructor(editions) {
        this._index = [];
        this._selectedLanguages = [];
        this._selectedTranslations = [];
        this._index = editions;
        this._selectedLanguages = editions.map(edition => edition.language);
        this._selectedTranslations = editions.map(edition => edition.short_name);
    }
    getLanguages(languages) {
        return new BibleLibrary(this._index.filter(edition => languages.some(lang => edition.language.includes(lang))));
    }
    setLanguages(languages) {
        this._index = this._index.filter(edition => languages.some(lang => edition.language.includes(lang)));
        this._selectedLanguages = languages;
        return this;
    }
    getTranslations(translations) {
        return new BibleLibrary(this._index.filter(edition => translations.includes(edition.short_name)));
    }
    setTranslations(translations) {
        this._index = this._index.filter(edition => translations.includes(edition.short_name));
        this._selectedTranslations = translations;
        return this;
    }
    bookSearch(query) {
        const MAX_SKIPS = 1;
        const MIN_MATCHES = 3;
        let selectedBooks = this._index.map(e => e.books.map(b => {
            return {
                ...b,
                translation: e.short_name,
                searchWeight: 0
            };
        })).flat();
        let qwords = query.split(" ");
        return selectedBooks.reduce((matches, book) => {
            let name = book.name;
            let matchWeight = 0;
            let match = qwords.filter((qword) => {
                if (/[0-9]/.test(qword)) {
                    let numtest = qword.replace(/[^0-9]/g, "");
                    if (RegExp(numtest).test(name)) {
                        matchWeight += 2;
                        return true;
                    }
                    else
                        return false;
                }
                else {
                    let matchLength = 0;
                    var test = "";
                    var skipcount = 0;
                    var matchcount = 0;
                    var len = 0;
                    const compileExpr = (q) => new RegExp(`(\\s|^)${q.replace(/(?<=\s|^)(ів|йо|іо)/ig, "(ів|іо|йо)")}${len == qword.length - 1 ? '(\\s|$)' : ''}`, "igu");
                    var expr;
                    for (; len < qword.length; len++) {
                        test += qword[len];
                        expr = compileExpr(test);
                        if (!(expr.test(name))) {
                            if (skipcount < MAX_SKIPS && matchcount >= MIN_MATCHES) {
                                skipcount++;
                                if (skipcount == MAX_SKIPS)
                                    matchcount = 0;
                                test = test.slice(0, len) + ".";
                                expr = compileExpr(test);
                                if (!(expr.test(name))) {
                                    break;
                                }
                            }
                            else
                                break;
                        }
                        else {
                            skipcount = 0;
                            matchcount++;
                        }
                        matchLength = len + 1;
                        if (len == qword.length - 1)
                            matchLength += 1;
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
                let searchWeight = Math.round((matchWeight / name.length) * 100);
                if (searchWeight > 30) {
                    book.searchWeight = searchWeight;
                    matches.push(book);
                }
            }
            return matches;
        }, [])
            .sort((b1, b2) => b2.searchWeight - b1.searchWeight);
    }
}

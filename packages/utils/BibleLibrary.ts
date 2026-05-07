import { BibleEdition, BollsBible, BookSearchResult } from "./bolls";

export class BibleLibrary {
  private _index: BibleEdition[] = [];
  get all() { return this._index }
  private _selectedLanguages: string[] = [];
  get selectedLanguages() { return this._selectedLanguages; }
  private _selectedTranslations: string[] = [];
  get selectedTranslations() { return this._selectedTranslations; }


  constructor(editions: BibleEdition[]) {
    this._index = editions;
    this._selectedLanguages = editions.map(edition => edition.language);
    this._selectedTranslations = editions.map(edition => edition.short_name);
  }

  getLanguages(languages: string[]) {
    return new BibleLibrary(this._index.filter(edition => languages.some(lang => edition.language.includes(lang))))
  }

  setLanguages(languages: string[]) {
    this._index = this._index.filter(edition => languages.some(lang => edition.language.includes(lang)));
    this._selectedLanguages = languages;
    return this;
  }

  getTranslations(translations: BollsBible.Translation['short_name'][]) {
    return new BibleLibrary(this._index.filter(edition => translations.includes(edition.short_name)))
  }

  setTranslations(translations: BollsBible.Translation['short_name'][]) {
    this._index = this._index.filter(edition => translations.includes(edition.short_name));
    this._selectedTranslations = translations;
    return this;
  }

  bookSearch(query: string): BookSearchResult[] {
    //const MIN_MATCH_LENGTH = 1;
    const MAX_SKIPS = 1;
    const MIN_MATCHES = 3;
    let selectedBooks: BookSearchResult[] = this._index.map(e => e.books.map(b => {
      return {
        ...b,
        translation: e.short_name,
        searchWeight: 0
      } as BookSearchResult;
    })).flat();
    let qwords: string[] = query.split(" ");
    return selectedBooks.reduce<BookSearchResult[]>((matches: BookSearchResult[], book: BookSearchResult) => {
      let name = book.name; //.toWellFormed?.() || book.name;
      let matchWeight = 0;
      let match = qwords.filter((qword) => {
        if (/[0-9]/.test(qword)) { // numbers from qwords matched separately
          let numtest = qword.replace(/[^0-9]/g, "");
          if (RegExp(numtest).test(name)) {
            matchWeight += 2;
            return true;
          }
          else
            return false;
        } else {
          let matchLength = 0;
          var test = "";
          var skipcount = 0;
          var matchcount = 0;
          var len = 0;
          const compileExpr = (q: string) => new RegExp(`(\\s|^)${q.replace(/(?<=\s|^)(ів|йо|іо)/ig, "(ів|іо|йо)") // popular variations in ukrainian translations of John's book naming
            }${len == qword.length - 1 ? '(\\s|$)' : ''}`, "igu");
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
            } else {
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

export namespace BollsBible {

  export declare interface Verse {
    pk: number;
    chapter: number;
    verse: number;
    text: string;
  }

  export declare interface SingleVerse extends Verse {
    translation: string;
    book: number;
  }

  export declare interface ChapterVerse extends Verse {
    comment?: string;
  }

  export declare interface Translation {
    short_name: string;
    full_name: string;
    commentaries?: boolean;
    updated: number;
    info?: string;
    dir?: 'rtl' | 'ltr';
  }

  export declare interface L10n {
    language: string;
    translations: Translation[];
  }

  export declare interface Book {
    bookid: number;
    chronorder: number;
    name: string;
    chapter: number;
  }

  export declare type BooksIndex = {
    [edition in Translation["short_name"]]: Book[];
  };
}

export interface BookSearchResult extends BollsBible.Book {
  translation: BollsBible.Translation['short_name']
  searchWeight: number
}

export interface BibleEdition extends BollsBible.Translation {
  language: string;
  books: BollsBible.Book[]
}

export interface BibleReference {
  translation?: BollsBible.Translation["short_name"]
  reference: string
  bookName: string
  chapter: number
  verses?: number[]
}

export interface BibleExcerptData extends BibleReference {
  translation: BollsBible.Translation["short_name"]
  bookNum: number
  versesData: BollsBible.ChapterVerse[]
  url: string
}

export class BollsBibleService {
  static API_ROOT = 'https://bolls.life';
  static TRANSLATIONSINDEX_URL = this.API_ROOT + '/static/bolls/app/views/languages.json';
  static TRANSLATIONSBOOKS_URL = this.API_ROOT + '/static/bolls/app/views/translations_books.json';
  static allEditions: Promise<BibleEdition[]> = this.getLibrary();

  static getBollsHomepage(translation: BollsBible.Translation['short_name']): string {
    return `${this.API_ROOT}/${translation}/`
  }

  static async fetchTranslationsIndex(): Promise<BollsBible.L10n[]> {
    try {
      const resp = await fetch(this.TRANSLATIONSINDEX_URL);
      if (!resp.ok) {
        throw new Error(`Fetch failed with status: ${resp.status}`)
      }
      const result: BollsBible.L10n[] = await resp.json();
      return result;
    } catch (error) {
      console.error(error)
      return []
    }
  }

  static async fetchTranslationsBooks(): Promise<BollsBible.BooksIndex> {
    try {
      const resp = await fetch(this.TRANSLATIONSBOOKS_URL);
      if (!resp.ok) throw new Error(`Fetch failed with status: ${resp.status}`);
      const result: BollsBible.BooksIndex = await resp.json()
      return result;
    } catch (error) {
      console.error(error)
      return {}
    }
  }

  static async getLibrary(): Promise<BibleEdition[]> {
    const booksIndex: BollsBible.BooksIndex = await BollsBibleService.fetchTranslationsBooks();
    var translationsIndex = await BollsBibleService.fetchTranslationsIndex();

    return translationsIndex
      .map(ln => ln.translations.map(tr => {
        return {
          ...tr,
          language: ln.language,
          books: booksIndex[tr.short_name]
        }
      })).flat();
  }

  static async fetchTranslationBooks(translationShortName: string): Promise<BollsBible.Book[]> {
    try {
      const resp = await fetch(`${this.API_ROOT}/get-books/${translationShortName}/`);
      if (!resp.ok) {
        throw new Error(`Fetch failed with status: ${resp.status}`)
      }
      const result: BollsBible.Book[] = await resp.json();
      return result;
    } catch (error) {
      console.error(error)
      return []
    }
  }

  static async fetchChapter(translation: string, book: number, chapter: number) {
    try {
      const resp = await fetch(`${this.API_ROOT}/get-chapter/${translation}/${book}/${chapter}/`);
      if (!resp.ok) {
        throw new Error(`Fetch failed with status: ${resp.status}`)
      }
      const result: BollsBible.ChapterVerse[] = await resp.json();
      return result;
    } catch (error) {
      console.error(error)
      return []
    }
  }

  static getChapterUrl(translation: string, book: number, chapter: number, verse?: number): string {
    return `${this.API_ROOT}/${translation}/${book}/${chapter}/${verse ? verse + "/" : ""}`;
  }

  private _selectedLanguages: string[] = [];
  get selectedLanguages() { return this._selectedLanguages }
  private _selectedTranslations: string[] = [];
  get selectedTranslations() { return this._selectedTranslations }
  library: Promise<BibleEdition[]>;

  constructor() {
    this.library = BollsBibleService.allEditions.then(editions => {
      this._selectedLanguages = editions.map(edition => edition.language);
      this._selectedTranslations = editions.map(edition => edition.short_name);
      return editions
    })
  }

  selectLanguages(languages: string[]): Promise<BibleEdition[]> {
    return this.library = BollsBibleService.allEditions.then(editions => {
      this._selectedLanguages = languages;
      return editions.filter(ln => languages.some(lang => ln.language.includes(lang)))
    })
  }

  selectTranslations(translations: BollsBible.Translation['short_name'][]): Promise<BibleEdition[]> {
    return this.library = BollsBibleService.allEditions.then(editions => {
      this._selectedTranslations = translations;
      return editions
        .filter(edition => translations.includes(edition.short_name))
    })
  }

  async bookSearch(query: string): Promise<BookSearchResult[]> {
    //const MIN_MATCH_LENGTH = 1;
    const MAX_SKIPS = 1;
    const MIN_MATCHES = 3;
    let selectedBooks: BookSearchResult[] = (await this.library)
      .map(e => e.books.map(b => {
        return {
          ...b,
          translation: e.short_name,
          searchWeight: 0
        } as BookSearchResult
      })).flat();
    let qwords: string[] = query.split(" ");
    return selectedBooks.reduce<BookSearchResult[]>((matches: BookSearchResult[], book: BookSearchResult) => {
      let name = book.name.toWellFormed?.() || book.name;
      let matchWeight = 0;
      let match = qwords.filter((qword) => {
        if (/[0-9]/.test(qword)) {    // numbers from qwords matched separately
          let numtest = qword.replace(/[^0-9]/g, "");
          if (RegExp(numtest).test(name)) {
              matchWeight += 2;
              return true;
          } else
              return false;
        } else {
          let matchLength = 0;
          var test = "";
          var skipcount = 0;
          var matchcount = 0;
          var len = 0;
          const compileExpr = (q: string) => new RegExp(`(\\s|^)${
              q.replace(/(?<=\s|^)(ів|йо|іо)/ig, "(ів|іо|йо)") // popular variations in ukrainian translations of John's book naming
          }${len == qword.length - 1 ? '(\\s|$)' : ''}`,"igu");
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
                  } else
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
          } else
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
      return matches
    }, [])
      .sort((b1, b2) => b2.searchWeight - b1.searchWeight)
  }

  async getBook(bookName: string, translation?: BollsBible.Translation['short_name']): Promise<BollsBible.Book> {
    let searchInEdition = (await this.bookSearch(bookName.toString()))
      .filter(sr => sr.searchWeight >= 60), result: BollsBible.Book[] = searchInEdition;
    if (searchInEdition.length) {
      if (translation) {
        result = searchInEdition.filter(book => book.translation == translation);
        if (result.length) return searchInEdition[0];
        else {
          let bookid = searchInEdition[0].bookid;
          let books = (await BollsBibleService.allEditions).find(ed => ed.short_name === translation)?.books;
          if (books?.length) {
            result = books.filter(b => b.bookid == bookid);
            if (result.length) return result[0];
          }
        }
      }
    }
    throw new Error(`Cannot find the book. Check the book's name spelling if it exists in selected Bible's edition(s).`);
  }
}

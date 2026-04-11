import { spreadNumbers } from "./spreadNumbers";

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

  static parseReferenses(refs: string): BibleReference[] {
    return refs.split(',')
      .reduce((result: BibleReference[], ref, i, _originalRefs) => {
        let translation: string | undefined, foundtranslations: string[] | null = ref.trim().match(/\([A-Z0-9]+\)/);
        if (foundtranslations && foundtranslations.length) {
          ref = ref.replace(foundtranslations[0], '').trim();
          translation = foundtranslations[0].replace(/[\(\)]/g, '');
        } else {
          translation = i > 0 ? result[i - 1].translation : undefined;
          ref = ref.trim();
        }
        let stances: string[] = ref.split(':'),
          chapters: number[], bookName: string;
        let chapterspreads = stances[0].match(/[0-9 -]+$/);
        if (chapterspreads && chapterspreads.length) {
          chapters = spreadNumbers(chapterspreads[0]);
          bookName = stances[0].replace(chapterspreads[0], '').trim();
        }
        else {
          chapters = i > 0 ? [result[i - 1].chapter] : [1];
          bookName = stances[0].trim();
        };
        if (bookName === '') {
          bookName = i > 0 ? result[i - 1].bookName : '';
        }
        if (bookName)
          chapters.forEach((chapter, i) => {
            let verses: number[] = [];
            if (i === chapters.length - 1) {
              if (stances.length == 2) {
                verses = spreadNumbers(stances[1].trim());
              }
            }
            let excerpt: BibleReference = {
              translation: translation,
              reference: `${bookName} ${chapter}${verses.length ? `:${stances[1]}` : ''}${translation ? ` (${translation})` : ''}`,
              bookName,
              chapter,
              verses
            };
            result.push(excerpt)
          })
        return result
      }, [])
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

  // async fetchChapter(ref: BibleReference): Promise<BollsBible.ChapterVerse[]> {
  //   let bookNum = (await this.getBook(ref.bookName)).bookid;
  //   return BollsBibleService.fetchChapter(ref.translation || this.defaultTranslation, bookNum, ref.chapter);
  // }

  // async getChapterUrl(ref: BibleReference): Promise<string> {
  //   let bookNum = (await this.getBook(ref.bookName)).bookid;
  //   return BollsBibleService.getChapterUrl(ref.translation || this.defaultTranslation, bookNum, ref.chapter, ref.verses?.length ? ref.verses[0] : undefined);
  // }

  async bookSearch(query: string): Promise<BookSearchResult[]> {
    //const MIN_MATCH_LENGTH = 1;
    let selectedBooks: BookSearchResult[] = (await this.library)
      .map(e => e.books.map(b => {
        return {
          ...b,
          translation: e.short_name,
          searchWeight: 0
        } as BookSearchResult
      })).flat();
    let subqueries: string[] = query.split(" ");
    return selectedBooks.reduce<BookSearchResult[]>((matches: BookSearchResult[], book: BookSearchResult) => {
      let matchWeight = 0;
      let match = subqueries.filter((subQ) => {
        if (/[0-9]/.test(subQ)) {    // numbers matched completely as they come
          if (RegExp(subQ.replace(/[^0-9]/g, "")).test(book.name)) {
            matchWeight += 3;
            return true;
          } else return false
        } else {
          //if (subQ.length < MIN_MATCH_LENGTH) return true;
          let matchLength = 0;
          var len = 1;//Math.max(Math.floor(subQ.length*0.7), MIN_MATCH_LENGTH);
          for (; len <= subQ.length; len++) {
            let exp = new RegExp(`(?<=\\s|^)${subQ.slice(0, len).replace(/(і|й|и)/gi, "(і|и|й)")}${len == subQ.length ? '(?=\\s|$)' : ''}`, "ig");
            if (exp.test(book.name)) {
              matchLength = len;
              if (len == subQ.length) matchLength += 2;
            } else break;
          }
          if (matchLength) {
            matchWeight += matchLength;
            return true;
          } else return false
        }
      });
      if (match.length && matchWeight) {
        let searchWeight = matchWeight * match.length + (book.name.split(" ").length == match.length ? 2 : -3);
        if (searchWeight > 3) {
          book.searchWeight = searchWeight;
          matches.push(book);
        }
      }
      return matches
    }, [])
      .sort((b1, b2) => b2.searchWeight - b1.searchWeight)
  }

  async getBook(bookName: string, translation?: BollsBible.Translation['short_name']): Promise<BookSearchResult> {
    let searchInEdition = (await this.bookSearch(bookName.toString()))
      .filter(sr => sr.searchWeight >= bookName.length * 0.7);
    if (translation) {
      searchInEdition = searchInEdition.filter(book => book.translation == translation);
    }
    if (searchInEdition.length) return searchInEdition[0];
    else throw new Error(`Cannot find the book. Check the book's name spelling if it exists in selected Bible's edition(s).`);
  }
}

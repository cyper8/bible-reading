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

export class BollsController {
  static API_ROOT = 'https://bolls.life';
  static TRANSLATIONSINDEX_URL = this.API_ROOT + '/static/bolls/app/views/languages.json';
  static TRANSLATIONSBOOKS_URL = this.API_ROOT + '/static/bolls/app/views/translations_books.json';
  static DEFAULT_TRANSLATION = 'UBIO';

  selectedLanguages: string[];
  selectedTranslations: string[];
  defaultTranslation: string;
  library: Promise<BibleEdition[]>;

  constructor(defaultTranslation: string, languages: string[] = [], translations: string[] = []) {
    this.defaultTranslation = defaultTranslation;
    this.selectedLanguages = languages;
    this.selectedTranslations = translations;
    this.library = this.getBibleEditions({ languages, translations })
  }

  static getBollsHomepage(translation = this.DEFAULT_TRANSLATION) {
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

  async getBibleEditions({ languages = [], translations = [] }: { languages: string[], translations: BollsBible.Translation['short_name'][] }): Promise<BibleEdition[]> {
    try {
      const booksIndex: BollsBible.BooksIndex = await BollsController.fetchTranslationsBooks();

      var translationsIndex = await BollsController.fetchTranslationsIndex();

      if (languages.length) {
        translationsIndex = translationsIndex
          .filter(ln => languages.some(lang => ln.language.includes(lang)))
      } else this.selectedLanguages = languages = translationsIndex.map(ln => ln.language);

      if (translations.length) {
        translationsIndex = translationsIndex
          .filter(ln => {
            ln.translations = ln.translations.filter(tr => translations.includes(tr.short_name))
            return ln.translations.length > 0
          })
      } else this.selectedTranslations = translations = Object.keys(booksIndex);

      return translationsIndex
        .map(ln => ln.translations.map(tr => {
          return {
            ...tr,
            language: ln.language,
            books: booksIndex[tr.short_name]
          }
        })).flat();

    } catch (error) {
      console.error(error)
      return []
    }
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

  async fetchChapter(ref: BibleReference): Promise<BollsBible.ChapterVerse[]> {
    let bookNum = (await this.getBook(ref.bookName)).bookid;
    return BollsController.fetchChapter(ref.translation || this.defaultTranslation || BollsController.DEFAULT_TRANSLATION, bookNum, ref.chapter);
  }

  static getChapterUrl(translation: string, book: number, chapter: number, verse?: number): string {
    return `${this.API_ROOT}/${translation}/${book}/${chapter}/${verse ? verse + "/" : ""}`;
  }

  async getChapterUrl(ref: BibleReference): Promise<string> {
    let bookNum = (await this.getBook(ref.bookName)).bookid;
    return BollsController.getChapterUrl(ref.translation || this.defaultTranslation || BollsController.DEFAULT_TRANSLATION, bookNum, ref.chapter, ref.verses?.length ? ref.verses[0] : undefined);
  }

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

  async getBook(bookName: string): Promise<BookSearchResult> {
    let searchInEdition = (await this.bookSearch(bookName.toString()))
      .filter(sr => sr.searchWeight >= bookName.length * 0.7);
    if (searchInEdition.length) return searchInEdition[0];
    else throw new Error(`Cannot find the book's number. Check the book's name spelling if it exists in selected Bible's edition(s).`);
  }

  async getExcerpt(ref: BibleReference): Promise<BibleExcerptData> {
    let book = await this.getBook(ref.bookName);
    let translation = ref.translation || book.translation;
    let bookNum = book.bookid;
    let chapter = ref.chapter;
    var versesData = await BollsController.fetchChapter(translation, bookNum, chapter);
    if (ref.verses && ref.verses.length) {
      versesData = versesData.filter(verse => ref.verses!.includes(verse.verse));
    }
    return {
      ...ref,
      translation,
      reference: ref.reference + (ref.translation ? '' : ` (${translation})`),
      bookNum,
      versesData,
      url: BollsController.getChapterUrl(translation, bookNum, ref.chapter, ref.verses?.length ? ref.verses[0] : undefined)
    }
  }
}

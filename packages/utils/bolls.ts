import { BibleLibrary } from "./BibleLibrary.js";

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
  static allEditions: Promise<BibleEdition[]> = this.getEditions();

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

  static async getEditions(): Promise<BibleEdition[]> {
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
  library: Promise<BibleLibrary>;

  constructor() {
    this.library = BollsBibleService.allEditions.then(editions => new BibleLibrary(editions))
  }

  selectLanguages(languages: string[]): Promise<BibleLibrary> {
    return this.library.then(library => {
      let lib = library.setLanguages(languages);
      this._selectedLanguages = lib.selectedLanguages;
      return lib
    })
  }

  selectTranslations(translations: BollsBible.Translation['short_name'][]): Promise<BibleLibrary> {
    return this.library.then(editions => {
      let lib = editions.setTranslations(translations);
      this._selectedTranslations = lib.selectedTranslations;
      return lib
    })
  }

  async bookSearch(query: string): Promise<BookSearchResult[]> {
    return (await this.library).bookSearch(query)
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



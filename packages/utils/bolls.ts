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
  translation: string
  bookNum: number
  versesData: BollsBible.ChapterVerse[]
}

export class BollsController {
  static BOLLS_HOSTNAME = 'https://bolls.life';
  static BOLLS_TRANSLATIONSINDEX = this.BOLLS_HOSTNAME+'/static/bolls/app/views/languages.json';
  static BOLLS_TRANSLATIONSBOOKS = this.BOLLS_HOSTNAME+'/static/bolls/app/views/translations_books.json';
  static DEFAULT_TRANSLATION = 'UBIO';

  readonly selectedLanguages?: string[];
  readonly selectedTranslations?: string[];
  library: Promise<BibleEdition[]>;
  
  constructor({languages = [], translations = []}: {languages?: string[], translations?: string[]}) {
    if (languages.length) this.selectedLanguages = languages;
    if (translations.length) this.selectedTranslations = translations;
    this.library = BollsController.fetchBollsTranslationsBooks({languages, translations})
  }

  static getBollsHomepage(translation = this.DEFAULT_TRANSLATION) {
    return `${this.BOLLS_HOSTNAME}/${translation}/`
  }

  static async fetchBollsTranslationsIndex(): Promise<BollsBible.L10n[]> {
    try {
      const resp = await fetch(this.BOLLS_TRANSLATIONSINDEX);
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
  
  static async fetchBollsTranslationsBooks({languages = [], translations = []} : {languages: string[], translations: BollsBible.Translation['short_name'][]}): Promise<BibleEdition[]> {
    try {
      let translationsIndex = await this.fetchBollsTranslationsIndex(),
      selectedTranslations: BollsBible.L10n[] = translationsIndex;
      if (!(languages.length && translations.length) ) {
        return await fetch(this.BOLLS_TRANSLATIONSBOOKS)
        .then(res => {
          if (!res.ok) throw new Error(`Fetch failed with status: ${res.status}`);
          return res.json()
        }).then((booksIndex: BollsBible.BooksIndex) => selectedTranslations.map(ln => {
          return ln.translations.map(tr => {
            return {
              ...tr,
              language: ln.language,
              books: booksIndex[tr.short_name]
            }
          })
        }).flat())
      } else {
        if (languages.length) {
          selectedTranslations = selectedTranslations
            .filter(ln => languages.some(lang => ln.language.includes(lang)))
        }
        if (translations.length) {
          selectedTranslations = selectedTranslations
          .filter(ln => {
            ln.translations = ln.translations.filter(tr => translations.includes(tr.short_name))
            return ln.translations.length > 0
          })
        }
        return Promise.all(
          selectedTranslations
          .map(ln => ln.translations.map(async tr => {
            return {
              ...tr,
              language: ln.language,
              books: await this.fetchBollsTranslationBooks(tr.short_name)
            }
          })).flat()
        )
      }
    } catch (error) {
      console.error(error)
      return []
    }
  }
  
  static async fetchBollsTranslationBooks(translationShortName: string): Promise<BollsBible.Book[]> {
    try {
      const resp = await fetch(`https://bolls.life/get-books/${translationShortName}/`);
      if (!resp.ok) {
        throw new Error(`Fetch failed with status: ${resp.status}`)
      }
      const result: BollsBible.Book[] = await resp.json();
      return result;
    } catch(error) {
      console.error(error)
      return []
    }
  }

  static async fetchBollsChapter({ translation, bookNum, chapter }: { translation: BollsBible.Translation['short_name']; bookNum: number; chapter: number; }): Promise<BollsBible.ChapterVerse[]> {
    try {
      const resp = await fetch(`https://bolls.life/get-chapter/${translation}/${bookNum}/${chapter}/`);
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

  static getBollsChapterUrl({ translation, bookNum, chapter, verse }: { translation: BollsBible.Translation['short_name']; bookNum: number; chapter: number; verse?: number }): string {
    return `https://bolls.life/${translation}/${bookNum}/${chapter}/${verse ? verse + "/" : ""}`;
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
    var versesData = await BollsController.fetchBollsChapter({
      translation: ref.translation || book.translation,
      bookNum: book.bookid,
      chapter: ref.chapter
    });
    if (ref.verses && ref.verses.length) {
      versesData = versesData.filter(verse => ref.verses!.includes(verse.verse));
    }
    return {
      ...ref,
      translation: ref.translation || book.translation,
      bookNum: book.bookid,
      versesData
    }
  }
}

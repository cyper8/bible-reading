import { ReactiveController, ReactiveControllerHost } from "lit";
import { BollsBible, fetchBollsTranslations, fetchBollsEditionBooks, fetchBollsChapter, getBollsChapterUrl } from "../../utils/bolls.js";
import { spreadNumbers } from "../../utils/spreadNumbers.js";

const DEFAULT_TRANSLATION = 'UBIO';

export interface BibleReference {
  edition: BollsBible.Edition["short_name"]
  reference: string
  bookName: string
  book: number
  chapter: number
  selectedVerses: number[]
}

export interface BibleExcerptData extends BibleReference {
  verses: BollsBible.ChapterVerses
}

export interface BookSearchResult extends BollsBible.Book {
  edition: BollsBible.Edition['short_name']
  searchWeight: number
}

export interface BibleEdition extends BollsBible.Edition {
  language: string;
  books: BollsBible.Book[]
}

export class BibleController implements ReactiveController {

  static editions: Promise<BibleEdition[]> = Promise.all([fetchBollsTranslations(), fetchBollsEditionBooks()]).then(([translations, editions]) => {
    return this.getBibleEditions(translations, editions)
  });

  static bookSearch(query: string, editions: BibleEdition[]): BookSearchResult[] {
    //const MIN_MATCH_LENGTH = 1;
    let selectedBooks: BookSearchResult[] = editions.map(e => e.books.map(b => {
      return {
        ...b,
        edition: e.short_name,
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

  static getBookNum(bookName: string, editions: BibleEdition[]): number | undefined {
    let searchInEdition = (this.bookSearch(bookName.toString(), editions))
      .filter(sr => sr.searchWeight >= bookName.length * 0.7);
    if (searchInEdition.length) return searchInEdition[0].bookid
    else {
      let searchInAll = this.bookSearch(bookName.toString(), editions)
        .filter(sr => sr.searchWeight >= bookName.length * 0.7)
        .filter(book => book !== undefined)
        .sort((b1, b2) => b2.bookid - b1.bookid);
      let collapsed: [BollsBible.Book, number][] = [];
      while (searchInAll.length) {
        let bid = searchInAll[0].bookid;
        let count = searchInAll.findIndex(book => book.bookid !== bid);
        collapsed.push([searchInAll[0], count]);
        searchInAll.splice(0, count);
      }
      let top = collapsed.sort((b1, b2) => b1[1] - b2[1]).pop();
      return top ? top[0].bookid : undefined
    }
  }

  static parseReferenses(refs: string, editions: BibleEdition[]): BibleReference[] {
    return refs.split(',')
      .reduce((result: BibleReference[], ref, i, _originalRefs) => {
        let translation: string, foundtranslations: string[] | null = ref.trim().match(/\([A-Z0-9]+\)/);
        if (foundtranslations && foundtranslations.length) {
          ref = ref.replace(foundtranslations[0], '').trim();
          translation = foundtranslations[0].replace(/[\(\)]/g, '');
        } else {
          translation = i > 0 ? result[i - 1].edition : DEFAULT_TRANSLATION;
          ref = ref.trim();
        }
        let stances: string[] = ref.split(':'),
          chapters: number[], bookNum: number = 0, bookName: string;
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
          bookNum = i > 0 ? result[i - 1].book : 0;
        } else {
          bookNum = this.getBookNum(bookName, editions) || 0;
        }
        if (bookName && bookNum)
          chapters.forEach((chapter, i) => {
            let verses: number[] = [];
            if (i === chapters.length - 1) {
              if (stances.length == 2) {
                verses = spreadNumbers(stances[1].trim());
              }
            }
            let excerpt: BibleReference = {
              edition: translation,
              reference: `${bookName} ${chapter}${verses.length ? `:${stances[1]}` : ''} (${translation})`,
              bookName,
              book: bookNum,
              chapter,
              selectedVerses: verses
            };
            result.push(excerpt)
          })
        return result
      }, [])
  }

  static getBibleEditions(bollsTranslations: BollsBible.Translations, bollsEditions: BollsBible.EditionBooks): BibleEdition[] {
    return bollsTranslations.map(translation =>
      translation.editions
        .map(edition => {
          return {
            ...edition,
            language: translation.language,
            books: bollsEditions[edition.short_name]
          } as BibleEdition
        })).flat();
  }

  async selectLanguages(languages: string[]) {
    BibleController.editions
      .then(editions => {
        this.editions = editions.filter(edition => languages.some(lang => edition.language.includes(lang)));
      });
  }

  parseReferenses(refs: string, editions = this.editions): BibleReference[] {
    return BibleController.parseReferenses(refs, editions);
  }

  static refAnchor(ref: { edition: BollsBible.Edition['short_name'], book: number, chapter: number, selectedVerses: number[], reference: string }): string {
    return `<a href="${getBollsChapterUrl(ref)}">${ref.reference}</a>`
  }

  host: ReactiveControllerHost;

  translations: BollsBible.Translations = [];
  editions: BibleEdition[] = [];

  private _languages: string[] = [];
  get languages() { return this._languages }
  set languages(langs: string[]) {
    this.selectLanguages(this._languages = langs);
  }

  private _reference: string = '';
  get reference() { return this._reference };
  set reference(ref: string) { this.init(ref) }

  excerpts: BibleExcerptData[] = [];

  init(ref: string) {
    Promise.all(
      this.parseReferenses(this._reference = ref)
        .map(ex => fetchBollsChapter(ex)
          .then(verses => {
            return {
              ...ex,
              verses
            }
          })
        )
    )
      .then(ex => {
        this.excerpts = ex;
      }).finally(this.host.requestUpdate)
  }

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.languages = ['Ukrainian', 'English'];
  }

  hostConnected(): void { }

  hostDisconnected(): void { }

  hostUpdate(): void { }

  hostUpdated(): void { }

}

import { ReactiveController, ReactiveControllerHost } from "lit";
import { BollsBible, fetchBollsTranslations, fetchBollsEditionBooks, fetchBollsChapter, getBollsChapterUrl } from "../../utils/bolls.js";
import { spreadNumbers } from "../../utils/spreadNumbers.js";

const DEFAULT_TRANSLATION = 'UBIO';

export interface BibleReference {
  edition: BollsBible.Edition["short_name"]
  reference: string
  bookName: string
  book: number | undefined
  chapter: number
  selectedVerses: number[]
}
export interface BibleExcerptData extends BibleReference {
  book: number
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

export function isBibleExcerpt(reference: BibleReference | BibleExcerptData): reference is BibleExcerptData {
  return reference.book !== undefined &&
    typeof reference.book === "number" &&
    "verses" in reference &&
    reference.verses instanceof Array
}

export class BibleController implements ReactiveController {
  static editions: Promise<BibleEdition[]> = Promise.all([fetchBollsTranslations(), fetchBollsEditionBooks()]).then(([translations, editions]) => {
    return this.getBibleEditions(translations, editions)
  });

  static async bookSearch(query: string, editions = this.editions): Promise<BookSearchResult[]> {
    //const MIN_MATCH_LENGTH = 1;
    let selectedBooks: BookSearchResult[] = (await editions)
      .map(e => e.books.map(b => {
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

  static async getBookNum(bookName: string, editions = this.editions): Promise<number | undefined> {
    let searchInEdition = (await this.bookSearch(bookName.toString(), editions))
      .filter(sr => sr.searchWeight >= bookName.length * 0.7);
    if (searchInEdition.length) return searchInEdition[0].bookid
  }

  static async parseReferenses(refs: string, editions = this.editions): Promise<BibleReference[]> {
    return Promise.all(
      refs.split(',')
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
            chapters: number[], bookNum: number | undefined = 0, bookName: string;
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
            bookNum = i > 0 ? result[i - 1].book : undefined;
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
        }, []).map(async br => {
          let bn = await this.getBookNum(br.bookName, editions);
          br.book = bn;
          return br
        }))
  }

  private static getBibleEditions(bollsTranslations: BollsBible.Translations, bollsEditions: BollsBible.EditionBooks): BibleEdition[] {
    return bollsTranslations.map(translation =>
      translation.translations
        .map(edition => {
          return {
            ...edition,
            language: translation.language,
            books: bollsEditions[edition.short_name]
          } as BibleEdition
        })).flat();
  }

  async parseReferenses(refs: string): Promise<BibleReference[]> {
    return BibleController.parseReferenses(refs, this.editions);
  }

  static refAnchor(ref: { edition: BollsBible.Edition['short_name'], book: number | undefined, chapter: number, selectedVerses: number[], reference: string }): string {
    if (ref.book) {
      return `<a href="${getBollsChapterUrl({ edition: ref.edition, book: ref.book, chapter: ref.chapter, verse: ref.selectedVerses[0] })}">${ref.reference}</a>`
    } else return ref.reference;
  }

  host: ReactiveControllerHost;

  get editions(): Promise<BibleEdition[]> {
    return BibleController.editions
      .then(editions =>
        editions.filter(edition =>
          this.languages.some(lang => edition.language.includes(lang))
        )
      )
  }

  private languages: string[] = [];

  private _reference: string = '';
  get reference() { return this._reference };
  set reference(ref: string) { this.init(ref) }

  excerpts: (BibleReference | BibleExcerptData)[] = [];

  init(ref: string) {
    this.parseReferenses(this._reference = ref)
      .then(exerpts =>
        exerpts.map(excerpt =>
          fetchBollsChapter(excerpt)
            .then(verses => {
              if (excerpt.book && verses.length) {
                return {
                  ...excerpt,
                  verses
                } as BibleExcerptData
              } else {
                return excerpt as BibleReference
              }
            })
        ))
      .then(async ex => {
        this.excerpts = await Promise.all(ex);
      })
      .finally(() => { this.host.requestUpdate() })
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

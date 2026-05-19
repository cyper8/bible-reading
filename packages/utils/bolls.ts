import { spreadNumbers } from "./spreadNumbers.js";

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
    chapters: number;
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

export interface BibleEditionsFilterOptions {
  languages?: string[];
  translations?: BollsBible.Translation['short_name'][]
}

export interface BibleReference {
  translation?: BollsBible.Translation["short_name"]
  reference: string
  bookName: string
  chapter: number
  verses?: number[]
}

export type BibleReferenceContext = Partial<BibleReference>

export interface BibleExcerptData extends BibleReference {
  translation: BollsBible.Translation["short_name"]
  bookNum: number
  versesData: BollsBible.ChapterVerse[]
  url: string
}
export const BOLLS_HOSTNAME = 'https://bolls.life';
export const API_ROOT = BOLLS_HOSTNAME;
export const TRANSLATIONSINDEX_URL = API_ROOT + '/static/bolls/app/views/languages.json';
export const TRANSLATIONSBOOKS_URL = API_ROOT + '/static/bolls/app/views/translations_books.json';
export const allEditions: Promise<BibleEdition[]> = fetchTranslationsBooks()
  .then(books => fetchTranslationsIndex().then(translations => compileEditions(books, translations)));

export function getBollsHomepage(translation: BollsBible.Translation['short_name']): string {
  return `${API_ROOT}/${translation}/`
}

export async function fetchTranslationsIndex(): Promise<BollsBible.L10n[]> {
  try {
    const resp = await fetch(TRANSLATIONSINDEX_URL);
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

export async function fetchTranslationsBooks(): Promise<BollsBible.BooksIndex> {
  try {
    const resp = await fetch(TRANSLATIONSBOOKS_URL);
    if (!resp.ok) throw new Error(`Fetch failed with status: ${resp.status}`);
    const result: BollsBible.BooksIndex = await resp.json()
    return result;
  } catch (error) {
    console.error(error)
    return {}
  }
}

export function compileEditions(booksIndex: BollsBible.BooksIndex, translationsIndex: BollsBible.L10n[]): BibleEdition[] {
  return translationsIndex
    .map(ln => ln.translations.map(tr => {
      return {
        ...tr,
        language: ln.language,
        books: booksIndex[tr.short_name]
      }
    })).flat();
}

export async function getEditions(filterOptions?: BibleEditionsFilterOptions): Promise<BibleEdition[]> {
  return (await allEditions)
    .filter(edition => (
      (filterOptions?.languages ? filterOptions.languages.some(sellang => edition.language.includes(sellang)) : true)
      && (filterOptions?.translations ? filterOptions.translations.includes(edition.short_name) : true)
    ));
}

export async function fetchTranslationBooks(translationShortName: string): Promise<BollsBible.Book[]> {
  try {
    const resp = await fetch(`${API_ROOT}/get-books/${translationShortName}/`);
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

export async function fetchChapter(translation: string, book: number, chapter: number): Promise<BollsBible.ChapterVerse[]> {
  try {
    const resp = await fetch(`${API_ROOT}/get-chapter/${translation}/${book}/${chapter}/`);
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

export function getChapterUrl(translation: string, book: number, chapter: number, verse?: number): string {
  return `${API_ROOT}/${translation}/${book}/${chapter}/${verse ? verse + "/" : ""}`;
}

export function parseReferenses(refs: string, context?: BibleReferenceContext): BibleReference[] {
  return refs.split(',')
    .reduce((result: BibleReference[], ref, i, _originalRefs) => {
      let translation: string | undefined, foundtranslations: string[] | null = ref.trim().match(/\([A-Z0-9]+\)/);
      if (foundtranslations && foundtranslations.length) {
        ref = ref.replace(foundtranslations[0], '').trim();
        translation = foundtranslations[0].replace(/[\(\)]/g, '');
      } else {
        translation = i == 0 ? context?.translation : result[i - 1].translation;
        ref = ref.trim();
      }
      let stances: string[] = ref.split(':'), chapters: number[], bookName: string;
      let chapterspreads = stances[0].match(/[0-9 -]+$/);
      if (chapterspreads && chapterspreads.length) {
        chapters = spreadNumbers(chapterspreads[0]);
        bookName = stances[0].replace(chapterspreads[0], '').trim();
      }
      else {
        chapters = [i == 0 ? context?.chapter || 1 : result[i - 1].chapter];
        bookName = stances[0].trim();
      };
      if (bookName === '') {
        bookName = i == 0 ? context?.bookName || '' : result[i - 1].bookName;
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
          result.push(excerpt);
        });
      return result;
    }, []);
}



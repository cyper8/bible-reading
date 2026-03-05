/** /bolls/ => https://bolls.life/ */

export const BOLLS_TRANSLATIONS = 'https://bolls.life/static/bolls/app/views/languages.json';
export const BOLLS_EDITIONSBOOKS = 'https://bolls.life/static/bolls/app/views/translations_books.json';

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

  export declare interface Edition {
    short_name: string;
    full_name: string;
    commentaries?: boolean;
    updated: number;
    info?: string;
    dir?: 'rtl' | 'ltr';
  }

  export declare interface Translation {
    language: string;
    translations: Edition[];
  }

  export declare interface Book {
    bookid: number;
    chronorder: number;
    name: string;
    chapter: number;
  }

  export declare type Translations = Translation[];

  export declare type EditionBooks = {
    [edition in Edition["short_name"]]: Book[];
  };

  export declare type ChapterVerses = ChapterVerse[];
}

export async function fetchBollsTranslations(): Promise<BollsBible.Translations> {
  try {
    const resp = await fetch(BOLLS_TRANSLATIONS);
    if (!resp.ok) {
      throw new Error(`Fetch failed with status: ${resp.status}`)
    }
    const result: BollsBible.Translations = await resp.json();
    return result;
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function fetchBollsEditionBooks(): Promise<BollsBible.EditionBooks> {
  try {
    const resp = await fetch(BOLLS_EDITIONSBOOKS);
    if (!resp.ok) {
      throw new Error(`Fetch failed with status: ${resp.status}`)
    }
    const result: BollsBible.EditionBooks = await resp.json();
    return result;
  } catch (error) {
    console.error(error)
    return {}
  }
}

export async function fetchBollsChapter({ edition, book, chapter }: { edition: BollsBible.Edition['short_name']; book: number | undefined; chapter: number; }): Promise<BollsBible.ChapterVerses> {
  try {
    if (book) {
      const resp = await fetch(`https://bolls.life/get-chapter/${edition}/${book}/${chapter}/`);
      if (!resp.ok) {
        throw new Error(`Fetch failed with status: ${resp.status}`)
      }
      const result: BollsBible.ChapterVerses = await resp.json();
      return result;
    } else throw Error(`Cannot fetch chapter of unknown book.`)
  } catch (error) {
    console.error(error)
    return []
  }
}

export function getBollsChapterUrl({ edition, book, chapter, verse }: { edition: BollsBible.Edition['short_name']; book: number; chapter: number; verse?: number }) {
  return `https://bolls.life/${edition}/${book ? book : 1}/${book ? chapter : 1}/${(book && verse) ? verse + "/" : ""}`;
}
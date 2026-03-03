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
  const resp = await fetch(BOLLS_TRANSLATIONS);
  const result: BollsBible.Translations = await resp.json();
  return result;
}

export async function fetchBollsEditionBooks(): Promise<BollsBible.EditionBooks> {
  const resp = await fetch(BOLLS_EDITIONSBOOKS);
  const result: BollsBible.EditionBooks = await resp.json();
  return result;
}

export async function fetchBollsChapter({ edition, book, chapter }: { edition: BollsBible.Edition['short_name']; book: number; chapter: number; }): Promise<BollsBible.ChapterVerses> {
  const resp = await fetch(`https://bolls.life/get-chapter/${edition}/${book}/${chapter}/`);
  const result: BollsBible.ChapterVerses = await resp.json();
  return result;
}

export function getBollsChapterUrl({ edition, book, chapter, verse }: { edition: BollsBible.Edition['short_name']; book: number; chapter: number; verse?: number }) {
  return `https://bolls.life/${edition}/${book}/${chapter}/${verse ? verse + "/" : ""}`;
}
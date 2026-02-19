import { ReactiveController, ReactiveControllerHost } from "lit";
const TRANSLATIONS_ENDPOINT = '/bolls/static/bolls/app/views/languages.json';
const BOOKS_ENDPOINT = '/bolls/static/bolls/app/views/translations_books.json';

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
    editions: Edition[];
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

export class BollsBibleController implements ReactiveController {
  private static fetchBolls(endpoint: string, init?: RequestInit) {
    return fetch(endpoint, {
      method: 'GET',
      ...init,
      headers: { 'Content-Type': 'application/json', }
    })
  }

  static translations: Promise<BollsBible.Translations> = this.fetchBolls(TRANSLATIONS_ENDPOINT).then<BollsBible.Translations>(resp => resp.json());
  static editions: Promise<BollsBible.EditionBooks> = this.fetchBolls(BOOKS_ENDPOINT).then<BollsBible.EditionBooks>(resp => resp.json());

  async getChapter(editionName: string, bookNum: number, chapter: number): Promise<BollsBible.ChapterVerses> {
    return BollsBibleController.fetchBolls(
      `/bolls/get-chapter/${editionName}/${bookNum}/${chapter}/`, { mode: 'cors' }
    ).then<BollsBible.ChapterVerses>(response => response.json())
  }

  host: ReactiveControllerHost;
  translations: BollsBible.Translations = [];
  editions: BollsBible.EditionBooks = {};

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    BollsBibleController.translations.then(translations => { this.translations = translations; this.host.requestUpdate() });
    BollsBibleController.editions.then(editions => { this.editions = editions; this.host.requestUpdate() });
  }

  hostConnected(): void {

  }

  hostDisconnected(): void {

  }

  hostUpdate(): void {

  }

  hostUpdated(): void {

  }

}

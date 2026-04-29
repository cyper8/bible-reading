import { ReactiveController, ReactiveControllerHost } from "lit";
import { BibleExcerptData, BibleReference, BollsBible, BollsBibleService } from "../../utils/bolls.js";
import { spreadNumbers } from "../../utils/spreadNumbers.js";

type BibleReferenceContext = Partial<BibleReference>

export class BibleController implements ReactiveController {

  static parseReferenses(refs: string, context?: BibleReferenceContext): BibleReference[] {
    return refs.split(',')
      .reduce((result: BibleReference[], ref, i, _originalRefs) => {
        let translation: string | undefined,
          foundtranslations: string[] | null = ref.trim().match(/\([A-Z0-9]+\)/);
        if (foundtranslations && foundtranslations.length) {
          ref = ref.replace(foundtranslations[0], '').trim();
          translation = foundtranslations[0].replace(/[\(\)]/g, '');
        } else {
          translation = i == 0 ? context?.translation : result[i - 1].translation;
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
            result.push(excerpt)
          })
        return result
      }, [])
  }

  async getExcerpts(refs: string): Promise<BibleExcerptData[]>
  async getExcerpts(refs: BibleReference[]): Promise<BibleExcerptData[]>
  async getExcerpts(refs: string | BibleReference[]): Promise<BibleExcerptData[]> {
    let references: BibleReference[];
    if (typeof refs == "string") {
      references = BibleController.parseReferenses(refs, { translation: this.defaultTranslation });
    } else {
      references = refs
    }
    return Promise.all(references.map(async ref => {
      let book = await this.remote.getBook(ref.bookName, this.defaultTranslation);
      let translation = ref.translation || this.defaultTranslation;
      let bookName = book.name;
      let bookNum = book.bookid;
      let chapter = ref.chapter;
      var versesData = await BollsBibleService.fetchChapter(translation, bookNum, chapter);
      if (ref.verses && ref.verses.length) {
        versesData = versesData.filter(verse => ref.verses!.includes(verse.verse));
      }
      return {
        ...ref,
        translation,
        reference: ref.reference + (ref.translation ? '' : ` (${translation})`),
        bookName,
        bookNum,
        versesData,
        url: BollsBibleService.getChapterUrl(translation, bookNum, ref.chapter, ref.verses?.length ? ref.verses[0] : undefined)
      }
    }))
  }

  async getUrls(refs: string): Promise<string[]>
  async getUrls(refs: BibleReference[]): Promise<string[]>
  getUrls(refs: string | BibleReference[]): Promise<string[]> {
    let references: BibleReference[];
    if (typeof refs == "string") {
      references = BibleController.parseReferenses(refs, { translation: this.defaultTranslation });
    } else {
      references = refs
    }
    return Promise.all(
      references.map(async ref => {
        let book = await this.remote.getBook(ref.bookName, this.defaultTranslation);
        return BollsBibleService.getChapterUrl(
          ref.translation || this.defaultTranslation,
          book.bookid,
          ref.chapter,
          ref.verses?.length ? ref.verses[0] : undefined
        )
      })
    )
  }

  host: ReactiveControllerHost;

  remote = new BollsBibleService();

  defaultTranslation: string;

  private _reference: string = '';
  get reference() { return this._reference };
  set reference(ref: string) {
    this.getExcerpts(ref)
      .then(excerpts => this.excerpts = excerpts)
      .finally(() => {
        this._reference = this.excerpts.map(ec => ec.reference).join(", ") || "";
        this.host.requestUpdate()
      })
  }

  excerpts: BibleExcerptData[] = [];

  constructor(host: ReactiveControllerHost, defaultTranslation: BollsBible.Translation['short_name'], languages?: string[], translations?: BollsBible.Translation['short_name'][]) {
    this.host = host;
    if (languages && languages.length) this.remote.selectLanguages(languages);
    if (translations && translations.length) this.remote.selectTranslations(translations);
    this.defaultTranslation = defaultTranslation;
  }

  hostConnected(): void { }

  hostDisconnected(): void { }

  hostUpdate(): void { }

  hostUpdated(): void { }

}

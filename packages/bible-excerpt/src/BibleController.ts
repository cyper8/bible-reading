import { ReactiveController, ReactiveControllerHost } from "lit";
import { BibleExcerptData, BibleReference, BollsBible, BollsBibleService } from "../../utils/bolls.js";
import { spreadNumbers } from "../../utils/spreadNumbers.js";

type BibleReferenceContext = Partial<BibleReference>

export class BibleController implements ReactiveController {

  static parseReferenses(refs: string, context?: BibleReferenceContext): BibleReference[] {
    return refs.split(',')
      .reduce((result: BibleReference[], ref, i, _originalRefs) => {
        let refContext = (context ? [context] : []).concat(result);
        let translation: string | undefined, foundtranslations: string[] | null = ref.trim().match(/\([A-Z0-9]+\)/);
        if (foundtranslations && foundtranslations.length) {
          ref = ref.replace(foundtranslations[0], '').trim();
          translation = foundtranslations[0].replace(/[\(\)]/g, '');
        } else {
          translation = refContext.at(i - 1)?.translation || undefined;
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
          chapters = [refContext.at(i - 1)?.chapter || 1];
          bookName = stances[0].trim();
        };
        if (bookName === '') {
          bookName = refContext.at(i - 1)?.bookName || '';
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

  async getExcerpts(refs: BibleReference[]): Promise<BibleExcerptData[]> {
    return Promise.all(refs.map(async ref => {
      let book = await this.remote.getBook(ref.bookName, this.defaultTranslation);
      let translation = ref.translation || this.defaultTranslation;
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
        bookNum,
        versesData,
        url: BollsBibleService.getChapterUrl(translation, bookNum, ref.chapter, ref.verses?.length ? ref.verses[0] : undefined)
      }
    }))
  }

  async getUrls(refs: BibleReference[]): Promise<string[]> {
    return Promise.all(
      refs.map(async ref => {
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
    this.getExcerpts(BibleController.parseReferenses(ref))
      .then(excerpts => this.excerpts = excerpts)
      .finally(() => { this.host.requestUpdate() })
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

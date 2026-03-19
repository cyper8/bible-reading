import { ReactiveController, ReactiveControllerHost } from "lit";
import { BibleExcerptData, BibleReference, BollsBible, BollsController} from "../../utils/bolls.js";
import { spreadNumbers } from "../../utils/spreadNumbers.js";
import { type BibleDataSource } from './bible-excerpt.js';

export class BibleController implements ReactiveController, BibleDataSource {
  remote = new BollsController({languages: ['Ukrainian']})

  static parseReferenses(refs: string): BibleReference[] {
    return refs.split(',')
        .reduce((result: BibleReference[], ref, i, _originalRefs) => {
          let translation: string | undefined, foundtranslations: string[] | null = ref.trim().match(/\([A-Z0-9]+\)/);
          if (foundtranslations && foundtranslations.length) {
            ref = ref.replace(foundtranslations[0], '').trim();
            translation = foundtranslations[0].replace(/[\(\)]/g, '');
          } else {
            translation = i > 0 ? result[i - 1].translation : undefined;
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
            chapters = i > 0 ? [result[i - 1].chapter] : [1];
            bookName = stances[0].trim();
          };
          if (bookName === '') {
            bookName = i > 0 ? result[i - 1].bookName : '';
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
                reference: `${bookName} ${chapter}${verses.length ? `:${stances[1]}` : ''} (${translation})`,
                bookName,
                chapter,
                verses
              };
              result.push(excerpt)
            })
          return result
        }, [])
  }

  static refAnchor({translation, bookNum, chapter, verse, reference}: { translation: BollsBible.Translation['short_name'], bookNum: number, chapter: number, verse?: number, reference: string }): string {
      let url = BollsController.getBollsChapterUrl({
        translation, bookNum, chapter, verse
      });
      return `<a href="${url}">${reference}</a>`
  }

  host: ReactiveControllerHost;
  
  private _reference: string = '';
  get reference() { return this._reference };
  set reference(ref: string) {
    Promise.all(
      BibleController.parseReferenses(this._reference = ref)
      .map(ref =>
          this.remote.getExcerpt(ref)
      )
    )
    .then(excerpts => this.excerpts = excerpts)
    .finally(() => { this.host.requestUpdate() })
  }

  excerpts: BibleExcerptData[] = [];

  constructor(host: ReactiveControllerHost) {
    this.host = host;
  }

  hostConnected(): void { }

  hostDisconnected(): void { }

  hostUpdate(): void { }

  hostUpdated(): void { }

}

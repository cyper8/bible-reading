import { ReactiveController, ReactiveControllerHost } from "lit";
import { BibleExcerptData, BibleReference, BollsController } from "../../utils/bolls.js";
import { spreadNumbers } from "../../utils/spreadNumbers.js";

export class BibleController implements ReactiveController {
  static remote = new BollsController();

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

  static async parseExcerpts(refs: string) {
    return Promise.all(this.parseReferenses(refs).map(ref => this.remote.getExcerpt(ref)))
  }

  static async refAnchor(ref: BibleReference): Promise<string> {
    let url = await this.remote.getChapterUrl(ref);
    return `<a href="${url}">${ref.reference}</a>`
  }

  host: ReactiveControllerHost;

  defaultTranslation: string;

  private _reference: string = '';
  get reference() { return this._reference };
  set reference(ref: string) {
    BibleController.parseExcerpts(ref)
      .then(excerpts => this.excerpts = excerpts)
      .finally(() => { this.host.requestUpdate() })
  }

  excerpts: BibleExcerptData[] = [];

  constructor(host: ReactiveControllerHost, defaultTranslation: BollsBible.Translation['short_name']) {
    this.host = host;
    this.defaultTranslation = defaultTranslation;
  }

  hostConnected(): void { }

  hostDisconnected(): void { }

  hostUpdate(): void { }

  hostUpdated(): void { }

}

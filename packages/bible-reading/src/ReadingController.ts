import { ReactiveController, ReactiveControllerHost } from "lit";
import { getJSONP } from "../../utils/getJSONP.js";

const READING_SOURCE = "/reading/json";

export const stripHours = (date: Date) => (date.setHours(0, 0, 0, 0), date);

export declare interface ReadingDay {
  date: Date;
  reading: string;
  questions: string;
  exposition: string;
}

const objToReadingDay: (object: { [key in keyof ReadingDay]: string }) => ReadingDay = (object: { [key in keyof ReadingDay]: string }) => {
  return {
    date: new Date(object.date),
    reading: object.reading,
    questions: object.questions,
    exposition: object.exposition
  }
}

export type ReadingMonth = ReadingDay[];

export class ReadingController implements ReactiveController {

  host: ReactiveControllerHost;

  month: ReadingMonth = [];
  day?: ReadingDay;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
  }

  async setReadingDate(date: Date) {
    const d = stripHours(date);
    if (this.month.length == 0 || (this.month[1].date.getMonth() !== d.getMonth())) {
      let month = JSON.parse(JSON.stringify(await getJSONP<{ [key in keyof ReadingDay]: string }[]>(READING_SOURCE, `date=${date.toDateString()}`)));
      this.month = month
        .map(objToReadingDay);
    }
    this.day = this.month.find(reading => reading.date.getTime() == d.getTime());
    this.host.requestUpdate();
  }

  hostConnected(): void { }
  hostDisconnected(): void { }
  hostUpdate(): void { }
  hostUpdated(): void { }
}
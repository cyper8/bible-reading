import { ReactiveController, ReactiveControllerHost } from "lit";

const READING_SOURCE = "/reading/json";

export declare interface ReadingDay {
  date: Date;
  reading: string;
  questions: string;
  exposition: string;
}

export class ReadingController implements ReactiveController {
  today: Date = new Date();
  reading: ReadingDay[] = [];

  host: ReactiveControllerHost;
  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.today.setHours(0, 0, 0);
    this.getReading();
  }

  getReading() {
    fetch(READING_SOURCE + "?date=" + this.today.toDateString())
      .then<ReadingDay[]>(response => response.json())
      .then(reading => {
        this.reading = reading;
        this.host.requestUpdate()
      })
  }

  hostConnected(): void { }
  hostDisconnected(): void { }
  hostUpdate(): void { }
  hostUpdated(): void { }
}
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

  static handleReadingData: Function | undefined;

  getReading() {
    var script = document.createElement('script');
    var nW: any = Object.defineProperty(window, "handleReadingData", {
      value: (data: Array<ReadingDay>) => {
        this.reading = data as ReadingDay[];
        document.head.removeChild(script);
        delete nW.handleReadingData;
        this.host.requestUpdate();
      },
      enumerable: true,
      configurable: true
    });
    script.src = READING_SOURCE + "?date=" + this.today.toDateString() + '&callback=window.handleReadingData';
    document.head.appendChild(script);
  }

  hostConnected(): void { }
  hostDisconnected(): void { }
  hostUpdate(): void { }
  hostUpdated(): void { }
}
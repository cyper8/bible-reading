import { getJSONP } from "../../utils/getJSONP.js";
const READING_SOURCE = "/reading/json";
export const stripHours = (date) => (date.setHours(0, 0, 0, 0), date);
const objToReadingDay = (object) => {
    return {
        date: new Date(object.date),
        reading: object.reading,
        questions: object.questions,
        exposition: object.exposition
    };
};
export class ReadingController {
    constructor(host) {
        this.month = [];
        this.host = host;
    }
    async setReadingDate(date) {
        const d = stripHours(date);
        if (this.month.length == 0 || (this.month[1].date.getMonth() !== d.getMonth())) {
            let month = JSON.parse(JSON.stringify(await getJSONP(READING_SOURCE, `date=${date.toDateString()}`)));
            this.month = month
                .map(objToReadingDay);
        }
        this.day = this.month.find(reading => reading.date.getTime() == d.getTime());
        this.host.requestUpdate();
    }
    hostConnected() { }
    hostDisconnected() { }
    hostUpdate() { }
    hostUpdated() { }
}

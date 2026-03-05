import { getJSONP } from "../../utils/getJSONP.js";
const DEFAULT_READING_SOURCE = location.origin + "/json";
const defaultReadingDataProvider = (date) => getJSONP(DEFAULT_READING_SOURCE, `date=${date.toDateString()}`);
export const stripHours = (date) => (date.setHours(0, 0, 0, 0), date);
const objToReadingDay = (object) => {
    return {
        date: new Date(object.date),
        reading: object.reading,
        questions: object.questions,
        exposition: object.exposition
    };
};
export function isRawReadingDay(obj) {
    return ("date" in obj &&
        "reading" in obj &&
        "questions" in obj &&
        "exposition" in obj) && (typeof obj.date === "string" &&
        typeof obj.reading === "string" &&
        typeof obj.questions === "string" &&
        typeof obj.exposition === "string");
}
export class ReadingController {
    constructor(host, dataProvider = defaultReadingDataProvider) {
        this.month = [];
        this.host = host;
        this.dataSourse = dataProvider;
    }
    loadMonthData(data) {
        this.month = data
            .map(reading => objToReadingDay(reading));
    }
    async setReadingDate(date) {
        const d = stripHours(date);
        if (this.month.length == 0 || (this.month[1].date.getMonth() !== d.getMonth())) {
            let month = await Promise.resolve(this.dataSourse(date));
            this.loadMonthData(month);
        }
        this.day = this.month.find(reading => reading.date.getTime() == d.getTime());
        this.host.requestUpdate();
    }
    hostConnected() { }
    hostDisconnected() { }
    hostUpdate() { }
    hostUpdated() { }
}

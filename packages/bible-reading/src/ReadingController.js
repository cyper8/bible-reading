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
    get date() { return this._date; }
    ;
    set date(date) {
        const d = stripHours(date);
        this._date = d;
        Promise.resolve(this.month.length == 0 || (this.month[1].date.getMonth() !== d.getMonth())
            ? Promise.resolve(this.dataSourse(date))
                .then(rawdays => rawdays.map(rawday => objToReadingDay(rawday)))
            : this.month)
            .then(days => {
            this.month = days;
            this.day = this.month.find(reading => reading.date.getTime() == d.getTime());
            this.host.requestUpdate();
        });
    }
    constructor(host, dataProvider) {
        this._date = stripHours(new Date());
        this.month = [];
        this.host = host;
        this.dataSourse = dataProvider;
    }
    hostConnected() {
        let params = new URLSearchParams(location.search);
        if (params.has("date")) {
            this.date = stripHours(new Date(params.get("date")));
        }
        else
            this.date = stripHours(new Date());
    }
    hostDisconnected() { }
    hostUpdate() { }
    hostUpdated() { }
}

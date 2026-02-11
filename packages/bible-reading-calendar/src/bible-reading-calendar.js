var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
const daysInMonth = (m0, y) => {
    let d = new Date();
    d.setFullYear(y || d.getFullYear());
    d.setMonth(m0 + 1);
    d.setDate(0);
    return d.getDate();
};
let BibleReadingCalendar = class BibleReadingCalendar extends LitElement {
    constructor() {
        super(...arguments);
        this.monthReading = [];
        this.date = new Date();
    }
    async fetchDataFor(thedate) {
        var readingData = [], reportedFlag = false, theyear = thedate.getFullYear(), themonth = thedate.getMonth(), theday = thedate.getDate(), year = theyear, month = themonth;
        for (; year > theyear - 1; year--) {
            if (reportedFlag)
                break;
            for (; month >= 0; month--) {
                if (reportedFlag)
                    break;
                readingData[month] = [];
                var day = (month < themonth || year < theyear) ? daysInMonth(month, year) : theday;
                for (; day > 0; day--) {
                    await fetch(`./${year}/${month + 1}/${day}.md`, {
                        method: 'GET',
                        redirect: 'error',
                        headers: {
                            'Content-Type': 'text/markdown',
                            'Accept': 'text/markdown'
                        }
                    }).then(res => {
                        if (res.ok) {
                            return res.text();
                        }
                        else
                            return '';
                    })
                        .then(rData => {
                        readingData[month][day - 1] = rData;
                        if (rData && !reportedFlag) {
                            reportedFlag = true;
                            this.currentReadingDate = new Date(year, month, day);
                            this.reportData({
                                date: this.currentReadingDate,
                                reading: rData
                            });
                        }
                    });
                }
            }
        }
        return readingData;
    }
    genMonth(data, currentReadingDate = new Date()) {
        const week = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
        let month = currentReadingDate.getMonth();
        let year = currentReadingDate.getFullYear();
        let theday = currentReadingDate.getDate();
        let day1 = new Date(year, month, 1);
        let offset = (day1.getDay() + 7 - 1) % 7 || 7;
        let length = daysInMonth(month, year);
        let monthData = (data[month] || []);
        let gen = ['prev', ...(monthData.concat(Array(length - monthData.length).fill(''))), 'next'];
        return html `<section class="calendar">
      ${week.map(d => html `<div class="day header">${d}</div>`)}
      ${gen.map((d, n, a) => {
            let dw = (n + offset - 1) % 7;
            let today = (n == theday);
            let ffwd = (n == a.length - 1);
            let rewd = (n == 0);
            return html `<div class="${classMap({
                day: true,
                ffwd,
                rewd,
                empty: (d == '' || ffwd || rewd),
                selected: today,
                weekend: dw > 4
            })}"
          style="${styleMap({
                'grid-column': `span ${rewd ? offset : (ffwd ? 7 - dw : 1)}`
            })}"
          @click="${() => {
                if (rewd)
                    this.date = new Date(year, month, 0);
                else if (ffwd)
                    this.date = new Date(year, month + 2, 0);
                else if (!today)
                    this.reportData({
                        date: this.currentReadingDate = new Date(year, month, n),
                        reading: d
                    });
            }}">${n}</div>`;
        })}</section>`;
    }
    reportData(reading) {
        this.dispatchEvent(new CustomEvent('reading-date-selected', {
            detail: reading,
            bubbles: true,
            composed: true
        }));
    }
    updated(_changedProperties) {
        if (_changedProperties.has("date")) {
            this.fetchDataFor(this.date).then((res) => {
                if (res) {
                    this.monthReading = res;
                }
            });
        }
    }
    render() {
        return html `
    <label class="icon" id="clock" for="date-selector-switch">
      ${(this.currentReadingDate || this.date).toLocaleDateString(navigator.language, { dateStyle: 'long' })}<input type=checkbox id="date-selector-switch" hidden />
      <div class="date-selector">
        ${this.genMonth(this.monthReading, this.currentReadingDate)}
      </div>
    </label>
    
    `;
    }
    static get styles() {
        return css `
    :host {
      display: inline-block;
      margin: 0.2em;
      padding: 0.2em;
      border: solid 1px var(--bible-excerpt-color);
      border-radius: 1.2em;
      line-height: 2em
    }
    #clock.icon {
      position: relative
    }
    #clock.icon::before {
      content: '';
      margin: 0.2em;
      display: block;
      float: left;
      width: 1.5em;
      height: 1.5em;
      border-radius: 50%;
      background-color: currentColor;
      position: relative;
    }
    #clock.icon::after {
      content: '';
      width: 0.1em;
      height: 0.5em;
      border: none ;
      border-radius: 0.05em;
      position: absolute;
      left: -1.05em;
      top: 0.05em;
      background-color: var(--bible-excerpt-background);
      transform-origin: center bottom;
      transform: rotate(35deg);
      transition: transform 2s linear;
    }
    #clock.icon:hover::after {
      transform: rotate(-360deg)
    }
    .date-selector {
      display: none;
      position: absolute;
      width: auto;
      height: auto;
      background-color: var(--bible-excerpt-color);
      color: var(--bible-excerpt-background);
      border-radius: 1em;
      padding: 1em;
    }
    input#date-selector-switch:checked+.date-selector {
      display: block
    }
    .calendar {
      border-radius: 0.2em;
      border: none;
      display: grid;
      grid-template-columns: repeat(7, 2em);
      .day {
        &:not(.header) {
          &:hover {
            background-color: var(--bible-excerpt-hilight, rgba(200,200,200,0.3));
            &:not(.empty) {
              background-color: var(--bible-excerpt-hilight-accent, rgba(200,225,255,0.3));
            }
          }
        }
        &.header, &.selected {
          font-weight: bold;
        }
      }
      .weekend, .empty {
        filter: brightness(80%);
      }
      .rewd, .ffwd {
        color: transparent;
        text-align: center;
      }
      .rewd::after {
        content: '<<';
        color: var(--bible-excerpt-background);
      }
      .ffwd::before {
        content: '>>';
        color: var(--bible-excerpt-background);
      }
    }
    `;
    }
};
__decorate([
    state()
], BibleReadingCalendar.prototype, "monthReading", void 0);
__decorate([
    state()
], BibleReadingCalendar.prototype, "currentReadingDate", void 0);
__decorate([
    property({ type: Date })
], BibleReadingCalendar.prototype, "date", void 0);
BibleReadingCalendar = __decorate([
    customElement('bible-reading-calendar')
], BibleReadingCalendar);
export { BibleReadingCalendar };

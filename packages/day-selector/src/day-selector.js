var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
/** zero-based day of week (like Date.prototype.getDay) but locale-corrected (if supported by browser) */
const getLocaleDayOfWeek = (date) => {
    const locale = new Intl.Locale(navigator.language);
    var weekStart;
    if ("getWeekInfo" in locale) {
        weekStart = locale.getWeekInfo().firstDay;
    }
    else {
        weekStart = navigator.languages.includes("uk") ? 1 : 7;
    }
    return (date.getDay() + 7 - weekStart) % 7;
};
const weekDaysNames = Array(7)
    .fill(0).map((_d, n) => new Date(0, 0, n))
    .reduce((w, d) => w.with(d.getDay() - 1, d.toLocaleDateString(undefined, { weekday: "short" })), Array(7));
const daysInMonth = (m0, y) => {
    let d = new Date();
    d.setFullYear(y || d.getFullYear());
    d.setMonth(m0 + 1);
    d.setDate(0);
    return d.getDate();
};
let DaySelector = class DaySelector extends LitElement {
    constructor() {
        super(...arguments);
        this.date = new Date();
        this.month = [];
    }
    genMonth(monthData, currentDate = new Date()) {
        let month = currentDate.getMonth();
        let year = currentDate.getFullYear();
        let today = currentDate.getDate();
        let day1 = new Date(year, month, 1);
        let firstDayOffset = getLocaleDayOfWeek(day1) || 7; // if the month starts from first weekday, add whole week for "to previous month" option plus compensate
        let monthLength = daysInMonth(month, year);
        let calendarDaysData = Array(monthLength + 2).fill(undefined);
        monthData.forEach((day) => {
            calendarDaysData[day.date.getDate()] = day;
        });
        return html `<section class="calendar">
      ${weekDaysNames.map(weekdayname => html `<div class="day header">${weekdayname}</div>`)}
      ${calendarDaysData.map((dayData, n, a) => {
            let date = new Date(year, month, n);
            let dayOfWeek = getLocaleDayOfWeek(date);
            let isToday = (n == today);
            let nextMonth = (n == a.length - 1);
            let prevMonth = (n == 0);
            let empty = dayData == undefined;
            return html `<div class="${classMap({
                day: true,
                ffwd: nextMonth,
                rewd: prevMonth,
                empty: (empty || nextMonth || prevMonth),
                selected: isToday,
                weekend: dayOfWeek > 4
            })}"
          style="${styleMap({
                'grid-column': `span ${prevMonth ? firstDayOffset : (nextMonth ? 7 - dayOfWeek : 1)}`
            })}"
          @click="${() => {
                if (nextMonth || prevMonth || !(isToday || empty)) {
                    this.date = date;
                    this.reportData({
                        date,
                        ...(dayData || {})
                    });
                }
            }}">${n}</div>`;
        })}</section>`;
    }
    reportData(data) {
        this.dispatchEvent(new CustomEvent('date-selected', {
            detail: data,
            bubbles: true,
            composed: true
        }));
    }
    render() {
        return html `
    <label class="icon" id="clock" for="date-selector-switch">
      ${(this.date).toLocaleDateString(navigator.language, { dateStyle: 'long' })}<input type=checkbox id="date-selector-switch" hidden />
      <div class="date-selector">
        ${this.genMonth(this.month, this.date)}
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
    property({ type: Date })
], DaySelector.prototype, "date", void 0);
__decorate([
    property({ type: Array })
], DaySelector.prototype, "month", void 0);
DaySelector = __decorate([
    customElement('day-selector')
], DaySelector);
export { DaySelector };

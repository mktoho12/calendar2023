"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("date-fns/addDays/index"));
const differenceInDays_1 = __importDefault(require("date-fns/differenceInDays"));
const endOfMonth_1 = __importDefault(require("date-fns/endOfMonth"));
const isSaturday_1 = __importDefault(require("date-fns/isSaturday"));
const isSunday_1 = __importDefault(require("date-fns/isSunday"));
const nextSaturday_1 = __importDefault(require("date-fns/nextSaturday"));
const previousSunday_1 = __importDefault(require("date-fns/previousSunday"));
const japanese_holidays_1 = __importDefault(require("japanese-holidays"));
const months = Array(12)
    .fill(null)
    .map((_, i) => i)
    .map(month => {
    const firstDay = new Date(2023, month, 1);
    const lastDayOfMonth = (0, endOfMonth_1.default)(firstDay).getDate();
    const dates = Array(lastDayOfMonth)
        .fill(null)
        .map((_, i) => new Date(2023, month, i + 1));
    const lastSundayOfFirstDay = (0, isSunday_1.default)(dates[0])
        ? dates[0]
        : (0, previousSunday_1.default)(dates[0]);
    const lastDateOfMonth = dates.at(-1);
    if (lastDateOfMonth === undefined)
        throw new Error('lastDateOfMonth is undefined');
    const nextSaturdayOfEndDay = (0, isSaturday_1.default)(lastDateOfMonth)
        ? lastDateOfMonth
        : (0, nextSaturday_1.default)(lastDateOfMonth);
    return { month, from: lastSundayOfFirstDay, to: nextSaturdayOfEndDay };
});
const splitBy = (arr, num) => arr.length === 0 ? [] : [arr.slice(0, num), ...splitBy(arr.slice(num), num)];
const renderMonth = ({ month, from, to, }) => ({
    month,
    body: splitBy(Array((0, differenceInDays_1.default)(to, from) + 1)
        .fill(null)
        .map((_, i) => {
        const date = (0, index_1.default)(from, i);
        if (date.getMonth() !== month)
            return '  ';
        const dayOfMonth = date.getDate();
        const dayString = dayOfMonth < 10 ? ` ${dayOfMonth}` : dayOfMonth.toString();
        const colorPrefix = japanese_holidays_1.default.isHoliday(date) || (0, isSunday_1.default)(date)
            ? '\x1b[31m'
            : (0, isSaturday_1.default)(date)
                ? '\x1b[34m'
                : '';
        const colorSuffix = japanese_holidays_1.default.isHoliday(date) || (0, isSunday_1.default)(date) || (0, isSaturday_1.default)(date)
            ? '\x1b[0m'
            : '';
        return `${colorPrefix}${dayString}${colorSuffix}`;
    }), 7).map(week => week.join(' ')),
});
const center = (str, width) => {
    const padding = Math.max(0, (width - str.length - 1) / 2);
    return ' '.repeat(Math.ceil(padding)) + str + ' '.repeat(Math.floor(padding));
};
const monthLines = splitBy(months, 3);
console.log(monthLines
    .map(line => {
    const calendars = line.map(renderMonth);
    const length = Math.max(...calendars.map(c => c.body.length));
    return [
        calendars.map(c => center(`${c.month + 1}月`, 20)).join('  '),
        '',
        ...Array(length)
            .fill(null)
            .map((_, i) => calendars
            .map(c => c.body.at(i) || '                    ')
            .join('  ')),
        '',
    ].join('\n');
})
    .join('\n'));

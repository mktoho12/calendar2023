import addDays from 'date-fns/addDays/index'
import differenceInDays from 'date-fns/differenceInDays'
import endOfMonth from 'date-fns/endOfMonth'
import isSaturday from 'date-fns/isSaturday'
import isSunday from 'date-fns/isSunday'
import nextSaturday from 'date-fns/nextSaturday'
import previousSunday from 'date-fns/previousSunday'
import JapaneseHolidays from 'japanese-holidays'

type CalendarMonth = {
  month: number
  from: Date
  to: Date
}

const months = Array(12)
  .fill(null)
  .map((_, i) => i)
  .map(month => {
    const firstDay = new Date(2023, month, 1)
    const lastDayOfMonth = endOfMonth(firstDay).getDate()
    const dates = Array(lastDayOfMonth)
      .fill(null)
      .map((_, i) => new Date(2023, month, i + 1))

    const lastSundayOfFirstDay = isSunday(dates[0])
      ? dates[0]
      : previousSunday(dates[0])
    const lastDateOfMonth = dates.at(-1)
    if (lastDateOfMonth === undefined)
      throw new Error('lastDateOfMonth is undefined')
    const nextSaturdayOfEndDay = isSaturday(lastDateOfMonth)
      ? lastDateOfMonth
      : nextSaturday(lastDateOfMonth)
    return { month, from: lastSundayOfFirstDay, to: nextSaturdayOfEndDay }
  })

const splitBy: <T>(arr: T[], num: number) => T[][] = (arr, num) =>
  arr.length === 0 ? [] : [arr.slice(0, num), ...splitBy(arr.slice(num), num)]

const renderMonth: (m: CalendarMonth) => { month: number; body: string[] } = ({
  month,
  from,
  to,
}) => ({
  month,
  body: splitBy(
    Array(differenceInDays(to, from) + 1)
      .fill(null)
      .map((_, i) => {
        const date = addDays(from, i)
        if (date.getMonth() !== month) return '  '
        const dayOfMonth = date.getDate()
        const dayString =
          dayOfMonth < 10 ? ` ${dayOfMonth}` : dayOfMonth.toString()

        const colorPrefix =
          JapaneseHolidays.isHoliday(date) || isSunday(date)
            ? '\x1b[31m'
            : isSaturday(date)
            ? '\x1b[34m'
            : ''
        const colorSuffix =
          JapaneseHolidays.isHoliday(date) || isSunday(date) || isSaturday(date)
            ? '\x1b[0m'
            : ''
        return `${colorPrefix}${dayString}${colorSuffix}`
      }),
    7
  ).map(week => week.join(' ')),
})

const center = (str: string, width: number) => {
  const padding = Math.max(0, (width - str.length - 1) / 2)
  return ' '.repeat(Math.ceil(padding)) + str + ' '.repeat(Math.floor(padding))
}

const monthLines = splitBy(months, 3)

console.log(
  monthLines
    .map(line => {
      const calendars = line.map(renderMonth)
      const length = Math.max(...calendars.map(c => c.body.length))
      return [
        calendars.map(c => center(`${c.month + 1}月`, 20)).join('  '),
        '',
        ...Array(length)
          .fill(null)
          .map((_, i) =>
            calendars
              .map(c => c.body.at(i) || '                    ')
              .join('  ')
          ),
        '',
      ].join('\n')
    })
    .join('\n')
)

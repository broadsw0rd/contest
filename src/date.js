
const DAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
]

const MONTHS = [
  'Jan',
  'Fab',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

export function format (time) {
  var date = new Date(time)
  return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`
}

export function formatShort (time) {
  var date = new Date(time)
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}

export const DAY = 24 * 60 * 60 * 1000

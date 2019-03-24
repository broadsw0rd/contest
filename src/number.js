export function abbreviate (value) {
  var suffixes = ['', 'K', 'M', 'B','T']
  var suffixNum = 0

  while (value >= 1000) {
    value /= 1000
    suffixNum++
  }

  value += suffixes[suffixNum]
  return value;
}

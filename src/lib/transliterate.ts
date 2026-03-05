const digraphMap: Array<[RegExp, string]> = [
  [/sch/g, 'ш'],
  [/ch/g, 'х'],
  [/ei/g, 'ай'],
  [/ie/g, 'и'],
  [/eu/g, 'ой'],
  [/au/g, 'ау'],
  [/sp/g, 'шп'],
  [/st/g, 'шт'],
  [/ph/g, 'ф'],
  [/qu/g, 'кв'],
]

const letterMap: Record<string, string> = {
  a: 'а',
  b: 'б',
  c: 'к',
  d: 'д',
  e: 'е',
  f: 'ф',
  g: 'г',
  h: 'х',
  i: 'и',
  j: 'й',
  k: 'к',
  l: 'л',
  m: 'м',
  n: 'н',
  o: 'о',
  p: 'п',
  r: 'р',
  s: 'с',
  t: 'т',
  u: 'у',
  v: 'ф',
  w: 'в',
  x: 'кс',
  y: 'ю',
  z: 'ц',
  ä: 'э',
  ö: 'ё',
  ü: 'ю',
  ß: 'с',
}

export function transliterateGermanToRu(input: string): string {
  let value = input.toLowerCase()

  for (const [pattern, replacement] of digraphMap) {
    value = value.replace(pattern, replacement)
  }

  return value
    .split('')
    .map((char) => letterMap[char] ?? char)
    .join('')
}

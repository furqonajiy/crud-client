// src/app/utils/country.ts
import wc from 'world-countries';

export type Country = { code: string; name: string };

// Canonical list: ISO2 (lowercase) + common country name (e.g., "Netherlands")
export const COUNTRIES: Country[] = wc
  .map(c => ({ code: c.cca2.toLowerCase(), name: c.name.common }))
  .sort((a, b) => a.name.localeCompare(b.name));

const CODE_BY_NAME = new Map(COUNTRIES.map(c => [c.name, c.code]));
const NAME_BY_CODE = new Map(COUNTRIES.map(c => [c.code, c.name]));

export function isoFromName(name?: string): string {
  return name ? (CODE_BY_NAME.get(name) ?? '') : '';
}

export function nameFromCode(code?: string): string {
  return code ? (NAME_BY_CODE.get(code.toLowerCase()) ?? '') : '';
}

export function countriesList(): Country[] {
  return COUNTRIES;
}
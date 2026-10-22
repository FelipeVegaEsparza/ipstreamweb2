import type { Locale } from './i18n'
import * as es from './content'
import * as en from './content.en'

export function getContent(locale: Locale) {
  return locale === 'en' ? en : es
}

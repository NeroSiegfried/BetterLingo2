export const languages = [
  { id: 'english', name: 'English', flag: '🇬🇧', countryCode: 'GB', flagUrl: 'https://flagcdn.com/w80/gb.png', nativeName: 'English', locale: 'en-GB', voiceCode: 'en-GB' },
  { id: 'spanish', name: 'Spanish', flag: '🇪🇸', countryCode: 'ES', flagUrl: 'https://flagcdn.com/w80/es.png', nativeName: 'Español', locale: 'es-ES', voiceCode: 'es-ES' },
  { id: 'french', name: 'French', flag: '🇫🇷', countryCode: 'FR', flagUrl: 'https://flagcdn.com/w80/fr.png', nativeName: 'Français', locale: 'fr-FR', voiceCode: 'fr-FR' },
  { id: 'german', name: 'German', flag: '🇩🇪', countryCode: 'DE', flagUrl: 'https://flagcdn.com/w80/de.png', nativeName: 'Deutsch', locale: 'de-DE', voiceCode: 'de-DE' },
  { id: 'italian', name: 'Italian', flag: '🇮🇹', countryCode: 'IT', flagUrl: 'https://flagcdn.com/w80/it.png', nativeName: 'Italiano', locale: 'it-IT', voiceCode: 'it-IT' },
  { id: 'portuguese', name: 'Portuguese', flag: '🇵🇹', countryCode: 'PT', flagUrl: 'https://flagcdn.com/w80/pt.png', nativeName: 'Português', locale: 'pt-PT', voiceCode: 'pt-PT' },
  { id: 'japanese', name: 'Japanese', flag: '🇯🇵', countryCode: 'JP', flagUrl: 'https://flagcdn.com/w80/jp.png', nativeName: '日本語', locale: 'ja-JP', voiceCode: 'ja-JP' },
  { id: 'korean', name: 'Korean', flag: '🇰🇷', countryCode: 'KR', flagUrl: 'https://flagcdn.com/w80/kr.png', nativeName: '한국어', locale: 'ko-KR', voiceCode: 'ko-KR' },
  { id: 'mandarin', name: 'Mandarin', flag: '🇨🇳', countryCode: 'CN', flagUrl: 'https://flagcdn.com/w80/cn.png', nativeName: '中文', locale: 'zh-CN', voiceCode: 'zh-CN' },
  { id: 'arabic', name: 'Arabic', flag: '🇸🇦', countryCode: 'SA', flagUrl: 'https://flagcdn.com/w80/sa.png', nativeName: 'العربية', locale: 'ar-SA', voiceCode: 'ar-SA' },
  { id: 'russian', name: 'Russian', flag: '🇷🇺', countryCode: 'RU', flagUrl: 'https://flagcdn.com/w80/ru.png', nativeName: 'Русский', locale: 'ru-RU', voiceCode: 'ru-RU' },
  { id: 'dutch', name: 'Dutch', flag: '🇳🇱', countryCode: 'NL', flagUrl: 'https://flagcdn.com/w80/nl.png', nativeName: 'Nederlands', locale: 'nl-NL', voiceCode: 'nl-NL' },
];

export type Language = typeof languages[0];

export const getLanguageById = (id: string) => languages.find(lang => lang.id === id);

// Localized UI strings
export const translations: Record<string, { wordBank: string; practice: string; myWords: string }> = {
  english: { wordBank: 'Word Bank', practice: 'Practice', myWords: 'My Words' },
  spanish: { wordBank: 'Banco de Palabras', practice: 'Practicar', myWords: 'Mis Palabras' },
  french: { wordBank: 'Banque de Mots', practice: 'Pratiquer', myWords: 'Mes Mots' },
  german: { wordBank: 'Wortschatz', practice: 'Üben', myWords: 'Meine Wörter' },
  italian: { wordBank: 'Vocabolario', practice: 'Praticare', myWords: 'Le Mie Parole' },
  portuguese: { wordBank: 'Banco de Palavras', practice: 'Praticar', myWords: 'Minhas Palavras' },
  japanese: { wordBank: '単語帳', practice: '練習', myWords: '私の単語' },
  korean: { wordBank: '단어장', practice: '연습', myWords: '내 단어' },
  mandarin: { wordBank: '生词本', practice: '练习', myWords: '我的词汇' },
  arabic: { wordBank: 'بنك الكلمات', practice: 'ممارسة', myWords: 'كلماتي' },
  russian: { wordBank: 'Словарь', practice: 'Практика', myWords: 'Мои Слова' },
  dutch: { wordBank: 'Woordenbank', practice: 'Oefenen', myWords: 'Mijn Woorden' },
};

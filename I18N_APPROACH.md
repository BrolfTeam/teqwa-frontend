# i18n Implementation Approach

## Overview
The project was originally built in English with hardcoded strings. We've added translation support **only for Amharic and Arabic**. English remains the default language and uses hardcoded strings (or English translation file with original strings).

## Language Switcher
- **Only shows**: አማርኛ (Amharic) and العربية (Arabic)
- **English is the default**: Not shown in switcher (users start in English)
- **Location**: Desktop navbar (next to ThemeToggle) and mobile menu

## Translation Approach

### Option 1: Use `t()` for all languages (Recommended)
Keep using `t()` consistently. The English translation file (`en.json`) contains the original hardcoded strings.

```jsx
import { useTranslation } from '@/hooks/useTranslation';

const { t } = useTranslation();
const homeText = t('nav.home'); // Works for all languages
```

### Option 2: Use `translate()` helper for conditional translation
Use the `translate()` helper when you want to use hardcoded English strings directly:

```jsx
import { useTranslation } from '@/hooks/useTranslation';

const { translate } = useTranslation();
const homeText = translate('nav.home', 'Home'); 
// English: returns 'Home' (hardcoded)
// Amharic/Arabic: returns translation from files
```

## Current Implementation
- Components currently use `t()` for all languages
- English translation file contains original strings
- This approach is consistent and maintainable

## Adding New Translations
1. Add English string to `en.json` (original hardcoded text)
2. Add Amharic translation to `am.json`
3. Add Arabic translation to `ar.json`

## Default Language
- **Default**: English (`en`)
- **Fallback**: English
- **Auto-detection**: Only applies to Amharic/Arabic; defaults to English otherwise

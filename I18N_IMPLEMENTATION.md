# i18n Implementation Guide

This document explains the i18n (internationalization) implementation for the Teqwa frontend application.

## Overview

The application now supports three languages:
- **English (en)** - Default language
- **Amharic (am)** - Ethiopian language with full font support
- **Arabic (ar)** - RTL layout support

## Features Implemented

✅ **i18next + react-i18next** integration
✅ **Translation files** for all three languages
✅ **Language switcher** component
✅ **localStorage persistence** of language selection
✅ **Browser language auto-detection**
✅ **RTL layout** for Arabic
✅ **Font support** for Amharic (Noto Sans Ethiopic) and Arabic (Tajawal)
✅ **Dynamic document direction** based on language

## File Structure

```
teqwa-frontend/
├── src/
│   ├── lib/
│   │   └── i18n.js              # i18n configuration
│   ├── locales/
│   │   ├── en.json              # English translations
│   │   ├── am.json              # Amharic translations
│   │   └── ar.json              # Arabic translations
│   ├── context/
│   │   └── LanguageContext.jsx   # Language context (updated)
│   ├── components/
│   │   └── ui/
│   │       └── LanguageToggle.jsx  # Language switcher (updated)
│   └── hooks/
│       └── useTranslation.js    # Custom translation hook
```

## Usage

### Basic Translation

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('common.welcome')}</h1>;
}
```

### Using the Custom Hook

```jsx
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t, isRTL, currentLanguage } = useTranslation();
  
  return (
    <div className={isRTL() ? 'rtl' : 'ltr'}>
      <h1>{t('common.welcome')}</h1>
      <p>Current language: {currentLanguage}</p>
    </div>
  );
}
```

### Changing Language

```jsx
import { useLanguage } from '@/context/LanguageContext';

function MyComponent() {
  const { lang, setLang } = useLanguage();
  
  return (
    <button onClick={() => setLang('ar')}>
      Switch to Arabic
    </button>
  );
}
```

### Translation with Variables

```jsx
const { t } = useTranslation();

// In translation file: "hello": "Hello {{name}}"
t('hello', { name: 'John' }) // "Hello John"
```

## Translation Keys Structure

All translations are organized in namespaces:

- `common.*` - Common UI elements (buttons, labels, etc.)
- `nav.*` - Navigation menu items
- `hero.*` - Hero section content
- `footer.*` - Footer content
- `prayer.*` - Prayer-related text
- `events.*` - Events page content
- `donations.*` - Donations page content
- `education.*` - Education page content
- `futsal.*` - Futsal booking content
- `itikaf.*` - I'tikaf program content
- `auth.*` - Authentication forms
- `membership.*` - Membership content
- `gallery.*` - Gallery content
- `news.*` - News content

## RTL Support

When Arabic is selected:
- Document direction automatically switches to `rtl`
- Layouts adjust automatically
- Text alignment changes to right
- Icons and arrows can be flipped using `.flip-rtl` class

### RTL-Specific CSS Classes

```css
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .flip-rtl {
  transform: scaleX(-1);
}
```

## Font Support

### Amharic
- Font: **Noto Sans Ethiopic**
- Automatically applied when Amharic is selected
- Supports all Ethiopic script characters

### Arabic
- Font: **Tajawal** (already installed)
- Automatically applied when Arabic is selected
- Optimized for Arabic text rendering

## Components Updated

The following components have been updated to use translations:

1. ✅ **LanguageContext** - Integrated with i18next
2. ✅ **LanguageToggle** - Updated with native language labels
3. ✅ **Navbar** - All navigation items use translation keys
4. ✅ **heroContent.js** - Hero slides use translations
5. ✅ **Home.jsx** - Updated to pass translation function

## Adding New Translations

### Step 1: Add to English (en.json)

```json
{
  "mySection": {
    "myKey": "My English Text"
  }
}
```

### Step 2: Add to Amharic (am.json)

```json
{
  "mySection": {
    "myKey": "የእኔ አማርኛ ጽሑፍ"
  }
}
```

### Step 3: Add to Arabic (ar.json)

```json
{
  "mySection": {
    "myKey": "نصي العربي"
  }
}
```

### Step 4: Use in Component

```jsx
const { t } = useTranslation();
return <p>{t('mySection.myKey')}</p>;
```

## Best Practices

1. **Always use translation keys** - Never hardcode strings
2. **Use descriptive keys** - `common.save` not `s1`
3. **Group related translations** - Use namespaces
4. **Test all languages** - Ensure layouts work in RTL
5. **Keep translations consistent** - Use the same key structure

## Testing

To test the implementation:

1. **Switch languages** using the LanguageToggle component
2. **Verify RTL layout** when Arabic is selected
3. **Check font rendering** for Amharic and Arabic
4. **Test localStorage persistence** - Refresh page, language should persist
5. **Test browser detection** - Clear localStorage, should detect browser language

## Troubleshooting

### Language not changing
- Check that i18n is initialized in `main.jsx`
- Verify LanguageProvider wraps the app
- Check browser console for errors

### RTL not working
- Verify `document.documentElement.dir` is set
- Check that `[dir="rtl"]` CSS is applied
- Ensure Tailwind RTL classes are used

### Fonts not loading
- Verify fonts are imported in `main.jsx`
- Check that font families are defined in `tailwind.config.js`
- Clear browser cache

## Next Steps

To complete the i18n implementation:

1. **Update remaining components** to use translation keys
2. **Add more translation keys** as needed
3. **Test thoroughly** in all three languages
4. **Update API responses** to support multilingual content (if needed)

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [RTL Support Guide](https://rtlstyling.com/)

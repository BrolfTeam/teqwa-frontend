# Translation Update Guide

## Status
✅ Translation keys added to en.json, am.json, and ar.json for all pages
✅ Services.jsx updated
✅ Ders.jsx updated

## Remaining Pages to Update

### Pattern to Follow:
1. Import `useTranslation` from 'react-i18next'
2. Call `const { t } = useTranslation();` in component
3. Replace hardcoded strings with `t('namespace.key')`

### Pages Still Needing Updates:

1. **Home.jsx** - Update hero section, quick actions, donation widget
2. **About.jsx** - Update all sections (mission, vision, values, timeline, team)
3. **Contact.jsx** - Update form labels, FAQ, contact info
4. **Membership.jsx** - Update membership tier descriptions
5. **Donations.jsx** - Update donation form and campaign descriptions
6. **Events.jsx** - Update event listings and filters
7. **News.jsx** - Update news listings and filters
8. **Gallery.jsx** - Update gallery categories and labels
9. **Futsal.jsx** - Update booking form and schedule
10. **Education.jsx** - Update course descriptions and filters
11. **PrayerTimes.jsx** - Update prayer time labels and Qibla section
12. **Itikaf.jsx** - Update program descriptions and registration

## Example Update Pattern:

**Before:**
```jsx
<h1>Our Services</h1>
<p>Serving the community...</p>
```

**After:**
```jsx
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <h1>{t('services.title')}</h1>
      <p>{t('services.subtitle')}</p>
    </>
  );
};
```

## Translation Keys Available

All keys are organized by page namespace:
- `home.*` - Home page
- `about.*` - About page
- `services.*` - Services page
- `contact.*` - Contact page
- `membership.*` - Membership page
- `donations.*` - Donations page
- `events.*` - Events page
- `news.*` - News page
- `gallery.*` - Gallery page
- `futsal.*` - Futsal page
- `education.*` - Education page
- `prayerTimes.*` - Prayer Times page
- `itikaf.*` - Itikaf page
- `ders.*` - Ders page

Check the locale files (en.json, am.json, ar.json) for complete list of available keys.

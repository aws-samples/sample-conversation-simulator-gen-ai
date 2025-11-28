# React i18n Implementation

This project uses `react-i18next` for internationalization. The implementation provides support for multiple languages with easy switching and translation management.

## Setup

The i18n configuration is automatically loaded when the app starts via `src/index.js`.

## Supported Languages

- **English (en)** - Default language
- **Spanish (es)** - Español
- **French (fr)** - Français

## Usage

### Basic Translation Hook

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('home.welcome')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### With Fallback Text

```javascript
const { t } = useTranslation();

// If the key doesn't exist, show fallback text
<p>{t('nonexistent.key', 'Fallback text here')}</p>
```

### Language Switching

```javascript
import { useTranslation } from 'react-i18next';

function LanguageButton() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <button onClick={() => changeLanguage('es')}>
      Switch to Spanish
    </button>
  );
}
```

### Current Language Detection

```javascript
const { i18n } = useTranslation();
console.log('Current language:', i18n.language);
```

## Translation Files Structure

Translation files are located in `src/i18n/locales/`:

```
src/i18n/locales/
├── en.json (English)
├── es.json (Spanish)
└── fr.json (French)
```

### Translation Key Structure

```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  },
  "navigation": {
    "home": "Home",
    "history": "My Presentations"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout"
  }
}
```

## Components

### LanguageSwitcher

A dropdown component for switching languages:

```javascript
import LanguageSwitcher from '../components/LanguageSwitcher';

function MyComponent() {
  return (
    <div>
      <LanguageSwitcher />
    </div>
  );
}
```

## Adding New Languages

1. Create a new JSON file in `src/i18n/locales/` (e.g., `de.json` for German)
2. Add all translation keys with appropriate translations
3. Update `src/i18n/index.js` to include the new language:

```javascript
import deTranslations from './locales/de.json';

const resources = {
  // ... existing languages
  de: {
    translation: deTranslations
  }
};
```

4. Update the `LanguageSwitcher` component to include the new language option

## Adding New Translation Keys

1. Add the key to all language files in `src/i18n/locales/`
2. Use the key in your components with the `t()` function

Example:
```json
// In en.json
{
  "buttons": {
    "download": "Download"
  }
}

// In es.json
{
  "buttons": {
    "download": "Descargar"
  }
}
```

```javascript
// In your component
const { t } = useTranslation();
<button>{t('buttons.download')}</button>
```

## Best Practices

1. **Organize keys logically** - Group related translations under common namespaces
2. **Use descriptive key names** - Make keys self-explanatory
3. **Provide fallbacks** - Always provide fallback text for important UI elements
4. **Keep translations consistent** - Use the same terminology across the app
5. **Test all languages** - Verify that text fits properly in all supported languages

## Debugging

Enable debug mode by setting `debug: true` in `src/i18n/index.js`. This will log missing translations and other i18n-related information to the console.
<h1 align="center">:flags: i18n-gap</h1>

<p align="center">A cli tool that keeps your translations in sync</p>

<pre align="center">npx <b>i18n-gap</b></pre>

## Features

- Works with JSON-based i18n setup
- No installation required — `npx i18n-gap`
- Detects missing translations across all languages
- Detects orphaned keys that don't exist in reference language
- Easy editing of missing translations via JSON

## Usage

By default, `i18n-gap` will use `en` as the reference language and compare all other languages against it.

<br>
<p align='center'>
<b>Find missing translations</b>
</p>

```bash
$ i18n-gap generate

Reference language: en
Analyzing 3 languages: en, fr, es

en: reference (42 keys)
fr: 6 missing
  app.title
  user.greeting
  ... +4 more
es: 12 missing

Generated: translation-gaps.json
```

This creates a `translation-gaps.json` file with all missing keys:

```json
{
  "fr": {
    "app.title": "My App",
    "user.greeting": "Hello, {{name}}!"
  },
  "es": {
    "app.title": "My App"
  }
}
```

Fill in the translations:

```json
{
  "fr": {
    "app.title": "Mon Application",
    "user.greeting": "Bonjour, {{name}} !"
  },
  "es": {
    "app.title": "Mi Aplicación"
  }
}
```

<br>
<p align='center'>
<b>Apply completed translations</b>
</p>

```bash
# Preview changes
$ i18n-gap apply --dry-run

fr: would add 6 translations
  + app.title: Mon Application
  + user.greeting: Bonjour, {{name}} !
  ...

# Apply when ready
$ i18n-gap apply

fr: +6
es: +12

Added 18 translations
```

<br>
<p align='center'>
<b>Check completion status</b>
</p>

```bash
$ i18n-gap stats

en     ██████████████████████████████ 100.0% 42/42 (reference)
fr     ████████████████████░░░░░░░░░░ 85.7% 36/42 (6 missing)
es     ███████████████░░░░░░░░░░░░░░░ 71.4% 30/42 (12 missing)

1/3 complete, 2 need attention

```
## Config

See `i18n-gap help` for more details.

### Config File

Create `.i18ngaprc.json` in your project root — `npx i18n-gap init`

```json
{
  "i18nDir": "./src/assets/i18n",
  "outputDir": "./",
  "referenceLang": "en",
  "ignoreLangs": []
}
```

### CLI Options

Override config with flags:

```bash
i18n-gap generate --dir ./locales --ref fr
i18n-gap generate --ignore dev,test
i18n-gap apply --dry-run
```

### Commands

```bash
i18n-gap generate      # Find missing translations
i18n-gap stats         # Show completion statistics
i18n-gap apply         # Merge completed translations
i18n-gap init          # Create config file
```

## License

[MIT](./LICENSE) License © 2025 [rznn7](https://github.com/rznn7)

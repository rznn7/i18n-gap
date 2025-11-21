const { colors } = require("../utils/logger");

function helpCommand() {
	console.log(`
${colors.cyan}i18n-gap${colors.reset} - Translation file manager

${colors.yellow}Commands:${colors.reset}
  generate    Generate missing translations file
  apply       Apply completed translations to source files
  stats       Show completion statistics
  init        Create a .i18ngaprc.json config file
  help        Show this help

${colors.yellow}Options:${colors.reset}
  -d, --dir <path>      i18n directory (default: ./src/assets/i18n)
  -o, --output <path>   Output directory (default: ./)
  -r, --ref <lang>      Reference language (default: en)
  -i, --ignore <langs>  Ignore languages (comma-separated)
  --dry-run             Preview changes without modifying files (apply only)

${colors.yellow}Configuration:${colors.reset}
  Create a .i18ngaprc.json file in your project root:
  {
    "i18nDir": "./locales",
    "outputDir": "./i18n-work",
    "ignoreLangs": ["fr", "it"],
    "referenceLang": "en"
  }
 
  CLI flags override config file settings.

${colors.yellow}Examples:${colors.reset}
  i18n-gap init
  i18n-gap generate
  i18n-gap generate --ref fr --ignore dev
  i18n-gap apply --dry-run
  i18n-gap apply
  i18n-gap stats

${colors.yellow}Workflow:${colors.reset}
  1. Run 'generate' → creates translation-gaps.json
  2. Translate
  3. Run 'apply --dry-run' → preview changes
  4. Run 'apply' → integrates completed translations

${colors.yellow}Notes:${colors.reset}
  The reference language is the source of truth for all keys.
  Other languages are compared against it to find missing translations.
`);
}

module.exports = { helpCommand };

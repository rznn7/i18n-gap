const fs = require("node:fs");
const path = require("node:path");
const { log } = require("./logger");

function loadTranslations(config) {
	if (!fs.existsSync(config.i18nDir)) {
		log.error(`Directory not found: ${config.i18nDir}`);
		process.exit(1);
	}

	const languageFiles = fs
		.readdirSync(config.i18nDir)
		.filter((file) => file.endsWith(".json"));

	if (languageFiles.length === 0) {
		log.error(`No JSON files in ${config.i18nDir}`);
		process.exit(1);
	}

	const translations = {};
	languageFiles.forEach((file) => {
		const lang = file.replace(".json", "");

		if (config.ignoreLangs.includes(lang)) {
			return;
		}

		const filePath = path.join(config.i18nDir, file);
		try {
			translations[lang] = JSON.parse(fs.readFileSync(filePath, "utf8"));
		} catch (e) {
			log.error(`Failed to parse ${file}: ${e.message}`);
			process.exit(1);
		}
	});

	if (Object.keys(translations).length === 0) {
		log.error("No valid translation files found");
		process.exit(1);
	}

	return translations;
}

module.exports = { loadTranslations };

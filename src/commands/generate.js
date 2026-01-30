const fs = require("node:fs");
const path = require("node:path");
const { log } = require("../utils/logger");
const { loadTranslations } = require("../utils/translations");
const { flattenObject } = require("../utils/flatten");

function generateCommand(config) {
	const translations = loadTranslations(config);

	if (!translations[config.referenceLang]) {
		log.error(`Reference language '${config.referenceLang}' not found`);
		log.dim(`Available languages: ${Object.keys(translations).join(", ")}`);
		process.exit(1);
	}

	const languages = Object.keys(translations);

	log.dim(`Reference language: ${config.referenceLang}`);
	log.dim(`Analyzing ${languages.length} languages: ${languages.join(", ")}`);

	const referenceFlat = flattenObject(translations[config.referenceLang]);
	const referenceKeys = Object.keys(referenceFlat);

	const flatTranslations = {};
	Object.keys(translations).forEach((lang) => {
		flatTranslations[lang] = flattenObject(translations[lang]);
	});

	const keysWithGaps = new Set();
	const gapCounts = {};

	languages.forEach((lang) => {
		if (lang === config.referenceLang) return;

		gapCounts[lang] = 0;
		referenceKeys.forEach((key) => {
			if (!flatTranslations[lang][key]) {
				keysWithGaps.add(key);
				gapCounts[lang]++;
			}
		});
	});

	const orphans = {};
	languages.forEach((lang) => {
		if (lang === config.referenceLang) return;

		const extraKeys = Object.keys(flatTranslations[lang]).filter(
			(key) => !referenceKeys.includes(key),
		);

		if (extraKeys.length > 0) {
			orphans[lang] = extraKeys;
		}
	});

	const hasGaps = keysWithGaps.size > 0;

	if (!hasGaps && Object.keys(orphans).length === 0) {
		log.success("All translations complete and aligned");
		return;
	}

	const output = {};
	const sortedKeysWithGaps = Array.from(keysWithGaps).sort();

	sortedKeysWithGaps.forEach((key) => {
		output[key] = {};
		languages.forEach((lang) => {
			output[key][lang] = flatTranslations[lang][key] || "";
		});
	});

	const outputPath = path.join(config.outputDir, "translation-gaps.json");
	fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

	log.plain("");
	log.info(`Keys with gaps: ${keysWithGaps.size}`);
	log.plain("");
	languages.forEach((lang) => {
		if (lang === config.referenceLang) {
			log.info(`${lang}: reference (${referenceKeys.length} keys)`);
			return;
		}

		const count = gapCounts[lang];

		if (count > 0) {
			log.warn(`${lang}: ${count} missing`);
		} else {
			log.success(`${lang}: complete`);
		}
	});

	// Show orphaned keys warning
	if (Object.keys(orphans).length > 0) {
		log.plain("");
		log.warn("!  Orphaned keys (not in reference language):");
		Object.keys(orphans).forEach((lang) => {
			log.dim(`  ${lang}: ${orphans[lang].length} extra keys`);
			orphans[lang].slice(0, 3).forEach((key) => {
				log.dim(`    - ${key}`);
			});
			if (orphans[lang].length > 3) {
				log.dim(`    ... +${orphans[lang].length - 3} more`);
			}
		});
		log.dim(
			"\n  Consider removing these keys or adding them to the reference language",
		);
	}

	log.plain("");
	log.info(`Generated: ${outputPath}`);
}

module.exports = { generateCommand };

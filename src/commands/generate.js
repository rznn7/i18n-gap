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

	// Flatten reference translation (source of truth)
	const referenceFlat = flattenObject(translations[config.referenceLang]);
	const referenceKeys = Object.keys(referenceFlat);

	// Flatten all translations
	const flatTranslations = {};
	Object.keys(translations).forEach((lang) => {
		flatTranslations[lang] = flattenObject(translations[lang]);
	});

	// Find gaps (only check against reference keys)
	const gaps = {};
	languages.forEach((lang) => {
		if (lang === config.referenceLang) return; // skip reference

		gaps[lang] = {};
		referenceKeys.forEach((key) => {
			if (!flatTranslations[lang][key]) {
				gaps[lang][key] = referenceFlat[key];
			}
		});
	});

	// Check for orphaned keys (keys in other languages but not in reference)
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

	// Check if there are any gaps
	const hasGaps = Object.values(gaps).some(
		(langGaps) => Object.keys(langGaps).length > 0,
	);

	if (!hasGaps && Object.keys(orphans).length === 0) {
		log.success("All translations complete and aligned");
		return;
	}

	// Save gaps file
	const outputPath = path.join(config.outputDir, "translation-gaps.json");
	fs.writeFileSync(outputPath, JSON.stringify(gaps, null, 2));

	// Print summary
	log.plain("");
	languages.forEach((lang) => {
		if (lang === config.referenceLang) {
			log.info(`${lang}: reference (${referenceKeys.length} keys)`);
			return;
		}

		const count = Object.keys(gaps[lang]).length;

		if (count > 0) {
			log.warn(`${lang}: ${count} missing`);

			if (count <= 3) {
				Object.keys(gaps[lang]).forEach((key) => {
					log.dim(`  ${key}`);
				});
			} else {
				Object.keys(gaps[lang])
					.slice(0, 2)
					.forEach((key) => {
						log.dim(`  ${key}`);
					});
				log.dim(`  ... +${count - 2} more`);
			}
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

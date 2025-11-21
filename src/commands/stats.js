const { log, colors } = require("../utils/logger");
const { loadTranslations } = require("../utils/translations");
const { flattenObject } = require("../utils/flatten");

function statsCommand(config) {
	const translations = loadTranslations(config);

	if (!translations[config.referenceLang]) {
		log.error(`Reference language '${config.referenceLang}' not found`);
		log.dim(`Available languages: ${Object.keys(translations).join(", ")}`);
		process.exit(1);
	}

	const languages = Object.keys(translations);

	// Flatten reference translation (source of truth)
	const referenceFlat = flattenObject(translations[config.referenceLang]);
	const referenceKeys = Object.keys(referenceFlat);
	const totalKeys = referenceKeys.length;

	// Flatten all translations
	const flatTranslations = {};
	Object.keys(translations).forEach((lang) => {
		flatTranslations[lang] = flattenObject(translations[lang]);
	});

	log.dim(`Reference language: ${config.referenceLang}`);
	log.dim(`Total keys: ${totalKeys}`);
	log.dim(`Languages: ${languages.length} (${languages.join(", ")})`);
	log.plain("");

	// Calculate stats for each language
	const languageStats = languages.map((lang) => {
		const langKeys = Object.keys(flatTranslations[lang]);

		// Check against reference keys (or own keys for reference language)
		const keysToCheck =
			lang === config.referenceLang ? langKeys : referenceKeys;

		// Count empty values (present but empty/null/"")
		const emptyCount = keysToCheck.filter((key) => {
			const hasKey = Object.hasOwn(flatTranslations[lang], key);
			if (!hasKey) return false; // Not empty, it's missing
			const value = flatTranslations[lang][key];
			return (
				value === null || value === undefined || value.toString().trim() === ""
			);
		}).length;

		// Count missing values (not present in object)
		const missingCount =
			lang === config.referenceLang
				? 0
				: referenceKeys.filter(
						(key) => !Object.hasOwn(flatTranslations[lang], key),
					).length;

		const orphanedCount =
			lang === config.referenceLang
				? 0
				: langKeys.filter((key) => !referenceKeys.includes(key)).length;

		const validCount = keysToCheck.filter((key) => {
			const hasKey = Object.hasOwn(flatTranslations[lang], key);
			if (!hasKey) return false;
			const value = flatTranslations[lang][key];
			return (
				value !== undefined && value !== null && value.toString().trim() !== ""
			);
		}).length;

		const percentage = ((validCount / totalKeys) * 100).toFixed(1);

		return {
			lang,
			total: langKeys.length,
			valid: validCount,
			empty: emptyCount,
			missing: missingCount,
			orphaned: orphanedCount,
			percentage: percentage,
			isReference: lang === config.referenceLang,
		};
	});

	// Sort by completion percentage (descending), reference first
	languageStats.sort((a, b) => {
		if (a.isReference) return -1;
		if (b.isReference) return 1;
		return parseFloat(b.percentage) - parseFloat(a.percentage);
	});

	// Display progress bars
	languageStats.forEach(
		({ lang, valid, empty, missing, orphaned, percentage, isReference }) => {
			const barLength = 30;
			const filled = Math.floor((percentage / 100) * barLength);
			const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

			const color =
				percentage === "100.0"
					? colors.green
					: percentage >= "80.0"
						? colors.yellow
						: colors.red;

			let status = `${valid}/${totalKeys}`;
			if (isReference) {
				status += ` ${colors.cyan}(reference)${colors.reset}`;
			}
			if (empty > 0) status += ` ${colors.dim}(${empty} empty)${colors.reset}`;
			if (missing > 0)
				status += ` ${colors.red}(${missing} missing)${colors.reset}`;
			if (orphaned > 0)
				status += ` ${colors.yellow}(${orphaned} extra)${colors.reset}`;

			console.log(
				`${lang.padEnd(6)} ${color}${bar}${colors.reset} ${percentage}% ${colors.dim}${status}${colors.reset}`,
			);
		},
	);

	// Summary
	log.plain("");
	// Check ALL languages (including reference) for completion
	const complete = languageStats.filter(
		(s) => s.percentage === "100.0" && s.empty === 0 && s.missing === 0,
	).length;
	const needAttention = languageStats.length - complete;

	if (complete === languageStats.length) {
		log.success(`All ${languageStats.length} languages complete! 🎉`);
	} else {
		log.info(
			`${complete}/${languageStats.length} complete, ${needAttention} need attention`,
		);
	}
}

module.exports = { statsCommand };

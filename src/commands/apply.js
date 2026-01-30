const fs = require("node:fs");
const path = require("node:path");
const { log } = require("../utils/logger");
const { flattenObject, unflattenObject } = require("../utils/flatten");

function applyCommand(config) {
	const gapsFile = path.join(config.outputDir, "translation-gaps.json");

	if (!fs.existsSync(gapsFile)) {
		log.error(`File not found: ${gapsFile}`);
		log.dim("Run 'generate' command first");
		process.exit(1);
	}

	if (config.dryRun) {
		log.info("DRY RUN MODE - No files will be modified");
		log.plain("");
	}

	const completedTranslations = JSON.parse(fs.readFileSync(gapsFile, "utf8"));
	let updatedCount = 0;
	let skippedCount = 0;

	const byLang = {};
	Object.keys(completedTranslations).forEach((key) => {
		Object.keys(completedTranslations[key]).forEach((lang) => {
			if (!byLang[lang]) {
				byLang[lang] = {};
			}
			byLang[lang][key] = completedTranslations[key][lang];
		});
	});

	Object.keys(byLang).forEach((lang) => {
		const filePath = path.join(config.i18nDir, `${lang}.json`);

		if (!fs.existsSync(filePath)) {
			log.warn(`${lang}: file not found, skipping`);
			return;
		}

		const current = JSON.parse(fs.readFileSync(filePath, "utf8"));
		const flat = flattenObject(current);

		let langUpdated = 0;
		const updates = [];
		Object.keys(byLang[lang]).forEach((key) => {
			const value = byLang[lang][key];

			if (value && value.trim() !== "" && flat[key] !== value) {
				flat[key] = value;
				langUpdated++;
				updates.push({ key, value });
			} else if (!value || value.trim() === "") {
				skippedCount++;
			}
		});

		if (langUpdated > 0) {
			if (config.dryRun) {
				log.info(
					`${lang}: would add ${langUpdated} translation${langUpdated === 1 ? "" : "s"}`,
				);
				updates.forEach(({ key, value }) => {
					log.dim(`  + ${key}: ${value}`);
				});
			} else {
				const updated = unflattenObject(flat);
				fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
				log.success(`${lang}: +${langUpdated}`);
			}
			updatedCount += langUpdated;
		} else {
			log.dim(`${lang}: no changes`);
		}
	});

	log.plain("");
	if (config.dryRun) {
		log.info(
			`Would add ${updatedCount} translation${updatedCount === 1 ? "" : "s"}`,
		);
		if (skippedCount > 0) {
			log.dim(`Would skip ${skippedCount} empty entries`);
		}
		log.plain("");
		log.dim("Run without --dry-run to apply changes");
	} else {
		log.info(`Added ${updatedCount} translations`);
		if (skippedCount > 0) {
			log.dim(`Skipped ${skippedCount} empty entries`);
		}
	}
}

module.exports = { applyCommand };

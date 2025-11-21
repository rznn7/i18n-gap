const fs = require("node:fs");
const path = require("node:path");
const { log } = require("./utils/logger");

const defaultConfig = {
	i18nDir: "./src/assets/i18n",
	outputDir: "./",
	ignoreLangs: [],
	referenceLang: "en",
};

function loadConfig() {
	const configPath = path.join(process.cwd(), ".i18ngaprc.json");
	if (fs.existsSync(configPath)) {
		try {
			const fileConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
			log.dim("Loaded config from .i18ngaprc.json");
			return { ...defaultConfig, ...fileConfig };
		} catch (e) {
			log.warn(`Failed to parse .i18ngaprc.json: ${e.message}`);
			log.dim("Using default configuration");
			return { ...defaultConfig };
		}
	}
	return { ...defaultConfig };
}

module.exports = { loadConfig, defaultConfig };

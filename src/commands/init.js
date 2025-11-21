const fs = require("node:fs");
const path = require("node:path");
const { log } = require("../utils/logger");

function initCommand() {
	const configPath = path.join(process.cwd(), ".i18ngaprc.json");

	if (fs.existsSync(configPath)) {
		log.warn(".i18ngaprc.json already exists");
		log.dim("Edit the file manually or delete it to create a new one");
		return;
	}

	const exampleConfig = {
		i18nDir: "./src/assets/i18n",
		outputDir: "./",
		ignoreLangs: [],
		referenceLang: "en",
	};

	fs.writeFileSync(configPath, JSON.stringify(exampleConfig, null, 2));
	log.success("Created .i18ngaprc.json");
	log.dim("Edit the file to customize your configuration");
}

module.exports = { initCommand };

function parseArgs(args, config) {
	const command = args[0];
	const flags = { ...config };

	for (let i = 1; i < args.length; i++) {
		if (args[i] === "--dir" || args[i] === "-d") {
			flags.i18nDir = args[++i];
		} else if (args[i] === "--output" || args[i] === "-o") {
			flags.outputDir = args[++i];
		} else if (args[i] === "--ignore" || args[i] === "-i") {
			flags.ignoreLangs = args[++i].split(",").map((lang) => lang.trim());
		} else if (args[i] === "--ref" || args[i] === "-r") {
			flags.referenceLang = args[++i];
		} else if (args[i] === "--dry-run") {
			flags.dryRun = true;
		}
	}

	return { command, flags };
}

module.exports = { parseArgs };

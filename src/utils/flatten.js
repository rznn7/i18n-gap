const { log } = require("./logger");

function flattenObject(obj, prefix = "") {
	const flattened = {};

	Object.keys(obj).forEach((key) => {
		if (key.includes("\\")) {
			log.error(`Invalid key "${key}" contains backslash`);
			process.exit(1);
		}

		const safeKey = key.replace(/\./g, "\\.");
		const newKey = prefix ? `${prefix}.${safeKey}` : safeKey;
		const value = obj[key];

		if (value && typeof value === "object" && !Array.isArray(value)) {
			// Check if object is empty
			if (Object.keys(value).length === 0) {
				// Preserve empty objects as empty string
				flattened[newKey] = "";
			} else {
				Object.assign(flattened, flattenObject(value, newKey));
			}
		} else {
			flattened[newKey] = value;
		}
	});

	return flattened;
}

function unflattenObject(obj) {
	const result = {};

	Object.keys(obj).forEach((key) => {
		const parts = key.split(/(?<!\\)\./).map((k) => k.replace(/\\\./g, "."));
		let current = result;

		for (let i = 0; i < parts.length - 1; i++) {
			if (!current[parts[i]]) current[parts[i]] = {};
			current = current[parts[i]];
		}

		current[parts[parts.length - 1]] = obj[key];
	});

	return result;
}

module.exports = { flattenObject, unflattenObject };

const { log } = require("./logger");

/**
 * Flattens a nested object into a single-level object with dot-notation keys.
 * Keys containing dots are escaped with backslashes.
 */
function flattenObject(obj, prefix = "") {
	const flattened = {};
	const leafPaths = new Set();

	validateKeys(obj);

	Object.keys(obj).forEach((key) => {
		const escapedKey = escapeDotsInKey(key);
		const fullPath = buildFullPath(prefix, escapedKey);
		const value = obj[key];

		checkForConflicts(key, prefix, leafPaths);

		if (isNonEmptyObject(value)) {
			validateNestedStructure(value);
			Object.assign(flattened, flattenObject(value, fullPath));
		} else {
			flattened[fullPath] = isEmptyObject(value) ? "" : value;
			leafPaths.add(fullPath);
		}
	});

	return flattened;
}

/**
 * Unflattens a dot-notation object back into a nested structure.
 * Handles escaped dots in keys.
 */
function unflattenObject(obj) {
	const result = {};

	Object.keys(obj).forEach((flatKey) => {
		const keyParts = splitAndUnescapeKey(flatKey);
		const finalValue = obj[flatKey];

		let current = result;
		for (let i = 0; i < keyParts.length - 1; i++) {
			const part = keyParts[i];
			if (!current[part]) {
				current[part] = {};
			}
			current = current[part];
		}

		const lastKey = keyParts[keyParts.length - 1];
		current[lastKey] = finalValue;
	});

	return result;
}

function validateKeys(obj) {
	Object.keys(obj).forEach((key) => {
		if (key.includes("\\")) {
			log.error(`Invalid key "${key}" contains backslash`);
			process.exit(1);
		}
	});
}

function escapeDotsInKey(key) {
	return key.replace(/\./g, "\\.");
}

function buildFullPath(prefix, key) {
	return prefix ? `${prefix}.${key}` : key;
}

function isNonEmptyObject(value) {
	return (
		value &&
		typeof value === "object" &&
		!Array.isArray(value) &&
		Object.keys(value).length > 0
	);
}

function isEmptyObject(value) {
	return (
		value &&
		typeof value === "object" &&
		!Array.isArray(value) &&
		Object.keys(value).length === 0
	);
}

function checkForConflicts(key, prefix, leafPaths) {
	if (!key.includes(".")) return;

	const keyBeforeDot = key.split(".")[0];
	const potentialConflictPath = prefix
		? `${prefix}.${keyBeforeDot}`
		: keyBeforeDot;

	if (leafPaths.has(potentialConflictPath)) {
		log.error(
			`Conflicting key structure: "${key}" conflicts with existing value at "${keyBeforeDot}"`,
		);
		process.exit(1);
	}
}

function validateNestedStructure(obj) {
	const nestedKeys = Object.keys(obj);

	nestedKeys.forEach((nestedKey) => {
		if (!nestedKey.includes(".")) return;

		const keyPrefix = nestedKey.split(".")[0];

		if (nestedKeys.includes(keyPrefix)) {
			log.error(
				`Conflicting key structure: "${nestedKey}" conflicts with existing key "${keyPrefix}"`,
			);
			process.exit(1);
		}
	});
}

function splitAndUnescapeKey(flatKey) {
	// Split on dots that aren't preceded by backslashes
	return flatKey.split(/(?<!\\)\./).map((part) => part.replace(/\\\./g, "."));
}

module.exports = { flattenObject, unflattenObject };

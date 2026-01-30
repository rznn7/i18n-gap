import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateCommand } from "./generate";

const { log } = require("../utils/logger");

describe("generateCommand", () => {
	let tempDir;
	let i18nDir;
	let outputDir;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-gap-test-"));
		i18nDir = path.join(tempDir, "i18n");
		outputDir = path.join(tempDir, "output");
		fs.mkdirSync(i18nDir);
		fs.mkdirSync(outputDir);

		vi.spyOn(process, "exit").mockImplementation(() => {
			throw new Error("process exited");
		});
		vi.spyOn(log, "error").mockImplementation(() => {});
		vi.spyOn(log, "warn").mockImplementation(() => {});
		vi.spyOn(log, "info").mockImplementation(() => {});
		vi.spyOn(log, "success").mockImplementation(() => {});
		vi.spyOn(log, "dim").mockImplementation(() => {});
		vi.spyOn(log, "plain").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	function writeTranslation(lang, content) {
		fs.writeFileSync(
			path.join(i18nDir, `${lang}.json`),
			JSON.stringify(content, null, 2),
		);
	}

	function readOutput() {
		const outputPath = path.join(outputDir, "translation-gaps.json");
		if (!fs.existsSync(outputPath)) return null;
		return JSON.parse(fs.readFileSync(outputPath, "utf8"));
	}

	function runGenerate(overrides = {}) {
		return generateCommand({
			i18nDir,
			outputDir,
			referenceLang: "en",
			ignoreLangs: [],
			...overrides,
		});
	}

	it("should generate gaps file with correct format - keys grouped with all languages", () => {
		writeTranslation("en", {
			greeting: "Hello",
			farewell: "Goodbye",
			thanks: "Thank you",
		});
		writeTranslation("fr", {
			greeting: "Bonjour",
			thanks: "Merci",
		});
		writeTranslation("es", {
			greeting: "Hola",
			farewell: "Adios",
		});

		runGenerate();

		const output = readOutput();
		expect(output).toEqual({
			farewell: {
				en: "Goodbye",
				fr: "",
				es: "Adios",
			},
			thanks: {
				en: "Thank you",
				fr: "Merci",
				es: "",
			},
		});
	});

	it("should handle nested translation keys", () => {
		writeTranslation("en", {
			user: {
				profile: {
					name: "Name",
					email: "Email",
				},
				settings: {
					theme: "Theme",
				},
			},
		});
		writeTranslation("fr", {
			user: {
				profile: {
					name: "Nom",
				},
				settings: {
					theme: "Theme",
				},
			},
		});

		runGenerate();

		const output = readOutput();
		expect(output).toEqual({
			"user.profile.email": {
				en: "Email",
				fr: "",
			},
		});
	});

	it("should not create output file when all translations are complete", () => {
		writeTranslation("en", { greeting: "Hello" });
		writeTranslation("fr", { greeting: "Bonjour" });
		writeTranslation("es", { greeting: "Hola" });

		runGenerate();

		expect(readOutput()).toBeNull();
	});

	it("should treat empty strings as missing translations", () => {
		writeTranslation("en", { greeting: "Hello", farewell: "Goodbye" });
		writeTranslation("fr", { greeting: "", farewell: "Au revoir" });

		runGenerate();

		const output = readOutput();
		expect(output).toEqual({
			greeting: {
				en: "Hello",
				fr: "",
			},
		});
	});

	it("should exit when reference language is not found", () => {
		writeTranslation("fr", { greeting: "Bonjour" });
		writeTranslation("es", { greeting: "Hola" });

		expect(() => runGenerate({ referenceLang: "en" })).toThrow(
			"process exited",
		);
	});
});

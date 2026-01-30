import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyCommand } from "./apply";

const { log } = require("../utils/logger");

describe("applyCommand", () => {
	let tempDir;
	let i18nDir;
	let outputDir;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-gap-test-"));
		i18nDir = path.join(tempDir, "i18n");
		outputDir = tempDir;
		fs.mkdirSync(i18nDir);

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

	function readTranslation(lang) {
		return JSON.parse(
			fs.readFileSync(path.join(i18nDir, `${lang}.json`), "utf8"),
		);
	}

	function writeGapsFile(content) {
		fs.writeFileSync(
			path.join(outputDir, "translation-gaps.json"),
			JSON.stringify(content, null, 2),
		);
	}

	function runApply(overrides = {}) {
		return applyCommand({
			i18nDir,
			outputDir,
			dryRun: false,
			...overrides,
		});
	}

	it("should apply new translations from gaps file to language files", () => {
		writeTranslation("en", { greeting: "Hello", farewell: "Goodbye" });
		writeTranslation("fr", { greeting: "Bonjour" });
		writeTranslation("es", { greeting: "Hola" });

		writeGapsFile({
			farewell: {
				en: "Goodbye",
				fr: "Au revoir",
				es: "Adios",
			},
		});

		runApply();

		expect(readTranslation("fr")).toEqual({
			greeting: "Bonjour",
			farewell: "Au revoir",
		});
		expect(readTranslation("es")).toEqual({
			greeting: "Hola",
			farewell: "Adios",
		});
	});

	it("should skip empty values and not overwrite existing translations", () => {
		writeTranslation("en", { greeting: "Hello", farewell: "Goodbye" });
		writeTranslation("fr", { greeting: "Bonjour" });
		writeTranslation("es", { greeting: "Hola", farewell: "Adios" });

		writeGapsFile({
			farewell: {
				en: "Goodbye",
				fr: "",
				es: "Adios",
			},
		});

		runApply();

		expect(readTranslation("fr")).toEqual({
			greeting: "Bonjour",
		});
		expect(readTranslation("es")).toEqual({
			greeting: "Hola",
			farewell: "Adios",
		});
	});

	it("should handle nested keys correctly", () => {
		writeTranslation("en", {
			user: { profile: { name: "Name", email: "Email" } },
		});
		writeTranslation("fr", {
			user: { profile: { name: "Nom" } },
		});

		writeGapsFile({
			"user.profile.email": {
				en: "Email",
				fr: "Courriel",
			},
		});

		runApply();

		expect(readTranslation("fr")).toEqual({
			user: { profile: { name: "Nom", email: "Courriel" } },
		});
	});

	it("should not modify files in dry-run mode", () => {
		writeTranslation("en", { greeting: "Hello" });
		writeTranslation("fr", {});

		writeGapsFile({
			greeting: {
				en: "Hello",
				fr: "Bonjour",
			},
		});

		runApply({ dryRun: true });

		expect(readTranslation("fr")).toEqual({});
	});

	it("should exit when gaps file does not exist", () => {
		writeTranslation("en", { greeting: "Hello" });

		expect(() => runApply()).toThrow("process exited");
	});

	it("should update existing translations if value has changed", () => {
		writeTranslation("en", { greeting: "Hello" });
		writeTranslation("fr", { greeting: "Salut" });

		writeGapsFile({
			greeting: {
				en: "Hello",
				fr: "Bonjour",
			},
		});

		runApply();

		expect(readTranslation("fr")).toEqual({
			greeting: "Bonjour",
		});
	});
});

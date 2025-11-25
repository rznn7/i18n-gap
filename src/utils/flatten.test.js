import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flattenObject } from "./flatten";

const { log } = require("./logger");

describe("flattenObject", () => {
	beforeEach(() => {
		vi.spyOn(process, "exit").mockImplementation(() => {
			throw new Error("process exited");
		});
		vi.spyOn(log, "error").mockImplementation(() => {
			/* hide logs */
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("exit when key contains backslash", () => {
		const inputJson = {
			aKey: {
				bKey: "I am the b key",
				"bKey\\cKey": "Invalid key with backslash",
			},
		};

		expect(() => flattenObject(inputJson)).toThrow("process exited");
	});

	describe("plain notation", () => {
		it("should work with legit plain notation", () => {
			const inputJson = {
				aKey: {
					bKey: "I am the b key",
					"zKey.bKey": "I am the z then b key",
					"yKey.wKey.aKey.bKey": "I am the y then w key",
				},
			};

			const res = flattenObject(inputJson);

			expect(res).toEqual({
				"aKey.bKey": "I am the b key",
				"aKey.yKey\\.wKey\\.aKey\\.bKey": "I am the y then w key",
				"aKey.zKey\\.bKey": "I am the z then b key",
			});
		});

		it("exit when key cause conflicting structure (value + nested keys)", () => {
			const inputJson = {
				aKey: {
					bKey: "I am the b key",
					"bKey.cKey": "Am I the b key + c key?",
				},
			};

			expect(() => flattenObject(inputJson)).toThrow("process exited");
		});
	});
});

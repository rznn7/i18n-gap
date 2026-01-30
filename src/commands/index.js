const { generateCommand } = require("./generate");
const { applyCommand } = require("./apply");
const { statsCommand } = require("./stats");
const { initCommand } = require("./init");
const { helpCommand } = require("./help");
const { versionCommand } = require("./version");

module.exports = {
	generateCommand,
	applyCommand,
	statsCommand,
	initCommand,
	helpCommand,
	versionCommand,
};

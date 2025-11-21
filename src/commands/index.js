const { generateCommand } = require("./generate");
const { applyCommand } = require("./apply");
const { statsCommand } = require("./stats");
const { initCommand } = require("./init");
const { helpCommand } = require("./help");

module.exports = {
	generateCommand,
	applyCommand,
	statsCommand,
	initCommand,
	helpCommand,
};

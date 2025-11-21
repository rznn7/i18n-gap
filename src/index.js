#!/usr/bin/env node

const { loadConfig } = require("./config");
const { parseArgs } = require("./cli/args");
const { log } = require("./utils/logger");
const {
	generateCommand,
	applyCommand,
	statsCommand,
	initCommand,
	helpCommand,
} = require("./commands");

const config = loadConfig();

const { command, flags } = parseArgs(process.argv.slice(2), config);

switch (command) {
	case "generate":
		generateCommand(flags);
		break;
	case "apply":
		applyCommand(flags);
		break;
	case "stats":
		statsCommand(flags);
		break;
	case "init":
		initCommand();
		break;
	case "help":
	case undefined:
		helpCommand();
		break;
	default:
		log.error(`Unknown command: ${command}`);
		log.plain("");
		helpCommand();
		process.exit(1);
}

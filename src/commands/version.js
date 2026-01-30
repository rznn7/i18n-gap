const { version } = require("../../package.json");

function versionCommand() {
	console.log(version);
}

module.exports = { versionCommand };

const colors = {
	reset: "\x1b[0m",
	dim: "\x1b[2m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
};

const log = {
	error: (msg) => console.error(`${colors.red}${msg}${colors.reset}`),
	success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
	info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
	warn: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
	dim: (msg) => console.log(`${colors.dim}${msg}${colors.reset}`),
	plain: (msg) => console.log(msg),
};

module.exports = { log, colors };

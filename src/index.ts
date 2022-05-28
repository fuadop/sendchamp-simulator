#!/usr/bin/env node
import minimist from "minimist";
import buildOptions from "minimist-options";
import Simulator from "./app";

const options = buildOptions({
	phone: {
		alias: "p",
		default: "2349153207998",
		type: "string",
	},
});
const argv = minimist(process.argv.slice(2), options);

// validate phone number length
if (argv.phone.length != 13) {
	console.log(
		`Invalid phone number: "${argv.phone}", should be in format: "2349153207998"`
	);
	process.exit(1);
}

let app: Simulator;
(async () => {
	app = new Simulator(argv.phone, 2920);
	app.start();

	process.on("SIGINT", stop);
	process.on("SIGTERM", stop);
})();

async function stop() {
	try {
		app.stop();
	} catch (e) {}
	process.exit(0);
}

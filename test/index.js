var less = require("less"),
    lessTest = require("less/test/less-test"),
    lessTester = lessTest(),
    plugin = require('../lib'),
    stylize = less.lesscHelper.stylize;

console.log("\n" + stylize("LESS - theme creator", 'underline') + "\n");

lessTester.runTestSet(
    {
		relativeUrls: true,
		silent: false,
		plugins: [new plugin({
			themedVariables: ['@brand-primary']
		})]
	},
    "/"
);
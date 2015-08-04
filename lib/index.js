var getThemeCreator = require("./theme-creator"),
    parseOptions = require("./parse-options");


function LessPluginThemeCreator(options) {
  this.options = options;
}

LessPluginThemeCreator.prototype = {
    install: function(less, pluginManager) {
		var ThemeCreator = getThemeCreator(less);
		var ThemeCreatorInstance = new ThemeCreator(this.options);
        pluginManager.addVisitor(ThemeCreatorInstance);
		pluginManager.addPostProcessor(ThemeCreatorInstance);
    },
    setOptions: function(options) {
        this.options = parseOptions(options);
    },
    minVersion: [2, 5, 0]
};

module.exports = LessPluginThemeCreator;
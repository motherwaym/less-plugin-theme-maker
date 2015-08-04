module.exports = {
    printUsage: function() {
        console.log("Theme Creator Plugin");
        console.log("specify plugin with --theme-creator");
        this.printOptions();
    },
    printOptions: function() {
      console.log("sorry, we currently don't support any options...");
    }

};

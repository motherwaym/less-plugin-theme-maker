// based on https://github.com/hoogi/less-plugin-theme-creator

var CleanCSS = require('clean-css');

module.exports = function(less) {
  function ThemeCreator(options, type) {
    this.options = options || {};

    this._themedVariables = this.options.themedVariables || [];
    this._excludeMixinName = this.options.excludeMixinName || '';

    this._excludes = Object.keys(this._themedVariables) || [];
    this._mixinExcludes = [];
    this._visitor = new less.visitors.Visitor(this);
  }

  ThemeCreator.prototype = {
    isReplacing: true,
    isPreEvalVisitor: true,

    run: function(root) {
      return this._visitor.visit(root);
    },

    process: function(css, extra) {
      // clean css after all operations - just clean up
      css = new CleanCSS({
        aggressiveMerging: false,
        keepBreaks: true,
        keepSpecialComments: 0
      }).minify(css).styles;
      return css;
    },

    visitRule: function(ruleNode, visitArgs) {
      this._inNonRuleDef = false;
      if (ruleNode.variable === true) {
        this._inVariableRule = true;
        this._currentVariableRuleName = ruleNode.name;
      } else {
        // evaluate if rule has to be removed
         this._deleteNode = true;
        ruleNode.accept(this._visitor);
        // remove rule if needed
        if (this._deleteNode && !this._inExcludeMixinDef) {
          ruleNode = new(less.tree.Comment)(['']);
        }
      }

      return ruleNode;
    },

    visitRuleOut: function(ruleNode) {
      this._inVariableRule = false;
    },

    visitMixinDefinition: function(mixinNode, visitArgs) {
      this._inMixinDef = true;
      // create mixin excludes before iterate underlaying rules
      this._mixinExcludes = [];
      this._inExcludeMixinDef = this._excludeMixinName && mixinNode.name == this._excludeMixinName;
      if (mixinNode.params.length) {
        for (var i = 0; i < mixinNode.params.length; i++) {
          this._mixinExcludes.push(mixinNode.params[i].name);
        }
      }
      return mixinNode;
    },

    visitMixinDefinitionOut: function(mixinNode) {
      this._inMixinDef = false;
    },

    visitMixinCall: function(mixinNode, visitArgs) {
      // evaluate if rule has to be removed - original arguments are simple array...
      this._deleteNode = true;
      this._inMixinCall = true;
      if (Array.isArray(mixinNode.arguments) && mixinNode.arguments.length) {
        for (var i = 0; i < mixinNode.arguments.length; i++) {
          mixinNode.arguments[i].value.accept(this._visitor);
        }
      } else {
        mixinNode.accept(this._visitor);
        this._deleteNode = false;
      }
      // remove rule if needed
      if (this._deleteNode) {
        mixinNode = new(less.tree.Comment)(['']);
      }

      return mixinNode;
    },

    visitMixinCallOut: function(mixinNode) {
      this._inMixinCall = false;
    },

    visitMedia: function (mediaNode, visitArgs) {
      return new(less.tree.Comment)(['']);
    },

    visitImport: function (importNode, visitArgs) {
      if (importNode.importedFilename && importNode.importedFilename.indexOf('.css') !== -1)
        return new(less.tree.Comment)(['']);

      return importNode;
    },

    visitVariable: function(variableNode, visitArgs) {
      // check if variable has a replacement or node is inside excluded
      var newValue = this.themeReplacesNodeValue(variableNode.name);
      var isExcluded = Array.isArray(this._excludes) && this._excludes.indexOf(variableNode.name) > -1;
      if (this._inMixinDef) {
        isExcluded = isExcluded || (Array.isArray(this._mixinExcludes) &&
          this._mixinExcludes.indexOf(variableNode.name) > -1);
      }
      if (this._inNonRuleDef) {
        isExcluded = newValue = false;
      }
      if (newValue || isExcluded) {
        this._deleteNode = false; // if replacement is available rule shouldn't be deleted

        // in a variable rule we add current rule name to excludes
        if (this._inVariableRule) {
          this._excludes.push(this._currentVariableRuleName);
        }
      }

      return variableNode;
    },

    themeReplacesNodeValue: function(variableName) {
      return typeof this._themedVariables == 'object' && this._themedVariables.find(v => v == variableName);
    }
  };

  return ThemeCreator;
};

var CleanCSS = require('clean-css');

module.exports = function(less) {
    function ThemeCreator(options, type) {
        this.options = options || {};
		this._replacements = this.options.replacements || {};
		this._excludes = Object.keys(this._replacements) || [];
		this._mixinExcludes = [];
        this._visitor = new less.visitors.Visitor(this);
    }

    ThemeCreator.prototype = {
		isReplacing: true,
		isPreEvalVisitor: true,

        run: function (root) {
            return this._visitor.visit(root);
        },
		
		process: function (css, extra) {
			// clean css after all operations - just clean up
            css = new CleanCSS({aggressiveMerging: false, keepBreaks: true}).minify(css).styles;
			return css;
        },
		
        visitRule: function (ruleNode, visitArgs) {			
            if(ruleNode.variable === true){
				this._inVariableRule = true;
				this._currentVariableRuleName = ruleNode.name;
				// find replacement and set new value if needed
				var newValue = this.getReplaceNode(ruleNode.name);
				if(typeof newValue != 'undefined'){
					ruleNode.value = newValue;
				}
            }
			else {
				// evaluate if rule has to be removed
				this._deleteNode = true;
				ruleNode.accept(this._visitor);
				// remove rule if needed
				if(this._deleteNode){
					ruleNode = new(less.tree.Comment)(['']);
				}
			}
			
            return ruleNode;
        },
		
		visitRuleOut: function(ruleNode){
			this._inVariableRule = false;
		},
		
		visitMixinDefinition: function(mixinNode, visitArgs){
			this._inMixinDef = true;
			// create mixin excludes before iterate underlaying rules
			this._mixinExcludes = [];
			if(mixinNode.params.length){
				for(i = 0; i < mixinNode.params.length; i++){
					this._mixinExcludes.push(mixinNode.params[i].name);
				}
			}
			return mixinNode;
		},
		
		visitMixinDefinitionOut: function(mixinNode){
			this._inMixinDef = false;
		},
		
		visitMixinCall: function(mixinNode, visitArgs){
			// evaluate if rule has to be removed - original arguments are simple array...
			this._deleteNode = true;
			if(Array.isArray(mixinNode.arguments)){
				for(i = 0; i < mixinNode.arguments.length; i++){
					mixinNode.arguments[i].value.accept(this._visitor);
				}
			}
			// remove rule if needed
			if(this._deleteNode){
				mixinNode = new(less.tree.Comment)(['']);
			}
			
			return mixinNode;
		},
		
		visitVariable: function(variableNode, visitArgs) {
			// check if variable has a replacement or node is inside excluded
			var newValue = this.getReplaceNode(variableNode.name);
			var isExcluded = Array.isArray(this._excludes) && this._excludes.indexOf(variableNode.name) > -1;
			if(this._inMixinDef){
				isExcluded = isExcluded || (Array.isArray(this._mixinExcludes) && this._mixinExcludes.indexOf(variableNode.name) > -1);
			}
			if(typeof newValue != 'undefined' || isExcluded){
				this._deleteNode = false; // if replacement is available rule shouldn't be deleted
				
				// in a variable rule we add current rule name to excludes
				if(this._inVariableRule){
					this._excludes.push(this._currentVariableRuleName);
				}
			}
				
			return variableNode;
		},
		
		getReplaceNode: function(variableName){
			if(typeof this._replacements == 'object' && this._replacements.hasOwnProperty(variableName)){
				return new(less.tree.Value)([
					new(less.tree.Expression)([
						new(less.tree.Color)(this._replacements[variableName])
					])					
				]);
			}
			return undefined;
		}
    };

    return ThemeCreator;
};
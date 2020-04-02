'use strict';

const Stringifier = require('postcss/lib/stringifier');

class TemplateStringifier extends Stringifier {
	literal(node) {
		if (node.nodes && node.nodes.length) {
			node.nodes.forEach((root) => {
				this.builder(root.raws.beforeStart, root, 'beforeStart');
				this.stringify(root);
				this.builder(root.raws.afterEnd, root, 'afterEnd');
			});
		} else {
			this.builder(node.text, node);
		}

		if (node.raws.ownSemicolon) {
			this.builder(node.raws.ownSemicolon, node, 'end');
		}
	}
	comment(node) {
		const left = this.raw(node, 'left', 'commentLeft');
		const right = this.raw(node, 'right', 'commentRight');

		if (node.raws.inline) {
			const text = node.raws.text || node.text;

			this.builder('//' + left + text + right, node);
		} else {
			this.builder('/*' + left + node.text + right + '*/', node);
		}
	}
}

module.exports = TemplateStringifier;

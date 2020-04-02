'use strict';

const Stringifier = require('postcss/lib/stringifier');

class ScriptCommentStringifier extends Stringifier {
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

module.exports = ScriptCommentStringifier;

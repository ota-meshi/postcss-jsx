'use strict';

const postcss = require('postcss');

class CommentParser {
	constructor(input) {
		this.input = input;
	}
	parse(node) {
		const root = postcss.root({
			source: {
				input: this.input,
				start: {
					line: 1,
					column: 1,
				},
			},
		});

		root.raws.node = node;
		this.comment(node, root);

		this.root = root;
	}
	comment(node, parent) {
		const text = node.value.match(/^(\s*)((?:\S[\s\S]*?)?)(\s*)$/);
		const comment = postcss.comment({
			text: text[2],
			raws: {
				node,
				left: text[1],
				right: text[3],
				inline: node.type === 'CommentLine',
			},
		});
		const endLoc = {
			line: 1,
			column: 1,
		};

		if (node.loc.start.line === node.loc.end.line) {
			endLoc.column += node.loc.end.column - node.loc.start.column;
		} else {
			endLoc.line += node.loc.end.line - node.loc.start.line;
			endLoc.column = node.loc.end.column;
		}

		comment.source = {
			input: this.input,
			start: {
				line: 1,
				column: 1,
			},
			end: endLoc,
		};

		parent.push(comment);

		return comment;
	}
}
module.exports = CommentParser;

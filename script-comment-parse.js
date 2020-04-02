'use strict';

const CommentParser = require('./script-comment-parser');
const Input = require('postcss/lib/input');

function commentParse(source, opts) {
	const input = new Input(source, opts);
	const parser = new CommentParser(input);

	parser.parse(opts.node);

	return parser.root;
}

module.exports = commentParse;

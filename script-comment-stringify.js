'use strict';

const CommentStringifier = require('./script-comment-stringifier');

module.exports = function commentStringify(node, builder) {
	const str = new CommentStringifier(builder);

	str.stringify(node);
};

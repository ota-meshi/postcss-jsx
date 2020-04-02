'use strict';

const parse = require('./script-comment-parse');
const stringify = require('./script-comment-stringify');

const syntax = {
	parse,
	stringify,
};

module.exports = syntax;

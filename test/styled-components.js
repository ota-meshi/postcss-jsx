'use strict';

const expect = require('chai').expect;
const fs = require('fs');
const syntax = require('../');

describe('styled-components', () => {
	it('basic', () => {
		const file = require.resolve('./fixtures/styled-components');
		let code = fs.readFileSync(file);

		const document = syntax.parse(code, {
			from: file,
		});

		code = code.toString();
		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty('lang', 'jsx');

		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(8);

		const lines = code
			.match(/^.+$/gm)
			.slice(3)
			.map((line) => line.replace(/^\s*(.+?);?\s*$/, '$1'));

		document.first.nodes.forEach((decl, i) => {
			if (i) {
				expect(decl).to.have.property('type', 'decl');
			} else {
				expect(decl).to.have.property('type', 'comment');
			}

			expect(decl.toString()).to.equal(lines[i]);
		});
	});

	it('interpolation with css template literal', () => {
		const code = [
			"import styled, { css } from 'styled-components';",

			'const Message = styled.p`',
			'	padding: 10px;',

			'	${css`',
			'		color: #b02d00;',
			'	`}',
			'`;',
		].join('\n');
		const document = syntax.parse(code, {
			from: undefined,
		});

		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty('lang', 'jsx');
		expect(document.nodes).to.have.lengthOf(1);
	});

	it('interpolation with two css template literals', () => {
		const code = [
			"import styled, { css } from 'styled-components';",

			'const Message = styled.p`',
			'	padding: 10px;',

			'	${(props) => css`',
			'		color: #b02d00;',
			'	`}',

			'	${(props2) => css`',
			'		border-color: red;',
			'	`}',
			'`;',
		].join('\n');
		const document = syntax.parse(code, {
			from: undefined,
		});

		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty('lang', 'jsx');
		expect(document.nodes).to.have.lengthOf(1);
	});

	it('empty template literal', () => {
		// prettier-ignore
		const code = [
			"function test() {",
			"  alert`debug`",
			"  return ``;",
			"}",
			"",
		].join("\n");
		const document = syntax.parse(code, {
			from: 'empty_template_literal.js',
		});

		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty('lang', 'jsx');
		expect(document.nodes).to.have.lengthOf(0);
	});

	it('skip javascript syntax error', () => {
		const code = '\\`';
		const document = syntax.parse(code, {
			from: 'syntax_error.js',
		});

		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty('lang', 'jsx');
		expect(document.nodes).to.have.lengthOf(0);
	});

	it('skip @babel/traverse error', () => {
		const code = 'let a;let a';
		const document = syntax.parse(code, {
			from: 'traverse_error.js',
		});

		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty('lang', 'jsx');
		expect(document.nodes).to.have.lengthOf(0);
	});

	it('illegal template literal', () => {
		// prettier-ignore
		const code = [
			"const styled = require(\"styled-components\");",
			"styled.div`$\n{display: block}\n${g} {}`",
		].join("\n");
		const document = syntax.parse(code, {
			from: 'illegal_template_literal.js',
		});

		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty('lang', 'jsx');
		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(2);
		expect(document.first.first).have.property('type', 'rule');
		expect(document.first.first).have.property('selector', '$');
		expect(document.last.last).have.property('type', 'rule');
		expect(document.last.last).have.property('selector', '${g}');
	});

	it('styled.img', () => {
		// prettier-ignore
		const code = [
			"const styled = require(\"styled-components\");",
			"const Image1 = styled.img.attrs({ src: 'url' })`",
			"  bad-selector {",
			"    color: red;",
			"  }",
			"`;",
		].join("\n");
		const root = syntax.parse(code, {
			from: 'styled.img.js',
		});

		expect(root.toString()).to.equal(code);
	});

	it('throw CSS syntax error', () => {
		// prettier-ignore
		const code = [
			"const styled = require(\"styled-components\");",
			"styled.div`a{`;",
		].join("\n");

		expect(() => {
			syntax.parse(code, {
				from: 'css_syntax_error.js',
			});
		}).to.throw('css_syntax_error.js:2:12: Unclosed block');
	});

	it('not skip empty template literal', () => {
		// prettier-ignore
		const code = [
			"const styled = require(\"styled-components\");",
			"styled.div``;",
		].join("\n");
		const root = syntax.parse(code, {
			from: 'empty_template_literal.js',
		});

		expect(root.toString()).to.equal(code);
		expect(root.nodes).to.have.lengthOf(1);
	});

	it('fix CSS syntax error', () => {
		// prettier-ignore
		const code = [
			"const styled = require(\"styled-components\");",
			"styled.div`a{`;",
		].join("\n");
		const document = syntax({
			css: 'safe-parser',
		}).parse(code, {
			from: 'postcss-safe-parser.js',
		});

		// prettier-ignore
		expect(document.toString()).to.equal([
			"const styled = require(\"styled-components\");",
			"styled.div`a{}`;",
		].join("\n"));
		expect(document.source).to.haveOwnProperty('lang', 'jsx');
		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(1);
		expect(document.first.first).have.property('type', 'rule');
		expect(document.first.first).have.property('selector', 'a');
	});

	it('fix styled syntax error', () => {
		// prettier-ignore
		const code = [
			"const styled = require(\"styled-components\");",
			"styled.div`${ a } {`",
		].join("\n");
		const document = syntax({
			css: 'safe-parser',
		}).parse(code, {
			from: 'styled-safe-parse.js',
		});

		// prettier-ignore
		expect(document.toString()).to.equal([
			"const styled = require(\"styled-components\");",
			"styled.div`${ a } {}`",
		].join("\n"));
		expect(document.source).to.haveOwnProperty('lang', 'jsx');
		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(1);
		expect(document.first.first).have.property('type', 'rule');
		expect(document.first.first).have.property('selector', '${ a }');
	});

	it('template literal in prop', () => {
		// prettier-ignore
		const code = [
			"const styled = require(\"styled-components\");",
			"styled.div`margin-${/* sc-custom 'left' */ rtlSwitch}: 12.5px;`",
		].join("\n");
		const document = syntax.parse(code, {
			from: 'template_literal_in_prop.js',
		});

		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty('lang', 'jsx');
		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.first).to.haveOwnProperty(
			'prop',
			"margin-${/* sc-custom 'left' */ rtlSwitch}"
		);
	});

	it('lazy assignment', () => {
		// prettier-ignore
		const code = [
			"let myDiv;",
			"myDiv = require(\"styled-components\").div;",
			"myDiv`a{}`;",
		].join("\n");
		const document = syntax.parse(code, {
			from: 'lazy_assign.js',
		});

		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty('lang', 'jsx');
		expect(document.nodes).to.have.lengthOf(1);
	});

	it('lazy assignment without init', () => {
		// prettier-ignore
		const code = [
			"myDiv = require(\"styled-components\").div;",
			"myDiv`a{}`;",
		].join("\n");
		const document = syntax.parse(code, {
			from: 'lazy_assign_no_init.js',
		});

		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty('lang', 'jsx');
		expect(document.nodes).to.have.lengthOf(1);
	});

	it('array destructuring assignment', () => {
		// prettier-ignore
		const code = [
			"const [",
			"\tstyledDiv,",
			"\t...c",
			"] = require(\"styled-components\");",
			"styledDiv`a{}`;",
		].join("\n");
		const document = syntax.parse(code, {
			from: 'arr_destructuring.js',
		});

		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty('lang', 'jsx');
		expect(document.nodes).to.have.lengthOf(1);
	});

	it('object destructuring assignment', () => {
		// prettier-ignore
		const code = [
			"const {",
			"\t// commit",
			"\t['div']: styledDiv,",
			"\ta,",
			"\t...styled",
			"} = require(\"styled-components\");",
			"styledDiv`a{}`;",
			"styled.div`a{}`;",
			"a`a{}`;",
		].join("\n");
		const document = syntax.parse(code, {
			from: 'obj_destructuring.js',
		});

		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty('lang', 'jsx');
		expect(document.nodes).to.have.lengthOf(4);
	});
});

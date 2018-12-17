
/**

  Authors: Toni Ruottu, Finland 2017-2018
           Lauri Kaitala, Finland 2017-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import rewire from 'rewire';
import {expect} from 'chai';
import errors from '../errors.js';
const {InvalidTemplateExpression} = errors;
import parser from '../parser.js';
const parserRewire = rewire('../parser.js');

const {escapeForTemplateExpression, parseTemplateExpression} = parser;

/* eslint-disable object-property-newline */

describe('parser module', () => {

  describe('quote helper function', () => {
    it('should quote a string', () => {
      expect(parserRewire.__get__('quote')('foo')).to.equal('"foo"');
    });
  });

  describe('escapeForTemplateExpression function', () => {
    it('should escape $', () => {
      expect(escapeForTemplateExpression('$')).to.equal('\\$');
    });
    it('should escape \\', () => {
      expect(escapeForTemplateExpression('\\')).to.equal('\\\\');
    });
  });
  describe('parseTemplateExpression function', () => {

    it('should parse text', () => {
      expect(parseTemplateExpression(
        'hello world',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: 'hello world'},
        ]},
      );
    });
    it('should parse an embedded function without parameters', () => {
      expect(parseTemplateExpression(
        '${function()}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'function', name: 'function', args: []},
        ]},
      );
    });
    it('should parse an embedded function with one parameter', () => {
      expect(parseTemplateExpression(
        '${function(123)}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'function', name: 'function', args: ['123']},
        ]},
      );
    });
    it('should parse an embedded function with two parameters', () => {
      expect(parseTemplateExpression(
        '${function(123,abc)}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'function', name: 'function', args: ['123', 'abc']},
        ]},
      );
    });
    it('should parse two embedded expressions',  () => {
      expect(parseTemplateExpression(
        '${foo()}${bar()}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'function', name: 'foo', args: []},
          {type: 'function', name: 'bar', args: []},
        ]},
      );
      expect(parseTemplateExpression(
        'foo${bar()}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: 'foo'},
          {type: 'function', name: 'bar', args: []},
        ]},
      );
      expect(parseTemplateExpression(
        '${foo()}bar',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'function', name: 'foo', args: []},
          {type: 'text', value: 'bar'},
        ]},
      );
    });
    it('should parse three embedded expressions', () => {
      expect(parseTemplateExpression(
        '${foo()}${bar()}${quux()}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'function', name: 'foo', args: []},
          {type: 'function', name: 'bar', args: []},
          {type: 'function', name: 'quux', args: []},
        ]},
      );
      expect(parseTemplateExpression(
        'foo${bar()}${quux()}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: 'foo'},
          {type: 'function', name: 'bar', args: []},
          {type: 'function', name: 'quux', args: []},
        ]},
      );
      expect(parseTemplateExpression(
        '${foo()}bar${quux()}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'function', name: 'foo', args: []},
          {type: 'text', value: 'bar'},
          {type: 'function', name: 'quux', args: []},
        ]},
      );
      expect(parseTemplateExpression(
        '${foo()}${bar()}quux',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'function', name: 'foo', args: []},
          {type: 'function', name: 'bar', args: []},
          {type: 'text', value: 'quux'},
        ]},
      );
      expect(parseTemplateExpression(
        'foo${bar()}quux',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: 'foo'},
          {type: 'function', name: 'bar', args: []},
          {type: 'text', value: 'quux'},
        ]},
      );
    });
    it('should parse escaped dollar sign as a regular character', () => {
      // note that javascript eliminates every other backslash
      expect(parseTemplateExpression(
        '\\$',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: '$'},
        ]},
      );
      expect(parseTemplateExpression(
        '\\${foo()}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: '$'},
          {type: 'text', value: '{foo()}'},
        ]},
      );
      expect(parseTemplateExpression(
        'foo\\${bar()}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: 'foo'},
          {type: 'text', value: '$'},
          {type: 'text', value: '{bar()}'},
        ]},
      );
      expect(parseTemplateExpression(
        '\\${foo()}bar',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: '$'},
          {type: 'text', value: '{foo()}bar'},
        ]},
      );
    });
    it('should parse escaped backslash as a regular character', () => {
      // note that javascript eliminates every other backslash
      expect(parseTemplateExpression(
        '\\\\',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: '\\'},
        ]},
      );
      expect(parseTemplateExpression(
        '\\\\${foo()}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: '\\'},
          {type: 'function', name: 'foo', args: []},
        ]},
      );
      expect(parseTemplateExpression(
        'foo\\\\${bar()}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: 'foo'},
          {type: 'text', value: '\\'},
          {type: 'function', name: 'bar', args: []},
        ]},
      );
      expect(parseTemplateExpression(
        '\\\\${foo()}bar',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: '\\'},
          {type: 'function', name: 'foo', args: []},
          {type: 'text', value: 'bar'},
        ]},
      );
      expect(parseTemplateExpression(
        '\\\\\\${foo()}bar',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: '\\'},
          {type: 'text', value: '$'},
          {type: 'text', value: '{foo()}bar'},
        ]},
      );
    });
    it('should parse escaped byte', () => {
      expect(parseTemplateExpression(
        '\\x00',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'byte', value: 0x00},
        ]},
      );
      expect(parseTemplateExpression(
        '\\xff',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'byte', value: 0xff},
        ]},
      );
    });
    it('should parse escaped fixed length unicode codepoint', () => {
      expect(parseTemplateExpression(
        '\\u2603',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'codepoint', value: 0x2603},
        ]},
      );
    });
    it('should parse escaped variable length unicode codepoint', () => {
      expect(parseTemplateExpression(
        '\\u{1f375}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'codepoint', value: 0x1f375},
        ]},
      );
    });
    it('should parse encoded special characters', () => {
      const lineFeed = '\x0a';
      const carriageReturn = '\x0d';
      const nullTerminator = '\x00';
      expect(parseTemplateExpression(
        '\\n',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: lineFeed},
        ]},
      );
      expect(parseTemplateExpression(
        '\\r',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: carriageReturn},
        ]},
      );
      expect(parseTemplateExpression(
        '\\0',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'text', value: nullTerminator},
        ]},
      );
    });
    it('should allow extra spaces inside placeholders', () => {
      expect(parseTemplateExpression(
        '${foo(123 , 456)}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'function', name: 'foo', args: ['123', '456']},
        ]},
      );
      expect(parseTemplateExpression(
        '${foo( 123,456 )}',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'function', name: 'foo', args: ['123', '456']},
        ]},
      );
      expect(parseTemplateExpression(
        '${ foo(123,456) }',
      )).to.deep.equal(
        {type: 'templateExpression', particles: [
          {type: 'function', name: 'foo', args: ['123', '456']},
        ]},
      );
    });
    it('should throw InvalidTemplateExpression for lone expression start', () => {
      expect(() => {
        return parseTemplateExpression('$');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '$',
        expected: ['"{"'],
        remainder: '',
        errorPosition: '$'.length,
      });
    });
    it('should throw InvalidTemplateExpression for space between expression start and expression open', () => {
      expect(() => {
        return parseTemplateExpression('$ {foo()}');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '$ {foo()}',
        expected: ['"{"'],
        remainder: ' {foo()}',
        errorPosition: '$'.length,
      });
    });
    it('should throw InvalidTemplateExpression for missing expression open and close', () => {
      expect(() => {
        return parseTemplateExpression('$foo()');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '$foo()',
        expected: ['"{"'],
        remainder: 'foo()',
        errorPosition: '$'.length,
      });
    });
    it('should throw InvalidTemplateExpression for missing argument after a comma', () => {
      expect(() => {
        return parseTemplateExpression('${foo(123,)}');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '${foo(123,)}',
        expected: ['an argument'],
        remainder: ')}',
        errorPosition: '${foo(123,'.length,
      });
    });
    it('should throw InvalidTemplateExpression for missing first argument before a comma', () => {
      expect(() => {
        return parseTemplateExpression('${foo(,456)}');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '${foo(,456)}',
        expected: ['an argument', '")"'],
        remainder: ',456)}',
        errorPosition: '${foo('.length,
      });
    });
    it('should throw InvalidTemplateExpression for missing comma', () => {
      expect(() => {
        return parseTemplateExpression('${foo(123 456)}');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '${foo(123 456)}',
        expected: ['","', '")"'],
        remainder: '456)}',
        errorPosition: '${foo(123 '.length,
      });
    });
    it('should throw InvalidTemplateExpression for no argument list', () => {
      expect(() => {
        return parseTemplateExpression('${foo}');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '${foo}',
        expected: ['"("'],
        remainder: '}',
        errorPosition: '${foo'.length,
      });
    });
    it('should throw InvalidTemplateExpression for empty argument list missing close', () => {
      expect(() => {
        return parseTemplateExpression('${foo(}');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '${foo(}',
        expected: ['an argument', '")"'],
        remainder: '}',
        errorPosition: '${foo('.length,
      });
    });
    it('should throw InvalidTemplateExpression for expression terminator as argument', () => {
      expect(() => {
        return parseTemplateExpression('${foo(})}');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '${foo(})}',
        expected: ['an argument', '")"'],
        remainder: '})}',
        errorPosition: '${foo('.length,
      });
    });
    it('should throw InvalidTemplateExpression for unterminated expression with populated argument list missing it\'s close', () => {
      expect(() => {
        return parseTemplateExpression('${foo(123');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '${foo(123',
        expected: ['","', '")"'],
        remainder: '',
        errorPosition: '${foo(123'.length,
      });
    });
    it('should throw InvalidTemplateExpression for unterminated expression with populated argument list missing both argument after comma and argument list close', () => {
      expect(() => {
        return parseTemplateExpression('${foo(123,');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '${foo(123,',
        expected: ['an argument'],
        remainder: '',
        errorPosition: '${foo(123,'.length,
      });
    });
    it('should throw InvalidTemplateExpression for unterminated expression with multivalue argument list missing it\'s close', () => {
      expect(() => {
        return parseTemplateExpression('${foo(123,456');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '${foo(123,456',
        expected: ['","', '")"'],
        remainder: '',
        errorPosition: '${foo(123,456'.length,
      });
    });
    it('should throw InvalidTemplateExpression for terminated multivalue argument list expression missing argument list close', () => {
      expect(() => {
        return parseTemplateExpression('${foo(123,456}');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '${foo(123,456}',
        expected: ['","', '")"'],
        remainder: '}',
        errorPosition: '${foo(123,456'.length,
      });
    });
    it('should throw InvalidTemplateExpression for missing argument list open', () => {
      expect(() => {
        return parseTemplateExpression('${foo)}');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '${foo)}',
        expected: ['"("'],
        remainder: ')}',
        errorPosition: '${foo'.length,
      });
    });
    it('should throw InvalidTemplateExpression for unterminated expression', () => {
      expect(() => {
        return parseTemplateExpression('${foo()');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '${foo()',
        expected: ['"}"'],
        remainder: '',
        errorPosition: '${foo()'.length,
      });
    });
    it('should throw InvalidTemplateExpression for terminator character in function name', () => {
      expect(() => {
        return parseTemplateExpression('${foo}()}');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '${foo}()}',
        expected: ['"("'],
        remainder: '}()}',
        errorPosition: '${foo'.length,
      });
    });
    it('should throw InvalidTemplateExpression for escaped nonspecial character', () => {
      expect(() => {
        return parseTemplateExpression('\\a');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: '\\a',
        expected: ['"\\"', '"$"', '"n"', '"r"', '"0"', '"x"', '"u"'],
        remainder: 'a',
        errorPosition: '\\'.length,
      });
    });
    it('should throw InvalidTemplateExpression for escape at end of input', () => {
      expect(() => {
        return parseTemplateExpression('a\\');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: 'a\\',
        expected: ['"\\"', '"$"', '"n"', '"r"', '"0"', '"x"', '"u"'],
        remainder: '',
        errorPosition: 'a\\'.length,
      });
    });
    it('should throw InvalidTemplateExpression for invalid byte escape', () => {
      expect(() => {
        return parseTemplateExpression('a\\x');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: 'a\\x',
        expected: ['hex digit'],
        remainder: '',
        errorPosition: 'a\\x'.length,
      });
      expect(() => {
        return parseTemplateExpression('a\\x0');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: 'a\\x0',
        expected: ['hex digit'],
        remainder: '',
        errorPosition: 'a\\x0'.length,
      });
    });
    it('should throw InvalidTemplateExpression for invalid unicode escape', () => {
      expect(() => {
        return parseTemplateExpression('a\\u');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: 'a\\u',
        expected: ['hex digit', '"{"'],
        remainder: '',
        errorPosition: 'a\\u'.length,
      });
      expect(() => {
        return parseTemplateExpression('a\\u0');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: 'a\\u0',
        expected: ['hex digit'],
        remainder: '',
        errorPosition: 'a\\u0'.length,
      });
      expect(() => {
        return parseTemplateExpression('a\\u00');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: 'a\\u00',
        expected: ['hex digit'],
        remainder: '',
        errorPosition: 'a\\u00'.length,
      });
      expect(() => {
        return parseTemplateExpression('a\\u000');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: 'a\\u000',
        expected: ['hex digit'],
        remainder: '',
        errorPosition: 'a\\u000'.length,
      });
      expect(() => {
        return parseTemplateExpression('a\\u{');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: 'a\\u{',
        expected: ['hex digit'],
        remainder: '',
        errorPosition: 'a\\u{'.length,
      });
      expect(() => {
        return parseTemplateExpression('a\\u{0');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: 'a\\u{0',
        expected: ['hex digit', '"}"'],
        remainder: '',
        errorPosition: 'a\\u{0'.length,
      });
      expect(() => {
        return parseTemplateExpression('a\\u{1234567');
      }).to.throw(InvalidTemplateExpression).that.does.deep.include({
        expression: 'a\\u{1234567',
        expected: ['"}"'],
        remainder: '7',
        errorPosition: 'a\\u{123456'.length,
      });
    });
  });
});


/**

  Authors: Toni Ruottu, Finland 2017-2018
           Lauri Kaitala, Finland 2017-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import {expect} from 'chai';
import errors from '../errors.js';
const {InvalidParticles} = errors;
import particles from '../particles.js';

const {escapeForParticles, parseParticles} = particles;

describe('particles module', () => {
  describe('escapeForParticles function', () => {
    it('should escape $', () => {
      expect(escapeForParticles('$')).to.equal('\\$');
    });
    it('should escape \\', () => {
      expect(escapeForParticles('\\')).to.equal('\\\\');
    });
  });
  describe('parseParticles function', () => {
    it('should parse a single default particle', () => {
      const result = parseParticles('particle');
      const expectedResult = [
        ['default', 'particle'],
      ];
      expect(result).to.deep.equal(expectedResult);
    });
    it('should parse a single named particle without parameters', () => {
      const result = parseParticles('${instruction()}');
      const expectedResult = [
        ['instruction'],
      ];
      expect(result).to.deep.equal(expectedResult);
    });
    it('should parse a single named particle with a single parameter', () => {
      const result = parseParticles('${instruction(123)}');
      const expectedResult = [
        ['instruction', '123'],
      ];
      expect(result).to.deep.equal(expectedResult);
    });
    it('should parse a single named particle with two parameters', () => {
      const result = parseParticles('${instruction(123,abc)}');
      const expectedResult = [
        ['instruction', '123', 'abc'],
      ];
      expect(result).to.deep.equal(expectedResult);
    });
    it('should parse two instruction particles',  () => {
      expect(parseParticles(
        '${foo()}${bar()}',
      )).to.deep.equal([
        ['foo'],
        ['bar'],
      ]);
      expect(parseParticles(
        'foo${bar()}',
      )).to.deep.equal([
        ['default', 'foo'],
        ['bar'],
      ]);
      expect(parseParticles(
        '${foo()}bar',
      )).to.deep.equal([
        ['foo'],
        ['default', 'bar'],
      ]);
    });
    it('should parse three instruction particles', () => {
      expect(parseParticles(
        '${foo()}${bar()}${quux()}',
      )).to.deep.equal([
        ['foo'],
        ['bar'],
        ['quux'],
      ]);
      expect(parseParticles(
        'foo${bar()}${quux()}',
      )).to.deep.equal([
        ['default', 'foo'],
        ['bar'],
        ['quux'],
      ]);
      expect(parseParticles(
        '${foo()}bar${quux()}',
      )).to.deep.equal([
        ['foo'],
        ['default', 'bar'],
        ['quux'],
      ]);
      expect(parseParticles(
        '${foo()}${bar()}quux',
      )).to.deep.equal([
        ['foo'],
        ['bar'],
        ['default', 'quux'],
      ]);
      expect(parseParticles(
        'foo${bar()}quux',
      )).to.deep.equal([
        ['default', 'foo'],
        ['bar'],
        ['default', 'quux'],
      ]);
    });
    it('should parse escaped dollar sign as a regular character', () => {
      // note that javascript eliminates every other backslash
      expect(parseParticles(
        '\\$',
      )).to.deep.equal([
        ['default', '$'],
      ]);
      expect(parseParticles(
        '\\${foo()}',
      )).to.deep.equal([
        ['default', '${foo()}'],
      ]);
      expect(parseParticles(
        'foo\\${bar()}',
      )).to.deep.equal([
        ['default', 'foo${bar()}'],
      ]);
      expect(parseParticles(
        '\\${foo()}bar',
      )).to.deep.equal([
        ['default', '${foo()}bar'],
      ]);
    });
    it('should parse escaped backslash as a regular character', () => {
      // note that javascript eliminates every other backslash
      expect(parseParticles(
        '\\\\',
      )).to.deep.equal([
        ['default', '\\'],
      ]);
      expect(parseParticles(
        '\\\\${foo()}',
      )).to.deep.equal([
        ['default', '\\'],
        ['foo'],
      ]);
      expect(parseParticles(
        'foo\\\\${bar()}',
      )).to.deep.equal([
        ['default', 'foo\\'],
        ['bar'],
      ]);
      expect(parseParticles(
        '\\\\${foo()}bar',
      )).to.deep.equal([
        ['default', '\\'],
        ['foo'],
        ['default', 'bar'],
      ]);
      expect(parseParticles(
        '\\\\\\${foo()}bar',
      )).to.deep.equal([
        ['default', '\\${foo()}bar'],
      ]);
    });
    it('should parse encoded line-endings', () => {
      const lineFeed = '\x0a';
      const carriageReturn = '\x0d';
      expect(parseParticles(
        '\\n',
      )).to.deep.equal([
        ['default', lineFeed],
      ]);
      expect(parseParticles(
        '\\r',
      )).to.deep.equal([
        ['default', carriageReturn],
      ]);
    });
    it('should allow extra spaces inside placeholders', () => {
      expect(parseParticles(
        '${foo(123 , 456)}',
      )).to.deep.equal([
        ['foo', '123', '456'],
      ]);
      expect(parseParticles(
        '${foo( 123,456 )}',
      )).to.deep.equal([
        ['foo', '123', '456'],
      ]);
      expect(parseParticles(
        '${ foo(123,456) }',
      )).to.deep.equal([
        ['foo', '123', '456'],
      ]);
    });
    it('should throw InvalidParticles for lone expression start', () => {
      expect(() => {
        return parseParticles('$');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '$',
        expected: ['"{"'],
        remainder: '',
        errorPosition: '$'.length,
      });
    });
    it('should throw InvalidParticles for space between expression start and expression open', () => {
      expect(() => {
        return parseParticles('$ {foo()}');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '$ {foo()}',
        expected: ['"{"'],
        remainder: ' {foo()}',
        errorPosition: '$'.length,
      });
    });
    it('should throw InvalidParticles for missing expression open and close', () => {
      expect(() => {
        return parseParticles('$foo()');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '$foo()',
        expected: ['"{"'],
        remainder: 'foo()',
        errorPosition: '$'.length,
      });
    });
    it('should throw InvalidParticles for missing argument after a comma', () => {
      expect(() => {
        return parseParticles('${foo(123,)}');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo(123,)}',
        expected: ['an argument'],
        remainder: ')}',
        errorPosition: '${foo(123,'.length,
      });
    });
    it('should throw InvalidParticles for missing first argument before a comma', () => {
      expect(() => {
        return parseParticles('${foo(,456)}');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo(,456)}',
        expected: ['an argument', '")"'],
        remainder: ',456)}',
        errorPosition: '${foo('.length,
      });
    });
    it('should throw InvalidParticles for missing comma', () => {
      expect(() => {
        return parseParticles('${foo(123 456)}');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo(123 456)}',
        expected: ['","', '")"'],
        remainder: '456)}',
        errorPosition: '${foo(123 '.length,
      });
    });
    it('should throw InvalidParticles for missing comma', () => {
      expect(() => {
        return parseParticles('${foo(123 456)}');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo(123 456)}',
        expected: ['","', '")"'],
        remainder: '456)}',
        errorPosition: '${foo(123 '.length,
      });
    });
    it('should throw InvalidParticles for no argument list', () => {
      expect(() => {
        return parseParticles('${foo}');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo}',
        expected: ['"("'],
        remainder: '}',
        errorPosition: '${foo'.length,
      });
    });
    it('should throw InvalidParticles for empty argument list missing close', () => {
      expect(() => {
        return parseParticles('${foo(}');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo(}',
        expected: ['an argument', '")"'],
        remainder: '}',
        errorPosition: '${foo('.length,
      });
    });
    it('should throw InvalidParticles for expression terminator as argument', () => {
      expect(() => {
        return parseParticles('${foo(})}');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo(})}',
        expected: ['an argument', '")"'],
        remainder: '})}',
        errorPosition: '${foo('.length,
      });
    });
    it('should throw InvalidParticles for unterminated expression with populated argument list missing it\'s close', () => {
      expect(() => {
        return parseParticles('${foo(123');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo(123',
        expected: ['","', '")"'],
        remainder: '',
        errorPosition: '${foo(123'.length,
      });
    });
    it('should throw InvalidParticles for unterminated expression with populated argument list missing both argument after comma and argument list close', () => {
      expect(() => {
        return parseParticles('${foo(123,');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo(123,',
        expected: ['an argument'],
        remainder: '',
        errorPosition: '${foo(123,'.length,
      });
    });
    it('should throw InvalidParticles for unterminated expression with multivalue argument list missing it\'s close', () => {
      expect(() => {
        return parseParticles('${foo(123,456');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo(123,456',
        expected: ['","', '")"'],
        remainder: '',
        errorPosition: '${foo(123,456'.length,
      });
    });
    it('should throw InvalidParticles for terminated multivalue argument list expression missing argument list close', () => {
      expect(() => {
        return parseParticles('${foo(123,456}');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo(123,456}',
        expected: ['","', '")"'],
        remainder: '}',
        errorPosition: '${foo(123,456'.length,
      });
    });
    it('should throw InvalidParticles for missing argument list open', () => {
      expect(() => {
        return parseParticles('${foo)}');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo)}',
        expected: ['"("'],
        remainder: ')}',
        errorPosition: '${foo'.length,
      });
    });
    it('should throw InvalidParticles for unterminated expression', () => {
      expect(() => {
        return parseParticles('${foo()');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo()',
        expected: ['"}"'],
        remainder: '',
        errorPosition: '${foo()'.length,
      });
    });
    it('should throw InvalidParticles for terminator character in instruction name', () => {
      expect(() => {
        return parseParticles('${foo}()}');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '${foo}()}',
        expected: ['"("'],
        remainder: '}()}',
        errorPosition: '${foo'.length,
      });
    });
    it('should throw InvalidParticles for escaped nonspecial character', () => {
      expect(() => {
        return parseParticles('\\a');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: '\\a',
        expected: ['"$"', '"\\"', '"n"', '"r"'],
        remainder: 'a',
        errorPosition: '\\'.length,
      });
    });
    it('should throw InvalidParticles for escape at end of input', () => {
      expect(() => {
        return parseParticles('a\\');
      }).to.throw(InvalidParticles).that.does.deep.include({
        expression: 'a\\',
        expected: ['"$"', '"\\"', '"n"', '"r"'],
        remainder: '',
        errorPosition: 'a\\'.length,
      });
    });
  });
});

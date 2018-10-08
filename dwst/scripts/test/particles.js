
/**

  Authors: Toni Ruottu, Finland 2017-2018
           Lauri Kaitala, Finland 2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import {InvalidParticles} from '../errors.js';
import {parseParticles, escapeForParticles} from '../particles.js';
import {expect} from 'chai';

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
    it('should throw an exception for invalid particles', () => {
      const invalidParticlesExamples = [
        '$',
        '$ {foo()}',
        '$foo()',
        '${foo(123,)}',
        '${foo(,456)}',
        '${foo}',
        '${foo(}',
        '${foo(123',
        '${foo(123,',
        '${foo(123,456',
        '${foo)}',
        '${foo()',
        '${foo}()}',
        '\\a',
      ];
      invalidParticlesExamples.forEach(invalidExample => {
        expect(() => {
          return parseParticles(invalidExample);
        }).to.throw(InvalidParticles);
      });
    });
  });
});

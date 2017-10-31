
/**

  Authors: Toni Ruottu, Finland 2017
           Lauri Kaitala, Finland 2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import {parseLisb} from '../particles.js';
import {expect} from 'chai';

describe('particles module', () => {
  describe('parseLisb function', () => {
    it.skip('should parse a single default particle', () => {
      const result = parseLisb('particle');
      const expectedResult = [
        ['default', 'particle'],
      ];
      expect(result).to.deep.equal(expectedResult);
    });
    it.skip('should parse a single named particle without parameters', () => {
      const result = parseLisb('${instruction()}');
      const expectedResult = [
        ['instruction'],
      ];
      expect(result).to.deep.equal(expectedResult);
    });
    it.skip('should parse a single named particle with a single parameter', () => {
      const result = parseLisb('${instruction(123)}');
      const expectedResult = [
        ['instruction', '123'],
      ];
      expect(result).to.deep.equal(expectedResult);
    });
    it.skip('should parse a single named particle with two parameters', () => {
      const result = parseLisb('${instruction(123,abc)}');
      const expectedResult = [
        ['instruction', '123', 'abc'],
      ];
      expect(result).to.deep.equal(expectedResult);
    });
    it.skip('should parse two instruction particles',  () => {
      expect(parseLisb(
        '${foo()}${bar()}',
      )).to.deep.equal([
        ['foo'],
        ['bar'],
      ]);
      expect(parseLisb(
        'foo${bar()}',
      )).to.deep.equal([
        ['default', 'foo'],
        ['bar'],
      ]);
      expect(parseLisb(
        '${foo()}bar',
      )).to.deep.equal([
        ['foo'],
        ['default', 'bar'],
      ]);
    });
    it.skip('should parse three instruction particles', () => {
      expect(parseLisb(
        '${foo()}${bar()}${quux()}',
      )).to.deep.equal([
        ['foo'],
        ['bar'],
        ['quux'],
      ]);
      expect(parseLisb(
        'foo${bar()}${quux()}',
      )).to.deep.equal([
        ['default', 'foo'],
        ['bar'],
        ['quux'],
      ]);
      expect(parseLisb(
        '${foo()}bar${quux()}',
      )).to.deep.equal([
        ['foo'],
        ['default', 'bar'],
        ['quux'],
      ]);
      expect(parseLisb(
        '${foo()}${bar()}quux',
      )).to.deep.equal([
        ['foo'],
        ['bar'],
        ['default', 'quux'],
      ]);
      expect(parseLisb(
        'foo${bar()}quux',
      )).to.deep.equal([
        ['default', 'foo'],
        ['bar'],
        ['default', 'quux'],
      ]);
    });
    it.skip('should parse escaped dollar sign as a regular character', () => {
      // note that javascript eliminates every other backslash
      expect(parseLisb(
        '\\$',
      )).to.deep.equal([
        ['default', '$'],
      ]);
      expect(parseLisb(
        '\\${foo()}',
      )).to.deep.equal([
        ['default', '${foo()}'],
      ]);
      expect(parseLisb(
        'foo\\${bar()}',
      )).to.deep.equal([
        ['default', 'foo${bar()}'],
      ]);
      expect(parseLisb(
        '\\${foo()}bar',
      )).to.deep.equal([
        ['default', '${foo()}bar'],
      ]);
    });
    it.skip('should parse escaped backslash as a regular character', () => {
      // note that javascript eliminates every other backslash
      expect(parseLisb(
        '\\\\',
      )).to.deep.equal([
        ['default', '\\'],
      ]);
      expect(parseLisb(
        '\\\\${foo()}',
      )).to.deep.equal([
        ['default', '\\${foo()}'],
      ]);
      expect(parseLisb(
        'foo\\\\${bar()}',
      )).to.deep.equal([
        ['default', 'foo\\${bar()}'],
      ]);
      expect(parseLisb(
        '\\\\${foo()}bar',
      )).to.deep.equal([
        ['default', '\\${foo()}bar'],
      ]);
    });
    it.skip('should throw an exception for invalid lisb', () => {
      const invalidLisbExamples = [
        '$',
        '$ {foo()}',
        '$foo()',
        '${foo(123, 456)}',
        '${foo}',
        '${foo(}',
        '${foo)}',
        '${foo()',
        '\\a',
      ];
      invalidLisbExamples.forEach(invalidLisb => {
        expect(() => {
          return parseLisb(invalidLisb);
        }).to.throw();
      });
    });
  });
});


/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

const REPEAT = ' ';

function *colorMasks(colors) {
  let color = colors[0];
  if (color === REPEAT) {
    throw new Error('invalid color mask');
  }
  let parts = [];
  for (const symbol of colors) {
    if (symbol === color) {
      parts.push(color);
    } else if (symbol === REPEAT) {
      parts.push(color);
    } else {
      yield parts.join('');
      parts = [symbol];
      color = symbol;
    }
  }
  if (parts.length > 0) {
    yield parts.join('');
  }
}

function *cellProperties(chars, colors) {
  let remainder = chars.slice();
  for (const mask of colorMasks(colors)) {
    const color = mask[0];
    const text = remainder.slice(0, mask.length);
    remainder = remainder.slice(mask.length);
    yield {text, color};
  }
}

function *izip(a, b) {
  const iterA = a[Symbol.iterator]();
  const iterB = b[Symbol.iterator]();
  while (true) {
    const resultA = iterA.next();
    const resultB = iterB.next();
    if (resultA.done || resultB.done) {
      return;
    }
    yield [resultA.value, resultB.value];
  }
}

export default function renderGfx(lines, colors) {

  const gfxContent = document.createElement('div');
  gfxContent.setAttribute('class', 'dwst-gfx__content');
  for (const [chars, cols] of izip(lines, colors)) {
    const gfxLine = document.createElement('div');
    gfxLine.setAttribute('class', 'dwst-gfx__line');
    for (const {text, color} of cellProperties(chars, cols)) {
      const gfxCell = document.createElement('span');
      gfxCell.setAttribute('class', `dwst-gfx__element dwst-gfx__element--color-${color}`);
      gfxCell.innerHTML = text;
      gfxLine.appendChild(gfxCell);
    }
    gfxContent.appendChild(gfxLine);
  }
  const background = document.createElement('div');
  background.setAttribute('class', 'dwst-gfx__background');
  const safe = document.createElement('div');
  safe.setAttribute('class', 'dwst-debug__background-guide');
  const safeco = document.createElement('div');
  safeco.setAttribute('class', 'dwst-debug__content-guide');
  safe.appendChild(safeco);
  background.appendChild(safe);
  gfxContent.appendChild(background);

  const gfxContainer = document.createElement('div');
  gfxContainer.setAttribute('class', 'dwst-gfx');
  gfxContainer.setAttribute('aria-hidden', 'true');
  gfxContainer.appendChild(gfxContent);

  return gfxContainer;
}




/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default function renderGfx(lines, colors) {

  const gfxContent = document.createElement('div');
  gfxContent.setAttribute('class', 'dwst-gfx__content');
  lines.forEach((line, li) => {
    const logLine = document.createElement('div');
    logLine.setAttribute('class', 'dwst-gfx__line');
    [...line].forEach((chr, ci) => {
      const color = colors[li][ci];
      const outputCell = document.createElement('span');
      outputCell.setAttribute('class', `dwst-gfx__element dwst-gfx__element--color-${color}`);
      outputCell.innerHTML = chr;
      logLine.appendChild(outputCell);
    });
    gfxContent.appendChild(logLine);
  });
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



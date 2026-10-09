/* Trade-flow drawings · solid fills that match the card exactly.
   The card is a 155° gradient, so one fixed fill colour reads darker or lighter than the card
   around it. This samples the card gradient at each drawing's centre and sets --art-fill on
   that drawing, so faces stay opaque (hiding the lines behind them) and blend in. */
(() => {
  const card = document.querySelector('#how-it-works .flow-window');
  if (!card) return;
  const arts = [...card.querySelectorAll('.flow-art')];
  const parse = str => {
    const m = str.match(/(color\(srgb[^)]*\)|rgba?\([^)]*\))/g);
    if (!m || m.length < 2) return null;
    const rgb = s => {
      const n = s.match(/[\d.]+/g).map(Number);
      return s.startsWith('color(') ? n.slice(0, 3).map(v => v * 255) : n.slice(0, 3);
    };
    const angle = parseFloat((str.match(/([\d.]+)deg/) || [0, 180])[1]);
    const stop = parseFloat((str.match(/\)\s*([\d.]+)%\s*\)?\s*$/) || [0, 100])[1]) / 100;
    return { angle, from: rgb(m[0]), to: rgb(m[1]), stop };
  };
  function paint() {
    const g = parse(getComputedStyle(card).backgroundImage);
    if (!g) return;
    const box = card.getBoundingClientRect();
    const a = g.angle * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a);
    const len = Math.abs(box.width * dx) + Math.abs(box.height * dy);
    arts.forEach(art => {
      const r = art.getBoundingClientRect();
      const px = r.left + r.width / 2 - (box.left + box.width / 2);
      const py = r.top + r.height / 2 - (box.top + box.height / 2);
      const t = Math.min(1, Math.max(0, (.5 + (px * dx + py * dy) / len) / g.stop));
      const c = g.from.map((v, i) => Math.round(v + (g.to[i] - v) * t));
      art.style.setProperty('--art-fill', `rgb(${c.join(',')})`);
    });
  }
  new ResizeObserver(paint).observe(card);
  document.fonts.ready.then(paint);
  paint();
})();

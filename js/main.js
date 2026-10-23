/* main.js — tema persistente + busca global */
(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const setIcon = () => { if (toggle) toggle.textContent = root.dataset.theme === 'dark' ? '☀️' : '🌙'; };
  setIcon();
  toggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    setIcon();
  });

  // ===== Busca global =====
  const input = document.getElementById('busca');
  const out = document.getElementById('busca-res');
  if (!input) return;
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cards = [...document.querySelectorAll('[data-search], .card')];
  const unique = [...new Set(cards)];
  let timer;

  const clear = () => {
    unique.forEach(c => c.classList.remove('highlight', 'dim'));
    document.querySelectorAll('mark[data-hit]').forEach(m => m.replaceWith(document.createTextNode(m.textContent)));
    document.body.normalize();
  };

  const markText = (el, term) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentElement.closest('svg,script,mark,button') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const txt = node.textContent, i = norm(txt).indexOf(term);
      if (i < 0) return;
      const range = document.createRange();
      range.setStart(node, i); range.setEnd(node, i + term.length);
      const m = document.createElement('mark'); m.dataset.hit = '';
      range.surroundContents(m);
    });
  };

  const run = () => {
    clear();
    const term = norm(input.value.trim());
    if (term.length < 2) { out.value = ''; return; }
    const hits = unique.filter(c => norm((c.dataset.search || '') + ' ' + c.textContent).includes(term));
    unique.forEach(c => c.classList.add(hits.includes(c) ? 'highlight' : 'dim'));
    hits.forEach(c => markText(c, term));
    out.value = hits.length ? `${hits.length} ✓` : '0 ✗';
    hits[0]?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  };
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 250); });
  input.addEventListener('keydown', e => { if (e.key === 'Escape') { input.value = ''; run(); } });
})();

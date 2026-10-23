/* simulators.js — potência hidrelétrica, Carnot e reação em cadeia */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fmt = (n, d = 1) => n.toLocaleString('pt-BR', { maximumFractionDigits: d });

  // ===== Potência hidrelétrica: P = η·ρ·g·h·Q =====
  const RHO = 1000, G = 9.8, LED_W = 9; // lâmpada LED de 9 W
  const h = $('h'), q = $('q'), eta = $('eta');
  if (h) {
    const update = () => {
      const H = +h.value, Q = +q.value, E = +eta.value / 100;
      const P = E * RHO * G * H * Q; // W
      const MW = P / 1e6;
      $('h-out').value = `${H} m`; $('q-out').value = `${fmt(Q, 0)} m³/s`; $('eta-out').value = `${eta.value}%`;
      $('p-out').textContent = `${fmt(MW)} MW`;
      $('p-bar').style.width = `${Math.min(100, MW / 14000 * 100)}%`; // escala: Itaipu ~14 000 MW
      const leds = P / LED_W;
      $('led-out').textContent = `≈ ${fmt(leds, 0)} lâmpadas LED de 9 W acesas ao mesmo tempo (${fmt(MW / 14000 * 100)}% de Itaipu).`;
      const box = $('leds'); const n = Math.max(1, Math.min(60, Math.round(Math.log10(leds + 1) * 7)));
      box.innerHTML = '<i></i>'.repeat(n);
    };
    [h, q, eta].forEach(el => el.addEventListener('input', update)); update();
  }

  // ===== Carnot: η = 1 − Tf/Tq =====
  const tq = $('tq'), tf = $('tf');
  if (tq) {
    let unit = 'K';
    const show = K => unit === 'K' ? `${fmt(K, 0)} K` : `${fmt(K - 273.15, 0)} °C`;
    const update = () => {
      const Tq = +tq.value, Tf = +tf.value;
      $('tq-out').value = show(Tq); $('tf-out').value = show(Tf);
      const alert = $('c-alert');
      if (Tf >= Tq) {
        $('c-out').textContent = '0%'; $('c-bar').style.width = '0';
        alert.innerHTML = '⚠️ A fonte fria precisa estar <strong>mais fria</strong> que a quente! Sem diferença de temperatura não há fluxo de calor nem trabalho.';
        return;
      }
      const r = 1 - Tf / Tq;
      $('c-out').textContent = `${fmt(r * 100)}%`;
      $('c-bar').style.width = `${r * 100}%`;
      alert.innerHTML = `🚫 <strong>Segunda Lei:</strong> mesmo esta máquina ideal descarta ${fmt((1 - r) * 100)}% do calor na fonte fria. Para 100% seria preciso T<sub>f</sub> = 0 K — inatingível. Máquinas reais rendem ainda menos.`;
    };
    document.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => {
      unit = b.dataset.unit;
      document.querySelectorAll('.seg button').forEach(x => x.setAttribute('aria-pressed', x === b));
      update();
    }));
    [tq, tf].forEach(el => el.addEventListener('input', update)); update();
  }

  // ===== Reação em cadeia (canvas) =====
  const cv = $('fission-canvas');
  if (cv) {
    const ctx = cv.getContext('2d');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let nuclei = [], neutrons = [], flashes = [], count = 0, control = false, raf;
    const reset = () => {
      nuclei = []; neutrons = []; flashes = []; count = 0;
      for (let x = 60; x < cv.width - 20; x += 46) for (let y = 30; y < cv.height - 10; y += 46)
        nuclei.push({ x: x + (Math.random() - .5) * 14, y: y + (Math.random() - .5) * 14, alive: true });
      $('fission-count').textContent = 'Fissões: 0';
    };
    const draw = () => {
      ctx.fillStyle = '#14202b'; ctx.fillRect(0, 0, cv.width, cv.height);
      if (control) { ctx.fillStyle = '#4b5c69'; for (let x = 200; x < cv.width; x += 220) ctx.fillRect(x, 0, 10, cv.height); }
      nuclei.forEach(n => { if (!n.alive) return; ctx.beginPath(); ctx.arc(n.x, n.y, 9, 0, 7); ctx.fillStyle = '#3ee59a'; ctx.fill(); });
      flashes = flashes.filter(f => (f.r += 2.5) < 30);
      flashes.forEach(f => { ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.strokeStyle = `rgba(255,212,59,${1 - f.r / 30})`; ctx.lineWidth = 3; ctx.stroke(); });
      neutrons.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); });
    };
    const step = () => {
      neutrons.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (control && Math.abs(((p.x - 205) % 220 + 220) % 220) < 8 && Math.random() < .6) p.dead = true;
        if (p.x < 0 || p.x > cv.width || p.y < 0 || p.y > cv.height) p.dead = true;
        for (const n of nuclei) if (n.alive && (n.x - p.x) ** 2 + (n.y - p.y) ** 2 < 120) {
          n.alive = false; p.dead = true; count++; flashes.push({ x: n.x, y: n.y, r: 4 });
          const k = 2 + (Math.random() < .5 ? 1 : 0);
          for (let i = 0; i < k; i++) { const a = Math.random() * 6.28; neutrons.push({ x: n.x, y: n.y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3 }); }
          break;
        }
      });
      neutrons = neutrons.filter(p => !p.dead);
      $('fission-count').textContent = `Fissões: ${count}`;
      draw();
      if (neutrons.length || flashes.length) raf = requestAnimationFrame(step);
    };
    $('fission-start').addEventListener('click', () => {
      cancelAnimationFrame(raf); reset();
      neutrons.push({ x: 0, y: cv.height / 2, vx: 3, vy: 0 });
      if (reduced) { for (let i = 0; i < 2000 && neutrons.length; i++) { neutrons.forEach(p => { p.x += p.vx; p.y += p.vy; }); step(); cancelAnimationFrame(raf); } draw(); }
      else step();
    });
    $('fission-control').addEventListener('click', e => {
      control = !control; e.currentTarget.setAttribute('aria-pressed', control);
      e.currentTarget.textContent = control ? 'Remover barras de controle' : 'Inserir barras de controle';
      draw();
    });
    reset(); draw();
  }
})();

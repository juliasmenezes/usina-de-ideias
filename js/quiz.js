/* quiz.js — questões estilo ENEM com gabarito comentado */
(() => {
  'use strict';
  const QUESTIONS = [
    { q: 'Em uma usina hidrelétrica, a sequência correta de transformações de energia é:',
      a: ['Elétrica → mecânica → potencial', 'Potencial gravitacional → cinética → mecânica (rotação) → elétrica', 'Térmica → cinética → elétrica', 'Química → térmica → elétrica', 'Cinética → potencial → elétrica'],
      c: 1, e: 'A água armazenada em altura (Ep) desce e ganha velocidade (Ec), gira a turbina (energia mecânica) e o gerador converte em energia elétrica por indução.' },
    { q: 'Uma queda d\'água tem h = 100 m e vazão Q = 200 m³/s. Considerando ρ = 1000 kg/m³, g = 10 m/s² e rendimento de 90%, a potência elétrica é:',
      a: ['18 MW', '20 MW', '180 MW', '200 MW', '1 800 MW'],
      c: 2, e: 'P = η·ρ·g·h·Q = 0,9 × 1000 × 10 × 100 × 200 = 1,8×10⁸ W = 180 MW.' },
    { q: 'Uma máquina térmica opera entre 527 °C e 27 °C. O rendimento máximo teórico (Carnot) é:',
      a: ['5%', '37,5%', '62,5%', '95%', '100%'],
      c: 2, e: 'Converta para Kelvin: Tq = 800 K, Tf = 300 K. η = 1 − 300/800 = 0,625 = 62,5%. Usar Celsius direto daria 95% — pegadinha clássica!' },
    { q: 'Termelétricas a carvão perdem grande parte da energia do combustível como calor. Isso ocorre principalmente porque:',
      a: ['Os engenheiros projetam mal as caldeiras', 'A Primeira Lei proíbe conservar energia', 'A Segunda Lei exige que parte do calor seja rejeitada para uma fonte fria', 'O carvão não libera energia química', 'A turbina gira devagar demais'],
      c: 2, e: 'Pela Segunda Lei da Termodinâmica (Kelvin-Planck), nenhuma máquina térmica cíclica converte todo o calor em trabalho; o condensador precisa descartar calor.' },
    { q: 'O funcionamento do gerador elétrico de qualquer usina baseia-se:',
      a: ['Na Lei de Coulomb', 'Na indução eletromagnética de Faraday', 'No efeito fotoelétrico', 'Na Lei de Ohm', 'No princípio de Pascal'],
      c: 1, e: 'A variação do fluxo magnético nas bobinas, causada pela rotação, induz uma força eletromotriz: ε = −ΔΦ/Δt.' },
    { q: 'Sobre as usinas Angra 1 e Angra 2, é correto afirmar que:',
      a: ['Funcionam por fusão nuclear de hidrogênio', 'Usam fissão do urânio-235 para aquecer água e gerar vapor', 'Não produzem rejeitos radioativos', 'São hidrelétricas no litoral do RJ', 'Convertem energia nuclear diretamente em elétrica, sem turbina'],
      c: 1, e: 'Angra usa reatores de fissão (U-235). O calor gera vapor que move turbinas — uma "termelétrica nuclear". O lixo radioativo é um desafio real.' },
    { q: 'Se a velocidade do vento num aerogerador dobra, a potência disponível:',
      a: ['Dobra', 'Quadruplica', 'Fica 8 vezes maior', 'Cai pela metade', 'Não muda'],
      c: 2, e: 'P ∝ v³, então (2)³ = 8. Por isso a escolha do local com ventos fortes é tão importante.' }
  ];

  const list = document.getElementById('quiz-list');
  if (!list) return;
  const bar = document.getElementById('quiz-bar'), score = document.getElementById('quiz-score');
  let answered = 0, right = 0;

  const progress = () => {
    bar.style.width = `${answered / QUESTIONS.length * 100}%`;
    score.textContent = `${answered} de ${QUESTIONS.length} respondidas · ${right} acerto(s)`;
    if (answered === QUESTIONS.length) {
      const d = document.getElementById('quiz-dialog');
      document.getElementById('quiz-final').textContent = `Você acertou ${right} de ${QUESTIONS.length}. ${right >= 5 ? 'Mandou muito, futuro(a) engenheiro(a)!' : 'Revise os macetes e tente de novo!'}`;
      d?.showModal?.();
    }
  };

  const render = () => {
    answered = 0; right = 0; list.innerHTML = '';
    QUESTIONS.forEach((item, i) => {
      const art = document.createElement('article');
      art.className = 'q card';
      art.dataset.search = 'quiz enem questão ' + item.q;
      art.innerHTML = `<h3>Questão ${i + 1}</h3><p>${item.q}</p><ol>${item.a.map((t, j) => `<li><button type="button" data-j="${j}">${t}</button></li>`).join('')}</ol><p class="explain macete" role="status"></p>`;
      art.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
        const j = +btn.dataset.j, ok = j === item.c;
        art.querySelectorAll('button').forEach((b, k) => { b.disabled = true; if (k === item.c) b.classList.add('right'); });
        if (!ok) btn.classList.add('wrong');
        art.classList.add('done');
        art.querySelector('.explain').textContent = (ok ? '✅ Correto! ' : '❌ Quase! ') + item.e;
        answered++; if (ok) right++;
        progress();
      }));
      list.appendChild(art);
    });
    progress();
  };
  document.getElementById('quiz-reset')?.addEventListener('click', render);
  render();
})();

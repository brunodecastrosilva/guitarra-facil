/* Guitarra Fácil · Teoria: escalas, acordes, círculo, intervalos e figuras */
'use strict';
function modeloDaTeoria() {
  const e = TEO.escala, d = Math.max(0, TEO.desenho);
  const m = MODELOS.find(x => x.cat === 'escalas' && x.grupo === 'Escala' && x.escala === e);
  if (!m) return null;
  return [m.id, e === 'blues' ? [0, 1, 2, 4, 5][d] : d];
}

const TEO = { raiz: 9, escala: 'penta-menor', rotulo: 'nota', desenho: -1, acRaiz: 0, acTipo: '', tom: 0 };
const TEORIA = [
  ['escalas', 'Escalas no braço', 'Todas as escalas e modos, em qualquer tom.'],
  ['acordes', 'Construtor de acordes', 'Monte um acorde e veja as notas no braço.'],
  ['circulo', 'Círculo das quintas', 'Os tons vizinhos e o campo harmônico.'],
  ['intervalos', 'Intervalos', 'A distância entre duas notas.'],
  ['ritmo', 'Ritmo e figuras', 'Quanto dura cada nota.'],
];
VIEWS.teoria = () => {
  const sec = parte(1), S = TEORIA.find(x => x[0] === sec);
  if (!S) return KitFacil.ui.cabecalho({ titulo: 'Teoria', sub: 'Escolha um assunto. Tudo desenhado no braço e pronto para ouvir.' })
    + `<div class="ladrilhos">${TEORIA.map(([id, n, d]) => ladrilho({ ir: 'teoria/' + id, ilu: ILU['te-' + id], nome: n, sub: d })).join('')}</div>`;
  const E = ESCALAS.find(e => e[0] === TEO.escala), notas = notasEscala(TEO.raiz, TEO.escala), pentas = TEO.escala.startsWith('penta') || TEO.escala === 'blues';
  const des = pentas && TEO.desenho >= 0 ? desenhosPenta(TEO.escala === 'penta-maior' ? pc(TEO.raiz + 9) : TEO.raiz)[TEO.desenho] : null;
  const acN = notasAcorde(TEO.acRaiz, TEO.acTipo), acT = TIPOS_ACORDE.find(t => t[0] === TEO.acTipo), campo = campoHarmonico(TEO.tom);
  const optRaiz = (sel) => NOTAS.map((n, i) => `<option value="${i}"${sel === i ? ' selected' : ''}>${n} (${CIFRA[i]})</option>`).join('');
  return migalhas([['teoria', 'Teoria'], [null, S[1]]]) + KitFacil.ui.cabecalho({ titulo: S[1], sub: S[2] })
  + `<div class="pilha">
    ${sec === 'escalas' ? `<section class="cartao te-sec" id="t-escalas">
      <div class="grade2"><div class="campo"><label class="kf-rotulo" for="te-raiz">Tônica</label><select id="te-raiz">${optRaiz(TEO.raiz)}</select></div>
      <div class="campo"><label class="kf-rotulo" for="te-esc">Escala</label><select id="te-esc">${ESCALAS.map(e => `<option value="${e[0]}"${TEO.escala === e[0] ? ' selected' : ''}>${e[1]}</option>`).join('')}</select></div></div>
      <p class="apoio">${esc(E[3])} Notas: <b>${notas.map(n => CIFRA[n]).join(' · ')}</b> · fórmula: ${E[2].map(i => GRAUS[i]).join(' ')}</p>
      <div class="kf-seg" role="group" aria-label="Rótulo das notas"><button type="button" data-te-rot="nota" aria-pressed="${TEO.rotulo === 'nota'}">Notas</button><button type="button" data-te-rot="grau" aria-pressed="${TEO.rotulo === 'grau'}">Graus</button></div>
      ${pentas ? `<div class="kf-opcoes desenhos" role="group" aria-label="Desenho da pentatônica"><button type="button" class="chip-est" data-te-des="-1" aria-pressed="${TEO.desenho < 0}">Braço inteiro</button>${[0, 1, 2, 3, 4].map(i => `<button type="button" class="chip-est" data-te-des="${i}" aria-pressed="${TEO.desenho === i}">Desenho ${i + 1}</button>`).join('')}</div>` : ''}
      <div class="braco-wrap" id="te-braco">${bracoMarcado({ notas, raiz: TEO.raiz, rotulo: TEO.rotulo, casas: 17, desenho: des, titulo: E[1] })}</div>
      <div class="legenda"><span class="lg raiz"></span>tônica<span class="lg"></span>outras notas da escala</div>
      <div class="te-acoes"><button type="button" class="kf-btn kf-sec" data-te-ouvir="escala">${I.play}Ouvir a escala</button>${modeloDaTeoria() ? `<button type="button" class="kf-btn kf-pri" data-te-treinar>${I.treinos}Treinar ${TEO.desenho >= 0 ? 'este desenho' : 'esta escala'}</button>` : ''}</div></section>` : ''}
    ${sec === 'acordes' ? `<section class="cartao te-sec" id="t-acordes">
      <div class="grade2"><div class="campo"><label class="kf-rotulo" for="ta-raiz">Fundamental</label><select id="ta-raiz">${optRaiz(TEO.acRaiz)}</select></div>
      <div class="campo"><label class="kf-rotulo" for="ta-tipo">Tipo</label><select id="ta-tipo">${TIPOS_ACORDE.map(t => `<option value="${t[0]}"${TEO.acTipo === t[0] ? ' selected' : ''}>${t[1]}${t[0] ? ' (' + t[0] + ')' : ''}</option>`).join('')}</select></div></div>
      <div class="ac-cifra"><b>${nomeAcorde(TEO.acRaiz, TEO.acTipo)}</b><span>${acT[2].map(i => `<span class="ac-g">${i === 14 ? '9' : GRAUS[i % 12]}<small>${CIFRA[pc(TEO.acRaiz + i)]}</small></span>`).join('')}</span></div>
      <div class="braco-wrap" id="ta-braco">${bracoMarcado({ notas: acN, raiz: TEO.acRaiz, rotulo: 'grau', casas: 15, titulo: 'Notas do acorde' })}</div>
      <p class="apoio">Todas as notas do acorde no braço: escolha uma de cada corda, perto umas das outras, e você tem uma forma do acorde.</p>
      <button type="button" class="kf-btn kf-sec" data-te-ouvir="acorde">${I.play}Ouvir o acorde</button></section>` : ''}
    ${sec === 'circulo' ? `<section class="cartao te-sec" id="t-circulo">
      <div class="circ-wrap">${circuloSVG(TEO.tom)}</div>
      <p class="apoio">Toque num tom. Por fora, os tons maiores; por dentro, a relativa menor (mesmas notas). Vizinhos no círculo combinam.</p>
      <div class="campo-h">${campo.map(c => `<button type="button" class="ch-it f-${c.funcao}" data-te-campo="${c.raiz}|${c.tipo}"><small>${c.grau}</small><b>${esc(c.triade)}</b><span>${esc(c.tetrade)}</span><em>${c.funcao}</em></button>`).join('')}</div>
      <p class="apoio">Toque num acorde para ouvir. Progressões que funcionam em ${NOTAS[TEO.tom]}: <b>I–V–vi–IV</b> (${[0, 4, 5, 3].map(i => campo[i].triade).join(' – ')}), <b>ii–V–I</b> (${[1, 4, 0].map(i => campo[i].triade).join(' – ')}), <b>I–IV–V</b> (${[0, 3, 4].map(i => campo[i].triade).join(' – ')}).</p></section>` : ''}
    ${sec === 'intervalos' ? `<section class="cartao te-sec" id="t-intervalos">
      <div class="intervalos">${INTERVALOS.map(([n, nome, desc]) => `<button type="button" class="int-it" data-te-int="${n}"><span class="int-barra" aria-hidden="true">${Array.from({ length: 13 }, (_, k) => `<i class="${k === 0 || k === n ? 'on' : k < n ? 'meio' : ''}"></i>`).join('')}</span><b>${nome}</b><span class="apoio">${n} ${n === 1 ? 'semitom' : 'semitons'} · ${desc}</span></button>`).join('')}</div></section>` : ''}
    ${sec === 'ritmo' ? `<section class="cartao te-sec" id="t-ritmo">
      <div class="figuras">${FIGURAS.map(([n, t]) => `<button type="button" class="fig-it" data-te-fig="${t}">${figuraSVG(t)}<b>${n}</b><span class="apoio">${t >= 1 ? t + (t === 1 ? ' tempo' : ' tempos') : t === .5 ? 'meio tempo' : '1/4 de tempo'} · ${Math.round(60 / DB.cfg.bpm * t * 1000)} ms a ${DB.cfg.bpm} bpm</span></button>`).join('')}</div>
      <p class="apoio">Num compasso 4/4 cabem 4 semínimas, 8 colcheias ou 16 semicolcheias. Toque numa figura para ouvir quatro tempos dela.</p></section>` : ''}
  </div>`;
};



function ligarTeoria(m) {
  const muda = (k, v) => { TEO[k] = v; redesenhar(); };
  $('#te-raiz', m)?.addEventListener('change', e => muda('raiz', +e.target.value));
  $('#te-esc', m)?.addEventListener('change', e => { TEO.desenho = -1; muda('escala', e.target.value); });
  $('#ta-raiz', m)?.addEventListener('change', e => muda('acRaiz', +e.target.value));
  $('#ta-tipo', m)?.addEventListener('change', e => muda('acTipo', e.target.value));
  $$('[data-te-rot]', m).forEach(b => b.onclick = () => muda('rotulo', b.dataset.teRot));
  $$('[data-te-des]', m).forEach(b => b.onclick = () => muda('desenho', +b.dataset.teDes));
  $('[data-te-treinar]', m)?.addEventListener('click', () => { const [id, pos] = modeloDaTeoria(); abrirTreino(id, { cfg: { raiz: TEO.raiz, pos, tam: 'moderado' } }); });
  const a = () => audio();
  $$('[data-te-ouvir]', m).forEach(b => b.onclick = () => {
    const ctx = a(); if (!ctx) return; const t = ctx.currentTime + .05;
    if (b.dataset.teOuvir === 'escala') { const base = 48 + TEO.raiz, iv = ESCALAS.find(e => e[0] === TEO.escala)[2]; [...iv, 12].forEach((i, k) => tocarCorda(base + i, t + k * .32, .5)); }
    else { const base = 48 + TEO.acRaiz, iv = TIPOS_ACORDE.find(x => x[0] === TEO.acTipo)[2]; iv.forEach((i, k) => { tocarCorda(base + i, t + k * .12, 2); }); }
  });
  $('.circ-wrap', m)?.addEventListener('click', e => { const g = e.target.closest('[data-tom]'); if (g) muda('tom', +g.dataset.tom); });
  $('.circ-wrap', m)?.addEventListener('keydown', e => { const g = e.target.closest('[data-tom]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); muda('tom', +g.dataset.tom); } });
  $$('[data-te-campo]', m).forEach(b => b.onclick = () => { const [rz, tp] = b.dataset.teCampo.split('|'); const ctx = a(); if (!ctx) return; const t = ctx.currentTime + .05; notasAcorde(+rz, tp).forEach((n, k) => tocarCorda(48 + n + (n < +rz ? 12 : 0), t + k * .1, 1.8)); });
  $$('[data-te-int]', m).forEach(b => b.onclick = () => { const ctx = a(); if (!ctx) return; const t = ctx.currentTime + .05, n = +b.dataset.teInt; tocarCorda(57, t, .8); tocarCorda(57 + n, t + .6, .8); tocarCorda(57, t + 1.3, 1.2); tocarCorda(57 + n, t + 1.3, 1.2); });
  $$('[data-te-fig]', m).forEach(b => b.onclick = () => { const ctx = a(); if (!ctx) return; const t = ctx.currentTime + .05, f = +b.dataset.teFig, seg = 60 / DB.cfg.bpm; for (let k = 0; k < 4 / f; k++) tocarCorda(57, t + k * f * seg, Math.max(.12, f * seg * .9)); });
  $$('.braco-wrap', m).forEach(w => w.addEventListener('click', e => { const g = e.target.closest('[data-nota]'); if (!g) return; const [c, k] = g.dataset.nota.split(',').map(Number); const ctx = a(); if (ctx) tocarCorda(midiDe(c, k), ctx.currentTime + .02, 1.2); g.classList.add('tocou'); setTimeout(() => g.classList.remove('tocou'), 400); }));
}

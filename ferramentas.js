/* Guitarra Fácil · ferramentas: metrônomo, bateria, mapa do braço, acordes e afinador (telas e funcionamento) */
'use strict';
/* Metrônomo: o número grande, a batida e um botão */
VIEWS.metronomo = () => KitFacil.ui.cabecalho({ titulo: 'Metrônomo', sub: 'O tempo com o metrônomo ligado conta para a meta do dia.' })
  + `<div class="pilha palco-ferr">
    <div class="batidas grande" aria-hidden="true">${Array.from({ length: DB.cfg.compasso || 4 }, () => '<span></span>').join('')}</div>
    <div class="metro-bpm"><button type="button" class="kf-btn kf-sec" data-bpm="-5" aria-label="5 batidas a menos">−5</button><button type="button" class="kf-btn kf-sec" data-bpm="-1" aria-label="1 batida a menos">−1</button><output id="bpm" aria-live="polite">${DB.cfg.bpm}</output><button type="button" class="kf-btn kf-sec" data-bpm="1" aria-label="1 batida a mais">+1</button><button type="button" class="kf-btn kf-sec" data-bpm="5" aria-label="5 batidas a mais">+5</button></div>
    <input type="range" id="bpm-r" min="40" max="240" step="1" value="${DB.cfg.bpm}" aria-label="Batidas por minuto">
    <button type="button" class="play-grande${metro.ligado ? ' on' : ''}" id="metro" aria-label="${metro.ligado ? 'Parar o metrônomo' : 'Começar o metrônomo'}">${metro.ligado ? I.stop : I.play}</button>
    <div class="linha-ferr"><div class="kf-seg" role="group" aria-label="Compasso">${[2, 3, 4, 6].map(c => `<button type="button" data-compasso="${c}" aria-pressed="${(DB.cfg.compasso || 4) === c}">${c === 6 ? '6/8' : c + '/4'}</button>`).join('')}</div>
      <button type="button" class="kf-btn kf-sec" id="toque-ritmo">Toque no ritmo</button></div>
  </div>`;
/* Bateria: estilos ilustrados pelo próprio desenho do ritmo */
const iluRitmo = ([, , ppb, P]) => { const n = ppb * 4, w = 56 / n; return ilu(['h', 'c', 'b'].map((k, r) => Array.from({ length: n }, (_, i) => P[k].includes(i) ? `<rect x="${4 + i * w + .6}" y="${8 + r * 12}" width="${w - 1.2}" height="9" rx="1.5" class="${k === 'b' ? 'il-a' : 'il-n'}"/>` : '').join('')).join('') + '<path d="M4 44h56" class="il-l"/>'); };
VIEWS.bateria = () => KitFacil.ui.cabecalho({ titulo: 'Bateria', sub: 'Escolha a batida e toque junto, no andamento do metrônomo.' })
  + `<div class="pilha palco-ferr">
    <div class="ladrilhos estilos" role="group" aria-label="Batida">${ESTILOS_BATERIA.map(e => ladrilho({ attrs: `data-estilo="${e[0]}" aria-pressed="${DB.cfg.estilo === e[0]}"`, ilu: iluRitmo(e), nome: e[1], classe: 'peq' })).join('')}</div>
    <div class="batidas grande" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
    <div class="metro-bpm"><button type="button" class="kf-btn kf-sec" data-bpm="-5" aria-label="5 batidas a menos">−5</button><output id="bpm" aria-live="polite">${DB.cfg.bpm}</output><button type="button" class="kf-btn kf-sec" data-bpm="5" aria-label="5 batidas a mais">+5</button></div>
    <button type="button" class="play-grande${bateria.ligada ? ' on' : ''}" id="bat-ligar" aria-label="${bateria.ligada ? 'Parar a bateria' : 'Tocar a bateria'}">${bateria.ligada ? I.stop : I.play}</button>
  </div>`;
// VIEWS.explorar mora em laboratorio.js; Acordes é a biblioteca aplicada de formas do instrumento.
VIEWS.acordes = () => acordesHTML();


/* ================= ferramentas: som ================= */
/* ================= ferramentas: som ================= */
const CORDAS = [['E', 'Mi grave', 82.41], ['A', 'Lá', 110], ['D', 'Ré', 146.83], ['G', 'Sol', 196], ['B', 'Si', 246.94], ['E', 'Mi agudo', 329.63]];
let ctxAudio = null;
const audio = () => { if (!ctxAudio) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctxAudio = new C(); somPreparar(ctxAudio); } if (ctxAudio.state === 'suspended') ctxAudio.resume(); return ctxAudio; };
function tocarNota(hz, dur = 2.2) {
  const a = audio(); if (!a) return;
  tocarCorda(Math.round(12 * Math.log2(hz / 440) + 69), a.currentTime + .01, Math.min(dur, 1.8));
}
const metro = { ligado: false, t: null, prox: 0, batida: 0, inicio: 0 };
function clique(acento, quando, dest) {
  const a = audio(); if (!a) return;
  somPeca(a, acento ? 'metronomo-forte' : 'metronomo', quando, dest || (typeof treino !== 'undefined' && treino.saida) || somMestre(a));
}
function metroLigar() {
  const a = audio(); metro.ligado = true; metro.batida = 0; metro.inicio = Date.now();
  metro.prox = a ? a.currentTime + 0.05 : 0;
  const passo = () => {
    const seg = 60 / DB.cfg.bpm;
    const cp = DB.cfg.compasso || 4;
    if (a) while (metro.prox < a.currentTime + 0.12) { clique(metro.batida % cp === 0, metro.prox); const b = metro.batida % cp, atraso = Math.max(0, (metro.prox - a.currentTime) * 1000); setTimeout(() => pintarBatida(b), atraso); metro.prox += seg; metro.batida++; }
  };
  passo(); metro.t = setInterval(passo, 25);
  pintarMetro();
}
function metroParar() {
  if (!metro.ligado) return;
  clearInterval(metro.t); metro.ligado = false;
  const min = Math.round((Date.now() - metro.inicio) / 60000);
  if (min >= 1) { registrarPratica(min); KitFacil.avisar(`${min} min de prática registrados.`); conferirConquistas(); }
  pintarMetro(); pintarBatida(-1);
}
function pintarMetro() { const b = $('#metro'); if (b) { b.innerHTML = metro.ligado ? I.stop : I.play; b.setAttribute('aria-label', metro.ligado ? 'Parar o metrônomo' : 'Começar o metrônomo'); b.classList.toggle('on', metro.ligado); } }
function pintarBatida(k) { $$('.batidas span').forEach((s, i) => s.classList.toggle('on', i === k)); }
// toque no ritmo: a média dos últimos toques vira o andamento
const toques = [];
function tocarRitmo() { const t = performance.now(); if (toques.length && t - toques[toques.length - 1] > 2000) toques.length = 0; toques.push(t); if (toques.length > 5) toques.shift(); if (toques.length >= 2) { const m = (toques[toques.length - 1] - toques[0]) / (toques.length - 1); mudarBpm(60000 / m); } }
function mudarBpm(v) {
  DB.cfg.bpm = Math.max(40, Math.min(240, Math.round(v))); LS.set('db', DB);
  const o = $('#bpm'), r = $('#bpm-r'); if (o) o.textContent = DB.cfg.bpm; if (r) r.value = DB.cfg.bpm; const fg = $('#fig-ms'); if (fg) fg.textContent = Math.round(60000 / DB.cfg.bpm); $$('.bpm-v').forEach(x => x.textContent = DB.cfg.bpm);
  clearTimeout(mudarBpm.t); mudarBpm.t = setTimeout(commit, 600);
}
/* diagramas de acorde: 6 cordas, 4 casas; casas: -1 não toca, 0 solta */
const ACORDES = [['Mi menor', [0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0]], ['Lá menor', [-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0]], ['Ré menor', [-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1]],
  ['Mi maior', [0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]], ['Lá maior', [-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0]], ['Ré maior', [-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2]],
  ['Dó maior', [-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]], ['Sol maior', [3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3]], ['Mi 5 (power chord)', [0, 2, -1, -1, -1, -1], [0, 1, 0, 0, 0, 0]],
  ['Fá maior (pestana)', [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], 1]];
const ACORDES_ABERTOS = [
  ['em', 4, 'm', ACORDES[0]], ['am', 9, 'm', ACORDES[1]], ['dm', 2, 'm', ACORDES[2]], ['e', 4, '', ACORDES[3]], ['a', 9, '', ACORDES[4]], ['d', 2, '', ACORDES[5]], ['c', 0, '', ACORDES[6]], ['g', 7, '', ACORDES[7]], ['e5', 4, '5', ACORDES[8]], ['f', 5, '', ACORDES[9]],
  ['c7', 0, '7', ['Dó com sétima', [-1,3,2,3,1,0], [0,3,2,4,1,0]]], ['c7m', 0, '7M', ['Dó com sétima maior', [-1,3,2,0,0,0], [0,3,2,0,0,0]]],
  ['d7', 2, '7', ['Ré com sétima', [-1,-1,0,2,1,2], [0,0,0,2,1,3]]], ['d7m', 2, '7M', ['Ré com sétima maior', [-1,-1,0,2,2,2], [0,0,0,1,2,3]]],
  ['e7', 4, '7', ['Mi com sétima', [0,2,0,1,0,0], [0,2,0,1,0,0]]], ['em7', 4, 'm7', ['Mi menor com sétima', [0,2,0,0,0,0], [0,2,0,0,0,0]]],
  ['a7', 9, '7', ['Lá com sétima', [-1,0,2,0,2,0], [0,0,2,0,3,0]]], ['am7', 9, 'm7', ['Lá menor com sétima', [-1,0,2,0,1,0], [0,0,2,0,1,0]]],
  ['g7', 7, '7', ['Sol com sétima', [3,2,0,0,0,1], [3,2,0,0,0,1]]], ['asus2', 9, 'sus2', ['Lá suspenso com 2ª', [-1,0,2,2,0,0], [0,0,1,2,0,0]]],
  ['asus4', 9, 'sus4', ['Lá suspenso com 4ª', [-1,0,2,2,3,0], [0,0,1,2,3,0]]], ['dsus2', 2, 'sus2', ['Ré suspenso com 2ª', [-1,-1,0,2,3,0], [0,0,0,1,3,0]]],
  ['dsus4', 2, 'sus4', ['Ré suspenso com 4ª', [-1,-1,0,2,3,3], [0,0,0,1,3,4]]],
].map(([id, raiz, tipo, a]) => ({ id: 'ab-' + id, raiz, tipo, nome: a[0], cifra: CIFRA[raiz] + tipo, casas: a[1], dedos: a[2], pestana: a[3] || 0, inicio: 1, forma: 'Aberto', nivel: tipo === '' || tipo === 'm' || tipo === '5' ? 1 : 2, essencial: true }));
const FORMAS_MOVEIS = {
  '': { e: [[0,2,2,1,0,0],[1,3,4,2,1,1]], a: [[-1,0,2,2,2,0],[0,1,3,3,3,1]] },
  m: { e: [[0,2,2,0,0,0],[1,3,4,1,1,1]], a: [[-1,0,2,2,1,0],[0,1,3,4,2,1]] },
  '7': { e: [[0,2,0,1,0,0],[1,3,1,2,1,1]], a: [[-1,0,2,0,2,0],[0,1,3,1,4,1]] },
  '7M': { e: [[0,2,1,1,0,0],[1,4,2,3,1,1]], a: [[-1,0,2,1,2,0],[0,1,4,2,3,1]] },
  m7: { e: [[0,2,0,0,0,0],[1,3,1,1,1,1]], a: [[-1,0,2,0,1,0],[0,1,3,1,2,1]] },
  '5': { e: [[0,2,2,-1,-1,-1],[1,3,4,0,0,0]], a: [[-1,0,2,2,-1,-1],[0,1,3,4,0,0]] },
};
const CATALOGO_ACORDES = (() => {
  const r = [...ACORDES_ABERTOS];
  Object.entries(FORMAS_MOVEIS).forEach(([tipo, formas]) => Array.from({ length: 12 }, (_, raiz) => raiz).forEach(raiz => Object.entries(formas).forEach(([forma, [rel, dedos]]) => {
    const aberta = forma === 'e' ? 4 : 9, casa = pc(raiz - aberta) || 12, casas = rel.map(k => k < 0 ? -1 : k + casa), t = TIPOS_ACORDE.find(x => x[0] === tipo);
    r.push({ id: `mov-${forma}-${raiz}-${tipo || 'M'}`, raiz, tipo, nome: `${NOTAS[raiz]} ${t[1].toLowerCase()}`, cifra: CIFRA[raiz] + tipo, casas, dedos, pestana: casa, inicio: casa, forma: `Forma de ${forma.toUpperCase()}`, nivel: tipo === '5' ? 1 : tipo === '' || tipo === 'm' ? 2 : 3, essencial: false });
  })));
  return r;
})();
const ACORDE_UI = { busca: '', familia: 'essenciais', nivel: '', mao: 'direita', sel: 'ab-em' };
function tocarAcorde(casas, arpejo = false) { const a = audio(); if (!a) return; const t = a.currentTime + .03; casas.forEach((k, s) => { if (k >= 0) tocarCorda(midiDe(s, k), t + (arpejo ? s * .28 : s * .035), 1.8, .35); }); }
function diagrama(casas, dedos, nome, pestana, op = {}) {
  pestana = pestana || (ACORDES.find(a => a[0] === nome) || [])[3];
  const inicio = Math.max(1, op.inicio || (Math.max(...casas) > 4 ? Math.min(...casas.filter(k => k > 0)) : 1)), x = i => 14 + i * 18, y = c => 26 + (c - inicio + 1) * 22, fonte = i => op.esquerda ? 5 - i : i;
  let s = `<svg viewBox="0 0 118 132" role="img" aria-label="Acorde de ${esc(nome)}${inicio > 1 ? ', a partir da casa ' + inicio : ''}"><g stroke="currentColor" fill="none">`;
  if (pestana) s += `</g><rect x="${x(0) - 6}" y="${y(pestana) - 18}" width="${x(5) - x(0) + 12}" height="14" rx="7" fill="currentColor"/><g stroke="currentColor" fill="none">`;
  s += `<line x1="${x(0)}" y1="${y(inicio - 1)}" x2="${x(5)}" y2="${y(inicio - 1)}" stroke-width="${inicio === 1 ? 4 : 1}"/>`;
  for (let f = 0; f < 4; f++) s += `<line x1="${x(0)}" y1="${y(inicio + f)}" x2="${x(5)}" y2="${y(inicio + f)}" stroke-width="1" opacity=".5"/>`;
  for (let i = 0; i < 6; i++) s += `<line x1="${x(i)}" y1="${y(inicio - 1)}" x2="${x(i)}" y2="${y(inicio + 3)}" stroke-width="1.2"/>`;
  s += '</g>';
  if (inicio > 1) s += `<text x="2" y="${y(inicio) - 7}" font-size="10" fill="currentColor">${inicio}</text>`;
  for (let i = 0; i < 6; i++) { const j = fonte(i), c = casas[j];
    if (c < 0) s += `<text x="${x(i)}" y="16" text-anchor="middle" font-size="12" fill="currentColor">X</text>`;
    else if (c === 0) s += `<circle cx="${x(i)}" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    else s += `<circle cx="${x(i)}" cy="${y(c) - 11}" r="7.5" fill="currentColor"/><text x="${x(i)}" y="${y(c) - 7}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--kf-surface)">${dedos[j] || 1}</text>`;
  }
  return s + '</svg>';
}

function acordesFiltrados() {
  const q = semAcento(ACORDE_UI.busca), tipo = a => ACORDE_UI.familia === 'essenciais' ? a.essencial : ACORDE_UI.familia === 'maiores' ? a.tipo === '' : ACORDE_UI.familia === 'menores' ? a.tipo === 'm' : ACORDE_UI.familia === 'setimas' ? a.tipo.includes('7') : ACORDE_UI.familia === 'power' ? a.tipo === '5' : true;
  return CATALOGO_ACORDES.filter(a => tipo(a) && (!ACORDE_UI.nivel || a.nivel === +ACORDE_UI.nivel) && (!q || semAcento(`${a.nome} ${a.cifra} ${a.forma}`).includes(q)));
}
function acordesHTML() {
  const L = acordesFiltrados(), atual = CATALOGO_ACORDES.find(a => a.id === ACORDE_UI.sel) || L[0] || CATALOGO_ACORDES[0], t = TIPOS_ACORDE.find(x => x[0] === atual.tipo), notas = notasAcorde(atual.raiz, atual.tipo), esquerda = ACORDE_UI.mao === 'esquerda';
  const familias = [['essenciais','Essenciais'],['maiores','Maiores'],['menores','Menores'],['setimas','Com sétima'],['power','Power chords'],['todos','Todos']];
  return arteDestaque('acordes') + KitFacil.ui.cabecalho({ titulo: 'Acordes', sub: 'Encontre uma forma, entenda sua construção, ouça e leve para o braço.' }) + `<div class="pilha acordes-app">
    <form class="ac-busca" data-ac-busca role="search"><label class="kf-rotulo" for="ac-q">Buscar por nome ou cifra</label><div class="busca-linha"><input id="ac-q" class="kf-entrada" type="search" value="${esc(ACORDE_UI.busca)}" placeholder="Ex.: Am7, Dó maior, power chord"><button class="kf-btn kf-pri" type="submit">Buscar</button></div></form>
    <div class="ac-filtros"><div class="kf-seg" role="group" aria-label="Família">${familias.map(([k,n])=>`<button type="button" data-ac-familia="${k}" aria-pressed="${ACORDE_UI.familia===k}">${n}</button>`).join('')}</div><div class="kf-seg" role="group" aria-label="Mão"><button type="button" data-ac-mao="direita" aria-pressed="${!esquerda}">Destro</button><button type="button" data-ac-mao="esquerda" aria-pressed="${esquerda}">Canhoto</button></div></div>
    <section class="ac-detalhe cartao" aria-labelledby="ac-atual"><div class="ac-diagrama-grande">${diagrama(atual.casas, atual.dedos, atual.nome, atual.pestana, { inicio: atual.inicio, esquerda })}</div><div class="ac-explica"><span class="meta-prazo">${esc(atual.forma)} · nível ${atual.nivel}</span><h2 id="ac-atual">${esc(atual.nome)} <span>${esc(atual.cifra)}</span></h2><p><b>Notas:</b> ${notas.map(n=>NOTAS[n]).join(', ')} · <b>fórmula:</b> ${t[2].map(i=>i===14?'9':GRAUS[i%12]).join(' · ')}</p><ol><li>Localize a fundamental e a casa inicial.</li><li>Coloque os dedos indicados sem encostar nas cordas vizinhas.</li><li>Toque corda por corda; ajuste qualquer nota abafada antes de tocar o acorde inteiro.</li></ol><p class="apoio">X significa não tocar. O significa corda solta. A barra contínua é uma pestana.</p><div class="ac-acoes"><button type="button" class="kf-btn kf-pri" data-ac-ouvir="junto">${I.ouvir}Ouvir junto</button><button type="button" class="kf-btn kf-sec" data-ac-ouvir="cordas">Ouvir corda por corda</button><button type="button" class="kf-btn kf-sec" data-ac-braco>Mostrar no braço</button><button type="button" class="kf-btn kf-sec" data-ac-treinar>Treinar acordes</button></div></div></section>
    <p class="apoio ac-contagem"><b>${L.length}</b> ${L.length===1?'forma encontrada':'formas encontradas'}</p><div class="acordes ac-grade">${L.map(a=>`<button type="button" class="acorde${a.id===atual.id?' on':''}" data-ac-selecionar="${a.id}">${diagrama(a.casas,a.dedos,a.nome,a.pestana,{inicio:a.inicio,esquerda})}<b>${esc(a.cifra)}</b><small>${esc(a.nome)} · ${esc(a.forma)}</small></button>`).join('')}</div>
  </div>`;
}
function ligarAcordes(m) {
  $('[data-ac-busca]', m)?.addEventListener('submit', e => { e.preventDefault(); ACORDE_UI.busca = $('#ac-q', m).value.trim(); redesenhar(); });
  $$('[data-ac-familia]', m).forEach(b => b.onclick = () => { ACORDE_UI.familia = b.dataset.acFamilia; ACORDE_UI.busca = ''; redesenhar(); });
  $$('[data-ac-mao]', m).forEach(b => b.onclick = () => { ACORDE_UI.mao = b.dataset.acMao; redesenhar(); });
  $$('[data-ac-selecionar]', m).forEach(b => b.onclick = () => { ACORDE_UI.sel = b.dataset.acSelecionar; redesenhar(); requestAnimationFrame(() => $('#ac-atual')?.scrollIntoView({ block: 'center' })); });
  const atual = () => CATALOGO_ACORDES.find(a => a.id === ACORDE_UI.sel) || acordesFiltrados()[0] || CATALOGO_ACORDES[0];
  $$('[data-ac-ouvir]', m).forEach(b => b.onclick = () => tocarAcorde(atual().casas, b.dataset.acOuvir === 'cordas'));
  $('[data-ac-braco]', m)?.addEventListener('click', () => { const a = atual(); Object.assign(LAB, { modo: 'acorde', raiz: a.raiz, acorde: a.tipo, rotulo: 'grau', base: null, sel: [] }); ir('explorar/acorde'); });
  $('[data-ac-treinar]', m)?.addEventListener('click', () => { BUSCA.competencia = 'acordes'; BUSCA.busca = ''; ir('treinos/buscar'); });
}

/* ================= mapa do braço ================= */
// NOTAS, CIFRA e SOLTAS vêm de teoria.js
const freqDe = (corda, casa) => CORDAS[corda][2] * Math.pow(2, casa / 12);
function bracoSVG(todas) {
  const C = 13, L = 46, A = 26, x = k => 22 + k * L, y = c => 18 + (5 - c) * A;
  let s = `<svg class="braco" viewBox="0 0 ${x(C) + 4} ${y(0) + 30}" role="group" aria-label="Mapa das notas no braço">`;
  s += `<rect x="${x(0)}" y="${y(5) - 10}" width="${x(C) - x(0)}" height="${y(0) - y(5) + 20}" rx="4" fill="var(--kf-surface-2)"/>`;
  for (let k = 0; k <= C; k++) s += `<line x1="${x(k)}" y1="${y(5) - 10}" x2="${x(k)}" y2="${y(0) + 10}" stroke="var(--kf-line-2)" stroke-width="${k === 0 ? 5 : 1.5}"/>`;
  [3, 5, 7, 9].forEach(k => s += `<circle cx="${x(k) - L / 2}" cy="${y(0) + 22}" r="3" fill="var(--kf-muted)"/>`);
  s += `<circle cx="${x(12) - L / 2 - 6}" cy="${y(0) + 22}" r="3" fill="var(--kf-muted)"/><circle cx="${x(12) - L / 2 + 6}" cy="${y(0) + 22}" r="3" fill="var(--kf-muted)"/>`;
  for (let c = 0; c < 6; c++) s += `<line x1="${x(0)}" y1="${y(c)}" x2="${x(C)}" y2="${y(c)}" stroke="var(--kf-muted)" stroke-width="${1 + (5 - c) * .25}"/>`;
  for (let c = 0; c < 6; c++) for (let k = 0; k < C; k++) {
    const n = (SOLTAS[c] + k) % 12, nat = !CIFRA[n].includes('#');
    if (!todas && !nat) continue;
    const cx = k === 0 ? x(0) - 12 : x(k) - L / 2;
    s += `<g class="nota${nat ? '' : ' sust'}" data-nota="${c},${k}" role="button" tabindex="0" aria-label="${NOTAS[n]}, ${6 - c}ª corda, ${k ? 'casa ' + k : 'solta'}"><circle cx="${cx}" cy="${y(c)}" r="10.5"/><text x="${cx}" y="${y(c) + 4}" text-anchor="middle">${CIFRA[n]}</text></g>`;
  }
  return s + '</svg>';
}

/* ================= afinador (microfone) ================= */
/* A frequência sai da autocorrelação do sinal: rápida e boa para as cordas da guitarra (80 a 1000 Hz).
   Nada é gravado nem enviado: o áudio é analisado em memória, quadro a quadro. */
function detectarFrequencia(buf, taxa) {
  const n = buf.length; let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
  if (Math.sqrt(rms / n) < 0.01) return null; // silêncio
  const min = Math.floor(taxa / 1000), max = Math.min(Math.floor(taxa / 70), n - 1);
  let melhor = -1, melhorV = 0, c = new Float32Array(max + 2);
  for (let l = min; l <= max + 1; l++) { let soma = 0; for (let i = 0; i < n - l; i++) soma += buf[i] * buf[i + l]; c[l] = soma; }
  let e0 = 0; for (let i = 0; i < n; i++) e0 += buf[i] * buf[i];
  for (let l = min + 1; l <= max; l++) { const v = c[l] / e0; if (v > melhorV && c[l] >= c[l - 1] && c[l] >= c[l + 1] && v > 0.5) { melhorV = v; melhor = l; if (v > 0.9) break; } }
  if (melhor < 0) return null;
  const a = c[melhor - 1], b = c[melhor], d = c[melhor + 1], desl = (a - d) / (2 * (a - 2 * b + d)) || 0;
  return taxa / (melhor + desl);
}
function notaDe(f) { const m = 12 * Math.log2(f / 440) + 69, r = Math.round(m); return { nome: NOTAS[(r % 12 + 12) % 12], cifra: CIFRA[(r % 12 + 12) % 12], cents: Math.round((m - r) * 100), alvo: 440 * Math.pow(2, (r - 69) / 12) }; }
const afinador = { ligado: false, fluxo: null, raf: 0 };
async function afinadorLigar() {
  const a = audio(); if (!a || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { KitFacil.avisar('Este navegador não permite usar o microfone. Use as notas de referência.'); return; }
  try {
    afinador.fluxo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  } catch { KitFacil.avisar('Sem permissão para o microfone. Libere nas configurações do navegador ou use as notas de referência.'); return; }
  const fonte = a.createMediaStreamSource(afinador.fluxo), an = a.createAnalyser(); an.fftSize = 2048; fonte.connect(an);
  const buf = new Float32Array(an.fftSize); afinador.ligado = true; pintarAfinador();
  let suave = null, quadro = 0;
  const passo = () => {
    if (!afinador.ligado) return;
    if (quadro++ % 2) { afinador.raf = requestAnimationFrame(passo); return; } // meio quadro basta e poupa bateria
    an.getFloatTimeDomainData(buf);
    const f = detectarFrequencia(buf, a.sampleRate);
    if (f) { suave = suave && Math.abs(f - suave) / suave < 0.03 ? suave * 0.7 + f * 0.3 : f; mostrarNota(suave); }
    afinador.raf = requestAnimationFrame(passo);
  };
  passo();
}
function afinadorDesligar() {
  if (!afinador.ligado) return;
  afinador.ligado = false; cancelAnimationFrame(afinador.raf);
  if (afinador.fluxo) afinador.fluxo.getTracks().forEach(t => t.stop()); afinador.fluxo = null;
  pintarAfinador();
}
const afinacao = () => afinacaoDe(DB.cfg.afinacao || 'padrao')[2];
function mostrarNota(f) {
  const n = notaDe(f), el = $('#af-nota'), pt = $('#af-ponteiro'), msg = $('#af-msg'); if (!el) return;
  const ok = Math.abs(n.cents) <= 5, m = 12 * Math.log2(f / 440) + 69, A = afinacao();
  el.textContent = n.cifra; el.classList.toggle('ok', ok);
  if (pt) pt.style.transform = `rotate(${Math.max(-50, Math.min(50, n.cents)) * 1.6}deg)`;
  // a corda mais perto do som, na afinação escolhida
  const k = A.reduce((b, x, i) => Math.abs(m - x) < Math.abs(m - A[b]) ? i : b, 0);
  $$('[data-corda]').forEach(b => b.classList.toggle('perto', +b.dataset.corda === k && Math.abs(m - A[k]) < 1.5));
  if (msg) msg.textContent = ok ? `${n.nome}: afinada` : n.cents < 0 ? `${n.nome}: baixa (${n.cents} cents). Aperte a tarraxa.` : `${n.nome}: alta (+${n.cents} cents). Afrouxe a tarraxa.`;
}
function pintarAfinador() { const b = $('#af-ligar'); if (b) { b.innerHTML = afinador.ligado ? I.stop + 'Desligar o microfone' : I.mic + 'Ligar o microfone'; b.classList.toggle('kf-sec', afinador.ligado); b.classList.toggle('kf-pri', !afinador.ligado); } if (!afinador.ligado) { const m = $('#af-msg'); if (m) m.textContent = 'Ligue o microfone e toque uma corda solta.'; const n = $('#af-nota'); if (n) { n.textContent = '–'; n.classList.remove('ok'); } const p = $('#af-ponteiro'); if (p) p.style.transform = 'rotate(0deg)'; $$('[data-corda]').forEach(x => x.classList.remove('perto')); } }



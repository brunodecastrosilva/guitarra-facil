/* Guitarra Fácil · ferramentas: Afinador, Metrônomo e Bateria.
   O afinador só usa o microfone quando a pessoa liga, e analisa o som na memória do aparelho: nada é gravado nem enviado
   (Regras do app, Art. 9º). Nenhuma nota é dada pelo áudio. */
'use strict';

/* ================= Afinador ================= */
const AFINADOR = { ligado: false, stream: null, ctx: null, an: null, buf: null, raf: 0, midi: null, cents: 0, hz: 0, ultimo: 0 };
/* frequência pela autocorrelação (método YIN simplificado); devolve 0 quando não há nota clara */
function detectarHz(buf, taxa) {
  let rms = 0; for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
  if (Math.sqrt(rms / buf.length) < .012) return 0;
  const min = Math.floor(taxa / 1400), max = Math.floor(taxa / 60), n = buf.length - max;
  const d = new Float32Array(max + 1);
  for (let tau = min; tau <= max; tau++) { let s = 0; for (let i = 0; i < n; i++) { const x = buf[i] - buf[i + tau]; s += x * x; } d[tau] = s; }
  let soma = 0, melhor = -1;
  const cm = new Float32Array(max + 1);
  for (let tau = min; tau <= max; tau++) { soma += d[tau]; cm[tau] = d[tau] * (tau - min + 1) / (soma || 1); }
  for (let tau = min + 1; tau < max; tau++) if (cm[tau] < .15 && cm[tau] <= cm[tau - 1] && cm[tau] <= cm[tau + 1]) { melhor = tau; break; }
  if (melhor < 0) return 0;
  const a = cm[melhor - 1], b = cm[melhor], c = cm[melhor + 1], p = (a - c) / (2 * (a - 2 * b + c) || 1);
  return taxa / (melhor + (Number.isFinite(p) ? p : 0));
}
async function ligarAfinador() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const fonte = ctx.createMediaStreamSource(s), an = ctx.createAnalyser(); an.fftSize = 4096; fonte.connect(an);
    Object.assign(AFINADOR, { ligado: true, stream: s, ctx, an, buf: new Float32Array(an.fftSize) });
    APP.redesenhar();
    const passo = () => {
      if (!AFINADOR.ligado) return;
      AFINADOR.an.getFloatTimeDomainData(AFINADOR.buf);
      const hz = detectarHz(AFINADOR.buf, AFINADOR.ctx.sampleRate);
      if (hz > 0) { const m = 69 + 12 * Math.log2(hz / 440); AFINADOR.midi = Math.round(m); AFINADOR.cents = Math.round((m - Math.round(m)) * 100); AFINADOR.hz = hz; AFINADOR.ultimo = Date.now(); pintarAfinador(); }
      else if (AFINADOR.midi != null && Date.now() - AFINADOR.ultimo > 1500) { AFINADOR.midi = null; pintarAfinador(); }
      AFINADOR.raf = setTimeout(passo, 70);
    };
    passo();
  } catch {
    KitFacil.avisar('O microfone não foi liberado. Permita o microfone para este site nas configurações do navegador.');
  }
}
function desligarAfinador() {
  clearTimeout(AFINADOR.raf);
  if (AFINADOR.stream) AFINADOR.stream.getTracks().forEach(t => t.stop());
  if (AFINADOR.ctx) AFINADOR.ctx.close().catch(() => {});
  Object.assign(AFINADOR, { ligado: false, stream: null, ctx: null, an: null, midi: null, cents: 0, hz: 0 });
}
function pintarAfinador() {
  const n = $('#af-nota'), g = $('#af-agulha'); if (!n) return;
  if (AFINADOR.midi == null) { n.innerHTML = `—<small>${AFINADOR.ligado ? 'Toque uma corda solta' : 'Microfone desligado'}</small>`; if (g) g.style.transform = 'rotate(0deg)'; $$('[data-corda-af]').forEach(x => x.removeAttribute('aria-current')); return; }
  const c = AFINADOR.cents, nome = TEORIA.nome(AFINADOR.midi, notacao()) + TEORIA.oitava(AFINADOR.midi);
  const dica = Math.abs(c) <= 5 ? 'Afinada' : c < 0 ? 'Baixa: aperte a tarraxa' : 'Alta: solte a tarraxa';
  n.innerHTML = `${esc(nome)}<small>${esc(dica)} · ${c > 0 ? '+' : ''}${c} cents</small>`;
  if (g) g.style.transform = `rotate(${limitar(c, -50, 50) * 1.6}deg)`;
  const cordas = TEORIA.afinacao(afin()).midi, perto = cordas.map((m, i) => [Math.abs(m - AFINADOR.midi), i]).sort((a, b) => a[0] - b[0])[0];
  $$('[data-corda-af]').forEach(x => { if (+x.dataset.cordaAf === perto[1] && perto[0] <= 2) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current'); });
}
TELAS.afinador = {
  titulo: 'Afinador', principal: true, sub: 'Afine pelo microfone ou de ouvido, corda por corda.',
  html() {
    const a = TEORIA.afinacao(afin());
    return `${KitFacil.ui.faixa({ tipo: 'info', html: 'O som do microfone é analisado só neste aparelho, na memória. Nada é gravado nem enviado.' })}
      <p class="gf-numero" id="af-nota" aria-live="polite">—<small>${AFINADOR.ligado ? 'Toque uma corda solta' : 'Microfone desligado'}</small></p>
      <svg class="gf-ponteiro" viewBox="0 0 240 130" role="img" aria-label="Ponteiro do afinador: no meio, a corda está afinada">
        ${[-50, -25, 0, 25, 50].map(v => { const a2 = (v * 1.6 - 90) * Math.PI / 180; return `<line class="${v ? 'gf-esc' : 'gf-meio'}" x1="${120 + Math.cos(a2) * 92}" y1="${118 + Math.sin(a2) * 92}" x2="${120 + Math.cos(a2) * 108}" y2="${118 + Math.sin(a2) * 108}"/>`; }).join('')}
        <line class="gf-agulha" id="af-agulha" x1="120" y1="118" x2="120" y2="22" style="transform-origin:120px 118px"/><circle class="gf-eixo" cx="120" cy="118" r="6"/></svg>
      <button type="button" class="kf-btn kf-pri" id="af-mic">${AFINADOR.ligado ? 'Desligar o microfone' : 'Ligar o microfone'}</button>
      ${escolhaHTML('af-afin', 'Afinação', TEORIA.AFINACOES.map(x => [x.id, x.nome]), a.id)}
      <h2 class="gf-h">Afinar de ouvido</h2><p class="gf-apoio">Toque para ouvir a nota de cada corda solta.</p>
      <ul class="gf-lista">${[5, 4, 3, 2, 1, 0].map(c => `<li><button type="button" class="gf-linha" data-corda-af="${c}"><span class="gf-num">${DESENHO.ORD[c]}</span><span class="gf-linha-tx"><b>${esc(TEORIA.nome(a.midi[c], notacao()) + TEORIA.oitava(a.midi[c]))}</b><small>${c === 0 ? 'a mais grossa' : c === 5 ? 'a mais fina' : 'corda'} </small></span>${ICONE.ouvir}</button></li>`).join('')}</ul>`;
  },
  ligar(r) {
    $('#af-mic', r).onclick = () => { if (AFINADOR.ligado) { desligarAfinador(); APP.redesenhar(); } else ligarAfinador(); };
    $('#af-afin', r).onchange = e => { DADOS.mudarPerfil({ afin: e.target.value }); APP.redesenhar(); };
    r.querySelectorAll('[data-corda-af]').forEach(b => b.onclick = () => TOCADOR.soar(+b.dataset.cordaAf, 0, afin()));
    pintarAfinador();
  },
  sair() { desligarAfinador(); },
};

/* ================= Metrônomo ================= */
const METRO = { bpm: 80, compasso: 4, sub: 1, ligado: false, laco: null, toques: [] };
function pintarPulso(i) {
  const passosPorTempo = METRO.sub, tempo = Math.floor(i / passosPorTempo) % METRO.compasso;
  if (i % passosPorTempo) return;
  $$('#pulsos li').forEach((li, j) => li.classList.toggle('gf-on', j === tempo));
}
async function ligarMetronomo() {
  METRO.ligado = true; APP.redesenhar();
  METRO.laco = await TOCADOR.laco({ bpm: METRO.bpm, passo: 1 / METRO.sub, pecas: ['metronomo', 'metronomo-forte'],
    aoPasso: (i, quando) => { const noTempo = i % METRO.sub === 0, tempo = Math.floor(i / METRO.sub) % METRO.compasso; SOM.peca(noTempo && tempo === 0 ? 'metronomo-forte' : 'metronomo', quando, noTempo ? 1 : .45); },
    aoVer: pintarPulso, aoParar: () => { METRO.ligado = false; METRO.laco = null; $$('#pulsos li').forEach(li => li.classList.remove('gf-on')); } });
}
function mudarBpmMetro(v) { METRO.bpm = limitar(Math.round(v), 30, 240); if (METRO.laco) METRO.laco.mudarBpm(METRO.bpm); const n = $('#mt-bpm'); if (n) n.innerHTML = `${METRO.bpm}<small>batidas por minuto</small>`; const s = $('#mt-faixa'); if (s) s.value = METRO.bpm; }
TELAS.metronomo = {
  titulo: 'Metrônomo', principal: true, sub: 'O pulso para treinar no tempo, com bloco de madeira.',
  html() {
    return `<p class="gf-numero" id="mt-bpm" aria-live="polite">${METRO.bpm}<small>batidas por minuto</small></p>
      <div class="gf-controle"><button type="button" class="kf-btn kf-sec gf-icone" id="mt-menos" aria-label="Mais devagar">${ICONE.menos}</button>
        <input type="range" class="gf-faixa-range" id="mt-faixa" min="30" max="240" step="1" value="${METRO.bpm}" aria-label="Andamento em batidas por minuto">
        <button type="button" class="kf-btn kf-sec gf-icone" id="mt-mais" aria-label="Mais depressa">${ICONE.mais}</button></div>
      <ol class="gf-pulsos" id="pulsos" aria-hidden="true">${Array.from({ length: METRO.compasso }, (x, i) => `<li class="${i ? '' : 'gf-forte'}"></li>`).join('')}</ol>
      <button type="button" class="kf-btn kf-pri" id="mt-ligar">${METRO.ligado ? ICONE.parar + 'Parar' : ICONE.play + 'Começar'}</button>
      ${segmento('mt-comp', 'Tempos por compasso', [[2, '2'], [3, '3'], [4, '4'], [6, '6']], METRO.compasso)}
      ${segmento('mt-sub', 'Cliques por tempo', [[1, '1'], [2, '2'], [3, '3'], [4, '4']], METRO.sub)}
      <button type="button" class="kf-btn kf-sec" id="mt-bater">Bater o tempo</button>
      <p class="gf-apoio">Toque em Bater o tempo no ritmo da música, quatro vezes ou mais, e o metrônomo acompanha.</p>`;
  },
  ligar(r) {
    $('#mt-menos', r).onclick = () => mudarBpmMetro(METRO.bpm - 1);
    $('#mt-mais', r).onclick = () => mudarBpmMetro(METRO.bpm + 1);
    $('#mt-faixa', r).oninput = e => mudarBpmMetro(+e.target.value);
    $('#mt-ligar', r).onclick = () => { if (METRO.ligado) { TOCADOR.parar(); APP.redesenhar(); } else ligarMetronomo(); };
    const reinicia = () => { const era = METRO.ligado; if (era) TOCADOR.parar(); APP.redesenhar(); if (era) ligarMetronomo(); };
    r.querySelectorAll('[data-seg-mt-comp]').forEach(b => b.onclick = () => { METRO.compasso = +b.dataset.segMtComp; reinicia(); });
    r.querySelectorAll('[data-seg-mt-sub]').forEach(b => b.onclick = () => { METRO.sub = +b.dataset.segMtSub; reinicia(); });
    $('#mt-bater', r).onclick = () => {
      const t = performance.now(); METRO.toques = METRO.toques.filter(x => t - x < 3000).concat(t);
      if (METRO.toques.length >= 2) { const d = (METRO.toques[METRO.toques.length - 1] - METRO.toques[0]) / (METRO.toques.length - 1); mudarBpmMetro(60000 / d); }
    };
  },
  sair() { if (METRO.ligado) TOCADOR.parar(); },
};

/* ================= Bateria ================= */
/* ritmos em passos: 16 por compasso (semicolcheias) ou 12 (tercinas). Cada peça lista os passos em que toca. */
const RITMOS = [
  { id: 'rock', nome: 'Rock', passos: 16, pecas: { chimbal: [0, 2, 4, 6, 8, 10, 12, 14], bumbo: [0, 8, 10], caixa: [4, 12] } },
  { id: 'balada', nome: 'Balada', passos: 16, pecas: { chimbal: [0, 2, 4, 6, 8, 10, 12, 14], bumbo: [0, 6, 8], caixa: [4, 12] } },
  { id: 'metal', nome: 'Metal com bumbo duplo', passos: 16, pecas: { conducao: [0, 4, 8, 12], bumbo: [...Array(16).keys()], caixa: [4, 12] } },
  { id: 'galope', nome: 'Galope', passos: 16, pecas: { chimbal: [0, 4, 8, 12], bumbo: [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15], caixa: [4, 12] } },
  { id: 'funk', nome: 'Funk', passos: 16, pecas: { chimbal: [...Array(16).keys()], bumbo: [0, 3, 10], caixa: [4, 12] } },
  { id: 'shuffle', nome: 'Shuffle (blues)', passos: 12, pecas: { chimbal: [0, 2, 3, 5, 6, 8, 9, 11], bumbo: [0, 6], caixa: [3, 9] } },
  { id: 'valsa', nome: 'Valsa (3 por compasso)', passos: 12, tempos: 3, pecas: { chimbal: [0, 2, 4, 6, 8, 10], bumbo: [0], caixa: [4, 8] } },
];
const BAT = { ritmo: 'rock', bpm: 90, ligado: false, laco: null };
TELAS.bateria = {
  titulo: 'Bateria', principal: true, sub: 'Uma bateria para tocar junto, em vários ritmos.',
  html() {
    const r = RITMOS.find(x => x.id === BAT.ritmo), tempos = r.tempos || 4;
    return `${escolhaHTML('bt-ritmo', 'Ritmo', RITMOS.map(x => [x.id, x.nome]), BAT.ritmo)}
      <p class="gf-numero" id="bt-bpm" aria-live="polite">${BAT.bpm}<small>batidas por minuto</small></p>
      <div class="gf-controle"><button type="button" class="kf-btn kf-sec gf-icone" id="bt-menos" aria-label="Mais devagar">${ICONE.menos}</button>
        <input type="range" class="gf-faixa-range" id="bt-faixa" min="40" max="220" value="${BAT.bpm}" aria-label="Andamento em batidas por minuto">
        <button type="button" class="kf-btn kf-sec gf-icone" id="bt-mais" aria-label="Mais depressa">${ICONE.mais}</button></div>
      <ol class="gf-pulsos" id="bt-pulsos" aria-hidden="true">${Array.from({ length: tempos }, (x, i) => `<li class="${i ? '' : 'gf-forte'}"></li>`).join('')}</ol>
      <button type="button" class="kf-btn kf-pri" id="bt-ligar">${BAT.ligado ? ICONE.parar + 'Parar' : ICONE.play + 'Tocar'}</button>`;
  },
  ligar(r) {
    const ritmo = () => RITMOS.find(x => x.id === BAT.ritmo);
    const bpm = v => { BAT.bpm = limitar(Math.round(v), 40, 220); if (BAT.laco) BAT.laco.mudarBpm(BAT.bpm * passosPorTempo()); const n = $('#bt-bpm'); if (n) n.innerHTML = `${BAT.bpm}<small>batidas por minuto</small>`; const s = $('#bt-faixa'); if (s) s.value = BAT.bpm; };
    const passosPorTempo = () => { const x = ritmo(); return x.passos / (x.tempos || 4) * (x.tempos ? 1 : 1); };
    const ligar = async () => {
      const x = ritmo(), ppt = x.passos / (x.tempos || 4);
      BAT.ligado = true; APP.redesenhar();
      BAT.laco = await TOCADOR.laco({ bpm: BAT.bpm * ppt, passo: 1, pecas: Object.keys(x.pecas),
        aoPasso: (i, q) => { const p = i % x.passos; Object.entries(x.pecas).forEach(([peca, ps]) => { if (ps.includes(p)) SOM.peca(peca, q, peca === 'bumbo' && x.id === 'metal' ? .8 : 1); }); },
        aoVer: i => { if (i % ppt) return; const t = Math.floor(i / ppt) % (x.tempos || 4); $$('#bt-pulsos li').forEach((li, j) => li.classList.toggle('gf-on', j === t)); },
        aoParar: () => { BAT.ligado = false; BAT.laco = null; } });
    };
    $('#bt-ritmo', r).onchange = e => { const era = BAT.ligado; if (era) TOCADOR.parar(); BAT.ritmo = e.target.value; APP.redesenhar(); if (era) ligar(); };
    $('#bt-menos', r).onclick = () => bpm(BAT.bpm - 2); $('#bt-mais', r).onclick = () => bpm(BAT.bpm + 2);
    $('#bt-faixa', r).oninput = e => bpm(+e.target.value);
    $('#bt-ligar', r).onclick = () => { if (BAT.ligado) { TOCADOR.parar(); APP.redesenhar(); } else ligar(); };
  },
  sair() { if (BAT.ligado) TOCADOR.parar(); },
};

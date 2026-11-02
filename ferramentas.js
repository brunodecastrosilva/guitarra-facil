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
VIEWS.bateria = () => KitFacil.ui.cabecalho({ titulo: 'Bateria', sub: 'Escolha o estilo e toque junto, no andamento do metrônomo.' })
  + `<div class="pilha palco-ferr">
    <div class="ladrilhos estilos" role="group" aria-label="Estilo">${ESTILOS_BATERIA.map(e => ladrilho({ attrs: `data-estilo="${e[0]}" aria-pressed="${DB.cfg.estilo === e[0]}"`, ilu: iluRitmo(e), nome: e[1], classe: 'peq' })).join('')}</div>
    <div class="batidas grande" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
    <div class="metro-bpm"><button type="button" class="kf-btn kf-sec" data-bpm="-5" aria-label="5 batidas a menos">−5</button><output id="bpm" aria-live="polite">${DB.cfg.bpm}</output><button type="button" class="kf-btn kf-sec" data-bpm="5" aria-label="5 batidas a mais">+5</button></div>
    <button type="button" class="play-grande${bateria.ligada ? ' on' : ''}" id="bat-ligar" aria-label="${bateria.ligada ? 'Parar a bateria' : 'Tocar a bateria'}">${bateria.ligada ? I.stop : I.play}</button>
  </div>`;
VIEWS.braco = () => KitFacil.ui.cabecalho({ titulo: 'Mapa do braço', sub: 'Toque numa nota para ouvir.' })
  + `<div class="pilha"><div class="kf-seg" role="group" aria-label="Notas mostradas"><button type="button" data-braco="naturais" aria-pressed="${DB.cfg.braco !== 'todas'}">Naturais</button><button type="button" data-braco="todas" aria-pressed="${DB.cfg.braco === 'todas'}">Todas</button></div>
    <div class="braco-wrap">${bracoSVG(DB.cfg.braco === 'todas')}</div></div>`;
VIEWS.acordes = () => KitFacil.ui.cabecalho({ titulo: 'Acordes', sub: 'Toque num acorde para ouvir. Os números são os dedos.' })
  + `<div class="acordes">${ACORDES.map(([nome, casas, dedos], i) => `<button type="button" class="acorde" data-acorde="${i}" aria-label="Ouvir ${esc(nome)}">${diagrama(casas, dedos, nome)}<b>${esc(nome)}</b></button>`).join('')}</div>
  <p class="apoio" style="margin-top:12px">X: não toque a corda. O: corda solta. A barra é a pestana.</p>`;


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
function clique(acento, quando) {
  const a = audio(); if (!a) return;
  somPeca(a, acento ? 'metronomo-forte' : 'metronomo', quando, (typeof treino !== 'undefined' && treino.saida) || somMestre(a));
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
function tocarAcorde(casas) { const a = audio(); if (!a) return; const t = a.currentTime + .03; casas.forEach((k, s) => { if (k >= 0) tocarCorda(midiDe(s, k), t + s * .035, 1.8, .35); }); }
function diagrama(casas, dedos, nome, pestana) {
  pestana = pestana || (ACORDES.find(a => a[0] === nome) || [])[3];
  const x = i => 14 + i * 18, y = c => 26 + c * 22;
  let s = `<svg viewBox="0 0 118 124" role="img" aria-label="Acorde de ${esc(nome)}"><g stroke="currentColor" fill="none">`;
  if (pestana) s += `</g><rect x="${x(0) - 6}" y="${y(pestana) - 18}" width="${x(5) - x(0) + 12}" height="14" rx="7" fill="currentColor"/><g stroke="currentColor" fill="none">`;
  s += `<line x1="${x(0)}" y1="${y(0)}" x2="${x(5)}" y2="${y(0)}" stroke-width="4"/>`;
  for (let c = 1; c <= 4; c++) s += `<line x1="${x(0)}" y1="${y(c)}" x2="${x(5)}" y2="${y(c)}" stroke-width="1" opacity=".5"/>`;
  for (let i = 0; i < 6; i++) s += `<line x1="${x(i)}" y1="${y(0)}" x2="${x(i)}" y2="${y(4)}" stroke-width="1.2"/>`;
  s += '</g>';
  casas.forEach((c, i) => {
    if (c < 0) s += `<text x="${x(i)}" y="16" text-anchor="middle" font-size="12" fill="currentColor">X</text>`;
    else if (c === 0) s += `<circle cx="${x(i)}" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    else s += `<circle cx="${x(i)}" cy="${y(c) - 11}" r="7.5" fill="currentColor"/><text x="${x(i)}" y="${y(c) - 7}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--kf-surface)">${dedos[i]}</text>`;
  });
  return s + '</svg>';
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



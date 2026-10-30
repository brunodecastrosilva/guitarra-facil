/* Guitarra Fácil · treinos com o professor: o app toca o exercício (som de guitarra sintetizado), a tablatura rola
   no andamento escolhido, e o microfone confere cada nota (afinação e nota certa). Também a bateria de acompanhamento.
   Tudo roda no aparelho: o som do microfone é analisado em memória, não é gravado nem enviado. */
'use strict';
/* exercícios monofônicos (uma nota por vez, para o microfone conseguir conferir): [corda (0 = 6ª), casa, batidas] */
const sobeDesce = n => [...n, ...n.slice(0, -1).reverse()];
const EXERCICIOS = [
  { id: 'ex-soltas', nome: 'Cordas soltas', nivel: 1, bpm: 60, alvo: 100, licao: 'm1-palheta', notas: sobeDesce([0, 1, 2, 3, 4, 5].map(c => [c, 0, 1])) },
  { id: 'ex-1234', nome: 'Aquecimento 1-2-3-4', nivel: 1, bpm: 60, alvo: 120, licao: 'm1-1234', notas: [0, 1, 2, 3, 4, 5].flatMap(c => [1, 2, 3, 4].map(k => [c, k, 1])) },
  { id: 'ex-em', nome: 'Arpejo de Mi menor', nivel: 1, bpm: 60, alvo: 100, licao: 'm2-em-am', notas: sobeDesce([[0, 0, 1], [1, 2, 1], [2, 2, 1], [3, 0, 1], [4, 0, 1], [5, 0, 1]]) },
  { id: 'ex-am', nome: 'Arpejo de Lá menor', nivel: 1, bpm: 60, alvo: 100, licao: 'm2-em-am', notas: sobeDesce([[1, 0, 1], [2, 2, 1], [3, 2, 1], [4, 1, 1], [5, 0, 1]]) },
  { id: 'ex-riff-estrada', nome: 'Riff "Estrada" (original)', nivel: 2, bpm: 80, alvo: 130, licao: 'm3-power', notas: [[0, 0, .5], [0, 0, .5], [0, 3, .5], [0, 5, .5], [0, 0, .5], [0, 0, .5], [0, 7, .5], [0, 5, .5], [0, 0, .5], [0, 0, .5], [0, 3, .5], [0, 5, .5], [0, 3, 1], [0, 0, 1]] },
  { id: 'ex-riff-galope', nome: 'Riff "Galope" (original)', nivel: 2, bpm: 80, alvo: 140, licao: 'm3-abafar', notas: [[1, 0, .5], [1, 0, .25], [1, 0, .25], [1, 3, .5], [1, 0, .5], [1, 5, .5], [1, 3, .5], [1, 0, 1], [1, 0, .5], [1, 0, .25], [1, 0, .25], [1, 3, .5], [1, 5, .5], [1, 7, .5], [1, 5, .5], [1, 3, 1]] },
  { id: 'ex-do-maior', nome: 'Escala de Dó maior', nivel: 3, bpm: 60, alvo: 110, licao: 'm4-escala-maior', notas: sobeDesce([[1, 3, 1], [2, 0, 1], [2, 2, 1], [2, 3, 1], [3, 0, 1], [3, 2, 1], [4, 0, 1], [4, 1, 1]]) },
  { id: 'ex-penta', nome: 'Pentatônica de Lá menor', nivel: 3, bpm: 70, alvo: 130, licao: 'm5-penta', notas: sobeDesce([[0, 5, 1], [0, 8, 1], [1, 5, 1], [1, 7, 1], [2, 5, 1], [2, 7, 1], [3, 5, 1], [3, 7, 1], [4, 5, 1], [4, 8, 1], [5, 5, 1], [5, 8, 1]]) },
  { id: 'ex-blues', nome: 'Frase de blues em Lá (original)', nivel: 4, bpm: 70, alvo: 110, licao: 'm5-blues', notas: [[3, 7, .5], [3, 5, .5], [2, 7, .5], [2, 6, .5], [2, 5, .5], [1, 7, .5], [1, 5, 1], [2, 5, .5], [2, 7, .5], [3, 5, .5], [3, 7, .5], [4, 5, 1], [3, 7, 1]] },
  { id: 'ex-alternada', nome: '1-2-3-4 em colcheias', nivel: 4, bpm: 60, alvo: 120, licao: 'm6-alternada', notas: [0, 1, 2, 3, 4, 5].flatMap(c => [1, 2, 3, 4].map(k => [c, k, .5])) },
];

/* som de guitarra: Karplus-Strong (ruído curto realimentado num filtro), gerado uma vez por nota e guardado */
const somCache = new Map();
function somCorda(a, midi) {
  if (somCache.has(midi)) return somCache.get(midi);
  const taxa = a.sampleRate, dur = 2.2, n = Math.floor(taxa * dur), buf = a.createBuffer(1, n, taxa), d = buf.getChannelData(0);
  const per = Math.max(2, Math.round(taxa / hzDeMidi(midi))), linha = new Float32Array(per);
  for (let i = 0; i < per; i++) linha[i] = Math.random() * 2 - 1;
  let k = 0;
  for (let i = 0; i < n; i++) { const prox = (k + 1) % per, v = (linha[k] + linha[prox]) * .4985; d[i] = linha[k]; linha[k] = v; k = prox; }
  somCache.set(midi, buf); return buf;
}
function tocarCorda(midi, quando, dur = 1.6, vol = .5) {
  const a = audio(); if (!a) return;
  const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
  s.buffer = somCorda(a, midi); f.type = 'lowpass'; f.frequency.value = 3200;
  g.gain.setValueAtTime(vol, quando); g.gain.setTargetAtTime(0.0001, quando + dur, .08);
  s.connect(f); f.connect(g); g.connect(treino.saida || a.destination); s.start(quando); s.stop(quando + dur + .5);
}

/* tablatura do exercício: uma coluna por batida (px por batida = PX) */
const PX = 64;
function tabSVG(ex) {
  const total = ex.notas.reduce((s, n) => s + n[2], 0), L = 40 + total * PX + 40, y = c => 18 + (5 - c) * 18;
  let s = `<svg class="tab" viewBox="0 0 ${L} 128" width="${L}" height="128" role="img" aria-label="Tablatura de ${esc(ex.nome)}">`;
  ['E', 'A', 'D', 'G', 'B', 'e'].forEach((r, c) => { s += `<text x="10" y="${y(c) + 4}" class="tab-r">${r}</text><line x1="24" y1="${y(c)}" x2="${L - 10}" y2="${y(c)}" class="tab-l"/>`; });
  let t = 0;
  for (let b = 0; b <= total; b++) s += `<line x1="${40 + b * PX}" y1="${y(5) - 6}" x2="${40 + b * PX}" y2="${y(0) + 6}" class="tab-b${b % 4 ? '' : ' forte'}"/>`;
  ex.notas.forEach(([c, k, d], i) => {
    const x = 40 + t * PX + 6;
    s += `<g class="tab-n" data-i="${i}"><rect x="${x - 2}" y="${y(c) - 9}" width="${String(k).length * 8 + 6}" height="18" rx="4"/><text x="${x + 1}" y="${y(c) + 5}">${k}</text></g>`;
    t += d;
  });
  return s + `<line class="tab-cursor" x1="0" y1="4" x2="0" y2="124"/></svg>`;
}

/* a execução: contagem de 4 batidas, depois as notas; o microfone confere enquanto toca */
const treino = { tocando: false, raf: 0, fluxo: null, saida: null };
async function treinoTocar(ex, o) {
  const a = audio(); if (!a || treino.tocando) return;
  const seg = 60 / o.bpm, total = ex.notas.reduce((s, n) => s + n[2], 0);
  let an = null, buf = null;
  if (o.ouvir) {
    try {
      treino.fluxo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const fonte = a.createMediaStreamSource(treino.fluxo); an = a.createAnalyser(); an.fftSize = 2048; fonte.connect(an); buf = new Float32Array(an.fftSize);
    } catch { KitFacil.avisar('Sem permissão para o microfone: o treino segue sem conferir as notas.'); }
  }
  treino.tocando = true;
  // tudo o que o treino agenda passa por esta saída: parar = desligar a saída
  treino.saida = a.createGain(); treino.saida.connect(a.destination);
  const t0 = a.currentTime + .15, ini = t0 + 4 * seg;
  for (let b = 0; b < 4; b++) clique(b === 0, t0 + b * seg);
  const janelas = []; let t = 0;
  ex.notas.forEach(([c, k, d]) => {
    const quando = ini + t * seg; janelas.push({ de: quando, ate: quando + d * seg, midi: midiDe(c, k), amostras: [] });
    if (o.guia) tocarCorda(midiDe(c, k), quando, Math.max(.25, d * seg * .95), o.ouvir ? .25 : .5);
    if (o.metronomo !== false) for (let q = 0; q < d; q++) if (Number.isInteger(t + q)) clique((t + q) % 4 === 0, quando + q * seg);
    t += d;
  });
  const fim = ini + total * seg;
  const passo = () => {
    if (!treino.tocando) return;
    const agora = a.currentTime;
    o.aoQuadro && o.aoQuadro(Math.max(-4, (agora - ini) / seg), agora < ini ? Math.ceil((ini - agora) / seg) : 0);
    if (an && agora >= ini) {
      an.getFloatTimeDomainData(buf);
      const f = detectarFrequencia(buf, a.sampleRate);
      const j = janelas.find(w => agora >= w.de + Math.min(.08, (w.ate - w.de) * .25) && agora <= w.ate - .02);
      if (j) j.amostras.push(f ? 12 * Math.log2(f / 440) + 69 : null);
    }
    if (agora >= fim + .15) return terminar();
    treino.raf = requestAnimationFrame(passo);
  };
  const soltarSaida = () => { if (treino.saida) { try { treino.saida.disconnect(); } catch {} treino.saida = null; } };
  const terminar = () => {
    treino.tocando = false; cancelAnimationFrame(treino.raf); soltarSaida();
    if (treino.fluxo) { treino.fluxo.getTracks().forEach(x => x.stop()); treino.fluxo = null; }
    const r = an ? avaliar(janelas) : null;
    o.aoFim && o.aoFim(r);
  };
  treino.parar = () => { if (!treino.tocando) return; treino.tocando = false; cancelAnimationFrame(treino.raf); soltarSaida(); if (treino.fluxo) { treino.fluxo.getTracks().forEach(x => x.stop()); treino.fluxo = null; } o.aoFim && o.aoFim(null, true); };
  passo();
}
// nota certa: a maioria das leituras dentro de meio tom da nota pedida; afinação: média dos cents das certas
function avaliar(janelas) {
  const notas = janelas.map(w => {
    const v = w.amostras.filter(x => x != null);
    if (v.length < 2) return { ok: false, cents: null, ouviu: false };
    const perto = v.filter(m => Math.abs(m - w.midi) <= .5);
    const ok = perto.length >= Math.max(2, v.length * .4);
    const cents = ok ? Math.round(perto.reduce((s, m) => s + (m - w.midi) * 100, 0) / perto.length) : null;
    return { ok, cents, ouviu: true };
  });
  const certas = notas.filter(n => n.ok), ouvidas = notas.filter(n => n.ouviu).length;
  return { acerto: Math.round(certas.length / notas.length * 100), cents: certas.length ? Math.round(certas.reduce((s, n) => s + Math.abs(n.cents), 0) / certas.length) : null, notas, ouvidas };
}

/* ================= bateria de acompanhamento ================= */
/* cada estilo: passos por batida e os passos (no compasso de 4 batidas) do bumbo, da caixa e do chimbal */
const ESTILOS_BATERIA = [
  ['rock', 'Rock', 2, { b: [0, 4], c: [2, 6], h: [0, 1, 2, 3, 4, 5, 6, 7] }],
  ['pop', 'Pop', 4, { b: [0, 6, 8], c: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] }],
  ['balada', 'Balada', 2, { b: [0, 5], c: [4], h: [0, 1, 2, 3, 4, 5, 6, 7] }],
  ['shuffle', 'Blues shuffle', 3, { b: [0, 6], c: [3, 9], h: [0, 2, 3, 5, 6, 8, 9, 11] }],
  ['funk', 'Funk', 4, { b: [0, 3, 7, 10], c: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] }],
  ['metal', 'Metal', 4, { b: [0, 2, 4, 6, 8, 10, 12, 14], c: [4, 12], h: [0, 4, 8, 12] }],
];
const bateria = { ligada: false, t: null, prox: 0, passo: 0 };
let ruidoBuf = null;
function ruido(a) { if (ruidoBuf) return ruidoBuf; const n = a.sampleRate * .5, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return (ruidoBuf = b); }
function peca(a, tipo, q) {
  if (tipo === 'b') { const o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(140, q); o.frequency.exponentialRampToValueAtTime(42, q + .12); g.gain.setValueAtTime(.9, q); g.gain.exponentialRampToValueAtTime(.001, q + .3); o.connect(g); g.connect(a.destination); o.start(q); o.stop(q + .32); return; }
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = ruido(a);
  f.type = tipo === 'c' ? 'bandpass' : 'highpass'; f.frequency.value = tipo === 'c' ? 1800 : 7000;
  const dur = tipo === 'c' ? .18 : .05; g.gain.setValueAtTime(tipo === 'c' ? .7 : .25, q); g.gain.exponentialRampToValueAtTime(.001, q + dur);
  s.connect(f); f.connect(g); g.connect(a.destination); s.start(q); s.stop(q + dur + .02);
  if (tipo === 'c') { const o = a.createOscillator(), g2 = a.createGain(); o.frequency.value = 190; g2.gain.setValueAtTime(.35, q); g2.gain.exponentialRampToValueAtTime(.001, q + .1); o.connect(g2); g2.connect(a.destination); o.start(q); o.stop(q + .12); }
}
function bateriaLigar(estilo, bpmFn, aoPasso) {
  const a = audio(); if (!a) return;
  const [, , ppb, P] = ESTILOS_BATERIA.find(e => e[0] === estilo) || ESTILOS_BATERIA[0];
  bateria.ligada = true; bateria.passo = 0; bateria.prox = a.currentTime + .05;
  const tot = ppb * 4;
  const agenda = () => {
    const dp = 60 / bpmFn() / ppb;
    while (bateria.prox < a.currentTime + .12) {
      const p = bateria.passo % tot;
      if (P.b.includes(p)) peca(a, 'b', bateria.prox); if (P.c.includes(p)) peca(a, 'c', bateria.prox); if (P.h.includes(p)) peca(a, 'h', bateria.prox);
      if (aoPasso && p % ppb === 0) { const bt = p / ppb, at = Math.max(0, (bateria.prox - a.currentTime) * 1000); setTimeout(() => aoPasso(bt), at); }
      bateria.prox += dp; bateria.passo++;
    }
  };
  agenda(); bateria.t = setInterval(agenda, 25);
}
function bateriaParar() { if (!bateria.ligada) return; clearInterval(bateria.t); bateria.ligada = false; }

/* Guitarra Fácil · o treino tocando: o braço e a tablatura do treino, o som de guitarra (com bend, slide e vibrato) e
   o tocador, que repete o exercício em voltas sem perder o tempo. Também a bateria de acompanhamento.
   Todo o som é gerado no aparelho. O catálogo de treinos fica em catalogo.js. */
'use strict';
/* braço do treino: só as casas do exercício; cada nota com o dedo (ou o nome), a da vez acesa e a próxima marcada */
function bracoTreino(ex) {
  const ks = ex.notas.map(n => n[1]), pres = ks.filter(k => k > 0);
  const a = Math.max(1, (pres.length ? Math.min(...pres) : 1) - 1), b = Math.max(a + 4, Math.max(...ks, 1) + 1);
  const L = 50, A = 25, X0 = 38, x = k => X0 + (k - a + 1) * L, y = c => 26 + (5 - c) * A, fundo = y(0) + 12;
  let s = `<svg class="braco-tr" viewBox="0 0 ${x(b) + 10} ${fundo + 26}" role="img" aria-label="Braço com as notas de ${esc(ex.nome)}">`;
  s += `<rect x="${X0}" y="${y(5) - 12}" width="${x(b) - X0}" height="${fundo - y(5) + 12}" rx="4" class="bt-madeira"/>`;
  for (let k = a - 1; k <= b; k++) s += `<line x1="${x(k)}" y1="${y(5) - 12}" x2="${x(k)}" y2="${fundo}" class="${k === 0 ? 'bt-pestana' : 'bt-traste'}"/>`;
  for (let k = a; k <= b; k++) {
    s += `<text x="${x(k) - L / 2}" y="${y(5) - 17}" text-anchor="middle" class="casa-n">${k}</text>`;
    if ([3, 5, 7, 9, 15, 17].includes(k)) s += `<circle cx="${x(k) - L / 2}" cy="${fundo + 12}" r="3" class="bt-ponto"/>`;
    if (k === 12) s += `<circle cx="${x(k) - L / 2 - 6}" cy="${fundo + 12}" r="3" class="bt-ponto"/><circle cx="${x(k) - L / 2 + 6}" cy="${fundo + 12}" r="3" class="bt-ponto"/>`;
  }
  ['E', 'A', 'D', 'G', 'B', 'e'].forEach((r, c) => { s += `<line x1="${X0}" y1="${y(c)}" x2="${x(b)}" y2="${y(c)}" class="bt-corda" stroke-width="${1 + (5 - c) * .3}"/><text x="${a === 1 ? 6 : 10}" y="${y(c) + 4}" class="tab-r">${r}</text>`; });
  const vistos = new Map();
  ex.notas.forEach(([c, k, , d], i) => { const ch = c + ',' + k; if (!vistos.has(ch)) vistos.set(ch, { c, k, d, idx: [] }); vistos.get(ch).idx.push(i); });
  vistos.forEach(({ c, k, d, idx }) => {
    const cx = k === 0 ? X0 - 15 : x(k) - L / 2, n = pc(SOLTAS[c] + k), raiz = ex.raiz != null && n === ex.raiz;
    const rot = ex.rotulo === 'nota' ? CIFRA[n] : ex.rotulo === 'grau' && ex.raiz != null ? GRAUS[pc(n - ex.raiz)] : (k === 0 ? '0' : d);
    s += `<g class="nt${raiz ? ' raiz' : ''}" data-i="${idx.join(' ')}" data-nota="${c},${k}"><circle cx="${cx}" cy="${y(c)}" r="11.5"/><text x="${cx}" y="${y(c) + 4.5}" text-anchor="middle">${rot}</text></g>`;
  });
  return s + '</svg>';
}

/* tablatura: uma coluna por batida; com notas curtas, as colunas alargam para os números não se encostarem */
function pxDe(ex) { return Math.max(56, Math.ceil((ex.notas.some(n => n[4]) ? 36 : 30) / Math.min(...ex.notas.map(n => n[2])))); }
function tabSVG(ex) {
  const PX = pxDe(ex), total = Math.ceil(ex.notas.reduce((s, n) => s + n[2], 0) - 1e-6), L = 40 + total * PX + 30, y = c => 18 + (5 - c) * 18;
  let s = `<svg class="tab" viewBox="0 0 ${L} 128" width="${L}" height="128" role="img" aria-label="Tablatura de ${esc(ex.nome)}">`;
  ['E', 'A', 'D', 'G', 'B', 'e'].forEach((r, c) => { s += `<text x="10" y="${y(c) + 4}" class="tab-r">${r}</text><line x1="24" y1="${y(c)}" x2="${L - 10}" y2="${y(c)}" class="tab-l"/>`; });
  for (let b = 0; b <= total; b++) s += `<line x1="${40 + b * PX}" y1="${y(5) - 6}" x2="${40 + b * PX}" y2="${y(0) + 6}" class="tab-b${b % 4 ? '' : ' forte'}"/>`;
  let t = 0;
  ex.notas.forEach(([c, k, d, , tc], i) => {
    const x = 40 + t * PX + 5, rot = k + (tc || '');
    s += `<g class="tab-n" data-i="${i}"><rect x="${x - 2}" y="${y(c) - 9}" width="${rot.length * 8 + 6}" height="18" rx="4"/><text x="${x + 1}" y="${y(c) + 5}">${rot}</text></g>`;
    t += d;
  });
  return s + `<line class="tab-cursor" x1="0" y1="4" x2="0" y2="124"/></svg>`;
}

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
// técnica: b = bend de um tom, s = slide chegando de um tom abaixo, v = vibrato, h/p = ligado (sem o ataque da palheta)
function tocarCorda(midi, quando, dur = 1.6, vol = .5, tec) {
  const a = audio(); if (!a) return;
  const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
  s.buffer = somCorda(a, midi); f.type = 'lowpass'; f.frequency.value = 3200;
  if (tec === 'b') { s.playbackRate.setValueAtTime(1, quando + dur * .12); s.playbackRate.linearRampToValueAtTime(Math.pow(2, 2 / 12), quando + dur * .5); }
  if (tec === 's') { s.playbackRate.setValueAtTime(Math.pow(2, -2 / 12), quando); s.playbackRate.linearRampToValueAtTime(1, quando + Math.min(.12, dur * .4)); }
  if (tec === 'v') { const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 5.5; lg.gain.value = .014; lfo.connect(lg); lg.connect(s.playbackRate); lfo.start(quando + dur * .2); lfo.stop(quando + dur + .5); }
  if (tec === 'h' || tec === 'p') vol *= .7;
  g.gain.setValueAtTime(vol, quando); g.gain.setTargetAtTime(0.0001, quando + dur, .08);
  s.connect(f); f.connect(g); g.connect(treino.saida || a.destination); s.start(quando); s.stop(quando + dur + .5);
}


/* o tocador: contagem de 4 batidas e depois o exercício em voltas. A próxima volta é pedida (o.proxima) um pouco antes
   do fim da atual e agendada colada nela, então o tempo não quebra entre uma volta e outra. Cada volta fecha em
   batidas inteiras, para o metrônomo seguir no lugar. Parar = desligar a saída por onde passa tudo o que foi agendado. */
const treino = { tocando: false, raf: 0, saida: null };
function treinoTocar(o) {
  const a = audio(); if (!a || treino.tocando) return false;
  const primeira = o.proxima(null); if (!primeira) return false;
  treino.tocando = true; treino.saida = a.createGain(); treino.saida.connect(a.destination);
  const rodadas = [];
  const agendar = (r, ini) => {
    const seg = 60 / r.bpm; let t = 0;
    r.ex.notas.forEach(([c, k, d, , tc]) => { if (o.guia) tocarCorda(midiDe(c, k), ini + t * seg, Math.max(.2, d * seg * .95), .45, tc); t += d; });
    const batidas = Math.max(1, Math.ceil(t - 1e-6));
    if (o.metronomo !== false) for (let b = 0; b < batidas; b++) clique(b % 4 === 0, ini + b * seg);
    const rr = { ...r, ini, seg, batidas, fim: ini + batidas * seg, n: rodadas.length + 1, pos: [] };
    let p = 0; r.ex.notas.forEach(n => { rr.pos.push(p); p += n[2]; });
    rodadas.push(rr); return rr;
  };
  const seg0 = 60 / primeira.bpm, t0 = a.currentTime + .15;
  for (let b = 0; b < 4; b++) clique(b === 0, t0 + b * seg0);
  agendar(primeira, t0 + 4 * seg0);
  const comeco = Date.now(); let mostrada = null;
  const resumo = parado => { const agora = a.currentTime, feitas = rodadas.filter(r => r.fim <= agora + .05); return { voltas: feitas.length, bpm: Math.max(0, ...feitas.map(r => r.bpm)), ultima: feitas[feitas.length - 1] || null, segs: (Date.now() - comeco) / 1000, tocado: Math.max(0, agora - rodadas[0].ini), parado }; };
  const encerrar = parado => {
    if (!treino.tocando) return; const r = resumo(parado);
    treino.tocando = false; cancelAnimationFrame(treino.raf);
    if (treino.saida) { try { treino.saida.disconnect(); } catch {} treino.saida = null; }
    o.aoFim && o.aoFim(r);
  };
  const passo = () => {
    if (!treino.tocando) return;
    const agora = a.currentTime, ult = rodadas[rodadas.length - 1];
    if (!ult.pedida && agora > ult.fim - .35) { ult.pedida = true; const p = o.proxima(ult, ult.fim - rodadas[0].ini); if (p) agendar(p, ult.fim); }
    const cur = rodadas.find(r => agora < r.fim);
    if (!cur) return encerrar(false);
    if (cur !== mostrada) { mostrada = cur; o.aoRodada && o.aoRodada(cur); }
    const beat = (agora - cur.ini) / cur.seg;
    let i = -1; if (beat >= 0) cur.pos.forEach((p, k) => { if (beat >= p) i = k; });
    o.aoQuadro && o.aoQuadro(cur, beat, agora < cur.ini ? Math.ceil((cur.ini - agora) / cur.seg) : 0, i, Math.max(0, agora - rodadas[0].ini));
    treino.raf = requestAnimationFrame(passo);
  };
  treino.parar = () => encerrar(true);
  passo();
  return true;
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

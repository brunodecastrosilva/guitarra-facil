/* Guitarra Fácil · o treino tocando: o braço e a tablatura do treino, o som de guitarra (limpo ou distorcido, com
   palm mute, bend, slide, vibrato, pinch, harmônico, nota morta e alavanca) e o tocador, que repete o treino em voltas
   sem perder o tempo. Também a bateria de acompanhamento. Todo o som é gerado no aparelho.
   Um treino é uma lista de eventos { d: duração em batidas, n: [[corda, casa, dedo]], t: técnicas }: n vazio é pausa,
   várias notas são um acorde (power chord, oitava, double stop). A corda 0 é a mais grave. */
'use strict';
const TEC_NOMES = { pm: 'palm mute', b: 'bend de um tom', b2: 'bend de meio tom', r: 'volta do bend', h: 'ligado para cima', p: 'ligado para baixo',
  t: 'tapping', s: 'slide', v: 'vibrato', pinch: 'pinch harmonic', harm: 'harmônico natural', x: 'nota morta', dive: 'alavanca (dive)', tr: 'trinado', hy: 'dedo (palhetada híbrida)' };
const TEC_TAB = { b: 'b', b2: 'b½', r: 'r', h: 'h', p: 'p', t: 'T', s: 's', v: '~', pinch: '*', dive: '↘', tr: 'tr', hy: 'm' };
const tecs = e => (e.t || '').split(' ').filter(Boolean);
const temTec = (e, k) => tecs(e).includes(k);
// harmônico natural: a casa diz qual nota soa (12 = oitava, 7 = oitava e quinta, 5 = duas oitavas)
const HARM = { 12: 12, 7: 19, 19: 19, 5: 24, 24: 24, 4: 28, 9: 28, 16: 28, 3: 31 };

/* braço do treino: só as casas do treino; a nota (ou o acorde) da vez acesa, a próxima tracejada */
function bracoTreino(ex, de = 0, ate = ex.evs.length) {
  const A = ex.afin, N = A.length, parte = ex.evs.slice(de, ate), ks = parte.flatMap(e => e.n.map(n => n[1])), pres = ks.filter(k => k > 0);
  const a = Math.max(1, (pres.length ? Math.min(...pres) : 1) - 1), b = Math.max(a + 4, Math.max(...ks, 1) + 1);
  const L = 50, H = 25, X0 = 38, x = k => X0 + (k - a + 1) * L, y = c => 26 + (N - 1 - c) * H, fundo = y(0) + 12;
  let s = `<svg class="braco-tr" viewBox="0 0 ${x(b) + 10} ${fundo + 26}" role="img" aria-label="Braço com as notas de ${esc(ex.nome)}">`;
  s += `<rect x="${X0}" y="${y(N - 1) - 12}" width="${x(b) - X0}" height="${fundo - y(N - 1) + 12}" rx="4" class="bt-madeira"/>`;
  for (let k = a - 1; k <= b; k++) s += `<line x1="${x(k)}" y1="${y(N - 1) - 12}" x2="${x(k)}" y2="${fundo}" class="${k === 0 ? 'bt-pestana' : 'bt-traste'}"/>`;
  for (let k = a; k <= b; k++) {
    s += `<text x="${x(k) - L / 2}" y="${y(N - 1) - 17}" text-anchor="middle" class="casa-n">${k}</text>`;
    if ([3, 5, 7, 9, 15, 17, 19, 21].includes(k)) s += `<circle cx="${x(k) - L / 2}" cy="${fundo + 12}" r="3" class="bt-ponto"/>`;
    if (k === 12 || k === 24) s += `<circle cx="${x(k) - L / 2 - 6}" cy="${fundo + 12}" r="3" class="bt-ponto"/><circle cx="${x(k) - L / 2 + 6}" cy="${fundo + 12}" r="3" class="bt-ponto"/>`;
  }
  A.forEach((m, c) => { s += `<line x1="${X0}" y1="${y(c)}" x2="${x(b)}" y2="${y(c)}" class="bt-corda" stroke-width="${1 + (N - 1 - c) * .28}"/><text x="${a === 1 ? 4 : 8}" y="${y(c) + 4}" class="tab-r">${nomeCorda(m)}</text>`; });
  const vistos = new Map();
  parte.forEach((e, j) => e.n.forEach(([c, k, d]) => { const ch = c + ',' + k; if (!vistos.has(ch)) vistos.set(ch, { c, k, d, idx: [] }); vistos.get(ch).idx.push(j + de); }));
  vistos.forEach(({ c, k, d, idx }) => {
    const cx = k === 0 ? X0 - 15 : x(k) - L / 2, n = pc(A[c] + k), raiz = ex.raiz != null && n === ex.raiz;
    const rot = ex.rotulo === 'grau' && ex.raiz != null ? GRAUS[pc(n - ex.raiz)] : ex.rotulo === 'dedo' && d != null ? (k === 0 ? '0' : d) : CIFRA[n];
    s += `<g class="nt${raiz ? ' raiz' : ''}" data-i="${[...new Set(idx)].join(' ')}" data-nota="${c},${k}"><circle cx="${cx}" cy="${y(c)}" r="11.5"/><text x="${cx}" y="${y(c) + 4.5}" text-anchor="middle">${rot}</text></g>`;
  });
  return s + '</svg>';
}

/* tablatura: uma coluna por batida (mais larga quando as notas são curtas); PM em cima das notas abafadas,
   as técnicas ao lado da casa, linhas de compasso no tamanho do compasso do treino */
function pxDe(ex) { const m = Math.min(...ex.evs.map(e => e.d)); return Math.max(56, Math.ceil((ex.evs.some(e => tecs(e).some(t => TEC_TAB[t])) ? 40 : 30) / m)); }
function tabSVG(ex) {
  const A = ex.afin, N = A.length, PX = pxDe(ex), [cn, cp] = ex.compasso || [4, 1], barra = cn * cp;
  const total = Math.ceil(ex.evs.reduce((s, e) => s + e.d, 0) / cp - 1e-6) * cp, L = 40 + total * PX + 30, y = c => 30 + (N - 1 - c) * 17, alto = y(0) + 16;
  let s = `<svg class="tab" viewBox="0 0 ${L} ${alto}" width="${L}" height="${alto}" role="img" aria-label="Tablatura de ${esc(ex.nome)}">`;
  A.forEach((m, c) => { s += `<text x="8" y="${y(c) + 4}" class="tab-r">${nomeCorda(m)}</text><line x1="24" y1="${y(c)}" x2="${L - 10}" y2="${y(c)}" class="tab-l"/>`; });
  for (let b = 0; b <= total + 1e-6; b += cp) { const forte = Math.abs(b / barra - Math.round(b / barra)) < 1e-6; s += `<line x1="${40 + b * PX}" y1="${y(N - 1) - 6}" x2="${40 + b * PX}" y2="${y(0) + 6}" class="tab-b${forte ? ' forte' : ''}"/>`; }
  let t = 0, pmIni = null;
  const fechaPM = x => { if (pmIni != null) { s += `<text x="${pmIni}" y="12" class="tab-pm">PM</text><line x1="${pmIni + 20}" y1="9" x2="${Math.max(pmIni + 22, x - 4)}" y2="9" class="tab-pml"/>`; pmIni = null; } };
  ex.evs.forEach((e, i) => {
    const x = 40 + t * PX + 5, T = tecs(e);
    if (T.includes('pm')) { if (pmIni == null) pmIni = x; } else fechaPM(x);
    if (e.n.length) {
      const suf = T.map(k => TEC_TAB[k] || '').join('');
      s += `<g class="tab-n" data-i="${i}">` + e.n.map(([c, k]) => { const rot = T.includes('x') ? 'x' : T.includes('harm') ? `<${k}>` : k + suf; return `<rect x="${x - 2}" y="${y(c) - 8}" width="${String(rot).length * 7.4 + 6}" height="16" rx="4"/><text x="${x + 1}" y="${y(c) + 4.5}">${esc(String(rot))}</text>`; }).join('') + '</g>';
    }
    t += e.d;
  });
  fechaPM(40 + t * PX);
  return s + `<line class="tab-cursor" x1="0" y1="2" x2="0" y2="${alto - 2}"/></svg>`;
}

/* som de guitarra: Karplus-Strong (ruído curto realimentado num filtro), gerado uma vez por nota e guardado */
const somCache = new Map();
function somCorda(a, midi) {
  if (somCache.has(midi)) return somCache.get(midi);
  const taxa = a.sampleRate, dur = 2.4, n = Math.floor(taxa * dur), buf = a.createBuffer(1, n, taxa), d = buf.getChannelData(0);
  const per = Math.max(2, Math.round(taxa / hzDeMidi(midi))), linha = new Float32Array(per);
  for (let i = 0; i < per; i++) linha[i] = Math.random() * 2 - 1;
  let k = 0;
  for (let i = 0; i < n; i++) { const prox = (k + 1) % per, v = (linha[k] + linha[prox]) * .4986; d[i] = linha[k]; linha[k] = v; k = prox; }
  somCache.set(midi, buf); return buf;
}
// distorção: um WaveShaper e um filtro de caixa por sessão, na frente da saída do treino
let curvaDist = null;
function entradaSom(a, distorcer) {
  const saida = treino.saida || a.destination;
  if (!distorcer) return saida;
  if (treino.dist && treino.distSaida === saida) return treino.dist;
  if (!curvaDist) { curvaDist = new Float32Array(2048); for (let i = 0; i < 2048; i++) { const x = i / 1024 - 1; curvaDist[i] = Math.tanh(x * 9) * .8; } }
  const pre = a.createGain(), ws = a.createWaveShaper(), cab = a.createBiquadFilter(), meio = a.createBiquadFilter(), vol = a.createGain();
  pre.gain.value = 1.6; ws.curve = curvaDist; ws.oversample = '2x'; cab.type = 'lowpass'; cab.frequency.value = 4200; meio.type = 'peaking'; meio.frequency.value = 750; meio.gain.value = -5; meio.Q.value = 1; vol.gain.value = .38;
  pre.connect(ws); ws.connect(meio); meio.connect(cab); cab.connect(vol); vol.connect(saida);
  treino.dist = pre; treino.distSaida = saida; return pre;
}
// uma nota: técnica (lista) muda o ataque, a duração e a altura no tempo
function tocarCorda(midi, quando, dur = 1.6, vol = .5, tec, opc = {}) {
  const a = audio(); if (!a) return;
  const T = Array.isArray(tec) ? tec : (tec ? [tec] : []), entra = entradaSom(a, opc.distorcer);
  if (T.includes('x')) { // nota morta: um estalo abafado
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = somCorda(a, midi); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = .8;
    g.gain.setValueAtTime(vol * .9, quando); g.gain.exponentialRampToValueAtTime(.0001, quando + .05); s.connect(f); f.connect(g); g.connect(entra); s.start(quando); s.stop(quando + .08); return;
  }
  const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
  s.buffer = somCorda(a, midi); f.type = 'lowpass';
  const pm = T.includes('pm'); f.frequency.value = pm ? 650 : 3400;
  const fim = pm ? Math.min(dur, .16) : dur;
  if (T.includes('b') || T.includes('b2')) { s.playbackRate.setValueAtTime(1, quando + fim * .12); s.playbackRate.linearRampToValueAtTime(Math.pow(2, (T.includes('b') ? 2 : 1) / 12), quando + fim * .45); }
  if (T.includes('r')) { s.playbackRate.setValueAtTime(Math.pow(2, 2 / 12), quando); s.playbackRate.linearRampToValueAtTime(1, quando + fim * .5); }
  if (T.includes('s')) { s.playbackRate.setValueAtTime(Math.pow(2, -2 / 12), quando); s.playbackRate.linearRampToValueAtTime(1, quando + Math.min(.12, fim * .4)); }
  if (T.includes('dive')) { s.playbackRate.setValueAtTime(1, quando + fim * .2); s.playbackRate.exponentialRampToValueAtTime(.45, quando + fim); }
  if (T.includes('v') || T.includes('tr')) { const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = T.includes('tr') ? 9 : 5.5; lg.gain.value = T.includes('tr') ? .055 : .016; lfo.connect(lg); lg.connect(s.playbackRate); lfo.start(quando + fim * .15); lfo.stop(quando + fim + .5); }
  if (T.includes('h') || T.includes('p') || T.includes('t')) vol *= .72;
  g.gain.setValueAtTime(vol, quando); g.gain.setTargetAtTime(0.0001, quando + fim, pm ? .03 : .08);
  s.connect(f); f.connect(g); g.connect(entra); s.start(quando); s.stop(quando + fim + .5);
  if (T.includes('pinch')) { // pinch harmonic: o agudo duas oitavas e uma quinta acima, curto e forte
    const o = a.createOscillator(), og = a.createGain(); o.type = 'sawtooth'; o.frequency.value = hzDeMidi(midi + 31);
    og.gain.setValueAtTime(vol * .35, quando); og.gain.exponentialRampToValueAtTime(.0001, quando + Math.min(fim, .9)); o.connect(og); og.connect(entra); o.start(quando); o.stop(quando + fim + .1);
  }
}
// um evento: cada nota do acorde com um pequeno atraso (a palheta descendo)
function tocarEvento(e, A, quando, seg, vol, distorcer) {
  const T = tecs(e), dur = Math.max(.12, e.d * seg * .95);
  e.n.forEach(([c, k], j) => {
    const m = T.includes('harm') ? A[c] + (HARM[k] || 12) : A[c] + k;
    tocarCorda(m, quando + j * .007, dur, (e.n.length > 1 ? .32 : .45) * vol, T, { distorcer: distorcer && !T.includes('harm') });
  });
}

/* o tocador: contagem de um compasso e depois o treino em voltas. A próxima volta é pedida (o.proxima) um pouco antes
   do fim da atual e agendada colada nela, então o tempo não quebra. Cada volta fecha em pulsos inteiros do compasso.
   Parar = desligar a saída por onde passa tudo o que foi agendado. */
const treino = { tocando: false, raf: 0, saida: null, dist: null };
function treinoTocar(o) {
  const a = audio(); if (!a || treino.tocando) return false;
  const primeira = o.proxima(null); if (!primeira) return false;
  treino.tocando = true; treino.saida = a.createGain(); treino.saida.connect(a.destination); treino.dist = null;
  const rodadas = [];
  const agendar = (r, ini) => {
    const seg = 60 / r.bpm, [cn, cp] = r.ex.compasso || [4, 1]; let t = 0;
    r.ex.evs.forEach(e => {
      if (e.n.length && o.guia) tocarEvento(e, r.ex.afin, ini + t * seg, seg, 1, o.distorcer);
      if (o.harmonia && e.n.length === 1 && !tecs(e).some(x => x === 'x' || x === 'harm')) { const [c, k] = e.n[0]; tocarCorda(harmonizar(r.ex.afin[c] + k, r.ex, o.harmonia), ini + t * seg + .004, Math.max(.12, e.d * seg * .95), .3, tecs(e), { distorcer: o.distorcer }); }
      t += e.d;
    });
    const pulsos = Math.max(1, Math.ceil(t / cp - 1e-6)), batidas = pulsos * cp;
    if (o.bateria) tocarBateriaNoTreino(a, o.bateria, ini, seg, batidas, [cn, cp]);
    else if (o.metronomo !== false) for (let p = 0; p < pulsos; p++) clique(p % cn === 0, ini + p * cp * seg);
    const rr = { ...r, ini, seg, batidas, fim: ini + batidas * seg, n: rodadas.length + 1, pos: [] };
    let q = 0; r.ex.evs.forEach(e => { rr.pos.push(q); q += e.d; });
    rodadas.push(rr); return rr;
  };
  // contagem: um compasso do treino (dois, se o compasso for curto), um clique por pulso
  const seg0 = 60 / primeira.bpm, [cn0, cp0] = primeira.ex.compasso || [4, 1], t0 = a.currentTime + .15, nCont = cn0 * (cn0 * cp0 >= 3 ? 1 : 2);
  for (let b = 0; b < nCont; b++) clique(b % cn0 === 0, t0 + b * cp0 * seg0);
  agendar(primeira, t0 + nCont * cp0 * seg0);
  const comeco = Date.now(); let mostrada = null;
  const resumo = parado => { const agora = a.currentTime, feitas = rodadas.filter(r => r.fim <= agora + .05); return { voltas: feitas.length, bpm: Math.max(0, ...feitas.map(r => r.bpm)), ultima: feitas[feitas.length - 1] || null, feitas, segs: (Date.now() - comeco) / 1000, tocado: Math.max(0, agora - rodadas[0].ini), parado }; };
  const encerrar = parado => {
    if (!treino.tocando) return; const r = resumo(parado);
    treino.tocando = false; cancelAnimationFrame(treino.raf);
    if (treino.saida) { try { treino.saida.disconnect(); } catch {} treino.saida = null; } treino.dist = null;
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
    let i = -1; if (beat >= 0) cur.pos.forEach((p, k) => { if (beat >= p - 1e-6) i = k; });
    if (i >= 0 && !cur.ex.evs[i].n.length) i = -1 - i; // pausa: nada aceso
    o.aoQuadro && o.aoQuadro(cur, beat, agora < cur.ini ? Math.ceil((cur.ini - agora) / (cur.seg * (cur.ex.compasso || [4, 1])[1]) - 1e-6) : 0, i, Math.max(0, agora - rodadas[0].ini));
    treino.raf = requestAnimationFrame(passo);
  };
  treino.parar = () => encerrar(true);
  passo();
  return true;
}

/* bateria no treino: em 4/4, o estilo escolhido; nos outros compassos, bumbo em cada pulso, caixa no meio do compasso */
function tocarBateriaNoTreino(a, estilo, ini, seg, batidas, [cn, cp]) {
  const dest = treino.saida || a.destination;
  if (cn * cp === 4 && cp === 1) {
    const [, , ppb, P] = ESTILOS_BATERIA.find(e => e[0] === estilo) || ESTILOS_BATERIA[0], tot = ppb * 4;
    for (let i = 0; i < Math.round(batidas * ppb); i++) { const p = i % tot, q = ini + i * seg / ppb; if (P.b.includes(p)) peca(a, 'b', q, dest); if (P.c.includes(p)) peca(a, 'c', q, dest); if (P.h.includes(p)) peca(a, 'h', q, dest); }
    return;
  }
  const meio = Math.floor(cn / 2);
  for (let p = 0; p * cp < batidas - 1e-6; p++) { const q = ini + p * cp * seg, m = p % cn; peca(a, 'b', q, dest); peca(a, 'h', q, dest); if (m === meio || (cn >= 6 && m === cn - 1)) peca(a, 'c', q, dest); }
}
/* segunda guitarra: a nota da escala duas acima (terça) ou quatro acima (quinta), ou a oitava; fora da escala, o
   intervalo paralelo */
function harmonizar(m, ex, modo) {
  if (modo === 'oitava') return m + 12;
  const iv = ex.escala ? (ESCALAS.find(e => e[0] === ex.escala) || [])[2] : null;
  if (!iv || ex.raiz == null) return m + (modo === 'quintas' ? 7 : 4);
  const pcs = iv.map(i => pc(ex.raiz + i));
  if (!pcs.includes(pc(m))) return m + (modo === 'quintas' ? 7 : 4);
  let passos = modo === 'quintas' ? 4 : 2, h = m; while (passos > 0) { h++; if (pcs.includes(pc(h))) passos--; }
  return h;
}
/* trecho em laço: só os compassos escolhidos (de e até contam de 1); uma nota que atravessa a borda é cortada */
function recortarCompassos(ex, de, ate) {
  const [cn, cp] = ex.compasso || [4, 1], bl = cn * cp, ini = (de - 1) * bl, fim = ate * bl, evs = [], idx = [];
  let t = 0;
  ex.evs.forEach((e, i) => {
    const a = t, b = t + e.d; t = b;
    if (b <= ini + 1e-6 || a >= fim - 1e-6) return;
    const a2 = Math.max(a, ini), b2 = Math.min(b, fim);
    if (a < ini - 1e-6) { evs.push({ d: b2 - a2, n: [], t: '' }); idx.push(i); return; } // começou antes: vira pausa
    evs.push({ ...e, d: b2 - a2 }); idx.push(i);
  });
  const partes = ex.partes ? ex.partes.map(p => ({ ...p, i: idx.findIndex(i => i >= p.i) })).filter(p => p.i >= 0) : null;
  return { ...ex, evs, partes: partes && partes.length ? partes.filter((p, j, L) => j === L.length - 1 || L[j + 1].i !== p.i) : null, trecho: [de, ate] };
}
const compassosDe = ex => { const [cn, cp] = ex.compasso || [4, 1]; return Math.max(1, Math.round(ex.evs.reduce((s, e) => s + e.d, 0) / (cn * cp))); };

/* ================= microfone no treino =================
   Só quando a pessoa liga, com permissão. Ritmo: a energia do som (abaixo de 700 Hz, para o clique e os agudos pesarem
   menos) é lida a cada quadro; um salto de energia é um ataque. Os ataques são comparados com o começo de cada nota do
   treino. Gravação: MediaRecorder em memória; o áudio fica neste aparelho e é apagado ao fechar a janela do treino.
   Nada é enviado. */
const mic = { fluxo: null, an: null, buf: null, ataques: [], ultimo: 0, base: .004, antes: 0, gravador: null, pedacos: [], url: null };
async function micLigar(gravar) {
  const a = audio(); if (!a || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return 'sem';
  try { mic.fluxo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); } catch { return 'negado'; }
  const fonte = a.createMediaStreamSource(mic.fluxo), f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
  mic.an = a.createAnalyser(); mic.an.fftSize = 1024; fonte.connect(f); f.connect(mic.an); mic.buf = new Float32Array(mic.an.fftSize);
  mic.ataques = []; mic.ultimo = 0; mic.antes = 0; mic.base = .004;
  if (gravar && window.MediaRecorder) { mic.pedacos = []; mic.gravador = new MediaRecorder(mic.fluxo); mic.gravador.ondataavailable = e => { if (e.data.size) mic.pedacos.push(e.data); }; mic.gravador.start(); }
  return 'ok';
}
// lê um quadro: guarda o instante (no relógio do áudio) de cada ataque
function micQuadro() {
  if (!mic.an) return; const a = audio(); mic.an.getFloatTimeDomainData(mic.buf);
  let e = 0; for (let i = 0; i < mic.buf.length; i++) e += mic.buf[i] * mic.buf[i]; e = Math.sqrt(e / mic.buf.length);
  const agora = a.currentTime;
  if (e > Math.max(mic.base * 3, .008) && e > mic.antes * 1.6 && agora - mic.ultimo > .07) { mic.ataques.push(agora - mic.buf.length / a.sampleRate / 2); mic.ultimo = agora; }
  mic.base = mic.base * .995 + Math.min(e, mic.base * 2) * .005; mic.antes = e;
}
function micDesligar() {
  return new Promise(res => {
    const fim = () => { if (mic.fluxo) mic.fluxo.getTracks().forEach(t => t.stop()); mic.fluxo = null; mic.an = null; res(); };
    if (mic.gravador && mic.gravador.state !== 'inactive') { mic.gravador.onstop = () => { if (mic.url) URL.revokeObjectURL(mic.url); mic.url = mic.pedacos.length ? URL.createObjectURL(new Blob(mic.pedacos, { type: mic.gravador.mimeType || 'audio/webm' })) : null; mic.gravador = null; fim(); }; mic.gravador.stop(); }
    else fim();
  });
}
function micApagarGravacao() { if (mic.url) URL.revokeObjectURL(mic.url); mic.url = null; mic.pedacos = []; }
/* nota do ritmo: cada nota esperada procura o ataque mais perto (a latência do aparelho é descontada);
   dentro de 60 ms (ou 30% da nota, o que for menor, nunca menos de 35 ms) conta como no tempo */
function avaliarRitmo(esperados, ataques, latencia) {
  const res = esperados.map(x => { let melhor = null; for (const t of ataques) { const d = t - latencia - x.t; if (melhor == null || Math.abs(d) < Math.abs(melhor)) melhor = d; } const tol = Math.max(.035, Math.min(.06, x.dur * .3)); return { ...x, desvio: melhor, ok: melhor != null && Math.abs(melhor) <= tol }; });
  const certos = res.filter(r => r.ok), pct = res.length ? Math.round(certos.length / res.length * 100) : 0;
  const media = certos.length ? Math.round(certos.reduce((s, r) => s + r.desvio, 0) / certos.length * 1000) : 0;
  const porComp = {}; res.forEach(r => { const k = r.comp; porComp[k] = porComp[k] || [0, 0]; porComp[k][1]++; if (!r.ok) porComp[k][0]++; });
  const pior = Object.entries(porComp).sort((a, b) => b[1][0] / b[1][1] - a[1][0] / a[1][1])[0];
  return { pct, media, pior: pior && pior[1][0] ? +pior[0] : null, total: res.length };
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
  ['duplo', 'Bumbo duplo', 4, { b: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], c: [4, 12], h: [0, 4, 8, 12] }],
  ['blast', 'Blast beat', 4, { b: [0, 2, 4, 6, 8, 10, 12, 14], c: [1, 3, 5, 7, 9, 11, 13, 15], h: [0, 2, 4, 6, 8, 10, 12, 14] }],
  ['dbeat', 'D-beat', 4, { b: [0, 3, 8, 11], c: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] }],
  ['skank', 'Thrash (skank)', 4, { b: [0, 4, 8, 12], c: [2, 6, 10, 14], h: [0, 2, 4, 6, 8, 10, 12, 14] }],
  ['galope', 'Galope', 4, { b: [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15], c: [4, 12], h: [0, 4, 8, 12] }],
  ['meio', 'Meio tempo (breakdown)', 4, { b: [0, 3, 6, 10], c: [8], h: [0, 4, 8, 12] }],
];
const ESTILOS_TREINO = ['metal', 'duplo', 'blast', 'dbeat', 'skank', 'galope', 'meio', 'rock', 'shuffle', 'funk']; // os que acompanham o treino
const bateria = { ligada: false, t: null, prox: 0, passo: 0 };
let ruidoBuf = null;
function ruido(a) { if (ruidoBuf) return ruidoBuf; const n = a.sampleRate * .5, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return (ruidoBuf = b); }
function peca(a, tipo, q, dest) {
  dest = dest || a.destination;
  if (tipo === 'b') { const o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(140, q); o.frequency.exponentialRampToValueAtTime(42, q + .12); g.gain.setValueAtTime(.9, q); g.gain.exponentialRampToValueAtTime(.001, q + .3); o.connect(g); g.connect(dest); o.start(q); o.stop(q + .32); return; }
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = ruido(a);
  f.type = tipo === 'c' ? 'bandpass' : 'highpass'; f.frequency.value = tipo === 'c' ? 1800 : 7000;
  const dur = tipo === 'c' ? .18 : .05; g.gain.setValueAtTime(tipo === 'c' ? .7 : .25, q); g.gain.exponentialRampToValueAtTime(.001, q + dur);
  s.connect(f); f.connect(g); g.connect(dest); s.start(q); s.stop(q + dur + .02);
  if (tipo === 'c') { const o = a.createOscillator(), g2 = a.createGain(); o.frequency.value = 190; g2.gain.setValueAtTime(.35, q); g2.gain.exponentialRampToValueAtTime(.001, q + .1); o.connect(g2); g2.connect(dest); o.start(q); o.stop(q + .12); }
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

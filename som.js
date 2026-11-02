/* Guitarra Fácil · o som do app: guitarra limpa, bateria e metrônomo gravados do banco FluidR3 (licença MIT, Frank Wen;
   ver sons/LICENCA-FluidR3.txt). As gravações ficam em sons/ e são guardadas para uso sem internet.
   Cada nota é nivelada ao carregar (todas com a mesma força) e tudo passa por um limitador na saída, para o som ficar
   alto sem estourar quando guitarra, segunda guitarra e bateria tocam juntas. Enquanto as gravações não chegam (ou se
   o navegador não as abrir), o app toca uma corda gerada no aparelho, no mesmo timbre limpo. */
'use strict';
const SOM = { notas: new Map(), pecas: new Map(), baixo: new Map(), fundo: new Map(), ctx: null, mestre: null, preparado: null };
const BAIXO_DE = 21, BAIXO_ATE = 52, FUNDO_DE = 45, FUNDO_ATE = 71; // baixo: Lá 0 a Mi 3; cordas de fundo: Lá 2 a Si 4
const SOM_DE = 28, SOM_ATE = 91; // Mi 1 a Sol 6: da sétima corda (Lá 1 em Drop A) aos harmônicos e à segunda guitarra
const SOM_PECAS = ['bumbo', 'caixa', 'chimbal', 'chimbal-aberto', 'prato', 'conducao', 'tom-agudo', 'tom-grave', 'metronomo', 'metronomo-forte'];
// quanto cada peça pesa na mistura (a guitarra vem na frente)
const SOM_MIX = { bumbo: .85, caixa: .7, chimbal: .32, 'chimbal-aberto': .3, prato: .38, conducao: .3, 'tom-agudo': .6, 'tom-grave': .6, metronomo: .55, 'metronomo-forte': .6 };

// saída geral: um ganho e um limitador; quem toca liga aqui no lugar de a.destination
function somMestre(a) {
  if (SOM.mestre && SOM.ctx === a) return SOM.mestre;
  const g = a.createGain(), lim = a.createDynamicsCompressor();
  lim.threshold.value = -3; lim.knee.value = 3; lim.ratio.value = 20; lim.attack.value = .002; lim.release.value = .15;
  g.gain.value = 1.15; g.connect(lim); lim.connect(a.destination);
  SOM.ctx = a; SOM.mestre = g; return g;
}

// abre um arquivo de som: tira o silêncio do começo (o MP3 traz um pouco) e mede o pico para nivelar
function somAbrir(a, url) {
  return fetch(url).then(r => { if (!r.ok) throw new Error(url); return r.arrayBuffer(); })
    .then(b => new Promise((ok, erro) => { const p = a.decodeAudioData(b, ok, erro); if (p && p.catch) p.catch(erro); }))
    .then(buf => {
      let pico = 0; for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pico) pico = v; } }
      const d = buf.getChannelData(0), lim = pico * .02; let i = 0; while (i < d.length && Math.abs(d[i]) < lim) i++;
      return { buf, ganho: pico > 0 ? 1 / pico : 1, ini: Math.max(0, i / buf.sampleRate - .002) };
    });
}
// carrega tudo uma vez (no primeiro som do app); se falhar, o som gerado no aparelho continua valendo
function somPreparar(a) {
  if (SOM.preparado || !a || typeof fetch !== 'function') return SOM.preparado;
  const notas = []; for (let m = SOM_DE; m <= SOM_ATE; m++) notas.push(somAbrir(a, `sons/guitarra/${m}.mp3`).then(x => SOM.notas.set(m, x)).catch(() => {}));
  const pecas = SOM_PECAS.map(p => somAbrir(a, `sons/bateria/${p}.mp3`).then(x => SOM.pecas.set(p, x)).catch(() => {}));
  const extras = [];
  for (let m = BAIXO_DE; m <= BAIXO_ATE; m++) extras.push(somAbrir(a, `sons/baixo/${m}.mp3`).then(x => SOM.baixo.set(m, x)).catch(() => {}));
  for (let m = FUNDO_DE; m <= FUNDO_ATE; m++) extras.push(somAbrir(a, `sons/fundo/${m}.mp3`).then(x => SOM.fundo.set(m, x)).catch(() => {}));
  return (SOM.preparado = Promise.all([...notas, ...pecas, ...extras]));
}

// muda a altura com uma curva suave (começo e fim devagar, como o dedo empurrando a corda)
function somCurva(param, de, para, t0, dur) {
  const n = 24, v = new Float32Array(n);
  for (let i = 0; i < n; i++) v[i] = de + (para - de) * (.5 - .5 * Math.cos(Math.PI * i / (n - 1)));
  try { param.setValueCurveAtTime(v, t0, Math.max(.03, dur)); } catch { try { param.linearRampToValueAtTime(para, t0 + dur); } catch {} }
}

/* uma nota de guitarra: técnica (lista) muda o ataque, a duração e a altura no tempo.
   pm palm mute · b/b2 bend · r volta do bend · s slide · h/p/t ligados e tapping · v vibrato · tr trinado ·
   x nota morta · pinch harmônico artificial · dive alavanca */
function tocarCorda(midi, quando, dur = 1.6, vol = .5, tec, opc = {}) {
  const a = audio(); if (!a) return;
  const T = Array.isArray(tec) ? tec : (tec ? [tec] : []), entra = opc.saida || (typeof treino !== 'undefined' && treino.saida) || somMestre(a);
  const base = Math.max(SOM_DE, Math.min(SOM_ATE, Math.round(midi))), am = SOM.notas.get(base);
  if (!am) return cordaGerada(a, midi, quando, dur, vol, T, entra);
  const r0 = Math.pow(2, (midi - base) / 12 + (Math.random() - .5) * 4 / 1200); // cada palhetada um pouco diferente
  const forca = vol * am.ganho * 1.45 * (.88 + Math.random() * .24);
  const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); s.buffer = am.buf; f.type = 'lowpass';
  if (T.includes('x')) { // nota morta: só o estalo da palheta na corda abafada
    f.type = 'bandpass'; f.frequency.value = 1300; f.Q.value = .9; s.playbackRate.value = r0;
    g.gain.setValueAtTime(0, quando); g.gain.linearRampToValueAtTime(forca * 1.2, quando + .003); g.gain.setTargetAtTime(0, quando + .012, .012);
    s.connect(f); f.connect(g); g.connect(entra); s.start(quando, am.ini); s.stop(quando + .1); return;
  }
  const pm = T.includes('pm'), lig = T.includes('h') || T.includes('p') || T.includes('t');
  f.frequency.value = pm ? 1000 : lig ? 5000 : 12000;
  const fim = pm ? Math.min(dur, .18) : dur;
  s.playbackRate.setValueAtTime(T.includes('r') ? r0 * Math.pow(2, 2 / 12) : T.includes('s') ? r0 * Math.pow(2, -2 / 12) : r0, quando);
  if (T.includes('b') || T.includes('b2')) somCurva(s.playbackRate, r0, r0 * Math.pow(2, (T.includes('b') ? 2 : 1) / 12), quando + Math.min(.08, fim * .12), Math.max(.09, fim * .33));
  else if (T.includes('r')) somCurva(s.playbackRate, r0 * Math.pow(2, 2 / 12), r0, quando + .02, Math.max(.09, fim * .4));
  else if (T.includes('s')) somCurva(s.playbackRate, r0 * Math.pow(2, -2 / 12), r0, quando + .002, Math.min(.15, fim * .4));
  if (T.includes('dive')) { s.playbackRate.setValueAtTime(r0, quando + fim * .2); s.playbackRate.exponentialRampToValueAtTime(r0 * .45, quando + fim); }
  if (T.includes('v') || T.includes('tr')) {
    const lfo = a.createOscillator(), lg = a.createGain(), ini = quando + fim * (T.includes('b') ? .5 : .15);
    lfo.frequency.value = T.includes('tr') ? 9 : 5.3; lg.gain.setValueAtTime(0, quando); lg.gain.setValueAtTime(0, ini); lg.gain.linearRampToValueAtTime(r0 * (T.includes('tr') ? .055 : .018), ini + .15);
    lfo.connect(lg); lg.connect(s.playbackRate); lfo.start(quando); lfo.stop(quando + fim + .6);
  }
  const v = lig ? forca * .72 : forca;
  g.gain.setValueAtTime(0, quando); g.gain.linearRampToValueAtTime(v, quando + (lig ? .008 : .003));
  if (pm) g.gain.setTargetAtTime(0, quando + .03, .06); else g.gain.setTargetAtTime(0, quando + fim, .09);
  s.connect(f); f.connect(g); g.connect(entra); s.start(quando, am.ini + (lig ? .012 : 0)); s.stop(quando + fim + .6);
  if (T.includes('pinch')) { // pinch harmonic: o agudo uma oitava e uma quinta acima, curto, por cima da nota
    const ah = SOM.notas.get(Math.min(SOM_ATE, base + 19)); if (!ah) return;
    const s2 = a.createBufferSource(), g2 = a.createGain(), f2 = a.createBiquadFilter(); s2.buffer = ah.buf; s2.playbackRate.value = Math.pow(2, (midi + 19 - Math.min(SOM_ATE, base + 19)) / 12);
    f2.type = 'highpass'; f2.frequency.value = 1500; g2.gain.setValueAtTime(vol * ah.ganho * .5, quando); g2.gain.setTargetAtTime(0, quando + .05, .12);
    s2.connect(f2); f2.connect(g2); g2.connect(entra); s2.start(quando, ah.ini); s2.stop(quando + Math.min(fim, 1) + .3);
  }
}

/* corda gerada no aparelho (enquanto as gravações não chegam): Karplus-Strong com palhetada variável e o "pente" do
   captador, guardada em quatro versões por nota para nenhuma palhetada sair igual à anterior */
const somGerado = new Map();
function cordaGeradaBuf(a, midi, forca) {
  const k = midi + ':' + Math.floor(Math.random() * 4); if (somGerado.has(k)) return somGerado.get(k);
  const taxa = a.sampleRate, n = Math.floor(taxa * 2.6), buf = a.createBuffer(1, n, taxa), d = buf.getChannelData(0);
  const per = Math.max(2, Math.round(taxa / hzDeMidi(midi))), l = new Float32Array(per), cru = new Float32Array(n);
  let y = 0; const brilho = .25 + .5 * forca; for (let i = 0; i < per; i++) { y += ((Math.random() * 2 - 1) - y) * brilho; l[i] = y; }
  let med = 0; for (let i = 0; i < per; i++) med += l[i]; med /= per; for (let i = 0; i < per; i++) l[i] -= med;
  const rho = midi < 50 ? .9993 : midi < 60 ? .999 : .9984; let j = 0;
  for (let i = 0; i < n; i++) { const p = (j + 1) % per, v = (l[j] + l[p]) * .5 * rho; cru[i] = l[j]; l[j] = v; j = p; }
  const pk = Math.max(1, Math.round(per * .13)); for (let i = 0; i < n; i++) d[i] = (cru[i] - (i >= pk ? cru[i - pk] : 0)) * .7;
  somGerado.set(k, buf); return buf;
}
function cordaGerada(a, midi, quando, dur, vol, T, entra) {
  const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(), pm = T.includes('pm');
  s.buffer = cordaGeradaBuf(a, Math.round(midi), .85); s.playbackRate.value = Math.pow(2, (midi - Math.round(midi)) / 12);
  f.type = 'lowpass'; f.frequency.value = pm ? 900 : 7000; const fim = pm ? Math.min(dur, .18) : dur;
  if (T.includes('b') || T.includes('b2')) somCurva(s.playbackRate, 1, Math.pow(2, (T.includes('b') ? 2 : 1) / 12), quando + Math.min(.08, fim * .12), Math.max(.09, fim * .33));
  const v = vol * (T.includes('x') ? .6 : 1.3);
  g.gain.setValueAtTime(0, quando); g.gain.linearRampToValueAtTime(v, quando + .004);
  if (pm || T.includes('x')) g.gain.setTargetAtTime(0, quando + .02, T.includes('x') ? .015 : .06); else g.gain.setTargetAtTime(0, quando + fim, .1);
  s.connect(f); f.connect(g); g.connect(entra); s.start(quando); s.stop(quando + fim + .6);
}

/* peças da bateria e o metrônomo: a gravação, ou um som gerado parecido enquanto ela não chega */
let somRuido = null;
const ruidoDe = a => { if (somRuido) return somRuido; const n = a.sampleRate * .5, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return (somRuido = b); };
function somPeca(a, nome, q, dest, forca = 1) {
  dest = dest || somMestre(a);
  const p = SOM.pecas.get(nome);
  if (p) { const s = a.createBufferSource(), g = a.createGain(); s.buffer = p.buf; g.gain.value = p.ganho * (SOM_MIX[nome] || .5) * forca; s.connect(g); g.connect(dest); s.start(q, p.ini); return; }
  if (nome.startsWith('metronomo')) { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = nome === 'metronomo-forte' ? 1600 : 1000; g.gain.setValueAtTime(.0001, q); g.gain.exponentialRampToValueAtTime(.5 * forca, q + .002); g.gain.exponentialRampToValueAtTime(.0001, q + .06); o.connect(g); g.connect(dest); o.start(q); o.stop(q + .07); return; }
  if (nome === 'bumbo' || nome.startsWith('tom')) { const o = a.createOscillator(), g = a.createGain(), f0 = nome === 'bumbo' ? 140 : nome === 'tom-agudo' ? 260 : 170; o.frequency.setValueAtTime(f0, q); o.frequency.exponentialRampToValueAtTime(f0 * .3, q + .12); g.gain.setValueAtTime(.9 * forca, q); g.gain.exponentialRampToValueAtTime(.001, q + .3); o.connect(g); g.connect(dest); o.start(q); o.stop(q + .32); return; }
  const caixa = nome === 'caixa', s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = ruidoDe(a);
  f.type = caixa ? 'bandpass' : 'highpass'; f.frequency.value = caixa ? 1800 : 7000;
  const dur = caixa ? .18 : nome === 'chimbal' ? .05 : .6; g.gain.setValueAtTime((caixa ? .7 : .25) * forca, q); g.gain.exponentialRampToValueAtTime(.001, q + dur);
  s.connect(f); f.connect(g); g.connect(dest); s.start(q); s.stop(q + dur + .02);
}

/* baixo (dobra a nota mais grave do riff uma oitava abaixo, ou marca a tônica) e cordas de fundo (o acorde da tônica,
   macio, compasso a compasso). Sem a gravação, ficam em silêncio: são acompanhamento, não a lição. */
function tocarBaixo(midi, quando, dur, vol, dest) {
  const a = audio(); if (!a) return; let m = Math.round(midi); while (m > BAIXO_ATE) m -= 12; while (m < BAIXO_DE) m += 12;
  const am = SOM.baixo.get(m); if (!am) return;
  const s = a.createBufferSource(), g = a.createGain(); s.buffer = am.buf;
  g.gain.setValueAtTime(0, quando); g.gain.linearRampToValueAtTime(vol * am.ganho * .9, quando + .006); g.gain.setTargetAtTime(0, quando + Math.max(.1, dur * .92), .06);
  s.connect(g); g.connect(dest || somMestre(a)); s.start(quando, am.ini); s.stop(quando + dur + .5);
}
function tocarFundo(midis, quando, dur, vol, dest) {
  const a = audio(); if (!a) return; const d = Math.min(dur, 3);
  midis.forEach(m0 => { let m = Math.round(m0); while (m > FUNDO_ATE) m -= 12; while (m < FUNDO_DE) m += 12; const am = SOM.fundo.get(m); if (!am) return;
    const s = a.createBufferSource(), g = a.createGain(); s.buffer = am.buf;
    g.gain.setValueAtTime(0, quando); g.gain.linearRampToValueAtTime(vol * am.ganho * .35, quando + .25); g.gain.setTargetAtTime(0, quando + d * .85, .25);
    s.connect(g); g.connect(dest || somMestre(a)); s.start(quando, am.ini); s.stop(quando + d + 1.2); });
}

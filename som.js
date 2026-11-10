/* Guitarra Fácil · som: guitarra limpa, bateria e metrônomo gravados do banco FluidR3 (licença MIT, Frank Wen; veja
   sons/LICENCA-FluidR3.txt). Tudo é gerado no aparelho; depois da primeira vez, as gravações ficam guardadas para uso
   sem internet. Enquanto uma gravação não chega, toca uma corda sintetizada no mesmo registro. */
'use strict';

const SOM = (() => {
  const GUITARRA_DE = 28, GUITARRA_ATE = 91;
  const PECAS = ['bumbo', 'caixa', 'chimbal', 'chimbal-aberto', 'prato', 'conducao', 'tom-agudo', 'tom-grave', 'metronomo', 'metronomo-forte'];
  const PESO = { bumbo: .9, caixa: .75, chimbal: .35, 'chimbal-aberto': .35, prato: .4, conducao: .32, 'tom-agudo': .6, 'tom-grave': .6, metronomo: .7, 'metronomo-forte': .8 };
  const buffers = new Map(), carregando = new Map(), ativos = new Set();
  let ctx = null, saida = null;
  const vol = { guitarra: .9, metronomo: .7, bateria: .8 };

  function audio() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC({ latencyHint: 'interactive' });
    // um limitador na saída: guitarra, bateria e metrônomo juntos não estouram
    const g = ctx.createGain(), lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -4; lim.knee.value = 4; lim.ratio.value = 16; lim.attack.value = .003; lim.release.value = .15;
    g.gain.value = 1; g.connect(lim); lim.connect(ctx.destination); saida = g;
    return ctx;
  }
  const tempo = () => (ctx ? ctx.currentTime : 0);

  /* abre uma gravação: tira o silêncio do começo e mede o pico para nivelar */
  function abrir(chave, url) {
    if (buffers.has(chave)) return Promise.resolve(buffers.get(chave));
    if (carregando.has(chave)) return carregando.get(chave);
    const a = audio(); if (!a) return Promise.resolve(null);
    const p = fetch(url).then(r => { if (!r.ok) throw new Error(url); return r.arrayBuffer(); })
      .then(b => new Promise((ok, erro) => { const x = a.decodeAudioData(b, ok, erro); if (x && x.catch) x.catch(erro); }))
      .then(buf => {
        let pico = 0; const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pico) pico = v; }
        let i = 0; const lim = pico * .02; while (i < d.length && Math.abs(d[i]) < lim) i++;
        const r = { buf, ganho: pico > 0 ? 1 / pico : 1, ini: Math.max(0, i / buf.sampleRate - .002) };
        buffers.set(chave, r); return r;
      })
      .catch(() => null)
      .finally(() => carregando.delete(chave));
    carregando.set(chave, p); return p;
  }
  const amostra = m => limitar(Math.round(m), GUITARRA_DE, GUITARRA_ATE);
  /* prepara as notas e as peças que um trecho vai usar (devolve quando estiverem prontas ou depois de 2,5 s) */
  function preparar(midis = [], pecas = []) {
    if (!audio()) return Promise.resolve();
    const ps = [...new Set(midis.map(amostra))].map(m => abrir('g' + m, `sons/guitarra/${m}.mp3`))
      .concat(pecas.map(p => abrir(p, `sons/bateria/${p}.mp3`)));
    return Promise.race([Promise.all(ps), new Promise(r => setTimeout(r, 2500))]);
  }
  function guardar(no, fim) { ativos.add(no); no.onended = () => ativos.delete(no); if (fim) try { no.stop(fim); } catch {} }

  /* uma nota de guitarra. tec: '' | 'h' | 'p' | 's' | 'b' | 'v' | 'pm' | 'x' (ligado, slide, bend, vibrato, abafada, morta) */
  function nota(midi, quando = tempo(), dur = .8, forca = 1, tec = '') {
    const a = audio(); if (!a) return;
    const base = amostra(midi), am = buffers.get('g' + base);
    if (!am) { abrir('g' + base, `sons/guitarra/${base}.mp3`); return sintetizada(midi, quando, dur, forca, tec); }
    const r0 = Math.pow(2, (midi - base) / 12);
    const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
    s.buffer = am.buf; f.type = 'lowpass';
    const pm = tec === 'pm', lig = tec === 'h' || tec === 'p', morta = tec === 'x';
    f.frequency.value = morta ? 1400 : pm ? 1100 : lig ? 6000 : 12000;
    const fim = morta ? .06 : pm ? Math.min(dur, .2) : dur;
    const v = vol.guitarra * am.ganho * .5 * forca * (lig ? .7 : 1) * (.92 + Math.random() * .16);
    s.playbackRate.setValueAtTime(tec === 's' ? r0 * Math.pow(2, -2 / 12) : r0, quando);
    if (tec === 's') s.playbackRate.linearRampToValueAtTime(r0, quando + Math.min(.15, fim * .4));
    if (tec === 'b') { s.playbackRate.setValueAtTime(r0, quando + Math.min(.08, fim * .15)); s.playbackRate.linearRampToValueAtTime(r0 * Math.pow(2, 2 / 12), quando + Math.max(.12, fim * .45)); }
    if (tec === 'v' || tec === 'b') {
      const lfo = a.createOscillator(), lg = a.createGain(), ini = quando + fim * (tec === 'b' ? .5 : .2);
      lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, quando); lg.gain.setValueAtTime(0, ini); lg.gain.linearRampToValueAtTime(r0 * .02, ini + .15);
      lfo.connect(lg); lg.connect(s.playbackRate); lfo.start(quando); guardar(lfo, quando + fim + .5);
    }
    g.gain.setValueAtTime(0, quando); g.gain.linearRampToValueAtTime(v, quando + (lig ? .01 : .003));
    g.gain.setTargetAtTime(0, quando + fim, morta ? .01 : pm ? .05 : .09);
    s.connect(f); f.connect(g); g.connect(saida); s.start(quando, am.ini); guardar(s, quando + fim + .6);
  }
  /* corda sintetizada (enquanto a gravação não chega) */
  function sintetizada(midi, quando, dur, forca, tec) {
    const a = ctx, o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
    const hz = TEORIA.freq(midi);
    o.type = 'sawtooth'; o2.type = 'triangle'; o.frequency.value = hz; o2.frequency.value = hz * 2;
    f.type = 'lowpass'; f.frequency.setValueAtTime(hz * 8, quando); f.frequency.exponentialRampToValueAtTime(hz * 1.5, quando + Math.max(.1, dur));
    const fim = tec === 'pm' ? Math.min(dur, .2) : dur, v = vol.guitarra * .12 * forca;
    g.gain.setValueAtTime(0, quando); g.gain.linearRampToValueAtTime(v, quando + .004); g.gain.setTargetAtTime(0, quando + .02, Math.max(.05, fim / 3));
    o.connect(f); o2.connect(f); f.connect(g); g.connect(saida); o.start(quando); o2.start(quando);
    guardar(o, quando + fim + .4); guardar(o2, quando + fim + .4);
  }
  /* peça de bateria ou metrônomo */
  function peca(nomePeca, quando = tempo(), forca = 1) {
    const a = audio(); if (!a) return;
    const am = buffers.get(nomePeca);
    const qual = nomePeca.startsWith('metronomo') ? vol.metronomo : vol.bateria;
    if (!am) { abrir(nomePeca, `sons/bateria/${nomePeca}.mp3`); return clique(quando, nomePeca === 'metronomo-forte' ? 1600 : 1100, qual * forca); }
    const s = a.createBufferSource(), g = a.createGain();
    s.buffer = am.buf; g.gain.value = qual * am.ganho * (PESO[nomePeca] || .6) * forca;
    s.connect(g); g.connect(saida); s.start(quando, am.ini); guardar(s, quando + am.buf.duration);
  }
  function clique(quando, hz, v) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = hz;
    g.gain.setValueAtTime(v * .4, quando); g.gain.exponentialRampToValueAtTime(.0001, quando + .05);
    o.connect(g); g.connect(saida); o.start(quando); guardar(o, quando + .06);
  }
  function calar() { ativos.forEach(n => { try { n.stop(); } catch {} }); ativos.clear(); }
  function volumes(v) { Object.assign(vol, v || {}); }

  return { audio, tempo, preparar, nota, peca, calar, volumes, PECAS, vol };
})();

/* Guitarra Fácil · tocador: põe um trecho no tempo (com contagem, metrônomo e repetições) e avisa a tela de cada nota,
   para o braço e a tablatura acompanharem. Também move os laços do metrônomo e da bateria.
   Evento de um trecho: { d: duração em tempos, n: [[corda, casa, dedo], …], t: técnica }; sem notas é pausa. */
'use strict';

const TOCADOR = (() => {
  const ADIANTE = .15, PASSO_MS = 25;
  let atual = null;

  /* duração total de um trecho, em tempos */
  const duracao = evs => evs.reduce((s, e) => s + (e.d || 0), 0);

  function parar() {
    if (!atual) return;
    const a = atual; atual = null;
    clearInterval(a.relogio); a.avisos.forEach(clearTimeout);
    SOM.calar();
    if (a.aoParar) try { a.aoParar(); } catch (e) { console.warn(e); }
  }
  const tocando = () => !!atual;

  /* toca um trecho. o = { evs, bpm, compasso: tempos por compasso, afin, metronomo, contagem, voltas, aoNota(i, volta),
     aoContagem(n), aoVolta(volta), aoFim(), aoParar() } */
  async function tocar(o) {
    parar();
    const a = SOM.audio(); if (!a) return false;
    const afin = o.afin || 'padrao', evs = o.evs || [];
    const pecas = o.metronomo || o.contagem ? ['metronomo', 'metronomo-forte'] : [];
    await SOM.preparar(evs.flatMap(e => (e.n || []).map(([c, k]) => TEORIA.midiDe(c, k, afin))), pecas);
    const seg = 60 / (o.bpm || 80), porCompasso = o.compasso || 4, total = duracao(evs);
    const voltas = o.voltas || 1, contagem = o.contagem ? porCompasso : 0;
    const t0 = SOM.tempo() + .12;
    const sessao = { relogio: 0, avisos: [], aoParar: o.aoParar };
    atual = sessao;
    // lista de tudo o que vai soar: cliques (contagem e metrônomo) e notas
    const fila = [];
    for (let b = 0; b < contagem; b++) fila.push({ tipo: 'clique', tb: b, forte: b === 0, conta: b + 1 });
    for (let v = 0; v < voltas; v++) {
      const base = contagem + v * total;
      if (o.metronomo) for (let b = 0; b < Math.ceil(total - 1e-6); b++) fila.push({ tipo: 'clique', tb: base + b, forte: b % porCompasso === 0 });
      let pos = 0;
      evs.forEach((e, i) => { fila.push({ tipo: 'nota', tb: base + pos, e, i, v }); pos += e.d || 0; });
      fila.push({ tipo: 'volta', tb: base + total, v });
    }
    fila.sort((x, y) => x.tb - y.tb || (x.tipo === 'clique' ? -1 : 1));
    const fimTb = contagem + voltas * total;
    let k = 0;
    const avisar = (quando, fn) => { const ms = Math.max(0, (quando - SOM.tempo()) * 1000); sessao.avisos.push(setTimeout(() => { if (atual === sessao) fn(); }, ms)); };
    const agendar = () => {
      if (atual !== sessao) return;
      const limite = SOM.tempo() + ADIANTE;
      while (k < fila.length && t0 + fila[k].tb * seg < limite) {
        const x = fila[k++], quando = t0 + x.tb * seg;
        if (x.tipo === 'clique') { SOM.peca(x.forte ? 'metronomo-forte' : 'metronomo', quando); if (x.conta && o.aoContagem) avisar(quando, () => o.aoContagem(x.conta)); }
        else if (x.tipo === 'nota') {
          const ns = x.e.n || [], dur = Math.max(.08, (x.e.d || 1) * seg * (x.e.t === 'pm' ? .5 : .95));
          // acorde: as cordas soam uma depois da outra, como a palheta descendo
          ns.forEach(([c, kk], j) => SOM.nota(TEORIA.midiDe(c, kk, afin), quando + (ns.length > 2 ? j * .012 : 0), dur + (ns.length > 2 ? .3 : 0), ns.length > 2 ? .75 : 1, x.e.t || ''));
          if (o.aoNota) avisar(quando, () => o.aoNota(x.i, x.v));
        } else if (x.tipo === 'volta' && o.aoVolta) avisar(quando, () => o.aoVolta(x.v + 1));
      }
      if (k >= fila.length && SOM.tempo() > t0 + fimTb * seg + .05) {
        clearInterval(sessao.relogio); atual = null;
        if (o.aoFim) try { o.aoFim(); } catch (e) { console.warn(e); }
      }
    };
    sessao.relogio = setInterval(agendar, PASSO_MS); agendar();
    return true;
  }

  /* laço sem fim (metrônomo e bateria): chama aoPasso(i, quando) a cada `passo` tempos; aoVer(i) avisa a tela */
  async function laco({ bpm, passo = 1, pecas = [], aoPasso, aoVer, aoParar }) {
    parar();
    const a = SOM.audio(); if (!a) return false;
    await SOM.preparar([], pecas);
    const sessao = { relogio: 0, avisos: [], aoParar, bpm };
    atual = sessao;
    let i = 0, prox = SOM.tempo() + .1;
    const agendar = () => {
      if (atual !== sessao) return;
      const dt = 60 / sessao.bpm * passo;
      while (prox < SOM.tempo() + ADIANTE) {
        const n = i, q = prox;
        aoPasso(n, q);
        if (aoVer) { const ms = Math.max(0, (q - SOM.tempo()) * 1000); sessao.avisos.push(setTimeout(() => { if (atual === sessao) aoVer(n); }, ms)); }
        if (sessao.avisos.length > 64) sessao.avisos.splice(0, 32);
        i++; prox += dt;
      }
    };
    sessao.relogio = setInterval(agendar, PASSO_MS); agendar();
    return { mudarBpm: v => { sessao.bpm = v; } };
  }

  /* toca uma nota só, na hora (toque no braço) */
  function soar(corda, casa, afin = 'padrao', tec = '') {
    if (!SOM.audio()) return;
    const m = TEORIA.midiDe(corda, casa, afin);
    SOM.preparar([m]).then(() => SOM.nota(m, SOM.tempo() + .01, 1.2, 1, tec));
  }
  /* toca várias notas juntas (acorde), rasgado de cima para baixo */
  function rasgar(notas, afin = 'padrao') {
    if (!SOM.audio()) return;
    const ms = notas.map(([c, k]) => TEORIA.midiDe(c, k, afin)).sort((x, y) => x - y);
    SOM.preparar(ms).then(() => { const t = SOM.tempo() + .02; ms.forEach((m, j) => SOM.nota(m, t + j * .03, 2, .8)); });
  }

  return { tocar, laco, parar, tocando, soar, rasgar, duracao };
})();

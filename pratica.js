/* Guitarra Fácil · o treino tocando: o braço e a tablatura do treino e o tocador, que repete o treino em voltas sem
   perder o tempo. Também a bateria de acompanhamento. O som (guitarra limpa, bateria e metrônomo) fica em som.js.
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

/* braço do treino: o braço inteiro (casa 0 a 24) sempre no mesmo tamanho, como a guitarra no colo. Ele desliza para
   os lados até as notas da vez; quem desenha a parte visível é a janela do treino (app.js). As notas de um trecho
   (um compasso nas linhas longas) ficam num grupo à parte, trocado sem redesenhar o braço.
   BR_L é a largura de uma casa e BR_H a distância entre as cordas, em unidades do desenho. */
const BR_L = 50, BR_H = 25, BR_X0 = 24, BR_CASAS = 24;
const brX = k => BR_X0 + k * BR_L;                                        // traste da casa k (k = 0 é a pestana)
const brMeio = k => k === 0 ? BR_X0 - 13 : brX(k) - BR_L / 2;              // onde o dedo aperta a casa k
const brY = (N, c) => 26 + (N - 1 - c) * BR_H;                            // corda 0 (a mais grave) embaixo, como na tablatura
const bracoLargura = () => brX(BR_CASAS) + 12;
function bracoTreino(ex, de = 0, ate = ex.evs.length) {
  const N = ex.afin.length, topo = brY(N, N - 1) - 12, fundo = brY(N, 0) + 12;
  let s = `<svg class="braco-tr" viewBox="0 0 ${bracoLargura()} ${fundo + 26}" width="${bracoLargura()}" height="${fundo + 26}" role="img" aria-label="Braço com as notas de ${esc(ex.nome)}">`;
  s += `<rect x="${BR_X0}" y="${topo}" width="${brX(BR_CASAS) - BR_X0}" height="${fundo - topo}" rx="4" class="bt-madeira"/>`;
  for (let k = 0; k <= BR_CASAS; k++) s += `<line x1="${brX(k)}" y1="${topo}" x2="${brX(k)}" y2="${fundo}" class="${k === 0 ? 'bt-pestana' : 'bt-traste'}"/>`;
  for (let k = 1; k <= BR_CASAS; k++) {
    s += `<text x="${brMeio(k)}" y="${topo - 5}" text-anchor="middle" class="casa-n">${k}</text>`;
    if ([3, 5, 7, 9, 15, 17, 19, 21].includes(k)) s += `<circle cx="${brMeio(k)}" cy="${fundo + 12}" r="3" class="bt-ponto"/>`;
    if (k === 12 || k === 24) s += `<circle cx="${brMeio(k) - 6}" cy="${fundo + 12}" r="3" class="bt-ponto"/><circle cx="${brMeio(k) + 6}" cy="${fundo + 12}" r="3" class="bt-ponto"/>`;
  }
  ex.afin.forEach((m, c) => { s += `<line x1="${BR_X0 - 24}" y1="${brY(N, c)}" x2="${brX(BR_CASAS)}" y2="${brY(N, c)}" class="bt-corda" stroke-width="${1 + (N - 1 - c) * .28}"/>`; });
  return s + `<g class="bt-notas">${notasBraco(ex, de, ate)}</g></svg>`;
}
// as notas de um trecho, uma vez cada (data-i lista os eventos em que ela toca)
function notasBraco(ex, de = 0, ate = ex.evs.length) {
  const A = ex.afin, N = A.length, vistos = new Map();
  ex.evs.slice(de, ate).forEach((e, j) => e.n.forEach(([c, k, d]) => { const ch = c + ',' + k; if (!vistos.has(ch)) vistos.set(ch, { c, k, d, idx: [] }); vistos.get(ch).idx.push(j + de); }));
  let s = '';
  vistos.forEach(({ c, k, d, idx }) => {
    const cx = brMeio(k), n = pc(A[c] + k), raiz = ex.raiz != null && n === ex.raiz;
    const rot = ex.rotulo === 'grau' && ex.raiz != null ? GRAUS[pc(n - ex.raiz)] : ex.rotulo === 'dedo' && d != null ? (k === 0 ? '0' : d) : CIFRA[n];
    s += `<g class="nt${raiz ? ' raiz' : ''}" data-i="${[...new Set(idx)].join(' ')}" data-nota="${c},${k}" style="--dir:${c >= N / 2 ? 1 : -1}"><circle cx="${cx}" cy="${brY(N, c)}" r="11.5"/><text x="${cx}" y="${brY(N, c) + 4.5}" text-anchor="middle">${rot}</text></g>`;
  });
  return s;
}
// os nomes das cordas, parados à esquerda enquanto o braço desliza
function cordasBraco(ex) {
  const N = ex.afin.length, alto = brY(N, 0) + 38;
  return `<svg class="braco-cordas" viewBox="0 0 22 ${alto}" width="22" height="${alto}" aria-hidden="true">${ex.afin.map((m, c) => `<text x="11" y="${brY(N, c) + 4}" text-anchor="middle" class="tab-r">${nomeCorda(m)}</text>`).join('')}</svg>`;
}
// de que casa a que casa vão as notas destes eventos (corda solta conta como casa 0)
function casasDe(evs) { const ks = evs.flatMap(e => e.n.map(n => n[1])); return ks.length ? [Math.min(...ks), Math.max(...ks)] : null; }
// o deslocamento (em unidades do desenho) que mostra as casas [a, b] numa janela de largura vis
function deslocarPara([a, b], vis, atual) {
  const esq = brMeio(a) - BR_L * .75, dir = brMeio(b) + BR_L * .75, max = Math.max(0, bracoLargura() - vis);
  if (atual != null && esq >= atual - 1 && dir <= atual + vis + 1) return atual;   // já está à vista: não mexe
  const alvo = dir - esq <= vis ? (esq + dir) / 2 - vis / 2 : esq;                  // cabe: centraliza; não cabe: começa pela primeira
  return Math.max(0, Math.min(max, alvo));
}

function pxDe(ex) { const m = Math.min(...ex.evs.map(e => e.d)); return Math.max(56, Math.ceil((ex.evs.some(e => tecs(e).some(t => TEC_TAB[t])) ? 40 : 30) / m)); }
/* tablatura: uma coluna por batida (mais larga quando as notas são curtas); PM em cima das notas abafadas, as técnicas
   ao lado da casa, linhas de compasso e, embaixo, o ritmo escrito (Documento Mestre, seção 9): haste para a semínima,
   uma barra para a colcheia, duas para a semicolcheia, três para a fusa; notas curtas do mesmo tempo ligadas pela
   barra; ponto nas pontuadas; "3" nas quiálteras; meia haste com bolinha aberta na mínima; pausas desenhadas. */
function ritmoTab(ex, PX, y0) {
  const [, cp] = ex.compasso || [4, 1], barras = d => d <= 1 / 8 + 1e-6 ? 3 : d <= 1 / 4 + 1e-6 ? 2 : d < 1 - 1e-6 ? 1 : 0;
  const base = d => { for (const b of [4, 2, 1, .5, .25, .125]) { if (Math.abs(d - b) < 1e-6) return [b, false, false]; if (Math.abs(d - b * 1.5) < 1e-6) return [b, true, false]; if (Math.abs(d - b * 2 / 3) < 1e-6) return [b, false, true]; } return [d, false, false]; };
  const X = [], hy = y0 + 22; let t = 0, s = '';
  ex.evs.forEach((e, i) => { X.push({ x: 40 + t * PX + 9, t, d: e.d, i, pausa: !e.n.length, b: base(e.d) }); t += e.d; });
  // grupos: notas curtas seguidas dentro do mesmo tempo
  const grupos = []; let g = [];
  X.forEach(n => { const curta = !n.pausa && n.b[0] < 1 - 1e-6, tempo = Math.floor(n.t / cp + 1e-6); if (curta && g.length && g[0].tempo === tempo) g.push({ ...n, tempo }); else { if (g.length) grupos.push(g); g = curta ? [{ ...n, tempo }] : []; if (!curta) grupos.push([n]); } });
  if (g.length) grupos.push(g);
  grupos.forEach(G => {
    G.forEach(n => {
      if (n.pausa) { const [b] = n.b, x = n.x;
        if (b >= 2) s += `<rect x="${x - 5}" y="${y0 + (b >= 4 ? 6 : 9)}" width="10" height="4" class="rt-p"/>`;
        else if (b >= 1) s += `<path d="M${x - 2} ${y0 + 2}l4 5-4 4 4 5" class="rt-pz"/>`;
        else s += `<circle cx="${x - 2}" cy="${y0 + 7}" r="2" class="rt-p"/><path d="M${x + 2} ${y0 + 5}l-3 13" class="rt-pz"/>${barras(b) > 1 ? `<circle cx="${x - 3}" cy="${y0 + 12}" r="2" class="rt-p"/>` : ''}`;
        return; }
      const [b, ponto] = n.b; if (b >= 4) return;
      s += `<line x1="${n.x}" y1="${b >= 2 ? hy - 9 : y0}" x2="${n.x}" y2="${hy}" class="rt-h"/>`;
      if (b >= 2) s += `<circle cx="${n.x}" cy="${hy - 12}" r="3" class="rt-a"/>`;
      if (ponto) s += `<circle cx="${n.x + 5}" cy="${hy - 3}" r="1.6" class="rt-p"/>`;
    });
    const notas = G.filter(n => !n.pausa && n.b[0] < 1 - 1e-6);
    if (!notas.length) return;
    if (notas.length === 1) { const n = notas[0]; for (let k = 0; k < barras(n.b[0]); k++) s += `<path d="M${n.x} ${hy - k * 4}l7 -5" class="rt-h"/>`; }
    else {
      const minB = Math.min(...notas.map(n => barras(n.b[0])));
      for (let k = 0; k < minB; k++) s += `<line x1="${notas[0].x}" y1="${hy - k * 4}" x2="${notas[notas.length - 1].x}" y2="${hy - k * 4}" class="rt-b"/>`;
      notas.forEach((n, j) => { for (let k = minB; k < barras(n.b[0]); k++) { const viz = notas[j + 1] || notas[j - 1], dx = viz === notas[j + 1] ? 6 : -6; s += `<line x1="${n.x}" y1="${hy - k * 4}" x2="${n.x + dx}" y2="${hy - k * 4}" class="rt-b"/>`; } });
    }
    if (notas.some(n => n.b[2])) s += `<text x="${(notas[0].x + notas[notas.length - 1].x) / 2}" y="${hy + 11}" text-anchor="middle" class="rt-3">3</text>`;
  });
  return s;
}
function tabSVG(ex) {
  const A = ex.afin, N = A.length, PX = pxDe(ex), [cn, cp] = ex.compasso || [4, 1], barra = cn * cp;
  const total = Math.ceil(ex.evs.reduce((s, e) => s + e.d, 0) / cp - 1e-6) * cp, L = 40 + total * PX + 30, y = c => 42 + (N - 1 - c) * 21, y0 = y(0) + 12, alto = y0 + 42;
  let s = `<svg class="tab" viewBox="0 0 ${L} ${alto}" width="${L}" height="${alto}" role="img" aria-label="Tablatura de ${esc(ex.nome)}, com o ritmo embaixo">`;
  A.forEach((m, c) => { s += `<text x="8" y="${y(c) + 4}" class="tab-r">${nomeCorda(m)}</text><line x1="24" y1="${y(c)}" x2="${L - 10}" y2="${y(c)}" class="tab-l"/>`; });
  for (let b = 0; b <= total + 1e-6; b += cp) { const forte = Math.abs(b / barra - Math.round(b / barra)) < 1e-6; s += `<line x1="${40 + b * PX}" y1="${y(N - 1) - 6}" x2="${40 + b * PX}" y2="${y(0) + 6}" class="tab-b${forte ? ' forte' : ''}"/>`; }
  let t = 0, pmIni = null;
  const fechaPM = x => { if (pmIni != null) { s += `<text x="${pmIni}" y="12" class="tab-pm">PM</text><line x1="${pmIni + 20}" y1="9" x2="${Math.max(pmIni + 22, x - 4)}" y2="9" class="tab-pml"/>`; pmIni = null; } };
  ex.evs.forEach((e, i) => {
    const x = 40 + t * PX + 5, T = tecs(e);
    if (T.includes('pm')) { if (pmIni == null) pmIni = x; } else fechaPM(x);
    if (e.n.length) {
      const ligados = T.some(k => ['h', 'p', 's'].includes(k)), par = e.n.length === 1 ? ligacaoTecnica(ex, i, e.n[0][0]) : null;
      const suf = T.filter(k => !(ligados && par && ['h', 'p', 's'].includes(k))).map(k => TEC_TAB[k] || '').join('');
      if (ligados && par) { const ant = ex.evs[i-1], x0 = x - ant.d * PX + 3, x1 = x + 3, yy = y(e.n[0][0]) - 12;
        s += T.includes('s') ? `<path d="M${x0 + 9} ${yy + (par.de < par.ate ? 4 : -4)}L${x1 - 5} ${yy + (par.de < par.ate ? -4 : 4)}" class="tab-art"/>` : `<path d="M${x0} ${yy}Q${(x0+x1)/2} ${yy-18} ${x1} ${yy}" class="tab-art"/><text x="${(x0+x1)/2}" y="${yy-12}" text-anchor="middle" class="tab-tec">${T.includes('h') ? 'H' : 'P'}</text>`; }
      s += `<g class="tab-n" data-i="${i}"><title>${esc(e.n.map(([c,k]) => `${N-c}ª corda, casa ${k}`).join('; '))}${T.length ? ': ' + esc(T.map(k => TEC_NOMES[k] || k).join(', ')) : ''}</title>` + e.n.map(([c, k]) => { const rot = T.includes('x') ? 'x' : T.includes('harm') ? `<${k}>` : k + suf; return `<rect x="${x - 2}" y="${y(c) - 8}" width="${String(rot).length * 7.4 + 6}" height="16" rx="4"/><text x="${x + 1}" y="${y(c) + 4.5}">${esc(String(rot))}</text>`; }).join('') + '</g>';
    }
    t += e.d;
  });
  fechaPM(40 + t * PX);
  s += `<g class="tab-ritmo" aria-hidden="true">${ritmoTab(ex, PX, y0)}</g>`;
  return s + `<line class="tab-cursor" x1="0" y1="2" x2="0" y2="${alto - 2}"/></svg>`;
}

// um evento: cada nota do acorde com um pequeno atraso (a palheta descendo)
function tocarEvento(e, A, quando, seg, vol, saida) {
  const T = tecs(e), dur = Math.max(.12, e.d * seg * .95);
  e.n.forEach(([c, k], j) => {
    const m = T.includes('harm') ? A[c] + (HARM[k] || 12) : A[c] + k;
    tocarCorda(m, quando + j * .012, dur, (e.n.length > 1 ? .32 : .45) * vol * (j ? .9 : 1), T, saida ? { saida } : {});
  });
}

/* o tocador: contagem de um compasso e depois o treino em voltas. A próxima volta é pedida (o.proxima) um pouco antes
   do fim da atual e agendada colada nela, então o tempo não quebra. Cada volta fecha em pulsos inteiros do compasso.
   Parar = desligar a saída por onde passa tudo o que foi agendado. */
const treino = { tocando: false, raf: 0, saida: null };
// volumes de cada parte, de 0 a 100 (Ajustes do treino › Volumes); o baixo e as cordas de fundo começam baixos
const MIX_PADRAO = { guitarra: 100, segunda: 80, baixo: 60, fundo: 40, bateria: 85 };
function treinoTocar(o) {
  const a = audio(); if (!a || treino.tocando) return false;
  const primeira = o.proxima(null); if (!primeira) return false;
  treino.tocando = true; treino.saida = a.createGain(); treino.saida.connect(somMestre(a));
  // volumes separados (Documento Mestre, seção 13): cada parte tem o seu ganho, ligado na saída do treino
  const mix = { ...MIX_PADRAO, ...(o.mix || {}) }, bus = Object.fromEntries(Object.keys(MIX_PADRAO).map(k => { const g = a.createGain(); g.gain.value = mix[k] / 100; g.connect(treino.saida); return [k, g]; }));
  treino.bus = bus;
  const rodadas = [];
  const agendar = (r, ini) => {
    const seg = 60 / r.bpm, [cn, cp] = r.ex.compasso || [4, 1]; let t = 0;
    r.ex.evs.forEach(e => {
      if (e.n.length && o.guia) tocarEvento(e, r.ex.afin, ini + t * seg, seg, 1, bus.guitarra);
      if (e.n.length && mix.baixo > 0 && r.ex.modelo && r.ex.modelo.ehRiff && !r.ex.modelo.melodia && !tecs(e).includes('x') && !tecs(e).includes('harm')) tocarBaixo(Math.min(...e.n.map(([c, k]) => r.ex.afin[c] + k)) - 12, ini + t * seg, Math.max(.12, e.d * seg * (tecs(e).includes('pm') ? .5 : .95)), .8, bus.baixo);
      if (o.harmonia && e.n.length === 1 && !tecs(e).some(x => x === 'x' || x === 'harm')) { const [c, k] = e.n[0]; tocarCorda(harmonizar(r.ex.afin[c] + k, r.ex, o.harmonia), ini + t * seg + .004, Math.max(.12, e.d * seg * .95), .3, tecs(e), { saida: bus.segunda }); }
      t += e.d;
    });
    const pulsos = Math.max(1, Math.ceil(t / cp - 1e-6)), batidas = pulsos * cp;
    if (o.bateria) tocarBateriaNoTreino(a, o.bateria, ini, seg, batidas, [cn, cp], bus.bateria);
    else if (o.metronomo !== false) for (let p = 0; p < pulsos; p++) clique(p % cn === 0, ini + p * cp * seg, bus.bateria);
    // escalas e solos: o baixo marca a tônica no começo de cada compasso e as cordas seguram o acorde da tônica
    if (r.ex.raiz != null && !(r.ex.modelo && r.ex.modelo.ehRiff && !r.ex.modelo.melodia)) {
      const bl = cn * cp, menor = r.ex.escala && (ESCALAS.find(x => x[0] === r.ex.escala) || [, , [0, 3, 7]])[2].includes(3), raiz = 36 + pc(r.ex.raiz - 36);
      for (let b = 0; b < batidas - 1e-6; b += bl) {
        if (mix.baixo > 0) tocarBaixo(raiz, ini + b * seg, Math.min(bl, batidas - b) * seg * .95, .75, bus.baixo);
        if (mix.fundo > 0) tocarFundo([raiz + 12, raiz + 12 + (menor ? 3 : 4), raiz + 19], ini + b * seg, Math.min(bl, batidas - b) * seg, .9, bus.fundo);
      }
    }
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
function tocarBateriaNoTreino(a, estilo, ini, seg, batidas, [cn, cp], destino) {
  const dest = destino || treino.saida || somMestre(a);
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

/* ================= gravação no treino =================
   Só quando a pessoa liga "Gravar", com permissão: MediaRecorder em memória. O áudio fica neste aparelho, é apagado ao
   fechar a janela do treino e nunca é enviado nem avaliado (Documento Mestre, seção 7: nada de nota automática pelo
   áudio; a pessoa ouve a gravação junto com o exemplo e julga). */
const mic = { fluxo: null, gravador: null, pedacos: [], url: null };
async function micLigar() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) return 'sem';
  try { mic.fluxo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); } catch { return 'negado'; }
  mic.pedacos = []; mic.gravador = new MediaRecorder(mic.fluxo); mic.gravador.ondataavailable = e => { if (e.data.size) mic.pedacos.push(e.data); }; mic.gravador.start();
  return 'ok';
}
function micDesligar() {
  return new Promise(res => {
    const fim = () => { if (mic.fluxo) mic.fluxo.getTracks().forEach(t => t.stop()); mic.fluxo = null; res(); };
    if (mic.gravador && mic.gravador.state !== 'inactive') { mic.gravador.onstop = () => { if (mic.url) URL.revokeObjectURL(mic.url); mic.url = mic.pedacos.length ? URL.createObjectURL(new Blob(mic.pedacos, { type: mic.gravador.mimeType || 'audio/webm' })) : null; mic.gravador = null; fim(); }; mic.gravador.stop(); }
    else fim();
  });
}
function micApagarGravacao() { if (mic.url) URL.revokeObjectURL(mic.url); mic.url = null; mic.pedacos = []; }

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
// as peças da bateria: bumbo, caixa e chimbal gravados (som.js)
const PECAS_BATERIA = { b: 'bumbo', c: 'caixa', h: 'chimbal' };
function peca(a, tipo, q, dest) { somPeca(a, PECAS_BATERIA[tipo] || tipo, q, dest); }
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

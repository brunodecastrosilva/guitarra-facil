/* Guitarra Fácil · catálogo de treinos: níveis, tamanhos, categorias, as posições do braço e as escalas, sequências e
   arpejos. Os riffs, solos e treinos de técnica por estilo vêm de metal.js. Cada nível tem treinos só dele: a
   dificuldade está na complexidade (técnicas, ritmo, mistura), não no andamento. O tamanho é o tamanho da linha. */
'use strict';
const NIVEIS = [
  [1, 'iniciante', 'Iniciante', 'Uma técnica por vez, colcheias e semínimas, power chords e palm mute.'],
  [2, 'intermediario', 'Intermediário', 'Semicolcheias, galopes, síncopes, ligados, pinch e três notas por corda.'],
  [3, 'avancado', 'Avançado', 'Várias técnicas juntas, varredura, tapping, quiálteras, compassos ímpares e polirritmia.'],
];
// tamanho: [id, nome, compassos, explicação] — o tamanho da linha, não o tempo de prática (decisão do Bruno, 02/11/2026)
const TAMANHOS = [
  ['curto', 'Curto', 1, '1 compasso: uma ideia.'],
  ['moderado', 'Moderado', 4, '2 a 4 compassos: a frase e uma variação.'],
  ['longo', 'Longo', 8, '8 compassos: partes A e B.'],
  ['muito-longo', 'Muito longo', 16, '16 compassos ou mais: riff, variação, virada e solo.'],
];
const CATEGORIAS = [
  ['riffs', 'Riffs', 'Palm mute, power chords, galopes, breakdowns.'],
  ['solos', 'Solos e licks', 'Frases para solar, das simples às insanas.'],
  ['tecnica', 'Técnica', 'Cada técnica levada ao extremo.'],
  ['escalas', 'Escalas e arpejos', 'Escalas, sequências e arpejos no braço todo.'],
];
const FIGURAS_TREINO = [[1, 'Semínimas', 'uma nota por batida'], [.5, 'Colcheias', 'duas notas por batida'], [1 / 3, 'Tercinas', 'três notas por batida'], [.25, 'Semicolcheias', 'quatro notas por batida'], [1 / 6, 'Sextinas', 'seis notas por batida']];
const ANDAMENTO = { 1: [70, 110], 2: [70, 120], 3: [70, 130] }; // a dificuldade não sobe pelo andamento
const cicloQuartas = r => Array.from({ length: 12 }, (_, i) => pc(r + 5 * i));
const nomeEscala = id => (ESCALAS.find(e => e[0] === id) || ESCALAS[0])[1];
const nomeTipo = t => (TIPOS_ACORDE.find(x => x[0] === t) || TIPOS_ACORDE[0])[1];
const ESCALAS_SEQ = ESCALAS.filter(e => e[0] !== 'cromatica').map(e => e[0]);
const ev = (d, n, t = '') => ({ d, n, t });
const evDeTuplas = tu => tu.map(([s, k, d, f, t]) => ev(d, [[s, k, f]], t || ''));
// dedos: a mão anda com as notas (quando uma nota sai do alcance de quatro casas, a mão vai junto)
function dedosEventos(evs) {
  let base = null;
  return evs.map(e => {
    if (e.n.length !== 1 || e.n[0][2] != null) return e;
    const [s, k] = e.n[0]; if (k === 0) return { ...e, n: [[s, k, 0]] };
    if (base == null || k < base) base = k; else if (k > base + 3) base = k - 3;
    return { ...e, n: [[s, k, Math.min(4, k - base + 1)]] };
  });
}

/* ================= o braço: posições e digitação ================= */
// dedos por corda: casa mais baixa da posição = dedo 1; se a corda pedir abertura maior, a própria corda decide
function dedilhar(notas) {
  const pres = notas.filter(n => n[1] > 0).map(n => n[1]), base = pres.length ? Math.min(...pres) : 1;
  const porCorda = {};
  notas.forEach(n => { if (n[1] > 0) (porCorda[n[0]] = porCorda[n[0]] || []).push(n[1]); });
  return notas.map(n => {
    const [s, k] = n; if (k === 0) return 0;
    const cs = porCorda[s], d = k - base + 1;
    if (d <= 4 && Math.max(...cs) - base + 1 <= 4) return Math.max(1, d);
    const lo = Math.min(...cs), hi = Math.max(...cs);
    if (k === lo) return 1; if (k === hi && hi - lo >= 3) return 4;
    return Math.max(1, Math.min(4, k - lo + 1));
  });
}
const cacheP = new Map();
// posições de uma escala num tom: 2 notas por corda (pentatônicas), 3 por corda (7 notas) ou caixa de 5 casas.
// Cada posição começa num grau da escala na 6ª corda; a primeira tem a tônica. Devolve as notas subindo: [corda, casa].
function posicoesEscala(id, raiz, sistema = 'nps') {
  const ch = `e${id}|${raiz}|${sistema}`; if (cacheP.has(ch)) return cacheP.get(ch);
  const iv = (ESCALAS.find(e => e[0] === id) || ESCALAS[0])[2], graus = iv.map(i => pc(raiz + i)), naEscala = m => graus.includes(pc(m));
  const nps = sistema === 'caixa' ? 0 : iv.length === 5 ? 2 : iv.length === 7 ? 3 : 0;
  const res = graus.map(g => {
    const k0 = pc(g - 4); let sobe = [];
    // começando muito perto da pestana, a corda seguinte cairia abaixo da corda solta: a posição sobe uma oitava
    if (nps) for (const k of [k0, k0 + 12]) { sobe = []; let m = 40 + k; for (let s = 0; s < 6; s++) for (let j = 0; j < nps; j++) { if (s || j) { m++; while (!naEscala(m)) m++; } sobe.push([s, m - MIDI_SOLTAS[s]]); } if (sobe.every(n => n[1] >= 0)) break; }
    else { let ult = -1; for (let s = 0; s < 6; s++) for (let k = k0; k <= k0 + 4; k++) { const m = MIDI_SOLTAS[s] + k; if (naEscala(m) && m > ult) { sobe.push([s, k]); ult = m; } } }
    return sobe;
  });
  cacheP.set(ch, res); return res;
}
// posições de um acorde: uma caixa de 5 casas a partir de cada nota do acorde na 6ª corda
function posicoesAcorde(tipo, raiz) {
  const ch = `a${tipo}|${raiz}`; if (cacheP.has(ch)) return cacheP.get(ch);
  const pcs = notasAcorde(raiz, tipo), res = pcs.map(g => { const k0 = pc(g - 4), sobe = []; let ult = -1; for (let s = 0; s < 6; s++) for (let k = k0; k <= k0 + 4; k++) { const m = MIDI_SOLTAS[s] + k; if (pcs.includes(pc(m)) && m > ult) { sobe.push([s, k]); ult = m; } } return sobe; });
  cacheP.set(ch, res); return res;
}
const casaMin = notas => { const p = notas.filter(n => n[1] > 0).map(n => n[1]); return p.length ? Math.min(...p) : 0; };
const rotuloPos = (i, notas) => `Posição ${i + 1} · casa ${notas.some(n => n[1] === 0) ? 0 : casaMin(notas)}`;
// regiões de frase (licks, riffs, campo harmônico): a tônica na 6ª ou na 5ª corda, embaixo e em cima no braço
function regioesFrase(raiz, grave) {
  const t6 = pc(raiz - 4), t5 = pc(raiz - 9), R = [[0, t6], [1, t5]];
  if (!grave) { if (t6 + 12 <= 15) R.push([0, t6 + 12]); if (t5 + 12 <= 15) R.push([1, t5 + 12]); }
  return R.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}
// coloca alturas (MIDI) no braço perto da casa f: dentro da mão quando dá, trocando pouco de corda
function digitar(midis, f, grave) {
  const lo = Math.max(0, f - 1), hi = f + 3; let ant = null; // um dedo por casa, com uma casa de folga para trás
  return midis.map(m => {
    let melhor = null, nota = 1e9;
    for (let s = 0; s < 6; s++) {
      const k = m - MIDI_SOLTAS[s]; if (k < 0 || k > 22) continue;
      const v = (k < lo ? (lo - k) * 3 : k > hi ? (k - hi) * 3 : 0) + (ant == null ? 0 : Math.abs(s - ant) * .6) + (k === 0 && f > 2 ? 2 : 0) + (grave ? s * .4 : 0);
      if (v < nota) { nota = v; melhor = [s, k]; }
    }
    ant = melhor[0]; return melhor;
  });
}
const sobeDesce = n => [...n, ...n.slice(0, -1).reverse()];
const montarNotas = (pos, fig, tecs) => { const d = dedilhar(pos); return pos.map((p, i) => [p[0], p[1], Array.isArray(fig) ? fig[i] : fig, d[i], tecs ? tecs[i] : undefined]); };

/* ================= sequências: padrões sobre os índices de uma posição ================= */
const PADROES = {
  grupos3: ['Grupos de 3', n => { const r = []; for (let i = 0; i + 2 < n; i++) r.push(i, i + 1, i + 2); return r; }],
  grupos4: ['Grupos de 4', n => { const r = []; for (let i = 0; i + 3 < n; i++) r.push(i, i + 1, i + 2, i + 3); return r; }],
  grupos5: ['Grupos de 5', n => { const r = []; for (let i = 0; i + 4 < n; i++) r.push(i, i + 1, i + 2, i + 3, i + 4); return r; }],
  grupos6: ['Grupos de 6', n => { const r = []; for (let i = 0; i + 5 < n; i++) r.push(i, i + 1, i + 2, i + 3, i + 4, i + 5); return r; }],
  quatroDesce: ['Grupos de 4 invertidos', n => { const r = []; for (let i = 0; i + 3 < n; i++) r.push(i + 3, i + 2, i + 1, i); return r; }],
  tercas: ['Terças', n => { const r = []; for (let i = 0; i + 2 < n; i++) r.push(i, i + 2); return r; }],
  quartas: ['Quartas', n => { const r = []; for (let i = 0; i + 3 < n; i++) r.push(i, i + 3); return r; }],
  sextas: ['Sextas', n => { const r = []; for (let i = 0; i + 5 < n; i++) r.push(i, i + 5); return r; }],
  pedal: ['Pedal na tônica', n => { const r = []; for (let i = 1; i < n; i++) r.push(0, i); return r; }],
};
// o padrão sobe na posição e desce espelhado (mesmo padrão sobre a posição de trás para frente)
function aplicarPadrao(pos, id) {
  const f = PADROES[id][1], n = pos.length, sobe = f(n).map(i => pos[i]), desce = f(n).map(i => pos[n - 1 - i]);
  return [...sobe, ...desce];
}


/* ================= escalas, sequências e arpejos =================
   O tamanho muda o treino: curto = uma oitava; moderado = a posição; longo = duas posições ligadas;
   muito longo = quatro posições, atravessando o braço. */
const MODELOS = [];
const add = m => { const [b, a] = ANDAMENTO[m.nivel]; MODELOS.push({ usaTom: true, manterAltura: true, bpm: b, alvo: a, rotulo: 'nota', ...m }); };
const umaOitava = p => { const A = afinacaoDe('padrao')[2], ini = A[p[0][0]] + p[0][1]; const r = []; for (const n of p) { r.push(n); if (A[n[0]] + n[1] >= ini + 12) break; } return r; };
function percorrer(P, pos, tam, f) {
  const L = P.length, q = i => P[(pos + i) % L];
  if (tam === 'curto') return f(umaOitava(q(0)), 'sobe');
  if (tam === 'moderado') return [...f(q(0), 'sobe'), ...f(q(0), 'desce')];
  const n = tam === 'longo' ? 2 : 4; let r = [];
  for (let i = 0; i < n; i++) r = r.concat(f(q(i), i % 2 ? 'desce' : 'sobe'));
  return r;
}
const sentido = (p, d) => d === 'desce' ? p.slice().reverse() : p;
const ESCALAS_MOD = [['penta-menor', 1, 'nps', .5], ['blues', 1, 'caixa', .5], ['menor', 1, 'caixa', .5], ['frigio', 1, 'caixa', .5],
  ['menor', 2, 'nps', .25, 'Menor em 3 notas por corda'], ['menor-harmonica', 2, 'nps', .25], ['frigio', 2, 'nps', .25, 'Frígio em 3 notas por corda'], ['dorico', 2, 'nps', .25], ['mixolidio', 2, 'nps', .25],
  ['frigio-dominante', 3, 'nps', 1 / 6], ['locrio', 3, 'nps', 1 / 6], ['hungara-menor', 3, 'nps', 1 / 6], ['diminuta', 3, 'caixa', 1 / 6], ['menor-melodica', 3, 'nps', 1 / 6], ['alterada', 3, 'nps', 1 / 6], ['tons-inteiros', 3, 'caixa', 1 / 6]];
ESCALAS_MOD.forEach(([e, nivel, sis, fig, nome]) => add({ id: `esc:${e}:${nivel}`, cat: 'escalas', grupo: 'Escala', nivel, fig, escala: e, nome: nome || nomeEscala(e),
  resumo: sis === 'nps' ? 'Notas por corda iguais, posição por posição.' : 'Posição por posição, na mão.',
  regioes: c => posicoesEscala(e, c.raiz, sis).map((p, i) => rotuloPos(i, p)),
  gerar: c => ({ evs: evDeTuplas(montarNotas(percorrer(posicoesEscala(e, c.raiz, sis), c.pos, c.tam, (p, d) => sentido(p, d)), c.fig)) }) }));
[['grupos3', 'penta-menor', 'nps', 1, .5], ['tercas', 'menor', 'caixa', 1, .5], ['pedal', 'penta-menor', 'nps', 1, .5],
  ['grupos4', 'menor', 'nps', 2, .25], ['grupos3', 'menor-harmonica', 'nps', 2, 1 / 3], ['quartas', 'penta-menor', 'nps', 2, .25], ['quatroDesce', 'frigio', 'nps', 2, .25],
  ['grupos6', 'menor-harmonica', 'nps', 3, 1 / 6], ['grupos5', 'frigio-dominante', 'nps', 3, .25], ['sextas', 'menor', 'nps', 3, .25], ['pedal', 'menor-harmonica', 'nps', 3, 1 / 6], ['tercas', 'diminuta', 'caixa', 3, 1 / 6]]
  .forEach(([pd, e, sis, nivel, fig]) => add({ id: `seq:${pd}:${e}:${nivel}`, cat: 'escalas', grupo: 'Sequência', nivel, fig, escala: e, trocaEscala: true, nome: `${PADROES[pd][0]} · ${nomeEscala(e)}`, resumo: 'A escala em sequência.',
    regioes: c => posicoesEscala(c.escala || e, c.raiz, sis).map((p, i) => rotuloPos(i, p)),
    gerar: c => { const f = PADROES[pd][1]; return { evs: evDeTuplas(montarNotas(percorrer(posicoesEscala(c.escala || e, c.raiz, sis), c.pos, c.tam, (p, d) => f(p.length).map(i => sentido(p, d)[i])), c.fig)) }; } }));
[['5', 1, .5, 'Arpejo de power chord'], ['m', 1, .5, 'Arpejo menor'], ['', 1, .5, 'Arpejo maior'],
  ['m7', 2, .25, 'Arpejo m7'], ['°', 2, 1 / 3, 'Arpejo diminuto'], ['7', 2, .25, 'Arpejo dominante'], ['+', 2, 1 / 3, 'Arpejo aumentado'],
  ['°7', 3, 1 / 6, 'Arpejo °7'], ['m7(b5)', 3, 1 / 6, 'Arpejo meio diminuto'], ['m(7M)', 3, 1 / 6, 'Arpejo menor com 7M']]
  .forEach(([t, nivel, fig, nome]) => add({ id: `arp:${t || 'M'}:${nivel}`, cat: 'escalas', grupo: 'Arpejo', nivel, fig, nome, resumo: 'O acorde nota por nota, nas formas do braço.',
    regioes: c => posicoesAcorde(t, c.raiz).map((p, i) => rotuloPos(i, p)),
    gerar: c => ({ evs: evDeTuplas(montarNotas(percorrer(posicoesAcorde(t, c.raiz), c.pos, c.tam, (p, d) => sentido(p, d)), c.fig)) }) }));

const modelo = id => MODELOS.find(m => m.id === id);
const cfgPadrao = m => ({ raiz: m.raizPadrao != null ? m.raizPadrao : 9, pos: 0, fig: m.fig, escala: m.escala, tam: m.tamanho || 'moderado', afin: null });
/* uma volta do treino: as notas na afinação escolhida, com os dedos, o compasso e o nome */
function volta(m, c) {
  const c0 = { ...cfgPadrao(m), ...c }, R = m.regioes(c0), cc = { ...c0, pos: Math.min(c0.pos || 0, Math.max(0, R.length - 1)) };
  if (m.tamanho) cc.tam = m.tamanho;
  const g = m.gerar(cc), base = g.afin || m.afin || 'padrao', A0 = afinacaoDe(base)[2];
  const afId = cc.afin && afinacoesPara(base).some(a => a[0] === cc.afin) ? cc.afin : base, A = afinacaoDe(afId)[2];
  const desloc = m.manterAltura || A.length !== A0.length ? 0 : A[0] - A0[0];
  const evs = dedosEventos(m.manterAltura ? converterAltura(g.evs, base, afId) : converterAfinacao(g.evs, base, afId));
  const raiz = g.raiz != null ? pc(g.raiz + desloc) : (m.usaTom ? cc.raiz : pc(A[0]));
  const esc = m.trocaEscala && cc.escala ? nomeEscala(cc.escala) : null, tom = m.usaTom ? NOTAS[raiz] : `${NOTAS[raiz]}`;
  return { id: m.id, modelo: m, cfg: cc, nome: typeof tituloDe === 'function' ? tituloDe(m) : m.nome, sub: [esc, `${tom} · ${afinacaoDe(afId)[1]}`, R.length > 1 ? R[cc.pos] : null].filter(Boolean).join(' · '),
    evs, afin: A, afinId: afId, compasso: g.compasso || [4, 1], raiz, escala: g.escala || cc.escala || m.escala || null, rotulo: c.rotulo || m.rotulo || 'nota', partes: g.partes || null, bpm: g.bpm || m.bpm, alvo: m.alvo };
}
// leva as notas para outra afinação sem mudar a altura (escalas e solos: o tom fica o escolhido)
function converterAltura(evs, de, para) {
  if (de === para) return evs;
  const A = afinacaoDe(de)[2], B = afinacaoDe(para)[2], d = B.length - A.length;
  return evs.map(e => ({ ...e, n: e.n.map(([s, k, f]) => {
    const m = A[s] + k, s2 = Math.min(B.length - 1, s + Math.max(0, d)), k2 = m - B[s2];
    if (k2 >= 0 && k2 <= 24) return [s2, k2, f];
    let melhor = null, dist = 1e9; B.forEach((o, c) => { const kk = m - o; if (kk >= 0 && kk <= 24 && Math.abs(c - s2) < dist) { dist = Math.abs(c - s2); melhor = [c, kk, f]; } });
    return melhor || [s2, Math.max(0, k2), f];
  }) }));
}

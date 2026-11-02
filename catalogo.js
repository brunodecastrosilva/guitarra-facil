/* Guitarra Fácil · catálogo de treinos.
   Cada treino é um modelo que se transpõe para os 12 tons e para as posições do braço: escalas, sequências, arpejos,
   licks, riffs e técnica, em três níveis. A duração (curto, moderado, longo, muito longo) é o tempo da sessão: quanto
   mais longa, mais posições e tons o treino percorre. Licks e riffs são originais do app. */
'use strict';
const NIVEIS = [
  [1, 'iniciante', 'Iniciante', 'Posições do começo do braço, notas mais longas e andamento calmo.'],
  [2, 'intermediario', 'Intermediário', 'Todo o braço, colcheias e tercinas, modos e acordes com sétima.'],
  [3, 'avancado', 'Avançado', 'Semicolcheias, sequências longas, varredura e escalas menos comuns.'],
];
const DURACOES = [
  ['curto', 'Curto', 2, 'Um tom, uma posição.'],
  ['moderado', 'Moderado', 5, 'Todas as posições, num tom.'],
  ['longo', 'Longo', 10, 'Todo o braço, em quatro tons.'],
  ['muito-longo', 'Muito longo', 20, 'Todo o braço, nos 12 tons.'],
];
const CATEGORIAS = [
  ['escalas', 'Escalas', 'Subir e descer cada escala, posição por posição.'],
  ['sequencias', 'Sequências', 'A escala em grupos, terças, quartas e sextas.'],
  ['arpejos', 'Arpejos', 'Os acordes nota por nota, em todo o braço.'],
  ['licks', 'Licks', 'Frases curtas e longas para solar.'],
  ['riffs', 'Riffs', 'Linhas no grave, do rock ao metal.'],
  ['tecnica', 'Técnica', 'Dedos, palhetada e ligados.'],
];
// figura: [duração, nome, explicação]
const FIGURAS_TREINO = [[1, 'Semínimas', 'uma nota por batida'], [.5, 'Colcheias', 'duas notas por batida'], [1 / 3, 'Tercinas', 'três notas por batida'], [.25, 'Semicolcheias', 'quatro notas por batida']];
const ANDAMENTO = { 1: [60, 90], 2: [70, 120], 3: [80, 140] }; // nível: andamento inicial e meta
const TECNICAS = { b: 'bend de um tom', h: 'ligado para cima', p: 'ligado para baixo', s: 'slide', v: 'vibrato' };
const cicloQuartas = r => Array.from({ length: 12 }, (_, i) => pc(r + 5 * i));
const nomeEscala = id => (ESCALAS.find(e => e[0] === id) || ESCALAS[0])[1];
const nomeTipo = t => (TIPOS_ACORDE.find(x => x[0] === t) || TIPOS_ACORDE[0])[1];
const ESCALAS_SEQ = ESCALAS.filter(e => e[0] !== 'cromatica').map(e => e[0]);

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

/* ================= licks (originais do app) =================
   [id, nível, nome, escala, notas]: nota = [semitons acima da tônica grave, duração em batidas, técnica] */
const LICKS = [
  ['i1', 1, 'Primeira frase', 'penta-menor', [[15, 1], [17, 1], [19, 1], [17, 1], [15, 1], [12, 2]]],
  ['i2', 1, 'Descida da pentatônica', 'penta-menor', [[24, 1], [22, 1], [19, 1], [17, 1], [15, 1], [12, 2]]],
  ['i3', 1, 'Resposta no grave', 'penta-menor', [[3, 1], [5, 1], [7, 1], [5, 1], [3, 1], [0, 2]]],
  ['i4', 1, 'Blues de três notas', 'blues', [[12, 1], [15, 1], [17, .5], [18, .5], [17, 1], [15, 1], [12, 2]]],
  ['i5', 1, 'Pentatônica alegre', 'penta-maior', [[12, 1], [14, 1], [16, 1], [19, 1], [16, 1], [14, 1], [12, 2]]],
  ['i6', 1, 'Subida da escala maior', 'maior', [[12, .5], [14, .5], [16, .5], [17, .5], [19, 1], [17, .5], [16, .5], [14, 1], [12, 1]]],
  ['i7', 1, 'Vai e volta', 'penta-menor', [[12, 1], [15, 1], [12, 1], [17, 1], [12, 1], [19, 1], [17, 1], [15, 1]]],
  ['i8', 1, 'Frase do rock', 'penta-menor', [[17, 1], [19, .5], [17, .5], [15, 1], [12, 1], [10, 1], [12, 2]]],
  ['i9', 1, 'Nota longa com vibrato', 'penta-menor', [[19, 1], [17, 1], [15, 1], [17, 3, 'v']]],
  ['i10', 1, 'Melodia em terças', 'maior', [[12, 1], [16, 1], [14, 1], [17, 1], [16, 1], [19, 1], [24, 2]]],
  ['i11', 1, 'Blues no grave', 'blues', [[0, 1], [3, 1], [5, 1], [6, 1], [7, 1], [10, 1], [12, 2]]],
  ['i12', 1, 'Menor tranquila', 'menor', [[12, 1], [14, 1], [15, 1], [17, 1], [19, 1], [15, 1], [14, 1], [12, 1]]],
  ['m1', 2, 'Bend na pentatônica', 'penta-menor', [[22, 1, 'b'], [22, .5], [19, .5], [17, 1], [19, .5], [17, .5], [15, 1], [12, 1]]],
  ['m2', 2, 'Ligados na pentatônica', 'penta-menor', [[12, .5], [15, .5, 'h'], [17, .5], [15, .5, 'p'], [12, .5], [10, .5], [12, 2, 'v']]],
  ['m3', 2, 'Dórico de funk', 'dorico', [[12, .5], [14, .5], [15, .5], [17, .5], [19, .5], [21, .5], [19, .5], [17, .5], [15, 1], [12, 1]]],
  ['m4', 2, 'Mixolídio do rock', 'mixolidio', [[12, .5], [16, .5], [19, .5], [22, .5], [24, 1], [22, .5], [19, .5], [16, 1], [14, .5], [12, .5]]],
  ['m5', 2, 'Subida harmônica', 'menor-harmonica', [[12, .5], [14, .5], [15, .5], [17, .5], [19, .5], [20, .5], [23, .5], [24, .5], [23, 1], [19, 1]]],
  ['m6', 2, 'Tercinas descendo', 'penta-menor', [[24, 1 / 3], [22, 1 / 3], [19, 1 / 3], [22, 1 / 3], [19, 1 / 3], [17, 1 / 3], [19, 1 / 3], [17, 1 / 3], [15, 1 / 3], [17, 1 / 3], [15, 1 / 3], [12, 1 / 3], [12, 2]]],
  ['m7', 2, 'Blue note com slide', 'blues', [[15, .5], [17, .5], [18, .5], [17, .5], [15, .5], [12, .5], [10, .5], [12, .5, 's'], [15, 1, 'b'], [12, 1]]],
  ['m8', 2, 'Pentatônica country', 'penta-maior', [[12, .5], [14, .5, 'h'], [16, .5], [19, .5], [21, .5], [19, .5], [16, .5], [14, .5], [12, 2]]],
  ['m9', 2, 'Lídio luminoso', 'lidio', [[12, .5], [16, .5], [18, .5], [19, .5], [23, 1], [19, .5], [18, .5], [16, 1], [12, 1]]],
  ['m10', 2, 'Arpejo e escala', 'maior', [[12, .5], [16, .5], [19, .5], [24, .5], [23, .5], [21, .5], [19, .5], [17, .5], [16, 2]]],
  ['m11', 2, 'Frígio pesado', 'frigio', [[0, .5], [1, .5], [0, .5], [3, .5], [0, .5], [1, .5], [5, .5], [3, .5], [1, 1], [0, 1]]],
  ['m12', 2, 'Slide entre desenhos', 'penta-menor', [[12, .5], [15, .5], [17, .5, 's'], [19, .5], [22, .5], [24, .5], [22, 1, 'b'], [19, 1]]],
  ['a1', 3, 'Descida em semicolcheias', 'penta-menor', [[24, .25], [22, .25], [19, .25], [22, .25], [19, .25], [17, .25], [19, .25], [17, .25], [15, .25], [17, .25], [15, .25], [12, .25], [15, .25], [12, .25], [10, .25], [12, .25], [12, 2, 'v']]],
  ['a2', 3, 'Legato dórico', 'dorico', [[12, .25], [14, .25, 'h'], [15, .25, 'h'], [14, .25, 'p'], [12, .25, 'p'], [14, .25, 'h'], [15, .25, 'h'], [17, .25], [19, .25], [21, .25, 'h'], [22, .25, 'h'], [21, .25, 'p'], [19, .25, 'p'], [17, .25], [15, .5], [12, 1]]],
  ['a3', 3, 'Pedal neoclássico', 'menor-harmonica', [[24, .25], [23, .25], [24, .25], [20, .25], [24, .25], [19, .25], [24, .25], [17, .25], [23, .25], [24, .25], [23, .25], [19, .25], [23, .25], [17, .25], [23, .25], [15, .25], [12, 1]]],
  ['a4', 3, 'Arpejo menor com sétima', 'menor', [[12, .25], [15, .25], [19, .25], [22, .25], [24, .25], [27, .25], [31, .25], [34, .25], [36, 1], [34, .25], [31, .25], [27, .25], [24, .25], [22, 1]]],
  ['a5', 3, 'Tensão alterada', 'alterada', [[24, .25], [22, .25], [20, .25], [18, .25], [16, .25], [15, .25], [13, .25], [12, .25], [10, 1]]],
  ['a6', 3, 'Diminuta simétrica', 'diminuta', [[12, .25], [14, .25], [15, .25], [17, .25], [15, .25], [17, .25], [18, .25], [20, .25], [18, .25], [20, .25], [21, .25], [23, .25], [24, 1]]],
  ['a7', 3, 'Tons inteiros em tercinas', 'tons-inteiros', [[12, 1 / 3], [14, 1 / 3], [16, 1 / 3], [18, 1 / 3], [20, 1 / 3], [22, 1 / 3], [24, 1 / 3], [22, 1 / 3], [20, 1 / 3], [18, 1 / 3], [16, 1 / 3], [14, 1 / 3], [12, 2]]],
  ['a8', 3, 'Três bends', 'penta-menor', [[24, .5, 'b'], [24, .5], [22, .5], [19, .5], [22, .5, 'b'], [22, .5], [19, .5], [17, .5], [19, .5, 'b'], [19, .5], [17, .5], [15, .5], [12, 2, 'v']]],
  ['a9', 3, 'Linha bebop', 'bebop-dominante', [[24, .25], [23, .25], [22, .25], [21, .25], [19, .25], [17, .25], [16, .25], [14, .25], [12, .25], [16, .25], [19, .25], [22, .25], [21, 1]]],
  ['a10', 3, 'Frígio dominante', 'frigio-dominante', [[12, .25], [13, .25], [16, .25], [17, .25], [19, .25], [20, .25], [22, .25], [24, .25], [25, .25], [24, .25], [22, .25], [20, .25], [19, .25], [17, .25], [16, .25], [13, .25], [12, 1]]],
  ['a11', 3, 'Quartas na pentatônica', 'penta-menor', [[12, .25], [17, .25], [15, .25], [19, .25], [17, .25], [22, .25], [19, .25], [24, .25], [22, .25], [27, .25], [24, .25], [29, .25], [27, .5], [24, 1]]],
  ['a12', 3, 'Menor melódica', 'menor-melodica', [[12, .25], [14, .25], [15, .25], [17, .25], [19, .25], [21, .25], [23, .25], [24, .25], [26, .25], [24, .25], [23, .25], [21, .25], [19, .5], [15, .5], [12, 1]]],
];
/* riffs (originais do app): semitons acima da tônica no grave */
const RIFFS = [
  ['estrada', 1, 'Estrada', [[0, .5], [0, .5], [3, .5], [5, .5], [0, .5], [0, .5], [7, .5], [5, .5], [0, .5], [0, .5], [3, .5], [5, .5], [3, 1], [0, 1]]],
  ['duas', 1, 'Duas notas', [[0, .5], [0, .5], [3, .5], [0, .5], [5, .5], [3, .5], [0, 1]]],
  ['boogie', 1, 'Linha de boogie', [[0, .5], [4, .5], [7, .5], [9, .5], [10, .5], [9, .5], [7, .5], [4, .5]]],
  ['menor-desce', 1, 'Menor descendo', [[12, .5], [10, .5], [7, .5], [5, .5], [3, .5], [0, .5], [3, 1]]],
  ['marcha', 1, 'Marcha no grave', [[0, 1], [0, 1], [7, 1], [5, 1], [3, 1], [3, 1], [5, 1], [0, 1]]],
  ['pergunta', 1, 'Pergunta e resposta', [[0, .5], [3, .5], [5, 1], [0, .5], [3, .5], [6, .5], [5, .5], [0, 2]]],
  ['galope', 2, 'Galope', [[0, .5], [0, .25], [0, .25], [3, .5], [0, .5], [5, .5], [3, .5], [0, 1], [0, .5], [0, .25], [0, .25], [3, .5], [5, .5], [7, .5], [5, .5], [3, 1]]],
  ['funk-corda', 2, 'Funk de uma corda', [[0, .25], [0, .25], [12, .25], [0, .25], [10, .25], [0, .25], [7, .25], [10, .25], [0, .25], [0, .25], [12, .25], [0, .25], [10, .5], [7, .5]]],
  ['penta-grave', 2, 'Pentatônica no grave', [[0, .5], [3, .5], [5, .5], [3, .5], [6, .5], [5, .5], [3, .5], [0, .5]]],
  ['hard', 2, 'Hard rock com corda solta', [[0, .25], [0, .25], [7, .5], [0, .25], [0, .25], [8, .5], [0, .25], [0, .25], [7, .5], [5, .5], [3, .5]]],
  ['dorico-groove', 2, 'Groove dórico', [[0, .5], [0, .25], [2, .25], [3, .5], [5, .5], [7, .5], [9, .5], [7, .5], [5, .5]]],
  ['frigio-metal', 2, 'Frígio do metal', [[0, .25], [0, .25], [1, .5], [0, .25], [0, .25], [3, .5], [0, .25], [0, .25], [1, .5], [5, .5]]],
  ['metal-semi', 3, 'Metal em semicolcheias', [[0, .25], [0, .25], [0, .25], [3, .25], [0, .25], [0, .25], [0, .25], [5, .25], [0, .25], [0, .25], [0, .25], [6, .25], [5, .25], [3, .25], [1, .25], [0, .25]]],
  ['galope-tercinas', 3, 'Galope em tercinas', [[0, 1 / 3], [0, 1 / 3], [0, 1 / 3], [3, 1 / 3], [0, 1 / 3], [0, 1 / 3], [5, 1 / 3], [0, 1 / 3], [0, 1 / 3], [6, 1 / 3], [5, 1 / 3], [3, 1 / 3]]],
  ['harmonico', 3, 'Pedal harmônico', [[0, .25], [11, .25], [0, .25], [8, .25], [0, .25], [7, .25], [0, .25], [5, .25], [3, .5], [2, .5], [0, 1]]],
  ['funk-sincopa', 3, 'Funk sincopado', [[0, .25], [12, .25], [10, .25], [12, .25], [0, .5], [7, .25], [10, .25], [12, .25], [0, .25], [3, .25], [5, .25], [6, .25], [7, .5]]],
  ['thrash', 3, 'Thrash alternado', [[0, .25], [0, .25], [0, .25], [0, .25], [5, .25], [0, .25], [6, .25], [0, .25], [7, .25], [0, .25], [6, .25], [0, .25], [5, .25], [0, .25], [3, .25], [0, .25]]],
  ['shuffle', 3, 'Shuffle pesado', [[0, 2 / 3], [0, 1 / 3], [3, 2 / 3], [0, 1 / 3], [5, 2 / 3], [0, 1 / 3], [6, 2 / 3], [5, 1 / 3], [3, 2 / 3], [0, 1 / 3], [0, 1]]],
];
const tamanhoFrase = notas => { const b = notas.reduce((s, n) => s + n[1], 0); return b <= 4 ? 'frase curta' : b <= 8 ? 'frase média' : 'frase longa'; };

/* ================= os modelos de treino =================
   modelo: { id, cat, nivel, nome, resumo, fig, usaTom, regioes(cfg) → [rótulos], gerar(cfg) → { notas, raiz } }
   cfg: { raiz, pos, fig, escala, perm } */
const MODELOS = [];
const add = m => { const [b, a] = ANDAMENTO[m.nivel]; MODELOS.push({ usaTom: true, bpm: b, alvo: a, ...m }); };

// escalas: [id da escala, nível, sistema, figura, nome do treino (opcional)]
[['penta-menor', 1, 'nps', 1], ['penta-maior', 1, 'nps', 1], ['blues', 1, 'caixa', 1], ['maior', 1, 'caixa', 1], ['menor', 1, 'caixa', 1],
  ['maior', 2, 'nps', .5, 'Maior em 3 notas por corda'], ['menor', 2, 'nps', .5, 'Menor em 3 notas por corda'], ['dorico', 2, 'nps', .5], ['mixolidio', 2, 'nps', .5], ['lidio', 2, 'nps', .5], ['frigio', 2, 'nps', .5], ['menor-harmonica', 2, 'nps', .5],
  ['locrio', 3, 'nps', .25], ['menor-melodica', 3, 'nps', .25], ['frigio-dominante', 3, 'nps', .25], ['alterada', 3, 'nps', .25], ['hungara-menor', 3, 'nps', .25], ['diminuta', 3, 'caixa', .25], ['tons-inteiros', 3, 'caixa', 1 / 3], ['bebop-dominante', 3, 'caixa', .25],
].forEach(([e, nivel, sis, fig, nome]) => add({ id: `esc:${e}${sis === 'nps' && nivel === 2 && (e === 'maior' || e === 'menor') ? '-3' : ''}`, cat: 'escalas', nivel, fig, escala: e,
  nome: nome || nomeEscala(e), resumo: sis === 'nps' ? (ESCALAS.find(x => x[0] === e)[2].length === 5 ? 'Os cinco desenhos, sobe e desce.' : 'Três notas por corda, sobe e desce.') : 'Posição por posição, sobe e desce.',
  regioes: c => posicoesEscala(e, c.raiz, sis).map((p, i) => rotuloPos(i, p)),
  gerar: c => ({ notas: montarNotas(sobeDesce(posicoesEscala(e, c.raiz, sis)[c.pos]), c.fig), raiz: c.raiz }) }));

// sequências: [padrão, escala, sistema, nível, figura]
[['grupos3', 'penta-menor', 'nps', 1, .5], ['grupos3', 'maior', 'caixa', 1, .5], ['tercas', 'maior', 'caixa', 1, .5], ['pedal', 'penta-menor', 'nps', 1, .5],
  ['grupos4', 'maior', 'nps', 2, .5], ['grupos3', 'menor', 'nps', 2, 1 / 3], ['tercas', 'dorico', 'nps', 2, .5], ['quartas', 'penta-menor', 'nps', 2, .5], ['quatroDesce', 'mixolidio', 'nps', 2, .5], ['tercas', 'menor-harmonica', 'nps', 2, .5],
  ['sextas', 'maior', 'nps', 3, .5], ['grupos6', 'penta-menor', 'nps', 3, .25], ['grupos5', 'menor-harmonica', 'nps', 3, .25], ['quartas', 'maior', 'nps', 3, .25], ['pedal', 'menor-harmonica', 'nps', 3, .25], ['tercas', 'diminuta', 'caixa', 3, .25],
].forEach(([pd, e, sis, nivel, fig]) => add({ id: `seq:${pd}:${e}`, cat: 'sequencias', nivel, fig, escala: e, trocaEscala: true,
  nome: PADROES[pd][0], resumo: `${nomeEscala(e)}, sobe e desce.`,
  regioes: c => posicoesEscala(c.escala || e, c.raiz, sis).map((p, i) => rotuloPos(i, p)),
  gerar: c => { const P = posicoesEscala(c.escala || e, c.raiz, sis); return { notas: montarNotas(aplicarPadrao(P[c.pos % P.length], pd), c.fig), raiz: c.raiz }; } }));

// arpejos: tipo de acorde, nível, figura e forma (subir e descer, ou varredura: uma nota por corda)
[['5', 1, 1, 'Power chord (1, 5 e 8)'], ['', 1, 1, 'Tríade maior'], ['m', 1, 1, 'Tríade menor'],
  ['7M', 2, .5, 'Sétima maior (7M)'], ['7', 2, .5, 'Dominante (7)'], ['m7', 2, .5, 'Menor com sétima (m7)'], ['°', 2, .5, 'Tríade diminuta'], ['+', 2, .5, 'Tríade aumentada'],
  ['m7(b5)', 3, .25, 'Meio diminuto (m7(b5))'], ['°7', 3, .25, 'Diminuto com sétima (°7)'], ['m(7M)', 3, .25, 'Menor com sétima maior'],
].forEach(([t, nivel, fig, nome]) => add({ id: `arp:${t || 'M'}`, cat: 'arpejos', nivel, fig, nome, resumo: 'Sobe e desce o arpejo, posição por posição.',
  regioes: c => posicoesAcorde(t, c.raiz).map((p, i) => rotuloPos(i, p)),
  gerar: c => ({ notas: montarNotas(sobeDesce(posicoesAcorde(t, c.raiz)[c.pos]), c.fig), raiz: c.raiz }) }));
// varredura: uma nota por corda, subindo e descendo
[['', 'Varredura maior'], ['m', 'Varredura menor']].forEach(([t, nome]) => add({ id: `arp:varredura-${t || 'M'}`, cat: 'arpejos', nivel: 3, fig: 1 / 3, nome, resumo: 'Uma nota por corda, num só movimento da palheta.',
  regioes: c => posicoesAcorde(t, c.raiz).map((p, i) => rotuloPos(i, p)),
  gerar: c => { const P = posicoesAcorde(t, c.raiz)[c.pos], um = []; let ult = -1; for (let s = 0; s < 6; s++) { const n = P.find(x => x[0] === s && MIDI_SOLTAS[s] + x[1] > ult); if (n) { um.push(n); ult = MIDI_SOLTAS[s] + n[1]; } } return { notas: montarNotas(sobeDesce(um), c.fig), raiz: c.raiz }; } }));
// campo harmônico: o arpejo de cada grau da escala maior, um depois do outro
[['tríades', 2, .5, false], ['tétrades', 3, .25, true]].forEach(([qual, nivel, fig, tet]) => add({ id: `arp:campo-${tet ? 4 : 3}`, cat: 'arpejos', nivel, fig, nome: `Campo harmônico em ${qual}`, resumo: 'Os sete acordes da escala maior, um depois do outro.',
  regioes: c => regioesFrase(c.raiz, true).map(([s, k]) => `Tônica na ${6 - s}ª corda · casa ${k}`),
  gerar: c => {
    const [s0, k0] = regioesFrase(c.raiz, true)[c.pos % 2], esc = [0, 2, 4, 5, 7, 9, 11], notas = [];
    const tri = [[0, 4, 7], [0, 3, 7], [0, 3, 7], [0, 4, 7], [0, 4, 7], [0, 3, 7], [0, 3, 6]], sete = [11, 10, 10, 11, 10, 10, 10];
    esc.forEach((g, i) => {
      let raizM = MIDI_SOLTAS[s0] + k0 + g, f = k0 + g; if (f > 14) { raizM -= 12; f -= 12; }
      const iv = [...tri[i], tet ? sete[i] : 12], pos = digitar(iv.map(x => raizM + x), f), d = dedilhar(pos);
      pos.forEach((p, j) => notas.push([p[0], p[1], fig, d[j]]));
    });
    return { notas, raiz: c.raiz };
  } }));

// licks: a frase vai para a região escolhida, na oitava que cabe na mão
const alturasFrase = (notas, s0, k0, alvo) => {
  const base = MIDI_SOLTAS[s0] + k0, ms = notas.map(n => base + n[0]), med = ms.slice().sort((a, b) => a - b)[ms.length >> 1];
  let oit = 0, melhor = 1e9;
  for (let o = -2; o <= 2; o++) { const lo = Math.min(...ms) + 12 * o, hi = Math.max(...ms) + 12 * o; if (lo < 40 || hi > 86) continue; const v = Math.abs(med + 12 * o - alvo); if (v < melhor) { melhor = v; oit = o; } }
  return ms.map(m => m + 12 * oit);
};
LICKS.forEach(([id, nivel, nome, e, frase]) => add({ id: `lick:${id}`, cat: 'licks', nivel, nome, rotulo: 'nota', escala: e, resumo: `${nomeEscala(e)} · ${tamanhoFrase(frase)}.`,
  temTec: frase.some(n => n[2]),
  regioes: c => regioesFrase(c.raiz).map(([s, k]) => `Tônica na ${6 - s}ª corda · casa ${k}`),
  gerar: c => { const R = regioesFrase(c.raiz), [s0, k0] = R[c.pos % R.length], ms = alturasFrase(frase, s0, k0, 57 + k0 + 2), pos = digitar(ms, k0), d = dedilhar(pos); return { notas: pos.map((p, i) => [p[0], p[1], frase[i][1], d[i], frase[i][2]]), raiz: c.raiz }; } }));
RIFFS.forEach(([id, nivel, nome, frase]) => add({ id: `riff:${id}`, cat: 'riffs', nivel, nome, rotulo: 'nota', resumo: `No grave · ${tamanhoFrase(frase)}.`,
  regioes: c => regioesFrase(c.raiz, true).map(([s, k]) => `Tônica na ${6 - s}ª corda · casa ${k}`),
  gerar: c => { const R = regioesFrase(c.raiz, true), [s0, k0] = R[c.pos % R.length], base = MIDI_SOLTAS[s0] + k0, pos = digitar(frase.map(n => base + n[0]), k0, true), d = dedilhar(pos); return { notas: pos.map((p, i) => [p[0], p[1], frase[i][1], d[i], frase[i][2]]), raiz: c.raiz }; } }));

/* técnica: não depende do tom; a "posição" é a casa onde o dedo 1 começa */
const PERMS = (() => { const r = [], p = (resto, s) => { if (!resto.length) r.push(s); resto.forEach((x, i) => p(resto.filter((_, j) => j !== i), s + x)); }; p(['1', '2', '3', '4'], ''); return r; })();
const permTexto = p => p.split('').join('-');
const casas = () => Array.from({ length: 12 }, (_, i) => `Casa ${i + 1}`);
const tec = (id, nivel, nome, resumo, fig, gerar, extra = {}) => add({ id: `tec:${id}`, cat: 'tecnica', nivel, nome, resumo, fig, usaTom: false, rotulo: 'dedo', regioes: casas, gerar, ...extra });
const pelasCordas = (ordem, porCorda) => ordem.flatMap(porCorda);
const C6 = [0, 1, 2, 3, 4, 5], C6V = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1];
tec('soltas', 1, 'Cordas soltas', 'Palhetada alternada, quatro notas por corda.', 1, c => ({ notas: pelasCordas(C6V, s => [0, 1, 2, 3].map(() => [s, 0, c.fig, 0])) }), { regioes: () => ['Cordas soltas'] });
tec('troca', 1, 'Troca de cordas', 'Corda solta e a vizinha, alternando.', .5, c => ({ notas: [0, 1, 2, 3, 4].flatMap(s => [s, s + 1, s, s + 1].map(x => [x, 0, c.fig, 0])) }), { regioes: () => ['Cordas soltas'] });
tec('crom', 1, 'Cromático 1-2-3-4', 'Um dedo por casa, da 6ª à 1ª corda.', 1, c => ({ notas: pelasCordas(C6, s => (c.perm || '1234').split('').map(d => [s, c.pos + +d, c.fig, +d])) }), { temPerm: true });
tec('escada', 1, 'Escada pelo braço', '1-2-3-4 subindo uma casa a cada corda.', .5, c => ({ notas: [...C6, ...[4, 3, 2, 1]].flatMap((s, i) => { const k = c.pos + 1 + (i < 6 ? i : 10 - i); return [1, 2, 3, 4].map(d => [s, k + d - 1, c.fig, d]); }) }), { regioes: () => casas().slice(0, 8) });
tec('crom24', 2, 'As 24 combinações', 'Cromático numa ordem de dedos diferente a cada etapa.', .5, c => ({ notas: pelasCordas(C6V, s => (c.perm || '1234').split('').map(d => [s, c.pos + +d, c.fig, +d])) }), { temPerm: true, variaPerm: true });
tec('aranha', 2, 'Aranha', 'Dois dedos em cada corda, alternando com a vizinha.', .5, c => ({ notas: [0, 1, 2, 3, 4].flatMap(s => [[s, 1], [s + 1, 2], [s, 3], [s + 1, 4]].map(([x, d]) => [x, c.pos + d, c.fig, d])) }));
tec('ligados', 2, 'Ligados 1-2, 1-3 e 1-4', 'Martele e puxe sem palhetar a segunda nota.', .5, c => ({ notas: C6.flatMap(s => [2, 3, 4].flatMap(d => [[s, c.pos + 1, c.fig, 1], [s, c.pos + d, c.fig, d, 'h'], [s, c.pos + 1, c.fig, 1, 'p']])) }));
tec('pulo', 2, 'Pulando cordas', '1-2-3-4 numa corda e 4-3-2-1 duas cordas acima.', .5, c => ({ notas: [0, 1, 2, 3].flatMap(s => [...[1, 2, 3, 4].map(d => [s, c.pos + d, c.fig, d]), ...[4, 3, 2, 1].map(d => [s + 2, c.pos + d, c.fig, d])]) }));
tec('crom-rapido', 3, 'Cromático rápido', 'Ida e volta nas seis cordas em semicolcheias.', .25, c => ({ notas: pelasCordas(C6V, s => (c.perm || '1234').split('').map(d => [s, c.pos + +d, c.fig, +d])) }), { temPerm: true });
tec('aranha-cruzada', 3, 'Aranha cruzada', 'Dedos 1 e 3 numa corda, 2 e 4 na vizinha.', .25, c => ({ notas: [0, 1, 2, 3, 4].flatMap(s => [[s, 1], [s + 1, 3], [s, 2], [s + 1, 4]].map(([x, d]) => [x, c.pos + d, c.fig, d])) }));
tec('trinados', 3, 'Trinados', 'Ligados rápidos 1-2 e 3-4 em cada corda.', .25, c => ({ notas: C6.flatMap(s => [[1, 2], [3, 4]].flatMap(([a, b]) => [[s, c.pos + a, c.fig, a], [s, c.pos + b, c.fig, b, 'h'], [s, c.pos + a, c.fig, a, 'p'], [s, c.pos + b, c.fig, b, 'h']])) }));
tec('tercinas', 3, 'Palhetada em tercinas', '1-2-3 e 4-3-2 em cada corda, contando três.', 1 / 3, c => ({ notas: C6.flatMap(s => [[1, 2, 3], [4, 3, 2]].flat().map(d => [s, c.pos + d, c.fig, d])) }));
add({ id: 'tec:tremolo', cat: 'tecnica', nivel: 3, fig: .25, rotulo: 'nota', nome: 'Trêmolo na pentatônica', resumo: 'Quatro palhetadas rápidas em cada nota da escala.',
  regioes: c => posicoesEscala('penta-menor', c.raiz).map((p, i) => rotuloPos(i, p)),
  gerar: c => { const P = sobeDesce(posicoesEscala('penta-menor', c.raiz)[c.pos]), d = dedilhar(P); return { notas: P.flatMap((p, i) => [0, 1, 2, 3].map(() => [p[0], p[1], c.fig, d[i]])), raiz: c.raiz }; } });

const modelo = id => MODELOS.find(m => m.id === id);
// ids e ajustes da versão 0.4.0 (o histórico continua valendo)
function normalizarTreino(t) {
  const id = t.ex || '', c = t.cfg || {};
  if (id.startsWith('crom:')) return { id: 'tec:crom', cfg: { perm: c.perm || id.slice(5), pos: Math.max(0, (c.casa || 1) - 1) } };
  if (id.startsWith('esc:') && id.split(':').length === 4) { const [, e, r, d] = id.split(':'); return { id: modelo('esc:' + e) ? 'esc:' + e : 'esc:penta-menor', cfg: { raiz: +r, pos: +d } }; }
  const velho = { 'ex-1234': ['tec:crom', {}], 'ex-alternada': ['tec:crom', {}], 'ex-penta': ['esc:penta-menor', { raiz: 9 }], 'ex-soltas': ['tec:soltas', {}], 'ex-em': ['arp:m', { raiz: 4 }], 'ex-am': ['arp:m', { raiz: 9 }], 'ex-c': ['arp:M', { raiz: 0 }], 'ex-g': ['arp:M', { raiz: 7 }], 'ex-do-maior': ['esc:maior', { raiz: 0 }], 'ex-riff-estrada': ['riff:estrada', { raiz: 4 }], 'ex-riff-galope': ['riff:galope', { raiz: 9 }], 'ex-blues': ['lick:m7', { raiz: 9 }] }[id];
  if (velho) return { id: velho[0], cfg: velho[1] };
  return { id, cfg: c };
}

/* ================= uma volta e o plano da sessão ================= */
const cfgPadrao = m => {
  const raiz = m.cat === 'riffs' ? 4 : !m.usaTom ? null : 9;
  // licks: começa com a tônica na 6ª corda (o desenho 1 da pentatônica)
  const pos = m.cat === 'licks' ? Math.max(0, regioesFrase(raiz).findIndex(r => r[0] === 0 && r[1] === pc(raiz - 4))) : 0;
  return { raiz, pos, fig: m.fig, escala: m.escala, perm: '1234' };
};
function volta(m, c) {
  const R = m.regioes(c), cc = { ...c, pos: Math.min(c.pos || 0, R.length - 1) }, g = m.gerar(cc);
  const tom = m.usaTom ? NOTAS[cc.raiz] : null, esc = m.trocaEscala && cc.escala ? nomeEscala(cc.escala) : null;
  const perm = m.temPerm ? permTexto(cc.perm || '1234') : null;
  return { id: m.id, modelo: m, cfg: cc, nome: m.nome + (perm ? ` · ${perm}` : ''), sub: [esc, tom, R[cc.pos]].filter(Boolean).join(' · '), notas: g.notas, raiz: g.raiz != null ? g.raiz : null, rotulo: c.rotulo || m.rotulo || 'nota', bpm: m.bpm, alvo: m.alvo };
}
// as etapas da sessão: tons (ciclo das quartas a partir do escolhido) × posições (a partir da escolhida)
function planoSessao(m, c, dur) {
  const P = m.regioes(c).length, ord = [...Array(P).keys()].map(i => (i + (c.pos || 0)) % P);
  if (m.variaPerm) { const k = PERMS.indexOf(c.perm || '1234'), n = { curto: 1, moderado: 6, longo: 12, 'muito-longo': 24 }[dur]; return Array.from({ length: n }, (_, i) => ({ ...c, perm: PERMS[(k + i) % 24] })); }
  if (!m.usaTom) { const n = { curto: 1, moderado: Math.min(5, P), longo: P, 'muito-longo': P * 2 }[dur]; return Array.from({ length: n }, (_, i) => ({ ...c, pos: P > 1 ? (i < P ? ord[i] : ord[2 * P - 1 - i]) : 0 })); }
  const nT = P <= 2 ? { curto: 1, moderado: 3, longo: 6, 'muito-longo': 12 }[dur] : { curto: 1, moderado: 1, longo: 4, 'muito-longo': 12 }[dur];
  const posicoes = dur === 'curto' ? [c.pos || 0] : ord, tons = cicloQuartas(c.raiz).slice(0, nT), out = [];
  tons.forEach(r => posicoes.forEach(p => out.push({ ...c, raiz: r, pos: p })));
  return out;
}
const contarCatalogo = () => MODELOS.length;

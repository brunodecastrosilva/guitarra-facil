/* Guitarra Fácil · catálogo de exercícios. Cada exercício é gerado aqui a partir de regras musicais e recebe um número e
   um objetivo ("#0001 · Praticar …"). Modelo único:
   { id: '0001', num, objetivo, familia, tecnica, competencia, nivel (1 a 3), mao, bpm: { ini, meta }, compasso (tempos),
     partes: [{ nome, evs }], dica, tipo: 'tocar' | 'preparo', passos? (preparo) }
   Evento: { d: duração em tempos, n: [[corda, casa, dedo]], t: técnica }. Corda 0 é a 6ª. Gênero musical não é filtro. */
'use strict';

const CATALOGO = (() => {
  const NIVEIS = ['', 'Iniciante', 'Intermediário', 'Avançado'];
  const COMPETENCIAS = [
    ['palhetada', 'Palhetada'], ['dedos', 'Independência dos dedos'], ['ritmo', 'Ritmo e contagem'], ['escalas', 'Escalas'],
    ['arpejos', 'Arpejos'], ['acordes', 'Acordes e trocas'], ['power', 'Power chords e abafamento'], ['ligados', 'Ligados'],
    ['expressao', 'Bends, slides e vibrato'], ['preparo', 'Preparo do corpo'],
  ];
  const MAOS = { palheta: 'Mão da palheta', braco: 'Mão do braço', ambas: 'As duas mãos' };
  const nomeCompetencia = id => (COMPETENCIAS.find(c => c[0] === id) || [, id])[1];

  /* ---------- peças para escrever trechos ---------- */
  const N = (d, c, k, dedo = null, t = '') => (t ? { d, n: [[c, k, dedo]], t } : { d, n: [[c, k, dedo]] });
  const Pausa = d => ({ d, n: [] });
  const Ac = (d, notas, t = '') => (t ? { d, n: notas.map(([c, k, x]) => [c, k, x ?? null]), t } : { d, n: notas.map(([c, k, x]) => [c, k, x ?? null]) });
  const total = evs => evs.reduce((s, e) => s + e.d, 0);
  /* completa o último compasso, esticando a última nota */
  function fechar(evs, comp = 4) {
    const t = Math.round(total(evs) * 1000) / 1000, resto = Math.round(((comp - (t % comp)) % comp) * 1000) / 1000;
    if (resto > 1e-6 && evs.length) evs[evs.length - 1] = { ...evs[evs.length - 1], d: +(evs[evs.length - 1].d + resto).toFixed(4) };
    return evs;
  }
  const dedoNaPosicao = (k, lo) => (k === 0 ? null : limitar(k - lo + 1, 1, 4));

  const lista = [];
  const add = ex => { lista.push({ compasso: 4, tipo: 'tocar', mao: 'ambas', ...ex }); };

  /* ===== 1. Preparo do corpo (sem som; a pessoa segue os passos no tempo) ===== */
  add({ familia: 'preparo', tipo: 'preparo', tecnica: 'Preparo', competencia: 'preparo', nivel: 1, mao: 'ambas', objetivo: 'Preparar as mãos e os punhos', bpm: { ini: 0, meta: 0 }, seg: 120,
    dica: 'Movimentos lentos, sem dor. Se doer, pare.',
    passos: [['Abra e feche as mãos', '10 vezes, devagar, esticando bem os dedos.'], ['Gire os punhos', '5 voltas para cada lado.'], ['Alongue os dedos', 'Com a outra mão, puxe de leve cada dedo para trás, 5 segundos.'], ['Solte os ombros', 'Suba e desça os ombros 5 vezes e deixe os braços pesados.']] });
  add({ familia: 'preparo', tipo: 'preparo', tecnica: 'Preparo', competencia: 'preparo', nivel: 1, mao: 'ambas', objetivo: 'Preparar a postura para tocar', bpm: { ini: 0, meta: 0 }, seg: 90,
    dica: 'A guitarra vem até você, não o contrário.',
    passos: [['Sente na ponta da cadeira', 'Pés no chão e costas retas, sem encostar.'], ['Apoie a guitarra', 'O corpo da guitarra encostado na barriga, o braço um pouco para cima.'], ['Solte o polegar', 'O polegar da mão do braço fica atrás do braço, sem apertar.'], ['Segure a palheta', 'Entre o polegar e a lateral do indicador, com a ponta curta para fora.']] });
  add({ familia: 'preparo', tipo: 'preparo', tecnica: 'Preparo', competencia: 'preparo', nivel: 1, mao: 'ambas', objetivo: 'Soltar o corpo depois de tocar', bpm: { ini: 0, meta: 0 }, seg: 90,
    dica: 'Termine o treino sem pressa: o descanso também conta.',
    passos: [['Sacuda as mãos', '10 segundos, bem soltas.'], ['Alongue os antebraços', 'Braço esticado, palma para frente, puxe os dedos para trás, 10 segundos de cada lado.'], ['Gire o pescoço', 'Devagar, 3 voltas para cada lado.'], ['Respire', '3 respirações longas, soltando os ombros.']] });

  /* ===== 2. Independência dos dedos (1-2-3-4) =====
     Cada parte tem uma ordem dos dedos, um desenho e uma casa; sobe as cordas com a ordem e desce com a ordem ao
     contrário, fechando compassos inteiros. Iniciante: casa fixa e ordens que começam no dedo 1. Intermediário: a mão
     sobe uma casa por parte. Avançado: sobe duas, com aranha, aranha cruzada e salto de cordas. */
  const txtOrdem = o => o.join('-');
  function parteDedos(ordem, casa, desenho = 'cromatico') {
    const evs = [], fr = d => casa + d - 1;
    const tocar = (corda, dedo) => evs.push(N(.5, corda, fr(dedo), dedo));
    if (desenho === 'cromatico') {
      for (let c = 0; c < 6; c++) ordem.forEach(d => tocar(c, d));
      const inv = [...ordem].reverse();
      for (let c = 5; c >= 0; c--) inv.forEach(d => tocar(c, d));
    } else if (desenho === 'aranha' || desenho === 'cruzada') {
      // pares de cordas: dedos alternando entre a corda de baixo e a de cima
      const padrao = desenho === 'aranha' ? [[0, 1], [1, 2], [0, 3], [1, 4]] : [[0, 1], [1, 3], [0, 2], [1, 4]];
      for (let s = 0; s < 5; s++) padrao.forEach(([q, d]) => tocar(s + q, d));
      for (let s = 4; s >= 0; s--) [...padrao].reverse().forEach(([q, d]) => tocar(s + q, d));
    } else if (desenho === 'salto') {
      const cordas = [0, 2, 1, 3, 2, 4, 3, 5];
      cordas.forEach(c => ordem.forEach(d => tocar(c, d)));
      [...cordas].reverse().forEach(c => [...ordem].reverse().forEach(d => tocar(c, d)));
    }
    return evs;
  }
  const NOME_DESENHO = { cromatico: 'cromático', aranha: 'aranha', cruzada: 'aranha cruzada', salto: 'salto de cordas' };
  [[5, [[1, 2, 3, 4], [1, 2, 4, 3]]], [5, [[1, 3, 2, 4], [1, 3, 4, 2]]], [5, [[1, 4, 2, 3], [1, 4, 3, 2]]],
    [3, [[1, 2, 3, 4], [1, 3, 2, 4]]], [7, [[1, 2, 4, 3], [1, 4, 3, 2]]]].forEach(([casa, ordens]) => add({
    familia: 'dedos', tecnica: 'Dedos 1-2-3-4', competencia: 'dedos', nivel: 1, mao: 'braco', bpm: { ini: 60, meta: 100 },
    objetivo: `Praticar os dedos nas ordens ${ordens.map(txtOrdem).join(' e ')}, na casa ${casa}`,
    dica: 'Um dedo por casa. Deixe cada dedo apertado até o próximo tocar.',
    partes: ordens.map(o => ({ nome: `Ordem ${txtOrdem(o)} · casa ${casa}`, evs: parteDedos(o, casa) })),
  }));
  [[5, [[1, 2, 3, 4], [2, 1, 4, 3], [3, 4, 1, 2]]], [5, [[1, 3, 2, 4], [2, 4, 1, 3], [4, 2, 3, 1]]],
    [3, [[1, 3, 4, 2], [3, 1, 2, 4], [2, 4, 3, 1]]], [7, [[4, 3, 2, 1], [3, 4, 2, 1], [2, 1, 3, 4]]]].forEach(([casa, ordens]) => add({
    familia: 'dedos', tecnica: 'Dedos 1-2-3-4', competencia: 'dedos', nivel: 2, mao: 'braco', bpm: { ini: 60, meta: 100 },
    objetivo: `Praticar os dedos nas ordens ${ordens.map(txtOrdem).join(', ').replace(/, ([^,]*)$/, ' e $1')}, subindo uma casa por parte a partir da casa ${casa}`,
    dica: 'A mão sobe uma casa a cada parte. O polegar acompanha a mão.',
    partes: ordens.map((o, i) => ({ nome: `Ordem ${txtOrdem(o)} · casa ${casa + i}`, evs: parteDedos(o, casa + i) })),
  }));
  [[5, ['aranha', 'aranha', 'aranha']], [5, ['cruzada', 'cruzada', 'cruzada']], [3, ['salto', 'salto', 'salto']], [7, ['aranha', 'cruzada', 'salto']]].forEach(([casa, ds]) => add({
    familia: 'dedos', tecnica: 'Dedos 1-2-3-4', competencia: 'dedos', nivel: 3, mao: 'braco', bpm: { ini: 60, meta: 110 },
    objetivo: `Praticar o desenho ${[...new Set(ds)].map(d => NOME_DESENHO[d]).join(', ')}, subindo duas casas por parte a partir da casa ${casa}`,
    dica: 'Cada dedo fica na sua casa. Os dedos que não tocam ficam perto das cordas.',
    partes: ds.map((d, i) => ({ nome: `${NOME_DESENHO[d][0].toUpperCase() + NOME_DESENHO[d].slice(1)} · casa ${casa + 2 * i}`, evs: parteDedos([1, 2, 3, 4], casa + 2 * i, d) })),
  }));

  /* ===== 3. Escalas em posição ===== */
  const NOME_TOM = r => TEORIA.nome(r);
  /* notas de uma escala numa posição do braço, subindo, a partir da tônica mais grave */
  function caixa(escId, raiz, casaRaiz) {
    const esc = TEORIA.escala(escId), pcs = esc.s.map(x => TEORIA.mod(raiz + x));
    const maior = esc.s.includes(4);
    const lo = Math.max(0, maior ? casaRaiz - 1 : casaRaiz), hi = lo + (esc.s.length > 6 ? 4 : 3);
    const out = []; let ult = -1;
    for (let c = 0; c < 6; c++) for (let k = lo; k <= hi; k++) {
      const m = TEORIA.midiDe(c, k);
      if (pcs.includes(TEORIA.mod(m)) && m > ult) { out.push([c, k, dedoNaPosicao(k, lo || 1), m]); ult = m; }
    }
    const raizGrave = TEORIA.midiDe(0, casaRaiz);
    return out.filter(n => n[3] >= raizGrave);
  }
  const ESCALAS = [
    ['penta-menor', 9, 5, 1], ['penta-menor', 4, 0, 1], ['penta-menor', 7, 3, 1], ['penta-menor', 2, 10, 2],
    ['maior', 7, 3, 1], ['maior', 0, 8, 2], ['maior', 9, 5, 2],
    ['menor', 9, 5, 1], ['menor', 4, 12, 2],
    ['blues', 9, 5, 2], ['blues', 4, 0, 2],
    ['penta-maior', 7, 3, 2], ['penta-maior', 9, 5, 2],
    ['dorico', 2, 10, 3], ['menor-harmonica', 9, 5, 3], ['mixolidio', 9, 5, 3], ['frigio', 4, 12, 3],
  ];
  ESCALAS.forEach(([id, raiz, casa, nivel]) => {
    const notas = caixa(id, raiz, casa), esc = TEORIA.escala(id);
    const sobe = notas.map(([c, k, d]) => [c, k, d]), desce = [...sobe].reverse();
    const modo = ['dorico', 'frigio', 'lidio', 'mixolidio'].includes(id);
    const nomeEsc = `${modo ? 'o modo' : 'a escala'} ${esc.nome.toLowerCase()} de ${NOME_TOM(raiz)}`;
    const ondeTxt = casa === 0 ? 'nas primeiras casas' : `na casa ${casa}`;
    const base = { familia: 'escalas', tecnica: 'Escalas', competencia: 'escalas', mao: 'ambas', escala: id, raiz, dica: `${esc.sobre} Comece devagar e toque cada nota limpa.` };
    // nível da escala: subir e descer em colcheias
    add({ ...base, nivel, bpm: { ini: 60, meta: 110 }, objetivo: `Praticar ${nomeEsc} ${ondeTxt}, subindo e descendo`,
      partes: [{ nome: 'Subindo', evs: fechar(sobe.map(([c, k, d]) => N(.5, c, k, d))) }, { nome: 'Descendo', evs: fechar(desce.map(([c, k, d]) => N(.5, c, k, d))) }] });
    // um nível acima: em grupos de três (tercinas); dois acima: em grupos de quatro (semicolcheias)
    const grupos = (L, g, d) => { const out = []; for (let i = 0; i + g <= L.length; i++) L.slice(i, i + g).forEach(([c, k, dd]) => out.push(N(d, c, k, dd))); return fechar(out); };
    if (nivel <= 2) add({ ...base, nivel: nivel + 1, bpm: { ini: 60, meta: 100 }, objetivo: `Praticar ${nomeEsc} ${ondeTxt}, em grupos de três notas`,
      partes: [{ nome: 'Grupos de três, subindo', evs: grupos(sobe, 3, 1 / 3) }, { nome: 'Grupos de três, descendo', evs: grupos(desce, 3, 1 / 3) }] });
    if (nivel === 1) add({ ...base, nivel: 3, bpm: { ini: 60, meta: 100 }, objetivo: `Praticar ${nomeEsc} ${ondeTxt}, em grupos de quatro notas`,
      partes: [{ nome: 'Grupos de quatro, subindo', evs: grupos(sobe, 4, .25) }, { nome: 'Grupos de quatro, descendo', evs: grupos(desce, 4, .25) }] });
  });

  /* ===== 4. Palhetada ===== */
  add({ familia: 'palhetada', tecnica: 'Palhetada alternada', competencia: 'palhetada', nivel: 1, mao: 'palheta', bpm: { ini: 60, meta: 120 },
    objetivo: 'Praticar palhetada alternada nas cordas soltas',
    dica: 'Para baixo, para cima, sempre alternando. Movimento pequeno, a partir do punho.',
    partes: [{ nome: 'Da 6ª à 1ª corda', evs: [0, 1, 2, 3, 4, 5].flatMap(c => Array.from({ length: 8 }, () => N(.5, c, 0))) },
      { nome: 'Da 1ª à 6ª corda', evs: [5, 4, 3, 2, 1, 0].flatMap(c => Array.from({ length: 8 }, () => N(.5, c, 0))) }] });
  [[[0, 1, 2], 'graves'], [[3, 4, 5], 'agudas']].forEach(([cordas, qual]) => add({
    familia: 'palhetada', tecnica: 'Palhetada alternada', competencia: 'palhetada', nivel: 1, mao: 'palheta', bpm: { ini: 60, meta: 120 },
    objetivo: `Praticar palhetada alternada numa nota presa, nas cordas ${qual}`,
    dica: 'O dedo 1 aperta a casa 5 perto do traste; a palheta mantém o vaivém.',
    partes: cordas.map(c => ({ nome: `${DESENHO.ORD[c]} corda, casa 5`, evs: Array.from({ length: 8 }, () => N(.5, c, 5, 1)) })) }));
  {
    const notas = caixa('penta-menor', 9, 5).map(([c, k, d]) => [c, k, d]);
    const rep = L => L.flatMap(([c, k, d]) => Array.from({ length: 4 }, () => N(.25, c, k, d)));
    add({ familia: 'palhetada', tecnica: 'Palhetada alternada', competencia: 'palhetada', nivel: 2, mao: 'palheta', bpm: { ini: 60, meta: 110 },
      objetivo: 'Praticar palhetada em semicolcheias, quatro ataques por nota, na pentatônica de Lá',
      dica: 'Quatro ataques por nota, sempre alternando. Conte 1-e-e-a em cada tempo.',
      partes: [{ nome: 'Subindo', evs: fechar(rep(notas)) }, { nome: 'Descendo', evs: fechar(rep([...notas].reverse())) }] });
    const par = s => [N(.25, s, 5, 1), N(.25, s, 7, 3), N(.25, s + 1, 5, 1), N(.25, s + 1, 7, 3)];
    add({ familia: 'palhetada', tecnica: 'Troca de corda', competencia: 'palhetada', nivel: 2, mao: 'palheta', bpm: { ini: 60, meta: 110 },
      objetivo: 'Praticar a troca de corda com palhetada alternada, de duas em duas cordas',
      dica: 'A palheta passa por cima da corda seguinte sem levantar o braço.',
      partes: [{ nome: 'Subindo de par em par', evs: [0, 1, 2, 3, 4].flatMap(s => [...par(s), ...par(s), ...par(s), ...par(s)]) },
        { nome: 'Descendo de par em par', evs: [4, 3, 2, 1, 0].flatMap(s => [...par(s), ...par(s), ...par(s), ...par(s)]) }] });
    /* três notas por corda: escala menor natural a partir da tônica na 6ª corda */
    const tres = (raiz, casa) => {
      const pcs = TEORIA.escala('menor').s.map(x => TEORIA.mod(raiz + x)), out = [];
      let m = TEORIA.midiDe(0, casa);
      for (let c = 0; c < 6; c++) {
        const ks = [];
        while (ks.length < 3) { const k = m - TEORIA.afinacao('padrao').midi[c]; if (pcs.includes(TEORIA.mod(m))) ks.push(k); m++; }
        const lo = Math.min(...ks); ks.forEach((k, i) => out.push([c, k, i === 0 ? 1 : limitar(k - lo + 1, 2, 4)]));
      }
      return out;
    };
    [[9, 5, 'Lá'], [4, 12, 'Mi']].forEach(([raiz, casa, nm]) => {
      const sobe = tres(raiz, casa);
      add({ familia: 'palhetada', tecnica: 'Palhetada alternada', competencia: 'palhetada', nivel: 3, mao: 'ambas', bpm: { ini: 60, meta: 120 },
        objetivo: `Praticar palhetada alternada com três notas por corda, na escala menor de ${nm}`,
        dica: 'Três notas por corda em tercinas: a acentuação muda de direção a cada corda.', escala: 'menor', raiz,
        partes: [{ nome: 'Subindo em tercinas', evs: fechar(sobe.map(([c, k, d]) => N(1 / 3, c, k, d))) }, { nome: 'Descendo em tercinas', evs: fechar([...sobe].reverse().map(([c, k, d]) => N(1 / 3, c, k, d))) }] });
    });
  }

  /* ===== 5. Ritmo ===== */
  const pm = d => N(d, 0, 0, null, 'pm');
  const repetir = (q, f) => Array.from({ length: q }, f).flat();
  add({ familia: 'ritmo', tecnica: 'Ritmo', competencia: 'ritmo', nivel: 1, mao: 'palheta', bpm: { ini: 70, meta: 120 },
    objetivo: 'Praticar semínimas e colcheias no tempo do metrônomo',
    dica: 'Conte em voz alta: 1, 2, 3, 4 nas semínimas; 1-e, 2-e nas colcheias.',
    partes: [{ nome: 'Semínimas', evs: repetir(8, () => [pm(1)]) }, { nome: 'Colcheias', evs: repetir(16, () => [pm(.5)]) }, { nome: 'Uma de cada', evs: repetir(4, () => [pm(1), pm(1), pm(.5), pm(.5), pm(.5), pm(.5)]) }] });
  add({ familia: 'ritmo', tecnica: 'Ritmo', competencia: 'ritmo', nivel: 1, mao: 'palheta', bpm: { ini: 70, meta: 110 },
    objetivo: 'Praticar pausas: tocar e calar no tempo certo',
    dica: 'Na pausa, abafe a corda com a mão da palheta. O silêncio também é tempo.',
    partes: [{ nome: 'Nota e pausa', evs: repetir(8, () => [pm(1), Pausa(1)]) }, { nome: 'Duas notas e pausa', evs: repetir(4, () => [pm(.5), pm(.5), Pausa(1), pm(1), Pausa(1)]) }] });
  add({ familia: 'ritmo', tecnica: 'Ritmo', competencia: 'ritmo', nivel: 2, mao: 'palheta', bpm: { ini: 60, meta: 100 },
    objetivo: 'Praticar tercinas e semicolcheias, trocando a cada compasso',
    dica: 'Tercina: 1-e-a. Semicolcheia: 1-e-e-a. O primeiro ataque de cada tempo cai junto com o metrônomo.',
    partes: [{ nome: 'Tercinas', evs: repetir(12, () => [pm(1 / 3)]).concat(repetir(12, () => [pm(1 / 3)])) }, { nome: 'Semicolcheias', evs: repetir(32, () => [pm(.25)]) },
      { nome: 'Alternando', evs: repetir(2, () => [...repetir(12, () => [pm(1 / 3)]), ...repetir(16, () => [pm(.25)])]) }] });
  add({ familia: 'ritmo', tecnica: 'Ritmo', competencia: 'ritmo', nivel: 2, mao: 'palheta', bpm: { ini: 70, meta: 120 },
    objetivo: 'Praticar o ritmo pontuado (colcheia pontuada e semicolcheia)',
    dica: 'Longa e curta: a segunda nota chega logo antes do próximo tempo.',
    partes: [{ nome: 'Pontuado', evs: repetir(8, () => [pm(.75), pm(.25)]) }, { nome: 'Pontuado e colcheias', evs: repetir(4, () => [pm(.75), pm(.25), pm(.5), pm(.5)]) }] });
  add({ familia: 'ritmo', tecnica: 'Ritmo', competencia: 'ritmo', nivel: 3, mao: 'palheta', bpm: { ini: 70, meta: 130 },
    objetivo: 'Praticar síncopes, com ataques no contratempo',
    dica: 'O ataque cai no "e", entre os cliques. Mantenha o vaivém da palheta mesmo sem tocar.',
    partes: [{ nome: 'Contratempo', evs: repetir(8, () => [Pausa(.5), pm(.5)]) }, { nome: 'Síncope', evs: repetir(4, () => [pm(.5), pm(1), pm(.5), Pausa(.5), pm(.5), pm(1)]) }] });
  add({ familia: 'ritmo', tecnica: 'Ritmo', competencia: 'ritmo', nivel: 3, mao: 'palheta', bpm: { ini: 80, meta: 150 },
    objetivo: 'Praticar o galope (colcheia e duas semicolcheias)',
    dica: 'Para baixo, para baixo, para cima: o galope tem três ataques por tempo.',
    partes: [{ nome: 'Galope', evs: repetir(8, () => [pm(.5), pm(.25), pm(.25)]) }, { nome: 'Galope invertido', evs: repetir(8, () => [pm(.25), pm(.25), pm(.5)]) }] });

  /* ===== 6. Acordes e trocas ===== */
  const acorde = (cifra, d, t = '') => { const f = FORMAS.aberta(cifra) || FORMAS.TODAS.find(x => x.cifra === cifra); return Ac(d, f.notas, t); };
  const melhorCifra = cifra => FORMAS.aberta(cifra) || FORMAS.TODAS.find(x => x.cifra === cifra);
  [['Em', 'Am'], ['Am', 'E'], ['C', 'G'], ['G', 'D'], ['D', 'A'], ['E', 'A'], ['C', 'Am'], ['G', 'Em'], ['D', 'Em'], ['A', 'D']].forEach(([a, b]) => add({
    familia: 'acordes', tecnica: 'Acordes', competencia: 'acordes', nivel: 1, mao: 'ambas', bpm: { ini: 60, meta: 100 }, acordes: [a, b],
    objetivo: `Praticar a troca entre os acordes ${a} e ${b}`,
    dica: 'Antes de tocar, monte o acorde todo de uma vez. Os dedos que ficam nos dois acordes não saem do lugar.',
    partes: [{ nome: `${a} e ${b}, um por compasso`, evs: [...repetir(4, () => [acorde(a, 1)]), ...repetir(4, () => [acorde(b, 1)]), ...repetir(4, () => [acorde(a, 1)]), ...repetir(4, () => [acorde(b, 1)])] },
      { nome: 'Troca a cada dois tempos', evs: repetir(4, () => [acorde(a, 1), acorde(a, 1), acorde(b, 1), acorde(b, 1)]) }] }));
  [['G', 'D', 'Em', 'C'], ['Am', 'G', 'C', 'D'], ['C', 'G', 'Am', 'Em'], ['E', 'A', 'B7', 'E'], ['Am', 'Dm', 'E7', 'Am'], ['D', 'A', 'Em', 'G']].forEach(prog => add({
    familia: 'acordes', tecnica: 'Acordes', competencia: 'acordes', nivel: 2, mao: 'ambas', bpm: { ini: 60, meta: 100 }, acordes: prog,
    objetivo: `Praticar a progressão ${prog.join(' – ')} com ritmo de colcheias`,
    dica: 'Rasgado em colcheias: para baixo no tempo, para cima no "e". O braço não para de balançar.',
    partes: [{ nome: 'Um acorde por compasso, semínimas', evs: prog.flatMap(c => repetir(4, () => [acorde(c, 1)])) },
      { nome: 'Colcheias', evs: prog.flatMap(c => repetir(8, () => [acorde(c, .5)])) }] }));
  [['F', 'C', 'G', 'Am'], ['Bm', 'G', 'D', 'A'], ['Cm', 'Ab', 'Eb', 'Bb'], ['F#m', 'D', 'A', 'E']].forEach(prog => {
    if (!prog.every(melhorCifra)) return;
    add({ familia: 'acordes', tecnica: 'Pestana', competencia: 'acordes', nivel: 3, mao: 'ambas', bpm: { ini: 60, meta: 100 }, acordes: prog,
      objetivo: `Praticar acordes com pestana na progressão ${prog.join(' – ')}`,
      dica: 'Na pestana, o dedo 1 fica de lado, perto do traste. Use o peso do braço, não a força do polegar.',
      partes: [{ nome: 'Semínimas', evs: prog.flatMap(c => repetir(4, () => [Ac(1, melhorCifra(c).notas)])) }, { nome: 'Colcheias', evs: prog.flatMap(c => repetir(8, () => [Ac(.5, melhorCifra(c).notas)])) }] });
  });

  /* ===== 7. Power chords ===== */
  const P6 = r => [[0, r, 1], [1, r + 2, 3]], P5 = r => [[1, r, 1], [2, r + 2, 3]];
  add({ familia: 'power', tecnica: 'Power chords', competencia: 'power', nivel: 1, mao: 'ambas', bpm: { ini: 70, meta: 120 },
    objetivo: 'Praticar power chords na 6ª corda (Mi, Sol, Lá e Dó)',
    dica: 'Dedo 1 na 6ª corda e dedo 3 duas casas acima, na 5ª. Abafe as outras cordas com a sobra dos dedos.',
    partes: [{ nome: 'Semínimas', evs: [0, 3, 5, 8].flatMap(r => repetir(4, () => [Ac(1, P6(r))])) }, { nome: 'Colcheias abafadas', evs: [0, 3, 5, 8].flatMap(r => repetir(8, () => [Ac(.5, P6(r), 'pm')])) }] });
  add({ familia: 'power', tecnica: 'Power chords', competencia: 'power', nivel: 1, mao: 'ambas', bpm: { ini: 70, meta: 120 },
    objetivo: 'Praticar power chords na 5ª corda (Lá, Ré, Mi e Sol)',
    dica: 'A mesma forma, uma corda acima. A 6ª corda fica calada, tocada de leve pela ponta do dedo 1.',
    partes: [{ nome: 'Semínimas', evs: [0, 5, 7, 10].flatMap(r => repetir(4, () => [Ac(1, P5(r))])) }, { nome: 'Colcheias abafadas', evs: [0, 5, 7, 10].flatMap(r => repetir(8, () => [Ac(.5, P5(r), 'pm')])) }] });
  add({ familia: 'power', tecnica: 'Power chords', competencia: 'power', nivel: 2, mao: 'ambas', bpm: { ini: 80, meta: 140 },
    objetivo: 'Praticar a troca de power chords entre a 6ª e a 5ª corda',
    dica: 'Escolha o caminho mais curto: muitas vezes basta trocar de corda, sem andar no braço.',
    partes: [{ nome: 'Mi, Lá, Ré e Si', evs: [P6(0), P5(0), P5(5), P6(7)].flatMap(n => repetir(8, () => [Ac(.5, n, 'pm')])) }, { nome: 'Sol, Dó, Ré e Lá', evs: [P6(3), P5(3), P5(5), P6(5)].flatMap(n => repetir(8, () => [Ac(.5, n, 'pm')])) }] });
  add({ familia: 'power', tecnica: 'Palm mute', competencia: 'power', nivel: 2, mao: 'palheta', bpm: { ini: 80, meta: 140 },
    objetivo: 'Praticar o abafamento com a palma (palm mute) entre notas e acordes',
    dica: 'A lateral da mão da palheta encosta nas cordas perto da ponte. Solte para o acorde soar aberto.',
    partes: [{ nome: 'Abafado e aberto', evs: repetir(4, () => [pm(.5), pm(.5), pm(.5), pm(.5), Ac(2, P6(0))]) }, { nome: 'Respostas', evs: repetir(4, () => [pm(.5), pm(.5), Ac(1, P6(3)), pm(.5), pm(.5), Ac(1, P6(5))]) }] });
  add({ familia: 'power', tecnica: 'Power chords', competencia: 'power', nivel: 3, mao: 'ambas', bpm: { ini: 90, meta: 160 },
    objetivo: 'Praticar o galope com power chords abafados',
    dica: 'Baixo, baixo, cima a cada tempo. O punho faz o trabalho; o braço fica solto.',
    partes: [{ nome: 'Galope em Mi', evs: repetir(8, () => [pm(.5), pm(.25), pm(.25)]) },
      { nome: 'Galope com trocas', evs: [0, 3, 5, 7].flatMap(r => repetir(4, () => [Ac(.5, P6(r), 'pm'), Ac(.25, P6(r), 'pm'), Ac(.25, P6(r), 'pm')])) }] });

  /* ===== 8. Ligados ===== */
  add({ familia: 'ligados', tecnica: 'Hammer-on', competencia: 'ligados', nivel: 1, mao: 'braco', bpm: { ini: 60, meta: 100 },
    objetivo: 'Praticar o hammer-on da casa 5 para a casa 7 em todas as cordas',
    dica: 'Palhete só a primeira nota. O dedo 3 cai como um martelo, rápido e perto do traste.',
    partes: [{ nome: 'Subindo as cordas', evs: [0, 1, 2, 3, 4, 5].flatMap(c => [N(.5, c, 5, 1), N(.5, c, 7, 3, 'h'), N(.5, c, 5, 1), N(.5, c, 7, 3, 'h')]) }] });
  add({ familia: 'ligados', tecnica: 'Pull-off', competencia: 'ligados', nivel: 1, mao: 'braco', bpm: { ini: 60, meta: 100 },
    objetivo: 'Praticar o pull-off da casa 7 para a casa 5 em todas as cordas',
    dica: 'O dedo 1 já fica na casa 5. O dedo 3 sai puxando a corda de leve para baixo, para ela soar.',
    partes: [{ nome: 'Descendo as cordas', evs: [5, 4, 3, 2, 1, 0].flatMap(c => [N(.5, c, 7, 3), N(.5, c, 5, 1, 'p'), N(.5, c, 7, 3), N(.5, c, 5, 1, 'p')]) }] });
  add({ familia: 'ligados', tecnica: 'Ligados', competencia: 'ligados', nivel: 2, mao: 'braco', bpm: { ini: 60, meta: 110 },
    objetivo: 'Praticar trinados (hammer-on e pull-off seguidos) com os dedos 1-2, 1-3 e 1-4',
    dica: 'Só o primeiro ataque é palhetado. Mantenha o volume igual em todas as notas.',
    partes: [[2, 6], [3, 7], [4, 8]].map(([d, k]) => ({ nome: `Dedos 1 e ${d}`,
      evs: [3, 4, 3, 4].flatMap(c => repetir(2, () => [N(.25, c, 5, 1), N(.25, c, k, d, 'h'), N(.25, c, 5, 1, 'p'), N(.25, c, k, d, 'h')])) })) });
  {
    const notas = caixa('penta-menor', 9, 5);
    const porCorda = c => notas.filter(n => n[0] === c);
    const sobe = [], desce = [];
    for (let c = 0; c < 6; c++) porCorda(c).forEach(([cc, k, d], i) => sobe.push(N(1 / 3, cc, k, d, i ? 'h' : '')));
    for (let c = 5; c >= 0; c--) [...porCorda(c)].reverse().forEach(([cc, k, d], i) => desce.push(N(1 / 3, cc, k, d, i ? 'p' : '')));
    add({ familia: 'ligados', tecnica: 'Ligados', competencia: 'ligados', nivel: 3, mao: 'braco', bpm: { ini: 60, meta: 110 },
      objetivo: 'Praticar ligados na pentatônica de Lá, palhetando só a primeira nota de cada corda',
      dica: 'Hammer-on para subir, pull-off para descer. As notas ligadas têm o mesmo volume das palhetadas.', escala: 'penta-menor', raiz: 9,
      partes: [{ nome: 'Subindo com hammer-on', evs: fechar(sobe) }, { nome: 'Descendo com pull-off', evs: fechar(desce) }] });
  }

  /* ===== 9. Bends, slides e vibrato ===== */
  add({ familia: 'expressao', tecnica: 'Slide', competencia: 'expressao', nivel: 1, mao: 'braco', bpm: { ini: 60, meta: 100 },
    objetivo: 'Praticar slides entre as casas 5 e 7 nas cordas Sol e Si',
    dica: 'Palhete a primeira nota e deslize sem tirar a pressão. A segunda nota soa só pelo deslize.',
    partes: [{ nome: 'Subindo com slide', evs: repetir(2, () => [3, 4].flatMap(c => [N(1, c, 5, 3), N(1, c, 7, 3, 's')])) }, { nome: 'Subindo e descendo', evs: repetir(2, () => [3, 4].flatMap(c => [N(.5, c, 5, 3), N(.5, c, 7, 3, 's'), N(.5, c, 7, 3), N(.5, c, 5, 3, 's')])) }] });
  add({ familia: 'expressao', tecnica: 'Vibrato', competencia: 'expressao', nivel: 1, mao: 'braco', bpm: { ini: 60, meta: 80 },
    objetivo: 'Praticar o vibrato em notas longas da pentatônica de Lá',
    dica: 'Balance a corda para cima e para baixo com o punho, num ritmo constante.',
    partes: [{ nome: 'Notas longas', evs: [[4, 5, 1], [4, 8, 4], [5, 5, 1], [5, 8, 4]].map(([c, k, d]) => N(4, c, k, d, 'v')) }] });
  add({ familia: 'expressao', tecnica: 'Bend', competencia: 'expressao', nivel: 2, mao: 'braco', bpm: { ini: 60, meta: 80 },
    objetivo: 'Praticar o bend de um tom, ouvindo antes a nota de chegada',
    dica: 'Toque a nota de chegada, depois puxe a corda até ela soar igual. Use três dedos juntos para empurrar.',
    partes: [{ nome: 'Corda Sol, casa 7', evs: repetir(2, () => [N(1, 3, 9, 3), Pausa(1), N(2, 3, 7, 3, 'b')]) }, { nome: 'Corda Si, casa 8', evs: repetir(2, () => [N(1, 4, 10, 3), Pausa(1), N(2, 4, 8, 3, 'b')]) }] });
  add({ familia: 'expressao', tecnica: 'Bend', competencia: 'expressao', nivel: 3, mao: 'braco', bpm: { ini: 60, meta: 90 },
    objetivo: 'Praticar frases com bend e vibrato na pentatônica de Lá',
    dica: 'Chegue na nota do bend afinado e só então balance com vibrato.', escala: 'penta-menor', raiz: 9,
    partes: [{ nome: 'Frase 1', evs: [N(1, 4, 8, 3, 'b'), N(.5, 4, 5, 1), N(.5, 5, 5, 1), N(1, 4, 8, 3, 'b'), N(1, 4, 5, 1, 'v')] },
      { nome: 'Frase 2', evs: [N(.5, 3, 7, 3), N(.5, 3, 5, 1), N(1, 3, 7, 3, 'b'), N(.5, 2, 7, 3), N(.5, 2, 5, 1), N(1, 3, 5, 1, 'v'), N(4, 2, 7, 3, 'v')] }] });
  add({ familia: 'expressao', tecnica: 'Slide', competencia: 'troca', nivel: 2, mao: 'braco', bpm: { ini: 60, meta: 100 },
    objetivo: 'Praticar a troca de posição deslizando o dedo 1 pela corda Sol',
    dica: 'O polegar acompanha a mão. Olhe para onde vai antes de deslizar.',
    partes: [{ nome: 'Casa 2 até a 12', evs: [2, 4, 5, 7, 9, 10, 12].map((k, i) => N(i ? 1 : 1, 3, k, 1, i ? 's' : '')).concat([Pausa(1)]) }, { nome: 'Casa 12 até a 2', evs: [12, 10, 9, 7, 5, 4, 2].map((k, i) => N(1, 3, k, 1, i ? 's' : '')).concat([Pausa(1)]) }] });

  /* ===== 10. Arpejos ===== */
  const arpejo = (notas, d, compasso = 4) => {
    const asc = [...notas].sort((a, b) => a[0] - b[0]);
    const ida = asc.concat([...asc].reverse().slice(1, -1));
    const q = Math.round(compasso / d);
    return Array.from({ length: q }, (x, i) => { const [c, k, dd] = ida[i % ida.length]; return N(d, c, k, dd); });
  };
  [['Am', 'C'], ['Em', 'G'], ['D', 'A'], ['C', 'G']].forEach(([a, b]) => add({
    familia: 'arpejos', tecnica: 'Arpejo', competencia: 'arpejos', nivel: 1, mao: 'ambas', bpm: { ini: 60, meta: 100 }, acordes: [a, b],
    objetivo: `Praticar o arpejo dos acordes ${a} e ${b}, uma corda de cada vez`,
    dica: 'Monte o acorde inteiro e toque uma corda por vez. Deixe todas soando juntas.',
    partes: [{ nome: `${a} e ${b}`, evs: [a, b, a, b].flatMap(c => arpejo(FORMAS.aberta(c).notas, .5)) }] }));
  [[['G', 3], ['C', 8], ['D', 10], ['G', 3]], [['Am', 5], ['F', 1], ['G', 3], ['Am', 5]]].forEach(seq => {
    const formas = seq.map(([cif, r]) => FORMAS.MOVEIS.find(f => f.cifra === cif && f.id.startsWith('E' + r + '-')));
    if (formas.some(f => !f)) return;
    add({ familia: 'arpejos', tecnica: 'Arpejo', competencia: 'arpejos', nivel: 2, mao: 'ambas', bpm: { ini: 60, meta: 100 }, acordes: seq.map(s => s[0]),
      objetivo: `Praticar arpejos com pestana na forma de Mi: ${seq.map(s => s[0]).join(' – ')}`,
      dica: 'A pestana fica firme; só os dedos que mudam de casa se mexem.',
      partes: [{ nome: seq.map(s => s[0]).join(' – '), evs: formas.flatMap(f => arpejo(f.notas, .5)) }] });
  });
  [['Am', 12, 'menor'], ['A', 12, 'maior']].forEach(([nm, r, tipo]) => {
    const f = { menor: [[1, r, 1], [2, r + 2, 3], [3, r + 2, 4], [4, r + 1, 2], [5, r, 1]], maior: [[1, r, 1], [2, r + 2, 2], [3, r + 2, 3], [4, r + 2, 4], [5, r, 1]] }[tipo];
    const ida = f.concat([[5, r + 5, 4]]), volta = [...ida].reverse().slice(1, -1);
    add({ familia: 'arpejos', tecnica: 'Sweep', competencia: 'arpejos', nivel: 3, mao: 'ambas', bpm: { ini: 50, meta: 100 },
      objetivo: `Praticar o arpejo de ${nm} em cinco cordas (sweep), na casa ${r}`,
      dica: 'A palheta desce num só movimento, como um rasgado lento; cada dedo levanta logo depois de tocar.',
      partes: [{ nome: 'Subindo e descendo', evs: fechar(repetir(4, () => [...ida, ...volta].map(([c, k, d]) => N(1 / 3, c, k, d)))) }] });
  });

  /* número e identidade pública: #0001 em diante, na ordem das famílias e dos níveis */
  const ORDEM = ['preparo', 'dedos', 'palhetada', 'ritmo', 'escalas', 'acordes', 'power', 'ligados', 'expressao', 'arpejos'];
  lista.sort((a, b) => ORDEM.indexOf(a.familia) - ORDEM.indexOf(b.familia) || a.nivel - b.nivel);
  lista.forEach((ex, i) => { ex.num = i + 1; ex.id = String(i + 1).padStart(4, '0'); ex.evs = (ex.partes || []).flatMap(p => p.evs); });

  const porId = id => lista.find(e => e.id === id);
  const rotulo = ex => `#${ex.id} · ${ex.objetivo}`;
  /* duração de uma volta, em segundos, num andamento */
  const segundos = (ex, bpm) => ex.tipo === 'preparo' ? ex.seg : Math.round(total(ex.evs) * 60 / (bpm || ex.bpm.ini));
  /* busca e filtros: texto livre no número, objetivo, técnica e competência */
  const semAcento = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function filtrar({ texto = '', nivel = '', competencia = '', mao = '', familia = '' } = {}) {
    const q = semAcento(texto).replace('#', '').trim();
    return lista.filter(e => (!nivel || e.nivel === +nivel) && (!competencia || e.competencia === competencia) && (!mao || e.mao === mao) && (!familia || e.familia === familia)
      && (!q || semAcento(`${e.id} ${e.objetivo} ${e.tecnica} ${nomeCompetencia(e.competencia)}`).includes(q)));
  }

  /* caminho do iniciante: do primeiro toque às primeiras frases */
  const CAMINHO_REGRAS = [
    e => e.objetivo === 'Preparar a postura para tocar',
    e => e.objetivo === 'Praticar palhetada alternada nas cordas soltas',
    e => e.objetivo === 'Praticar semínimas e colcheias no tempo do metrônomo',
    e => e.familia === 'dedos' && e.nivel === 1,
    e => e.objetivo.startsWith('Praticar palhetada alternada numa nota presa, nas cordas graves'),
    e => e.objetivo === 'Praticar power chords na 6ª corda (Mi, Sol, Lá e Dó)',
    e => e.objetivo === 'Praticar a troca entre os acordes Em e Am',
    e => e.objetivo === 'Praticar a troca entre os acordes C e G',
    e => e.familia === 'escalas' && e.nivel === 1 && e.raiz === 9 && e.escala === 'penta-menor',
    e => e.objetivo.startsWith('Praticar o hammer-on'),
    e => e.objetivo.startsWith('Praticar slides'),
    e => e.objetivo.startsWith('Praticar o vibrato'),
  ];
  const CAMINHO = CAMINHO_REGRAS.map(r => lista.find(r)).filter(Boolean).map(e => e.id);

  return { LISTA: lista, NIVEIS, COMPETENCIAS, MAOS, CAMINHO, porId, rotulo, segundos, filtrar, nomeCompetencia, total, fechar, N, Pausa, Ac };
})();

/* Guitarra Fácil · teoria musical: notas, afinações, intervalos, escalas e acordes.
   Só cálculo, sem tela. As cordas são numeradas de 0 (a mais grossa, 6ª corda) a 5 (a mais fina, 1ª corda). */
'use strict';

const TEORIA = (() => {
  const NOMES = ['Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si'];
  const CIFRAS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const CIFRAS_B = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const NOMES_B = ['Dó', 'Réb', 'Ré', 'Mib', 'Mi', 'Fá', 'Solb', 'Sol', 'Láb', 'Lá', 'Sib', 'Si'];

  /* afinações: nota MIDI de cada corda solta, da 6ª à 1ª */
  const AFINACOES = [
    { id: 'padrao', nome: 'Padrão (Mi Lá Ré Sol Si Mi)', midi: [40, 45, 50, 55, 59, 64] },
    { id: 'meio-tom', nome: 'Meio tom abaixo (Mib)', midi: [39, 44, 49, 54, 58, 63] },
    { id: 'drop-d', nome: 'Drop D (Ré Lá Ré Sol Si Mi)', midi: [38, 45, 50, 55, 59, 64] },
    { id: 'um-tom', nome: 'Um tom abaixo (Ré)', midi: [38, 43, 48, 53, 57, 62] },
  ];
  const afinacao = id => AFINACOES.find(a => a.id === id) || AFINACOES[0];

  const INTERVALOS = [
    { s: 0, sigla: 'T', nome: 'Tônica', cor: 'a mesma nota, o ponto de partida' },
    { s: 1, sigla: '2m', nome: 'Segunda menor', cor: 'meio tom: tensão e suspense' },
    { s: 2, sigla: '2M', nome: 'Segunda maior', cor: 'um tom: o passo da escala' },
    { s: 3, sigla: '3m', nome: 'Terça menor', cor: 'a cor do acorde menor' },
    { s: 4, sigla: '3M', nome: 'Terça maior', cor: 'a cor do acorde maior' },
    { s: 5, sigla: '4J', nome: 'Quarta justa', cor: 'aberta, de hino' },
    { s: 6, sigla: '4A', nome: 'Trítono', cor: 'instável, pede resolução' },
    { s: 7, sigla: '5J', nome: 'Quinta justa', cor: 'firme: a base do power chord' },
    { s: 8, sigla: '6m', nome: 'Sexta menor', cor: 'melancólica' },
    { s: 9, sigla: '6M', nome: 'Sexta maior', cor: 'doce e aberta' },
    { s: 10, sigla: '7m', nome: 'Sétima menor', cor: 'tensão suave, do blues' },
    { s: 11, sigla: '7M', nome: 'Sétima maior', cor: 'sofisticada, quer subir' },
  ];

  const ESCALAS = [
    { id: 'maior', nome: 'Maior', s: [0, 2, 4, 5, 7, 9, 11], sobre: 'Alegre e estável. A base da harmonia.' },
    { id: 'menor', nome: 'Menor natural', s: [0, 2, 3, 5, 7, 8, 10], sobre: 'Triste e escura. Relativa da maior, uma terça menor abaixo.' },
    { id: 'penta-menor', nome: 'Pentatônica menor', s: [0, 3, 5, 7, 10], sobre: 'Cinco notas para riffs, frases e improviso.' },
    { id: 'penta-maior', nome: 'Pentatônica maior', s: [0, 2, 4, 7, 9], sobre: 'Cinco notas para melodias abertas.' },
    { id: 'blues', nome: 'Blues', s: [0, 3, 5, 6, 7, 10], sobre: 'Pentatônica menor com a nota de passagem do blues.' },
    { id: 'menor-harmonica', nome: 'Menor harmônica', s: [0, 2, 3, 5, 7, 8, 11], sobre: 'Som neoclássico, com a sétima maior.' },
    { id: 'dorico', nome: 'Dórico', s: [0, 2, 3, 5, 7, 9, 10], sobre: 'Menor com a sexta maior: um menor com brilho.' },
    { id: 'frigio', nome: 'Frígio', s: [0, 1, 3, 5, 7, 8, 10], sobre: 'Menor com a segunda menor: tenso e escuro.' },
    { id: 'lidio', nome: 'Lídio', s: [0, 2, 4, 6, 7, 9, 11], sobre: 'Maior com a quarta aumentada: som de trilha de filme.' },
    { id: 'mixolidio', nome: 'Mixolídio', s: [0, 2, 4, 5, 7, 9, 10], sobre: 'Maior com a sétima menor: aberto e direto.' },
  ];
  const escala = id => ESCALAS.find(e => e.id === id) || ESCALAS[0];

  /* tipos de acorde: sufixo da cifra, nome em português e intervalos */
  const ACORDES = [
    { id: 'maior', suf: '', nome: 'maior', s: [0, 4, 7], familia: 'maiores' },
    { id: 'menor', suf: 'm', nome: 'menor', s: [0, 3, 7], familia: 'menores' },
    { id: '7', suf: '7', nome: 'com sétima', s: [0, 4, 7, 10], familia: 'setima' },
    { id: 'm7', suf: 'm7', nome: 'menor com sétima', s: [0, 3, 7, 10], familia: 'setima' },
    { id: 'maj7', suf: '7M', nome: 'com sétima maior', s: [0, 4, 7, 11], familia: 'setima' },
    { id: 'sus2', suf: 'sus2', nome: 'suspenso com segunda', s: [0, 2, 7], familia: 'outros' },
    { id: 'sus4', suf: 'sus4', nome: 'suspenso com quarta', s: [0, 5, 7], familia: 'outros' },
    { id: '5', suf: '5', nome: 'power chord', s: [0, 7], familia: 'outros' },
    { id: 'dim', suf: '°', nome: 'diminuto', s: [0, 3, 6], familia: 'outros' },
    { id: 'aum', suf: '+', nome: 'aumentado', s: [0, 4, 8], familia: 'outros' },
    { id: '6', suf: '6', nome: 'com sexta', s: [0, 4, 7, 9], familia: 'outros' },
    { id: 'm6', suf: 'm6', nome: 'menor com sexta', s: [0, 3, 7, 9], familia: 'outros' },
    { id: '9', suf: '9', nome: 'com nona', s: [0, 4, 7, 10, 14], familia: 'outros' },
  ];
  const tipoAcorde = id => ACORDES.find(a => a.id === id) || ACORDES[0];

  const mod = n => ((n % 12) + 12) % 12;
  /* nome de uma classe de nota (0 = Dó), na notação escolhida; bemol quando o contexto pede */
  function nome(pc, { cifra = false, bemol = false } = {}) {
    const i = mod(pc);
    return cifra ? (bemol ? CIFRAS_B : CIFRAS)[i] : (bemol ? NOMES_B : NOMES)[i];
  }
  /* tons que se escrevem com bemol (Fá, Sib, Mib, Láb, Réb e os menores relativos) */
  const usaBemol = (raiz, menor) => (menor ? [2, 7, 0, 5, 10, 3] : [5, 10, 3, 8, 1]).includes(mod(raiz));
  const midiDe = (corda, casa, afin = 'padrao') => afinacao(afin).midi[corda] + casa;
  const pcDe = (corda, casa, afin) => mod(midiDe(corda, casa, afin));
  const oitava = midi => Math.floor(midi / 12) - 1;
  const freq = midi => 440 * Math.pow(2, (midi - 69) / 12);
  const intervalo = s => INTERVALOS[mod(s)];

  /* todas as posições (corda, casa) de um conjunto de classes de nota, entre duas casas */
  function posicoes(pcs, { de = 0, ate = 12, afin = 'padrao' } = {}) {
    const set = new Set(pcs.map(mod)), out = [];
    for (let c = 0; c < 6; c++) for (let k = de; k <= ate; k++) if (set.has(pcDe(c, k, afin))) out.push([c, k]);
    return out;
  }

  /* reconhece o acorde de um conjunto de notas (a mais grave decide a inversão) */
  function reconhecer(midis) {
    const pcs = [...new Set(midis.map(mod))];
    if (pcs.length < 2) return null;
    const grave = mod(Math.min(...midis));
    const candidatos = [];
    for (const r of pcs) for (const t of ACORDES) {
      const alvo = [...new Set(t.s.map(x => mod(r + x)))];
      // em acordes de quatro notas ou mais, a quinta pode ficar de fora
      const semQuinta = alvo.length >= 4 ? alvo.filter(x => x !== mod(r + 7)) : null;
      const bate = a => a && a.length === pcs.length && a.every(x => pcs.includes(x));
      if (bate(alvo) || bate(semQuinta)) candidatos.push({ raiz: r, tipo: t, inversao: r !== grave, completo: bate(alvo) });
    }
    if (!candidatos.length) return null;
    candidatos.sort((a, b) => b.completo - a.completo || a.inversao - b.inversao);
    const c = candidatos[0];
    return { ...c, baixo: grave };
  }
  const cifraAcorde = (raiz, tipoId, baixo = null) => {
    const t = tipoAcorde(tipoId), bem = usaBemol(raiz, t.id === 'menor' || t.id === 'm7');
    return nome(raiz, { cifra: true, bemol: bem }) + t.suf + (baixo != null && mod(baixo) !== mod(raiz) ? '/' + nome(baixo, { cifra: true, bemol: bem }) : '');
  };

  /* campo harmônico da escala maior ou menor natural: graus, acordes e funções */
  function campo(raiz, menor = false) {
    const s = menor ? escala('menor').s : escala('maior').s;
    const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    return s.map((x, i) => {
      const t = mod(s[(i + 2) % 7] - x), q = mod(s[(i + 4) % 7] - x);
      const tipo = t === 4 && q === 7 ? 'maior' : t === 3 && q === 7 ? 'menor' : 'dim';
      const grau = tipo === 'maior' ? ROMANOS[i] : tipo === 'menor' ? ROMANOS[i].toLowerCase() : ROMANOS[i].toLowerCase() + '°';
      return { grau, raiz: mod(raiz + x), tipo };
    });
  }

  return { NOMES, CIFRAS, AFINACOES, INTERVALOS, ESCALAS, ACORDES, afinacao, escala, tipoAcorde, nome, usaBemol, mod,
    midiDe, pcDe, oitava, freq, intervalo, posicoes, reconhecer, cifraAcorde, campo };
})();

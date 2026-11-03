/* Guitarra Fácil · motor de teoria musical e os desenhos (SVG) do braço, do círculo das quintas e das figuras.
   Tudo calculado aqui: escalas, acordes, intervalos e campo harmônico em qualquer tom. */
'use strict';
const NOTAS = ['Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si'];
const CIFRA = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CIFRA_B = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const SOLTAS = [4, 9, 2, 7, 11, 4]; // 6ª a 1ª corda: Mi, Lá, Ré, Sol, Si, Mi
const MIDI_SOLTAS = [40, 45, 50, 55, 59, 64]; // Mi2, Lá2, Ré3, Sol3, Si3, Mi4
const GRAUS = ['T', '2m', '2M', '3m', '3M', '4J', '4A', '5J', '6m', '6M', '7m', '7M'];
const INTERVALOS = [
  [0, 'Uníssono', 'a mesma nota'], [1, 'Segunda menor', 'meio tom: tensão, suspense'], [2, 'Segunda maior', 'um tom: o passo da escala'],
  [3, 'Terça menor', 'a cor do acorde menor'], [4, 'Terça maior', 'a cor do acorde maior'], [5, 'Quarta justa', 'abertura, hinos'],
  [6, 'Trítono', 'instável, pede resolução'], [7, 'Quinta justa', 'o power chord'], [8, 'Sexta menor', 'melancólica'],
  [9, 'Sexta maior', 'doce, aberta'], [10, 'Sétima menor', 'tensão suave e acordes com 7'], [11, 'Sétima maior', 'aberta e sofisticada'], [12, 'Oitava', 'a mesma nota mais aguda'],
];
const ESCALAS = [
  ['maior', 'Maior (jônio)', [0, 2, 4, 5, 7, 9, 11], 'Alegre. A base de toda a harmonia.'],
  ['menor', 'Menor natural (eólio)', [0, 2, 3, 5, 7, 8, 10], 'Triste. Relativa da maior, uma terça menor abaixo.'],
  ['penta-menor', 'Pentatônica menor', [0, 3, 5, 7, 10], 'Cinco notas para frases, riffs e improvisação.'],
  ['penta-maior', 'Pentatônica maior', [0, 2, 4, 7, 9], 'Cinco notas para melodias abertas e improvisação.'],
  ['blues', 'Escala de blues', [0, 3, 5, 6, 7, 10], 'Pentatônica menor com a blue note.'],
  ['menor-harmonica', 'Menor harmônica', [0, 2, 3, 5, 7, 8, 11], 'Som neoclássico e flamenco.'],
  ['dorico', 'Dórico', [0, 2, 3, 5, 7, 9, 10], 'Menor com a 6ª maior: brilho dentro de uma sonoridade menor.'],
  ['frigio', 'Frígio', [0, 1, 3, 5, 7, 8, 10], 'Menor com a 2ª menor: tensão imediata e caráter escuro.'],
  ['lidio', 'Lídio', [0, 2, 4, 6, 7, 9, 11], 'Maior com a 4ª aumentada: trilhas de filme.'],
  ['mixolidio', 'Mixolídio', [0, 2, 4, 5, 7, 9, 10], 'Maior com a 7ª menor: aberto, direto e com tensão suave.'],
  ['locrio', 'Lócrio', [0, 1, 3, 5, 6, 8, 10], 'O mais instável dos modos.'],
  ['menor-melodica', 'Menor melódica', [0, 2, 3, 5, 7, 9, 11], 'Menor com a 6ª e a 7ª maiores: tensão sofisticada.'],
  ['frigio-dominante', 'Frígio dominante', [0, 1, 4, 5, 7, 8, 10], 'Quinto modo da menor harmônica: forte contraste entre a 2ª menor e a 3ª maior.'],
  ['hungara-menor', 'Húngara menor', [0, 2, 3, 6, 7, 8, 11], 'Menor harmônica com a 4ª aumentada: exótica.'],
  ['alterada', 'Alterada', [0, 1, 3, 4, 6, 8, 10], 'Todas as tensões do acorde dominante: máxima instabilidade antes da resolução.'],
  ['bebop-dominante', 'Bebop dominante', [0, 2, 4, 5, 7, 9, 10, 11], 'Mixolídio com a 7ª maior de passagem.'],
  ['diminuta', 'Diminuta (tom e semitom)', [0, 2, 3, 5, 6, 8, 9, 11], 'Simétrica, de oito notas: tensão e suspense.'],
  ['tons-inteiros', 'Tons inteiros', [0, 2, 4, 6, 8, 10], 'Só tons inteiros: som de sonho.'],
  ['cromatica', 'Cromática', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 'As doze notas.'],
];
const TIPOS_ACORDE = [
  ['', 'Maior', [0, 4, 7]], ['m', 'Menor', [0, 3, 7]], ['5', 'Power chord', [0, 7]], ['7', 'Com sétima', [0, 4, 7, 10]],
  ['7M', 'Com sétima maior', [0, 4, 7, 11]], ['m7', 'Menor com sétima', [0, 3, 7, 10]], ['sus2', 'Suspenso com 2ª', [0, 2, 7]],
  ['sus4', 'Suspenso com 4ª', [0, 5, 7]], ['°', 'Diminuto', [0, 3, 6]], ['m7(b5)', 'Meio diminuto', [0, 3, 6, 10]],
  ['+', 'Aumentado', [0, 4, 8]], ['°7', 'Diminuto com sétima', [0, 3, 6, 9]], ['m(7M)', 'Menor com sétima maior', [0, 3, 7, 11]],
  ['6', 'Com sexta', [0, 4, 7, 9]], ['9', 'Com nona', [0, 4, 7, 10, 14]],
];
const pc = n => ((n % 12) + 12) % 12;
const notasEscala = (raiz, id) => (ESCALAS.find(e => e[0] === id) || ESCALAS[0])[2].map(i => pc(raiz + i));
const notasAcorde = (raiz, tipo) => (TIPOS_ACORDE.find(t => t[0] === tipo) || TIPOS_ACORDE[0])[2].map(i => pc(raiz + i));
const grauDe = (raiz, n) => GRAUS[pc(n - raiz)];
const nomeAcorde = (raiz, tipo) => CIFRA[raiz] + tipo;
// campo harmônico da escala maior: tríades e tétrades de cada grau
function grafarPorLetra(n, letra) {
  const naturais = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let d = pc(n - naturais[letra]); if (d > 6) d -= 12;
  return letra + (d < 0 ? 'b'.repeat(-d) : '#'.repeat(d));
}
const TOM_CIRCULO = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
const tomCirculo = n => TOM_CIRCULO[CIRCULO.indexOf(n)];
const nomePorExtenso = cifra => ({ C: 'Dó', D: 'Ré', E: 'Mi', F: 'Fá', G: 'Sol', A: 'Lá', B: 'Si' })[cifra[0]] + cifra.slice(1).replaceAll('#', ' sustenido').replaceAll('b', ' bemol');
function campoHarmonico(raiz, nome = CIFRA[raiz]) {
  const esc = notasEscala(raiz, 'maior'), ROM = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  const tri = ['', 'm', 'm', '', '', 'm', '°'], tet = ['7M', 'm7', 'm7', '7M', '7', 'm7', 'm7(b5)'];
  const fun = ['tônica', 'subdominante', 'tônica', 'subdominante', 'dominante', 'tônica', 'dominante'];
  const letras = 'CDEFGAB', inicio = letras.indexOf(nome[0]);
  return esc.map((n, i) => ({ grau: ROM[i], triade: grafarPorLetra(n, letras[(inicio + i) % 7]) + tri[i], tetrade: grafarPorLetra(n, letras[(inicio + i) % 7]) + tet[i], funcao: fun[i], raiz: n, tipo: tri[i] }));
}
const relativaMenor = raiz => pc(raiz + 9);
const CIRCULO = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]; // Dó, Sol, Ré... (cada passo uma quinta)
const ACIDENTES = ['', '1#', '2#', '3#', '4#', '5#', '6#', '5b', '4b', '3b', '2b', '1b'];
const midiDe = (corda, casa) => MIDI_SOLTAS[corda] + casa;
const hzDeMidi = m => 440 * Math.pow(2, (m - 69) / 12);

/* braço com notas marcadas. o = { notas: [pcs], raiz, rotulo: 'nota'|'grau', casas, ini, desenho: [c0,c1] } */
function bracoMarcado(o) {
  const ini = o.ini || 0, fim = o.casas || 15, C = fim - ini + 1, L = 44, A = 26;
  const x = k => 30 + (k - ini) * L, y = c => 20 + (5 - c) * A, larg = x(fim + 1) + 6;
  const set = new Set(o.notas), [d0, d1] = o.desenho || [-1, -1];
  let s = `<svg class="braco" viewBox="0 0 ${larg} ${y(0) + 34}" role="group" aria-label="${esc(o.titulo || 'Notas no braço')}">`;
  s += `<rect x="${x(ini)}" y="${y(5) - 11}" width="${x(fim + 1) - x(ini)}" height="${y(0) - y(5) + 22}" rx="4" fill="var(--kf-surface-2)"/>`;
  if (d0 >= 0) s += `<rect x="${x(Math.max(ini, d0)) - (d0 === 0 ? 14 : 0)}" y="${y(5) - 11}" width="${x(d1 + 1) - x(Math.max(ini, d0)) + (d0 === 0 ? 14 : 0)}" height="${y(0) - y(5) + 22}" rx="6" fill="var(--kf-accent-soft)"/>`;
  for (let k = ini; k <= fim + 1; k++) s += `<line x1="${x(k)}" y1="${y(5) - 11}" x2="${x(k)}" y2="${y(0) + 11}" stroke="var(--kf-line-2)" stroke-width="${k === 0 ? 5 : 1.5}"/>`;
  for (let k = Math.max(1, ini); k <= fim; k++) {
    if ([3, 5, 7, 9, 15, 17].includes(k)) s += `<circle cx="${x(k) + L / 2}" cy="${y(0) + 24}" r="3" fill="var(--kf-muted)"/>`;
    if (k === 12) s += `<circle cx="${x(k) + L / 2 - 6}" cy="${y(0) + 24}" r="3" fill="var(--kf-muted)"/><circle cx="${x(k) + L / 2 + 6}" cy="${y(0) + 24}" r="3" fill="var(--kf-muted)"/>`;
    s += `<text x="${x(k) + L / 2}" y="${y(5) - 15}" text-anchor="middle" class="casa-n">${k}</text>`;
  }
  for (let c = 0; c < 6; c++) s += `<line x1="${x(ini)}" y1="${y(c)}" x2="${x(fim + 1)}" y2="${y(c)}" stroke="var(--kf-muted)" stroke-width="${1 + (5 - c) * .25}"/>`;
  for (let c = 0; c < 6; c++) for (let k = ini; k <= fim; k++) {
    const n = pc(SOLTAS[c] + k); if (!set.has(n)) continue;
    const raiz = n === o.raiz, cx = k === 0 ? x(0) - 14 : x(k) + L / 2, fora = d0 >= 0 && (k < d0 || k > d1);
    const rot = o.rotulo === 'grau' ? grauDe(o.raiz, n) : CIFRA[n];
    s += `<g class="nota${raiz ? ' raiz' : ''}${fora ? ' fora' : ''}" data-nota="${c},${k}" role="button" tabindex="0" aria-label="${NOTAS[n]}${raiz ? ' (tônica)' : ''}, ${6 - c}ª corda, ${k ? 'casa ' + k : 'solta'}"><circle cx="${cx}" cy="${y(c)}" r="11"/><text x="${cx}" y="${y(c) + 4}" text-anchor="middle">${rot}</text></g>`;
  }
  return s + '</svg>';
}
// os cinco desenhos (posições) da pentatônica: casas inicial e final de cada um, a partir da tônica na 6ª corda
function desenhosPenta(raiz) {
  const t = pc(raiz - 4); // casa da tônica na 6ª corda (0 a 11)
  const base = [[0, 3], [2, 5], [4, 8], [7, 10], [9, 12]];
  return base.map(([a, b]) => { let i = t + a, f = t + b; if (f > 17) { i -= 12; f -= 12; } if (i < 0) { i += 12; f += 12; } return [i, f]; });
}
/* círculo das quintas: maiores por fora, relativas menores por dentro */
function circuloSVG(sel) {
  const cx = 160, cy = 160;
  let s = `<svg class="circulo" viewBox="0 0 320 320" role="group" aria-label="Círculo das quintas">`;
  s += `<circle cx="${cx}" cy="${cy}" r="150" fill="var(--kf-surface-2)"/><circle cx="${cx}" cy="${cy}" r="98" fill="var(--kf-surface)"/><circle cx="${cx}" cy="${cy}" r="56" fill="var(--kf-surface-2)"/>`;
  CIRCULO.forEach((n, i) => {
    const maior = TOM_CIRCULO[i], letras = 'CDEFGAB', menor = grafarPorLetra(relativaMenor(n), letras[(letras.indexOf(maior[0]) + 5) % 7]);
    const a = (i * 30 - 90) * Math.PI / 180, on = n === sel;
    const xo = cx + 124 * Math.cos(a), yo = cy + 124 * Math.sin(a), xi = cx + 77 * Math.cos(a), yi = cy + 77 * Math.sin(a);
    s += `<g class="tom${on ? ' on' : ''}" data-tom="${n}" role="button" tabindex="0" aria-label="${nomePorExtenso(maior)} maior, relativa ${nomePorExtenso(menor)} menor, ${ACIDENTES[i] || 'sem acidentes'}" aria-pressed="${on}">`
      + `<circle cx="${xo}" cy="${yo}" r="22"/><text x="${xo}" y="${yo + 5}" text-anchor="middle" class="tom-M">${maior}</text>`
      + `<text x="${xi}" y="${yi + 4}" text-anchor="middle" class="tom-m">${menor}m</text></g>`;
  });
  const i = CIRCULO.indexOf(sel);
  s += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" class="tom-c">${tomCirculo(sel)}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" class="tom-a">${ACIDENTES[i] || 'sem acidentes'}</text>`;
  return s + '</svg>';
}
/* figuras rítmicas: desenho, nome e duração */
const FIGURAS = [['Semibreve', 4], ['Mínima', 2], ['Semínima', 1], ['Colcheia', .5], ['Semicolcheia', .25]];
function figuraSVG(tempos) {
  const cabeca = tempos >= 2 ? '<ellipse cx="18" cy="40" rx="9" ry="6.5" transform="rotate(-20 18 40)" fill="none" stroke="currentColor" stroke-width="2.5"/>' : '<ellipse cx="18" cy="40" rx="9" ry="6.5" transform="rotate(-20 18 40)" fill="currentColor"/>';
  const haste = tempos < 4 ? '<line x1="26" y1="38" x2="26" y2="6" stroke="currentColor" stroke-width="2.4"/>' : '';
  const band = tempos <= .5 ? '<path d="M26 6c2 8 12 10 10 22" fill="none" stroke="currentColor" stroke-width="2.4"/>' : '';
  const band2 = tempos <= .25 ? '<path d="M26 15c2 8 12 10 10 22" fill="none" stroke="currentColor" stroke-width="2.4"/>' : '';
  return `<svg viewBox="0 0 44 52" aria-hidden="true" class="figura">${cabeca}${haste}${band}${band2}</svg>`;
}

/* ================= afinações ================= */
// [id, nome, cordas soltas da mais grave para a mais aguda (MIDI), família]: '6' padrão, '6d' drop, '7' e '7d' sete cordas
const AFINACOES = [
  ['padrao', 'Padrão (Mi)', [40, 45, 50, 55, 59, 64], '6'],
  ['meio', 'Meio tom abaixo (Mi♭)', [39, 44, 49, 54, 58, 63], '6'],
  ['tom', 'Um tom abaixo (Ré)', [38, 43, 48, 53, 57, 62], '6'],
  ['drop-d', 'Drop D', [38, 45, 50, 55, 59, 64], '6d'],
  ['drop-cs', 'Drop C#', [37, 44, 49, 54, 58, 63], '6d'],
  ['drop-c', 'Drop C', [36, 43, 48, 53, 57, 62], '6d'],
  ['drop-b', 'Drop B', [35, 42, 47, 52, 56, 61], '6d'],
  ['sete', '7 cordas (Si)', [35, 40, 45, 50, 55, 59, 64], '7'],
  ['sete-drop-a', '7 cordas Drop A', [33, 40, 45, 50, 55, 59, 64], '7d'],
];
const afinacaoDe = id => AFINACOES.find(a => a[0] === id) || AFINACOES[0];
const nomeCorda = m => CIFRA[pc(m)];
// as afinações em que um treino pode ser tocado: as de 6 cordas servem para treinos de 6; as de 7, para 6 e 7
const afinacoesPara = id => { const n = afinacaoDe(id)[2].length; return AFINACOES.filter(a => a[2].length >= n); };
/* leva as notas de uma afinação para outra mantendo a forma da corda mais grave (o riff fica no mesmo desenho e muda
   de tom junto com a afinação, como se faz na guitarra). As outras cordas acompanham pela altura: um power chord de um
   dedo em Drop D vira 0-2-2 na afinação padrão. Em 7 cordas, um treino de 6 cordas vai para as 6 de cima. */
function converterAfinacao(evs, de, para) {
  if (de === para) return evs;
  const A = afinacaoDe(de)[2], B = afinacaoDe(para)[2], d = B.length - A.length; // 0 ou 1
  const ref = d ? B[1] - A[0] : B[0] - A[0];
  return evs.map(e => ({ ...e, n: e.n.map(([s, k, f]) => {
    const alvo = A[s] + k + ref, s2 = s + d; let k2 = alvo - B[s2];
    if (k2 > 24 && k2 - 12 >= 0) k2 -= 12; // passou do fim do braço: uma oitava abaixo
    if (k2 >= 0 && k2 <= 24) return [s2, k2, f];
    let melhor = [s2, Math.max(0, k2)], dist = 1e9; // não coube na mesma corda: a corda mais perto onde a nota cabe
    B.forEach((m, c) => { const kk = alvo - m; if (kk >= 0 && kk <= 22 && Math.abs(c - s2) < dist) { dist = Math.abs(c - s2); melhor = [c, kk]; } });
    return [melhor[0], melhor[1], f];
  }) }));
}

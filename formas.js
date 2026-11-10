/* Guitarra Fácil · formas de acorde: abertas (escritas à mão) e móveis (forma de Mi, na 6ª corda, e forma de Lá, na 5ª),
   em todas as casas. Nota: [corda, casa, dedo]; corda 0 é a 6ª. Corda que não aparece não é tocada. */
'use strict';

const FORMAS = (() => {
  const so = (...n) => n.map(([c, k, d]) => [c, k, d ?? null]);
  const ABERTAS = [
    ['C', 0, 'maior', so([1, 3, 3], [2, 2, 2], [3, 0], [4, 1, 1], [5, 0])],
    ['D', 2, 'maior', so([2, 0], [3, 2, 1], [4, 3, 3], [5, 2, 2])],
    ['E', 4, 'maior', so([0, 0], [1, 2, 2], [2, 2, 3], [3, 1, 1], [4, 0], [5, 0])],
    ['G', 7, 'maior', so([0, 3, 2], [1, 2, 1], [2, 0], [3, 0], [4, 0], [5, 3, 3])],
    ['A', 9, 'maior', so([1, 0], [2, 2, 1], [3, 2, 2], [4, 2, 3], [5, 0])],
    ['Am', 9, 'menor', so([1, 0], [2, 2, 2], [3, 2, 3], [4, 1, 1], [5, 0])],
    ['Dm', 2, 'menor', so([2, 0], [3, 2, 2], [4, 3, 3], [5, 1, 1])],
    ['Em', 4, 'menor', so([0, 0], [1, 2, 2], [2, 2, 3], [3, 0], [4, 0], [5, 0])],
    ['E7', 4, '7', so([0, 0], [1, 2, 2], [2, 0], [3, 1, 1], [4, 0], [5, 0])],
    ['A7', 9, '7', so([1, 0], [2, 2, 2], [3, 0], [4, 2, 3], [5, 0])],
    ['D7', 2, '7', so([2, 0], [3, 2, 2], [4, 1, 1], [5, 2, 3])],
    ['G7', 7, '7', so([0, 3, 3], [1, 2, 2], [2, 0], [3, 0], [4, 0], [5, 1, 1])],
    ['C7', 0, '7', so([1, 3, 3], [2, 2, 2], [3, 3, 4], [4, 1, 1], [5, 0])],
    ['B7', 11, '7', so([1, 2, 2], [2, 1, 1], [3, 2, 3], [4, 0], [5, 2, 4])],
    ['Am7', 9, 'm7', so([1, 0], [2, 2, 2], [3, 0], [4, 1, 1], [5, 0])],
    ['Em7', 4, 'm7', so([0, 0], [1, 2, 2], [2, 0], [3, 0], [4, 0], [5, 0])],
    ['Dm7', 2, 'm7', so([2, 0], [3, 2, 2], [4, 1, 1], [5, 1, 1])],
    ['C7M', 0, 'maj7', so([1, 3, 3], [2, 2, 2], [3, 0], [4, 0], [5, 0])],
    ['F7M', 5, 'maj7', so([2, 3, 3], [3, 2, 2], [4, 1, 1], [5, 0])],
    ['A7M', 9, 'maj7', so([1, 0], [2, 2, 2], [3, 1, 1], [4, 2, 3], [5, 0])],
    ['D7M', 2, 'maj7', so([2, 0], [3, 2, 1], [4, 2, 2], [5, 2, 3])],
    ['Asus2', 9, 'sus2', so([1, 0], [2, 2, 1], [3, 2, 2], [4, 0], [5, 0])],
    ['Asus4', 9, 'sus4', so([1, 0], [2, 2, 1], [3, 2, 2], [4, 3, 3], [5, 0])],
    ['Dsus2', 2, 'sus2', so([2, 0], [3, 2, 1], [4, 3, 3], [5, 0])],
    ['Dsus4', 2, 'sus4', so([2, 0], [3, 2, 1], [4, 3, 3], [5, 3, 4])],
    ['Esus4', 4, 'sus4', so([0, 0], [1, 2, 2], [2, 2, 3], [3, 2, 4], [4, 0], [5, 0])],
    ['E5', 4, '5', so([0, 0], [1, 2, 1], [2, 2, 2])],
    ['A5', 9, '5', so([1, 0], [2, 2, 1], [3, 2, 2])],
    ['D5', 2, '5', so([2, 0], [3, 2, 1], [4, 3, 3])],
  ].map(([cifra, raiz, tipo, notas]) => ({ id: 'ab-' + cifra.replace('#', 's'), cifra, raiz, tipo, notas, forma: 'Aberta', pestana: null }));

  /* formas móveis: casas relativas à casa da tônica (r) */
  const MOVEIS = {
    E: { corda: 0, base: 4, nome: 'Forma de Mi', tipos: {
      maior: [[0, 0, 1], [1, 2, 3], [2, 2, 4], [3, 1, 2], [4, 0, 1], [5, 0, 1]],
      menor: [[0, 0, 1], [1, 2, 3], [2, 2, 4], [3, 0, 1], [4, 0, 1], [5, 0, 1]],
      7: [[0, 0, 1], [1, 2, 3], [2, 0, 1], [3, 1, 2], [4, 0, 1], [5, 0, 1]],
      m7: [[0, 0, 1], [1, 2, 3], [2, 0, 1], [3, 0, 1], [4, 0, 1], [5, 0, 1]],
      sus4: [[0, 0, 1], [1, 2, 2], [2, 2, 3], [3, 2, 4], [4, 0, 1], [5, 0, 1]],
      5: [[0, 0, 1], [1, 2, 3]],
    } },
    A: { corda: 1, base: 9, nome: 'Forma de Lá', tipos: {
      maior: [[1, 0, 1], [2, 2, 2], [3, 2, 3], [4, 2, 4], [5, 0, 1]],
      menor: [[1, 0, 1], [2, 2, 3], [3, 2, 4], [4, 1, 2], [5, 0, 1]],
      7: [[1, 0, 1], [2, 2, 3], [3, 0, 1], [4, 2, 4], [5, 0, 1]],
      m7: [[1, 0, 1], [2, 2, 3], [3, 0, 1], [4, 1, 2], [5, 0, 1]],
      maj7: [[1, 0, 1], [2, 2, 3], [3, 1, 2], [4, 2, 4], [5, 0, 1]],
      5: [[1, 0, 1], [2, 2, 3]],
    } },
  };
  const moveis = [];
  for (const [f, m] of Object.entries(MOVEIS)) for (const [tipo, rel] of Object.entries(m.tipos)) for (let r = 1; r <= 11; r++) {
    const raiz = TEORIA.mod(m.base + r), cifra = TEORIA.cifraAcorde(raiz, tipo);
    const pest = rel.length > 2 ? { k: r, de: m.corda, ate: 5 } : null;
    moveis.push({ id: `${f}${r}-${tipo}`, cifra, raiz, tipo, notas: rel.map(([c, k, d]) => [c, r + k, d]), forma: `${m.nome}, casa ${r}`, pestana: pest });
  }
  const TODAS = [...ABERTAS, ...moveis];
  const porId = id => TODAS.find(f => f.id === id);
  const aberta = cifra => ABERTAS.find(f => f.cifra === cifra);
  /* a forma mais à mão de um acorde: a aberta, se houver; senão a móvel na casa mais baixa */
  function melhor(raiz, tipo) {
    const ab = ABERTAS.find(f => f.raiz === TEORIA.mod(raiz) && f.tipo === tipo);
    if (ab) return ab;
    return moveis.filter(f => f.raiz === TEORIA.mod(raiz) && f.tipo === tipo).sort((a, b) => Math.min(...a.notas.map(n => n[1])) - Math.min(...b.notas.map(n => n[1])))[0] || null;
  }
  return { ABERTAS, MOVEIS: moveis, TODAS, porId, aberta, melhor };
})();

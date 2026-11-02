/* Guitarra Fácil · biblioteca musical (Documento Mestre, seção 11; decisão 1A do Bruno): trechos para aplicar a
   técnica, organizados por obra, autor, estilo, técnica, dificuldade e competência, com recomendação pela competência
   da vez. Só entram obras em domínio público (compostas antes de 1929, ou tradicionais) e riffs originais do app,
   escritos à mão "no jeito" de cada estilo. Nunca trechos de músicas protegidas por direitos autorais: esses, a pessoa
   escreve no Estúdio para uso pessoal (decisão 1C).
   Notas: [corda, casa, dedo]; corda 0 é a mais grossa. Dedo null: o app escolhe. Todos os trechos em afinação padrão. */
'use strict';
const OBRAS = (() => {
  const n = (d, c, k, t = '') => ({ d, n: [[c, k, null]], t }), z = d => ({ d, n: [], t: '' }), ac = (d, notas, t = '') => ({ d, n: notas.map(([c, k, f]) => [c, k, f == null ? null : f]), t });
  const rep = (q, f) => Array.from({ length: q }, (_, i) => f(i)).flat();
  const PC = { E5: [[0, 0, 0], [1, 2, 1]], F5: [[0, 1, 1], [1, 3, 3]], G5: [[0, 3, 1], [1, 5, 3]], A5: [[0, 5, 1], [1, 7, 3]], Bb5: [[0, 6, 1], [1, 8, 3]], B5: [[0, 7, 1], [1, 9, 3]], C5: [[0, 8, 1], [1, 10, 3]] };
  const gal = (c = 0, k = 0) => [n(.5, c, k, 'pm'), n(.25, c, k, 'pm'), n(.25, c, k, 'pm')];
  const E = (d = .25) => n(d, 0, 0, 'pm');
  return [
    // ===== domínio público =====
    { id: 'grieg-montanha', nome: 'Na gruta do rei da montanha', autor: 'Edvard Grieg', ano: 1875, origem: 'dominio', nivel: 2, bpm: 90, alvo: 140, raiz: 9, escala: 'menor', compasso: [4, 1],
      sobre: 'O tema que acelera até o caos. Em Lá menor, na quinta posição: troca de corda limpa e cromatismo.',
      evs: [n(.5, 2, 7), n(.5, 3, 4), n(.5, 3, 5), n(.5, 3, 7), n(.5, 4, 5), n(.5, 3, 5), n(1, 4, 5),
        n(.5, 4, 4), n(.5, 3, 4), n(1, 4, 4), n(.5, 3, 7), n(.5, 3, 3), n(1, 3, 7),
        n(.5, 2, 7), n(.5, 3, 4), n(.5, 3, 5), n(.5, 3, 7), n(.5, 4, 5), n(.5, 3, 5), n(.5, 4, 5), n(.5, 5, 5),
        n(.5, 5, 3), n(.5, 4, 5), n(.5, 3, 5), n(.5, 4, 5), n(2, 5, 3, 'v')] },
    { id: 'beethoven-elise', nome: 'Para Elisa (tema)', autor: 'Ludwig van Beethoven', ano: 1810, origem: 'dominio', nivel: 2, bpm: 60, alvo: 84, raiz: 9, escala: 'menor-harmonica', compasso: [3, .5],
      sobre: 'Semicolcheias que balançam entre duas notas vizinhas e arpejos de Lá menor e Mi maior. Ótimo para a mão esquerda.',
      evs: [z(1), n(.25, 5, 12), n(.25, 5, 11),
        n(.25, 5, 12), n(.25, 5, 11), n(.25, 5, 12), n(.25, 4, 12), n(.25, 5, 10), n(.25, 5, 8),
        n(.5, 4, 10), z(.25), n(.25, 2, 10), n(.25, 3, 9), n(.25, 4, 10),
        n(.5, 4, 12), z(.25), n(.25, 3, 9), n(.25, 4, 9), n(.25, 4, 12),
        n(.5, 5, 8), z(.25), n(.25, 3, 9), n(.25, 5, 12), n(.25, 5, 11),
        n(.25, 5, 12), n(.25, 5, 11), n(.25, 5, 12), n(.25, 4, 12), n(.25, 5, 10), n(.25, 5, 8),
        n(.5, 4, 10), z(.25), n(.25, 2, 10), n(.25, 3, 9), n(.25, 4, 10),
        n(.5, 4, 12), z(.25), n(.25, 3, 9), n(.25, 5, 8), n(.25, 4, 12),
        n(1.5, 4, 10, 'v')] },
    { id: 'beethoven-alegria', nome: 'Ode à alegria', autor: 'Ludwig van Beethoven', ano: 1824, origem: 'dominio', nivel: 1, bpm: 80, alvo: 110, raiz: 0, escala: 'maior', compasso: [4, 1],
      sobre: 'A melodia da Nona Sinfonia, nas duas cordas mais finas, quase sem sair do lugar. Boa primeira música.',
      evs: [n(1, 5, 0), n(1, 5, 0), n(1, 5, 1), n(1, 5, 3), n(1, 5, 3), n(1, 5, 1), n(1, 5, 0), n(1, 4, 3),
        n(1, 4, 1), n(1, 4, 1), n(1, 4, 3), n(1, 5, 0), n(1.5, 5, 0), n(.5, 4, 3), n(2, 4, 3),
        n(1, 5, 0), n(1, 5, 0), n(1, 5, 1), n(1, 5, 3), n(1, 5, 3), n(1, 5, 1), n(1, 5, 0), n(1, 4, 3),
        n(1, 4, 1), n(1, 4, 1), n(1, 4, 3), n(1, 5, 0), n(1.5, 4, 3), n(.5, 4, 1), n(2, 4, 1)] },
    { id: 'bach-minueto', nome: 'Minueto em Sol', autor: 'Christian Petzold (atribuído a J. S. Bach)', ano: 1725, origem: 'dominio', nivel: 2, bpm: 90, alvo: 120, raiz: 7, escala: 'maior', compasso: [3, 1],
      sobre: 'Do Caderno de Anna Magdalena Bach. Em 3/4, pela primeira corda: troca de posição com as colcheias no lugar.',
      evs: [n(1, 5, 10), n(.5, 4, 8), n(.5, 4, 10), n(.5, 5, 7), n(.5, 5, 8),
        n(1, 5, 10), n(1, 4, 8), n(1, 4, 8),
        n(1, 5, 12), n(.5, 5, 8), n(.5, 5, 10), n(.5, 5, 12), n(.5, 5, 14),
        n(1, 5, 15), n(1, 4, 8), n(1, 4, 8),
        n(1, 5, 8), n(.5, 5, 10), n(.5, 5, 8), n(.5, 5, 7), n(.5, 4, 10),
        n(1, 5, 7), n(.5, 5, 8), n(.5, 5, 7), n(.5, 4, 10), n(.5, 4, 8),
        n(1, 4, 7), n(.5, 4, 8), n(.5, 4, 10), n(.5, 5, 7), n(.5, 4, 8),
        n(3, 4, 10, 'v')] },
    { id: 'bach-tocata', nome: 'Tocata e fuga em Ré menor (abertura)', autor: 'Johann Sebastian Bach', ano: 1708, origem: 'dominio', nivel: 1, bpm: 60, alvo: 90, raiz: 2, escala: 'menor-harmonica', compasso: [4, 1],
      sobre: 'O motivo do órgão, em duas oitavas. O mordente vira ligado para baixo e para cima; as notas longas pedem vibrato.',
      evs: [n(.25, 5, 5), n(.25, 5, 3, 'p'), n(2.5, 5, 5, 'h v'), z(1),
        n(.25, 5, 3), n(.25, 5, 1), n(.25, 5, 0), n(.25, 4, 3), n(1, 4, 2), n(2, 4, 3, 'v'),
        n(.25, 3, 2), n(.25, 3, 0, 'p'), n(2.5, 3, 2, 'h v'), z(1),
        n(.25, 3, 0), n(.25, 2, 3), n(.25, 2, 2), n(.25, 2, 0), n(1, 1, 4), n(2, 2, 0, 'v')] },
    { id: 'greensleeves', nome: 'Greensleeves', autor: 'Tradicional inglesa', ano: 1580, origem: 'dominio', nivel: 1, bpm: 90, alvo: 120, raiz: 9, escala: 'menor', compasso: [3, 1],
      sobre: 'Canção do século XVI em 3/4, com o ritmo pontuado que dá o balanço. Nas cordas soltas e nas três primeiras casas.',
      evs: [z(2), n(1, 3, 2),
        n(2, 4, 1), n(1, 4, 3), n(1.5, 5, 0), n(.5, 5, 1), n(1, 5, 0), n(2, 4, 3), n(1, 4, 0),
        n(1.5, 3, 0), n(.5, 3, 2), n(1, 4, 0), n(2, 4, 1), n(1, 3, 2), n(1.5, 3, 2), n(.5, 3, 1), n(1, 3, 2),
        n(2, 4, 0), n(1, 3, 1), n(3, 2, 2, 'v')] },
    // ===== riffs originais do app =====
    { id: 'riff-ferro', nome: 'Ferro e brasa', autor: 'Original do app', origem: 'original', estilo: 'heavy', nivel: 2, bpm: 110, alvo: 160, compasso: [4, 1],
      sobre: 'Galope em Mi com power chords subindo: o motor do heavy metal clássico.',
      evs: [...gal(), ...gal(), ac(.5, PC.G5), ac(.5, PC.A5), ac(1, PC.B5), ...gal(), ...gal(), ac(.5, PC.C5), ac(.5, PC.B5), ac(.5, PC.A5), ac(.5, PC.G5)] },
    { id: 'riff-motosserra', nome: 'Motosserra', autor: 'Original do app', origem: 'original', estilo: 'thrash', nivel: 2, bpm: 120, alvo: 180, compasso: [4, 1],
      sobre: 'Palhetada alternada em semicolcheias na corda solta, com notas cromáticas no meio. Thrash puro.',
      evs: [E(), E(), E(), n(.25, 0, 1), E(), E(), E(), n(.25, 0, 2), E(), E(), E(), n(.25, 0, 3), E(), E(), n(.25, 0, 2), n(.25, 0, 1),
        ac(.5, PC.A5), ac(.5, PC.G5), E(), E(), E(), E(), ac(.5, PC.A5), ac(.5, PC.Bb5), ac(.5, PC.A5), E(), E()] },
    { id: 'riff-lama', nome: 'Lama', autor: 'Original do app', origem: 'original', estilo: 'doom', nivel: 1, bpm: 60, alvo: 80, compasso: [4, 1],
      sobre: 'Lento e pesado: power chords longos e vibrato largo. O peso vem de deixar soar.',
      evs: [ac(2, PC.E5, 'v'), ac(1, PC.G5), ac(1, [[0, 2, 1], [1, 4, 3]]), ac(2, PC.Bb5, 'v'), ac(2, PC.A5, 'v')] },
    { id: 'riff-estrada', nome: 'Estrada', autor: 'Original do app', origem: 'original', estilo: 'hard-rock', nivel: 1, bpm: 100, alvo: 140, compasso: [4, 1],
      sobre: 'O vaivém de duas cordas do rock de estrada: quinta e sexta alternando, em Lá e em Ré.',
      evs: [...rep(2, () => [ac(.5, [[1, 0, 0], [2, 2, 1]]), ac(.5, [[1, 0, 0], [2, 2, 1]]), ac(.5, [[1, 0, 0], [2, 4, 3]]), ac(.5, [[1, 0, 0], [2, 4, 3]])]),
        ...rep(2, () => [ac(.5, [[2, 0, 0], [3, 2, 1]]), ac(.5, [[2, 0, 0], [3, 2, 1]]), ac(.5, [[2, 0, 0], [3, 4, 3]]), ac(.5, [[2, 0, 0], [3, 4, 3]])])] },
    { id: 'riff-escada', nome: 'Escada', autor: 'Original do app', origem: 'original', estilo: 'hard-rock', nivel: 2, bpm: 80, alvo: 120, raiz: 9, escala: 'penta-menor', compasso: [4, 1], melodia: true,
      sobre: 'Frase de solo na pentatônica de Lá menor, descendo com um bend no meio e subindo até o vibrato.',
      evs: [n(.5, 5, 8), n(.5, 5, 5), n(.5, 4, 8), n(.5, 4, 5), n(1, 3, 7, 'b'), n(.5, 3, 5), n(.5, 2, 7),
        n(.5, 2, 5), n(.5, 2, 7, 'h'), n(.5, 3, 5), n(.5, 3, 7), n(2, 2, 7, 'v')] },
    { id: 'riff-concreto', nome: 'Concreto', autor: 'Original do app', origem: 'original', estilo: 'metalcore', nivel: 3, bpm: 100, alvo: 140, compasso: [4, 1],
      sobre: 'Breakdown com pausas no contratempo: o silêncio no lugar certo é o que pesa.',
      evs: [E(.5), z(.5), E(), E(), z(.5), E(.5), z(.25), E(), ac(1, PC.F5),
        E(), E(), z(.5), ac(.5, PC.Bb5), z(.5), E(.5), ac(1, PC.A5), z(.5)] },
  ];
})();
// cada obra vira um exercício do modelo único (categoria biblioteca, origem fundamental)
OBRAS.forEach(o => {
  const total = o.evs.reduce((s, e) => s + e.d, 0), comps = Math.round(total / (o.compasso[0] * o.compasso[1]));
  registrarExercicio({ id: 'bib:' + o.id, cat: 'biblioteca', sub: o.origem, grupo: o.origem === 'dominio' ? 'Domínio público' : 'Riff original', nivel: o.nivel,
    tamanho: comps <= 1 ? 'curto' : comps <= 4 ? 'moderado' : comps <= 8 ? 'longo' : 'muito-longo', ehRiff: true, melodia: o.origem === 'dominio' || !!o.melodia, afinPadrao: 'padrao', usaTom: false, manterAltura: false,
    raizPadrao: null, rotulo: 'dedo', bpm: o.bpm, alvo: o.alvo, nome: o.nome, autor: o.autor, obra: o.nome, ano: o.ano || null, estilo: o.estilo || null,
    resumo: `${o.autor}${o.ano ? ', ' + o.ano : ''} · ${o.sobre}`, regioes: () => ['Trecho'],
    gerar: () => ({ evs: o.evs, compasso: o.compasso, raiz: o.raiz != null ? o.raiz : null, escala: o.escala || null }) });
});
const BIB = { origem: '', nivel: '' };
I.biblioteca = svg('<path d="M5 4h4v16H5zM10 4h4v16h-4z"/><path d="M15.5 5l3.6-1 3 15.5-3.6 1z"/>');
VIEWS.biblioteca = () => {
  const L = MODELOS.filter(m => m.cat === 'biblioteca' && (!BIB.origem || m.sub === BIB.origem) && (!BIB.nivel || m.nivel === +BIB.nivel));
  const comp = competenciaDaVez(), rec = MODELOS.filter(m => m.cat === 'biblioteca' && m.nivel <= nivelDaPessoa() + 1).filter(m => infoExercicio(m).competencias.includes(comp)).slice(0, 2);
  const grupo = (titulo, X) => X.length ? `<section aria-label="${titulo}"><h2 class="sec-h">${titulo}</h2><ul class="tr-lista">${X.map(m => itemTreino(m)).join('')}</ul></section>` : '';
  return KitFacil.ui.cabecalho({ titulo: 'Biblioteca', sub: 'Trechos para aplicar a técnica: obras em domínio público e riffs originais do app. Nenhuma música protegida.' })
    + `<div class="pilha">${rec.length ? `<section class="cartao bib-rec"><span class="meta-prazo">Para você agora</span><p class="apoio">Para treinar ${esc((COMPETENCIAS.find(c => c[0] === comp) || [, ''])[1].toLowerCase())}, a sua competência menos treinada:</p><ul class="tr-lista">${rec.map(m => itemTreino(m)).join('')}</ul></section>` : ''}
    <div class="kf-seg bib-f" role="group" aria-label="Origem">${[['', 'Tudo'], ['dominio', 'Domínio público'], ['original', 'Riffs originais']].map(([k, n2]) => `<button type="button" data-bib-origem="${k}" aria-pressed="${BIB.origem === k}">${n2}</button>`).join('')}</div>
    <div class="kf-seg bib-f" role="group" aria-label="Dificuldade">${[['', 'Todas'], ...NIVEIS.map(x => [String(x[0]), x[2]])].map(([k, n2]) => `<button type="button" data-bib-nivel="${k}" aria-pressed="${BIB.nivel === k}">${n2}</button>`).join('')}</div>
    ${L.length ? grupo('Obras em domínio público', L.filter(m => m.sub === 'dominio')) + grupo('Riffs originais do app', L.filter(m => m.sub === 'original'))
      : KitFacil.ui.vazio({ titulo: 'Nada com esses filtros', texto: 'Troque a origem ou a dificuldade.' })}
    <p class="apoio">Quer tocar o trecho de uma música que você tirou de ouvido? Escreva no <button type="button" class="kf-link" data-ir="estudio">Estúdio</button>: fica só com você.</p></div>`;
};
function ligarBiblioteca(m) {
  $$('[data-bib-origem]', m).forEach(b => b.onclick = () => { BIB.origem = b.dataset.bibOrigem; redesenhar(); });
  $$('[data-bib-nivel]', m).forEach(b => b.onclick = () => { BIB.nivel = b.dataset.bibNivel; redesenhar(); });
}

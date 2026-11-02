/* Guitarra Fácil · o caminho de quem nunca tocou: cinco etapas de quatro passos, do primeiro toque numa corda solta ao
   primeiro solo. Cada passo é um treino curto e original, com o braço mostrando onde pôr cada dedo e uma dica que diz
   o que fazer. Um passo conta como feito quando a pessoa marca "Saiu limpo". Quem já toca pode pular etapas.
   Notas: [corda, casa, dedo]; corda 0 é a mais grossa (Mi grave), 5 a mais fina. Dedo 0 = corda solta. */
'use strict';
// atalhos para escrever as linhas: nota única, acorde e pausa
const pn = (d, c, k, f, t = '') => ({ d, n: [[c, k, f]], t });
const pa = (d, notas, t = '') => ({ d, n: notas, t });
const pz = d => ({ d, n: [], t: '' });
const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i)).flat();
// os power chords do caminho
const E5 = [[0, 0, 0], [1, 2, 1]], G5 = [[0, 3, 1], [1, 5, 3]], A5 = [[0, 5, 1], [1, 7, 3]];
// pentatônica de Mi menor na primeira posição (cordas soltas e casas 2 e 3)
const PENTA_E = [[0, 0, 0], [0, 3, 3], [1, 0, 0], [1, 2, 2], [2, 0, 0], [2, 2, 2], [3, 0, 0], [3, 2, 2], [4, 0, 0], [4, 3, 3], [5, 0, 0], [5, 3, 3]];

const CAMINHO = [
  { id: 'contato', nome: 'Primeiro contato', resumo: 'Palheta na mão, cordas soltas e os quatro dedos', bpm: 60, alvo: 80, passos: [
    { nome: 'A primeira nota', resumo: 'A corda mais grossa, solta',
      dica: 'Segure a palheta entre o polegar e a lateral do indicador. Toque a corda mais grossa, sem apertar nada, uma vez a cada clique.',
      evs: rep(8, () => [pn(1, 0, 0, 0)]) },
    { nome: 'As seis cordas soltas', resumo: 'Da mais grossa à mais fina e de volta',
      dica: 'Toque uma corda por clique, da mais grossa à mais fina e depois de volta. A nota acesa no braço mostra qual corda tocar.',
      evs: [0, 1, 2, 3, 4, 5, 5, 4, 3, 2, 1, 0].map(c => pn(1, c, 0, 0)) },
    { nome: 'Apertando uma casa', resumo: 'Corda solta e casa 2, alternando',
      dica: 'Aperte a corda com a ponta do dedo, logo atrás do traste (o fio de metal). O número no círculo é o dedo: 1 indicador, 2 médio, 3 anelar, 4 mindinho.',
      evs: rep(4, () => [pn(1, 1, 0, 0), pn(1, 1, 2, 2)]) },
    { nome: 'Um dedo por casa', resumo: 'Casas 1, 2, 3 e 4 com os quatro dedos',
      dica: 'Cada dedo cuida de uma casa: o indicador na 1, o médio na 2, o anelar na 3 e o mindinho na 4. Deixe os dedos perto das cordas, mesmo quando não estão apertando.',
      evs: [0, 1].flatMap(c => [1, 2, 3, 4, 4, 3, 2, 1].map(k => pn(1, c, k, k))) },
  ] },
  { id: 'ritmo', nome: 'Palhetada e ritmo', resumo: 'No tempo, para baixo e para cima, com o som abafado', bpm: 70, alvo: 100, passos: [
    { nome: 'Duas por clique', resumo: 'Colcheias na corda solta',
      dica: 'Duas palhetadas por clique, todas para baixo. Conte junto: "um e, dois e, três e, quatro e".',
      evs: rep(16, () => [pn(.5, 0, 0, 0)]) },
    { nome: 'Para baixo e para cima', resumo: 'Palhetada alternada em duas cordas',
      dica: 'Agora alterne: para baixo no número, para cima no "e". A mão não para de balançar, como um pêndulo.',
      evs: [...rep(8, () => [pn(.5, 1, 0, 0)]), ...rep(8, () => [pn(.5, 2, 0, 0)])] },
    { nome: 'O som abafado', resumo: 'Palm mute na corda mais grossa',
      dica: 'Encoste a lateral da mão da palheta nas cordas, bem perto da ponte. O som fica curto e grave: é o palm mute, marcado PM na tablatura.',
      evs: rep(16, () => [pn(.5, 0, 0, 0, 'pm')]) },
    { nome: 'O tempo da pausa', resumo: 'Notas e silêncios no lugar certo',
      dica: 'Na pausa, encoste a mão da palheta nas cordas para o som parar. O silêncio também tem tempo: continue contando.',
      evs: rep(2, () => [pn(.5, 0, 0, 0, 'pm'), pn(.5, 0, 0, 0, 'pm'), pz(1), pn(.5, 0, 0, 0, 'pm'), pn(.5, 0, 0, 0, 'pm'), pn(.5, 0, 0, 0, 'pm'), pz(.5)]) },
  ] },
  { id: 'power', nome: 'Power chords', resumo: 'O acorde de duas notas que dá peso ao rock', bpm: 60, alvo: 90, passos: [
    { nome: 'O primeiro power chord', resumo: 'Mi 5: corda solta e casa 2',
      dica: 'Duas cordas de uma vez: a mais grossa solta e o indicador na casa 2 da corda de baixo. Toque só essas duas, com uma palhetada para baixo.',
      evs: rep(8, () => [pa(1, E5)]) },
    { nome: 'O desenho que anda', resumo: 'Sol 5 com indicador e anelar',
      dica: 'Indicador na casa 3 da corda mais grossa e anelar na casa 5 da corda de baixo. Esse desenho serve em qualquer casa do braço.',
      evs: rep(8, () => [pa(1, G5)]) },
    { nome: 'Mudando de lugar', resumo: 'Mi 5, Sol 5 e Lá 5',
      dica: 'Mude de casa sem desmontar a mão: o desenho dos dedos é o mesmo, só o lugar muda. Olhe o braço deslizar junto.',
      evs: [pa(2, E5), pa(2, G5), pa(2, A5), pa(2, G5)] },
    { nome: 'Power chord abafado', resumo: 'Palm mute com acordes',
      dica: 'Junte o palm mute com o power chord: a mão encostada perto da ponte e palhetadas curtas para baixo.',
      evs: [...rep(8, () => [pa(.5, E5, 'pm')]), ...rep(4, () => [pa(.5, G5, 'pm')]), ...rep(4, () => [pa(.5, A5, 'pm')])] },
  ] },
  { id: 'riffs', nome: 'Primeiros riffs', resumo: 'Corda solta, power chords e galope juntos', bpm: 70, alvo: 110, passos: [
    { nome: 'Motor', resumo: 'Corda solta abafada e dois acordes',
      dica: 'Quatro palhetadas abafadas na corda solta e depois os acordes, soando inteiros. Tire a mão da ponte quando chegar no acorde.',
      evs: [...rep(4, () => [pn(.5, 0, 0, 0, 'pm')]), pa(1, G5), pa(1, A5), ...rep(4, () => [pn(.5, 0, 0, 0, 'pm')]), pa(1, A5), pa(.5, G5), pa(.5, E5)] },
    { nome: 'Pedal', resumo: 'A corda solta volta entre as notas',
      dica: 'A corda mais grossa solta é o "pedal": ela volta entre cada nota da corda de baixo. Mantenha o pedal abafado e deixe as outras notas soarem.',
      evs: [pn(.5, 0, 0, 0, 'pm'), pn(.5, 1, 3, 2), pn(.5, 0, 0, 0, 'pm'), pn(.5, 1, 2, 1), pn(.5, 0, 0, 0, 'pm'), pn(.5, 1, 0, 0), pn(.5, 0, 0, 0, 'pm'), pn(.5, 1, 2, 1),
        pn(.5, 0, 0, 0, 'pm'), pn(.5, 1, 3, 2), pn(.5, 0, 0, 0, 'pm'), pn(.5, 1, 5, 4), pn(.5, 0, 0, 0, 'pm'), pn(.5, 1, 3, 2), pn(1, 0, 0, 0)] },
    { nome: 'Galope', resumo: 'Uma longa e duas curtas, como um cavalo',
      dica: 'O galope é uma palhetada longa e duas curtas: "pa, ta-ta". Comece bem devagar e só acelere quando sair igual.',
      evs: [...rep(3, () => [pn(.5, 0, 0, 0, 'pm'), pn(.25, 0, 0, 0, 'pm'), pn(.25, 0, 0, 0, 'pm')]), pa(.5, G5), pa(.5, A5),
        ...rep(2, () => [pn(.5, 0, 0, 0, 'pm'), pn(.25, 0, 0, 0, 'pm'), pn(.25, 0, 0, 0, 'pm')]), pa(1, A5), pa(1, G5)] },
    { nome: 'O riff inteiro', resumo: 'Motor, galope e pedal em sequência',
      dica: 'Os três riffs juntos, um compasso de cada. No fim, deixe o Mi 5 soar até o próximo clique.',
      evs: [...rep(4, () => [pn(.5, 0, 0, 0, 'pm')]), pa(1, G5), pa(1, A5),
        ...rep(3, () => [pn(.5, 0, 0, 0, 'pm'), pn(.25, 0, 0, 0, 'pm'), pn(.25, 0, 0, 0, 'pm')]), pa(.5, G5), pa(.5, A5),
        pn(.5, 0, 0, 0, 'pm'), pn(.5, 1, 3, 2), pn(.5, 0, 0, 0, 'pm'), pn(.5, 1, 2, 1), pn(.5, 0, 0, 0, 'pm'), pn(.5, 1, 0, 0), pn(.5, 0, 0, 0, 'pm'), pn(.5, 1, 2, 1),
        pa(4, E5)] },
  ] },
  { id: 'solos', nome: 'Primeiros solos', resumo: 'A escala do rock, o bend, o slide e o vibrato', bpm: 60, alvo: 90, passos: [
    { nome: 'A escala do solo', resumo: 'Pentatônica de Mi menor, subindo',
      dica: 'Esta é a pentatônica menor, a escala de quase todo solo de rock. Toque uma nota por clique e use o dedo que aparece no círculo.',
      evs: PENTA_E.map(([c, k, f]) => pn(1, c, k, f)) },
    { nome: 'Subindo e descendo', resumo: 'A escala inteira, duas notas por clique',
      dica: 'Agora duas notas por clique, subindo e voltando. Palhetada alternada: para baixo e para cima.',
      evs: [...PENTA_E, ...PENTA_E.slice().reverse()].map(([c, k, f]) => pn(.5, c, k, f)) },
    { nome: 'O primeiro bend', resumo: 'Empurrar a corda até a nota de cima',
      dica: 'Ouça a nota de chegada (casa 5 da segunda corda). Depois toque a casa 7 da terceira corda com o anelar, apoiado pelo médio e pelo indicador, e empurre a corda até soar igual. No braço, a nota sai da corda: isso é o bend.',
      evs: [pn(1, 4, 5, 1), pn(2, 3, 7, 3, 'b'), pn(1, 4, 5, 1), pn(2, 3, 7, 3, 'b'), pn(1, 3, 7, 3, 'r'), pn(1, 3, 5, 1)] },
    { nome: 'Slide e vibrato', resumo: 'Escorregar até a nota e fazer ela balançar',
      dica: 'No slide, toque a casa 5 e escorregue o dedo até a 7 sem tirar da corda. No fim, balance a última nota com o pulso: é o vibrato.',
      evs: [pn(1, 2, 5, 1), pn(1, 2, 7, 3, 's'), pn(1, 3, 5, 1), pn(1, 3, 7, 3), pn(1, 4, 5, 1), pn(1, 4, 8, 4), pn(2, 4, 5, 1, 'v')] },
  ] },
];
// cada passo vira um treino do catálogo (id cam:etapa:n), aberto na janela do treino como os outros
const etapaDe = id => CAMINHO.find(e => e.id === id);
CAMINHO.forEach(e => {
  e.ids = e.passos.map((p, i) => {
    const id = `cam:${e.id}:${i + 1}`;
    MODELOS.push({ id, cat: 'caminho', sub: e.id, grupo: `Passo ${i + 1} de ${e.passos.length}`, nivel: 1, tamanho: 'curto', ehRiff: true, afinPadrao: 'padrao',
      usaTom: false, manterAltura: false, raizPadrao: null, rotulo: 'dedo', bpm: e.bpm, alvo: e.alvo, nome: p.nome, resumo: p.resumo, dica: p.dica,
      regioes: () => ['Passo'], gerar: () => ({ evs: p.evs, compasso: [4, 1] }) });
    return id;
  });
});

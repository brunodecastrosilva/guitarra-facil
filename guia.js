/* Guitarra Fácil · guia do app em dois níveis (Código, Arts. 77 a 80):
   Simplificado: poucos passos, só com destaque. Completo: o app faz cada ação na tela, ao vivo, numa demonstração que
   não salva nada (os dados verdadeiros ficam guardados até o guia terminar). Toda troca de tela é feita tocando na
   barra, como a pessoa faria. */
'use strict';

const GUIA = (() => {
  const visivel = q => $$(q).find(e => e.getClientRects().length);
  /* troca de tela pelo guia ao vivo: toca na barra; se a seção estiver no Mais, abre o Mais e toca nela */
  async function irVia(m, nome, rota) {
    // numa tela interna a barra de baixo dá lugar às ações: primeiro volta, como a pessoa faria
    for (let i = 0; i < 4 && document.body.classList.contains('gf-interna') && visivel('#voltar'); i++) { await m.tocar('#voltar'); await m.esperar(400); }
    const direto = visivel(`.kf-nav [data-rota="${rota}"]:not(.kf-nav-oculto), .kf-trilho [data-rota="${rota}"], ${rota === 'ajustes' ? '.kf-nav [data-kf="ajustes"]:not(.kf-nav-oculto), .kf-trilho [data-kf="ajustes"]' : '#nada'}`);
    if (direto) { await m.tocar(direto); return; }
    await m.tocar(visivel('[data-kf-nav-mais]')); await m.esperar(500);
    const b = $$('.kf-ov [data-kf-mais-i]').find(x => x.textContent.trim().startsWith(nome));
    if (b) await m.tocar(b);
  }
  /* o braço é desenho (SVG): o dedo aponta e o toque é entregue ao braço */
  async function tocarCasa(m, raiz, c, k) {
    const sel = `${raiz} .gf-alvo[data-c="${c}"][data-k="${k}"]`;
    const el = await m.apontar(sel);
    if (el) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); await m.esperar(700); }
  }
  const PASSOS = [
    /* ---- Simplificado ---- */
    { niveis: [1], t: 'Comece pela sessão de hoje', d: 'Escolha quanto tempo tem e toque em Ver a sessão de hoje. O app monta preparação, aquecimento, treino principal, aplicação e encerramento.', sel: '#ver-sessao', ir: () => APP.ir('inicio') },
    { niveis: [1], t: 'Todos os treinos', d: 'Cada exercício tem um número e um objetivo. Busque pelo número ou por uma palavra e filtre por nível e competência.', sel: '#busca', ir: () => APP.ir('treinos') },
    { niveis: [1], t: 'O roteiro antes de tocar', d: 'Cada parte aparece desenhada no braço: a nota vermelha é onde começa, as setas mostram a ordem e os números, os dedos. Ouça a parte e toque em Começar.', sel: '[data-ouvir-parte="0"]', ir: () => APP.ir('treino/' + CATALOGO.CAMINHO[1]) },
    { niveis: [1], t: 'Explore o braço', d: 'Notas, escalas, acordes e intervalos. Toque numa casa para ouvir a nota.', sel: '#ex-braco', ir: () => APP.ir('explorar') },
    { niveis: [1], t: 'Escreva no Estúdio', d: 'Crie ideias e riffs tocando no braço, ouça e treine como qualquer exercício.', sel: '[data-nova-ideia]', ir: () => APP.ir('estudio') },
    { niveis: [1], t: 'Afinador, metrônomo e mais', d: 'Afinador, Metrônomo, Bateria, Biblioteca, Acordes e Progresso ficam em Mais (no computador, no menu ao lado).', sel: () => visivel('[data-kf-nav-mais], .kf-trilho [data-rota="afinador"]'), ir: () => APP.ir('inicio') },
    { niveis: [1], t: 'Do seu jeito', d: 'Em Ajustes → Prática: nível, mão (destro ou canhoto), afinação, metrônomo nos treinos e volumes.', sel: () => visivel('.kf-nav [data-kf="ajustes"]:not(.kf-nav-oculto), [data-kf-nav-mais], .kf-trilho [data-kf="ajustes"]') },

    /* ---- Completo: ações ao vivo ---- */
    { niveis: [2], t: 'Escolha o tempo e veja a sessão', d: 'Toque em 20 min e em Ver a sessão de hoje.', sel: '[data-seg-min="20"]',
      acao: async m => { await m.tocar('[data-seg-min="20"]'); await m.tocar('#ver-sessao'); await m.esperar(700); } },
    { niveis: [2], t: 'Abra uma etapa', d: 'Toque em Treino principal para ver, trocar, tirar ou subir os treinos.', sel: '[data-etapa="principal"] summary',
      acao: async m => { await m.tocar('[data-etapa="principal"] summary'); await m.apontar('[data-etapa="principal"] [data-trocar]'); } },
    { niveis: [2], t: 'Abra o roteiro do treino', d: 'Toque no treino para ver as partes desenhadas no braço.', sel: '[data-etapa="principal"] .gf-linha',
      acao: async m => { await m.tocar('[data-etapa="principal"] .gf-linha'); await m.esperar(700); } },
    { niveis: [2], t: 'Ouça uma parte', d: 'Toque em Ouvir esta parte. Toque de novo para parar.', sel: '[data-ouvir-parte="0"]',
      acao: async m => { await m.tocar('[data-ouvir-parte="0"]'); await m.esperar(2500); await m.tocar('[data-ouvir-parte="0"]'); } },
    { niveis: [2], t: 'Toque em Começar', d: 'O metrônomo conta um compasso; depois o braço e a tablatura acompanham o som. Na demonstração, nada é registrado.', sel: '[data-acao="comecar"]',
      acao: async m => { await m.tocar('[data-acao="comecar"]'); await m.esperar(800); await m.apontar('[data-acao="mais-rapido"]'); await m.esperar(3500); await m.tocar('[data-acao="parar"]'); } },
    { niveis: [2], t: 'Busque um treino', d: 'Em Treinos, digite um número ou uma palavra.', sel: () => visivel('.kf-nav [data-rota="treinos"], .kf-trilho [data-rota="treinos"]'),
      acao: async m => { await irVia(m, 'Treinos', 'treinos'); await m.esperar(500); await m.digitar('#busca', 'escala'); await m.esperar(600); await m.apontar('#lista-treinos .gf-linha'); } },
    { niveis: [2], t: 'Explore um acorde no braço', d: 'Em Explorar, escolha Acordes e toque numa casa para ouvir.', sel: () => visivel('.kf-nav [data-rota="explorar"], .kf-trilho [data-rota="explorar"]'),
      acao: async m => { await irVia(m, 'Explorar', 'explorar'); await m.tocar('[data-aba-ex="acordes"]'); await tocarCasa(m, '#ex-braco', 1, 0); await tocarCasa(m, '#ex-braco', 2, 2); await m.apontar('#ex-tom'); } },
    { niveis: [2], t: 'Escreva uma ideia', d: 'No Estúdio, toque em Nova ideia e nas casas do braço. Depois, em Ouvir.', sel: () => visivel('.kf-nav [data-rota="estudio"], .kf-trilho [data-rota="estudio"]'),
      acao: async m => { await irVia(m, 'Estúdio', 'estudio'); await m.tocar(visivel('[data-nova-ideia]')); await m.esperar(600); for (const [c, k] of [[1, 0], [1, 3], [1, 5], [2, 2]]) await tocarCasa(m, '#id-braco', c, k); await m.tocar('[data-acao="ouvir"]'); await m.esperar(2500); } },
    { niveis: [2], t: 'Afine a guitarra', d: 'Em Afinador, ligue o microfone ou ouça a nota de cada corda.', sel: () => visivel('[data-kf-nav-mais], .kf-trilho [data-rota="afinador"]'),
      acao: async m => { await irVia(m, 'Afinador', 'afinador'); await m.apontar('#af-mic'); await m.tocar('[data-corda-af="5"]'); } },
    { niveis: [2], t: 'Veja o seu progresso', d: 'Em Progresso: a semana, as competências, o histórico e as metas.', sel: () => visivel('[data-kf-nav-mais], .kf-trilho [data-rota="progresso"]'),
      acao: async m => { await irVia(m, 'Progresso', 'progresso'); await m.tocar('[data-aba-prog="competencias"]'); await m.apontar('[data-comp]'); } },
    { niveis: [2], t: 'Reveja este guia em Ajustes', d: 'Em Ajustes → Preferências gerais, o guia e a apresentação ao abrir o app.', sel: () => visivel('.kf-nav [data-kf="ajustes"]:not(.kf-nav-oculto), [data-kf-nav-mais], .kf-trilho [data-kf="ajustes"]'),
      acao: async m => { await irVia(m, 'Ajustes', 'ajustes'); await m.esperar(500); await m.tocar('[data-kf-aj-ir="preferencias"]'); await m.esperar(500); await m.apontar('.kf-guia-lista'); } },
  ];
  return {
    niveis: [{ nome: 'Simplificado' }, { nome: 'Completo' }],
    explicacao: 'O Simplificado mostra onde fica cada coisa. No Completo, o app faz cada ação na tela, numa demonstração que não salva nada.',
    passos: PASSOS,
    preparar: () => { TOCADOR.parar(); DADOS.demo.ligar(); APP.ir('inicio'); },
    fim: () => {
      TOCADOR.parar(); DADOS.demo.desligar();
      // a ideia da demonstração não existe fora dela
      const { nome, args } = APP.rota();
      if (nome === 'ideia' && !DADOS.ideia(args[0])) APP.ir('estudio'); else APP.redesenhar();
    },
    ocupado: () => false,
  };
})();

/* Guitarra Fácil · moldura e rotas: barra de cima, navegação (barra de baixo no celular e no tablet, trilho no
   computador), telas principais e internas, Ajustes, sincronização e a ligação com o Kit Fácil (comum/). */
'use strict';

const NAV = [
  ['inicio', 'Início', ICONE.inicio], ['treinos', 'Treinos', ICONE.treinos], ['explorar', 'Explorar', ICONE.explorar], ['estudio', 'Estúdio', ICONE.estudio],
  ['afinador', 'Afinador', ICONE.afinador, 1], ['metronomo', 'Metrônomo', ICONE.metronomo, 1], ['bateria', 'Bateria', ICONE.bateria, 1],
  ['biblioteca', 'Biblioteca', ICONE.biblioteca, 1], ['acordes', 'Acordes', ICONE.acordes, 1], ['progresso', 'Progresso', ICONE.progresso, 1],
];
/* tela "pai" de cada tela interna, para o Voltar quando não há histórico */
const PAI = { treino: 'treinos', sessao: 'inicio', ideia: 'estudio' };

const APP = (() => {
  let atual = null, chaveAtual = '', navegou = false;
  function rota() {
    const partes = (location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    const nome = partes[0] && (TELAS[partes[0]] || partes[0] === 'ajustes') ? partes[0] : 'inicio';
    return { nome, args: partes.slice(1) };
  }
  const telaDe = nome => nome === 'ajustes' ? AJUSTES : TELAS[nome];

  function barra(t, args) {
    const esq = $('#barra-esq');
    if (t.principal) {
      esq.className = 'kf-marca';
      esq.innerHTML = `<span class="kf-marca-ic">${MARCA_SVG}</span><span class="kf-marca-nome">Guitarra Fácil</span>`;
    } else {
      const tt = typeof t.titulo === 'function' ? t.titulo(args) : t.titulo;
      esq.className = 'gf-voltar';
      esq.innerHTML = `<button type="button" id="voltar" aria-label="Voltar">${ICONE.voltar}</button><h1>${esc(tt)}</h1>`;
    }
    // telas principais: nuvem, chopp e balão; telas internas: só nuvem e balão (Art. 58)
    $('#topo').innerHTML = t.principal ? KitFacil.topo.html({ principal: true }) : KitFacil.topo.html({ principal: false });
    KitFacil.topo.atualizar();
  }
  function navegacao(nome) {
    const ativo = nome === 'ajustes' ? '' : (TELAS[nome] && TELAS[nome].principal ? nome : PAI[nome] || '');
    $$('[data-rota]').forEach(b => b.setAttribute('aria-current', b.dataset.rota === ativo ? 'page' : 'false'));
    $$('[data-kf="ajustes"]').forEach(b => b.setAttribute('aria-current', nome === 'ajustes' ? 'page' : 'false'));
  }
  function acoes() {
    const t = atual, { args } = rota(), box = $('#acoes');
    const h = t && t.acoes ? t.acoes(args) : '';
    box.hidden = !h; $('#acoes-in').innerHTML = h || '';
  }
  function render({ foco, manterRolagem } = {}) {
    const { nome, args } = rota(), chave = nome + '/' + args.join('/');
    const t = telaDe(nome);
    const trocou = chave !== chaveAtual;
    if (trocou && atual && atual.sair) try { atual.sair(); } catch (e) { console.warn(e); }
    atual = t; chaveAtual = chave;
    if (t.preparar) t.preparar(args, trocou);
    document.body.classList.toggle('gf-interna', !t.principal);
    barra(t, args);
    const main = $('#tela'), y = scrollY;
    if (nome === 'ajustes') { main.innerHTML = AJUSTES.html(); AJUSTES.ligar(main); }
    else {
      const cab = t.principal ? KitFacil.ui.cabecalho({ titulo: t.titulo, sub: esc(t.sub || ''), criar: t.criar || null }) : '';
      main.innerHTML = cab + t.html(args);
      t.ligar(main, args);
    }
    acoes(); navegacao(nome);
    if (trocou) { KitFacil.movimento.entrar(main, { de: 'tela' }); window.scrollTo(0, 0); if (navegou && !foco) main.focus({ preventScroll: true }); }
    else if (manterRolagem !== false) window.scrollTo(0, y);
    if (foco) { const el = $(foco); if (el) { el.focus({ preventScroll: true }); if (el.setSelectionRange && typeof el.value === 'string') try { el.setSelectionRange(el.value.length, el.value.length); } catch {} } }
  }
  function ir(r) {
    navegou = true;
    const alvo = '#/' + r;
    if (location.hash === alvo) { render(); return; }
    if (history.state && history.state.kfAjPush) location.replace(alvo); else location.hash = alvo;
  }
  function voltar() {
    const { nome, args } = rota();
    if (navegou && history.length > 1) { history.back(); return; }
    ir(nome === 'treino' && args[1] === 'sessao' ? 'sessao' : PAI[nome] || 'inicio');
  }
  return { rota, render, ir, voltar, redesenhar: o => render(o), redesenharAcoes: acoes, redesenharBarra: () => { const { args } = rota(); barra(atual, args); }, tela: () => atual };
})();

/* ================= Ajustes (guias comuns do Kit e a guia própria Prática) ================= */
const AJUSTES = {
  principal: true, titulo: 'Ajustes',
  html() {
    const p = DADOS.perfil(), v = DADOS.aparelho().vol;
    const vol = (id, nome, val) => `<div class="gf-campo"><label class="kf-rotulo" for="vol-${id}">${nome}</label><input type="range" class="gf-faixa-range" id="vol-${id}" data-vol="${id}" min="0" max="100" value="${Math.round(val * 100)}"></div>`;
    const pratica = `<div class="kf-bloco"><h3>Treinos</h3>
        ${segmento('pr-nivel', 'Seu nível', [[1, 'Iniciante'], [2, 'Intermediário'], [3, 'Avançado']], p.nivel)}
        <p class="kf-ajuda">O nível escolhe os treinos da sessão de hoje. Todos os exercícios continuam abertos em Treinos.</p>
        ${segmento('pr-mao', 'Mão que segura a palheta', [['destro', 'Direita'], ['canhoto', 'Esquerda']], p.mao)}
        <p class="kf-ajuda">Com a esquerda, o braço e os diagramas aparecem espelhados, como você vê a sua guitarra.</p>
        ${escolhaHTML('pr-afin', 'Afinação', TEORIA.AFINACOES.map(a => [a.id, a.nome]), p.afin)}
        ${segmento('pr-notacao', 'Nome das notas', [['nomes', 'Dó Ré Mi'], ['cifras', 'C D E']], p.notacao)}
        ${segmento('pr-voltas', 'Repetições de cada treino', [[1, '1'], [2, '2'], [4, '4'], [8, '8']], p.voltas)}
        <label class="kf-check"><input type="checkbox" id="pr-metro" ${p.metronomo ? 'checked' : ''}><span>Metrônomo durante os treinos</span></label>
        <label class="kf-check"><input type="checkbox" id="pr-conta" ${p.contagem ? 'checked' : ''}><span>Contar um compasso antes de começar</span></label></div>
      <div class="kf-bloco"><h3>Volumes neste aparelho</h3>${vol('guitarra', 'Guitarra', v.guitarra)}${vol('metronomo', 'Metrônomo', v.metronomo)}${vol('bateria', 'Bateria', v.bateria)}
        <button type="button" class="kf-btn kf-sec" id="vol-testar">Ouvir</button></div>`;
    const nv = CATALOGO.NIVEIS[p.nivel];
    return KitFacil.ajustes.html({
      produto: [{ id: 'pratica', titulo: 'Prática', icone: '<path d="m14 4 6 6"/><path d="M17 7l-6.5 6.5"/><path d="M11.4 12.6a4 4 0 1 0-2.9 5.6 3 3 0 0 0 3.3-2.2 4 4 0 0 0-.4-3.4z"/>', resumo: `${nv} · ${p.mao === 'canhoto' ? 'canhoto' : 'destro'} · ${TEORIA.afinacao(p.afin).nome.split(' (')[0]}`, html: pratica }],
    });
  },
  ligar(r) {
    KitFacil.ajustes.ligar(r);
    const resumo = () => { const p = DADOS.perfil(); KitFacil.ajustes.resumo('pratica', `${CATALOGO.NIVEIS[p.nivel]} · ${p.mao === 'canhoto' ? 'canhoto' : 'destro'} · ${TEORIA.afinacao(p.afin).nome.split(' (')[0]}`); };
    const seg = (nome, campo, num) => r.querySelectorAll(`[data-seg-${nome}]`).forEach(b => b.onclick = () => {
      const v = b.dataset[('seg-' + nome).replace(/-(\w)/g, (x, c) => c.toUpperCase())];
      DADOS.mudarPerfil({ [campo]: num ? +v : v });
      r.querySelectorAll(`[data-seg-${nome}]`).forEach(x => x.setAttribute('aria-pressed', String(x === b))); resumo();
    });
    seg('pr-nivel', 'nivel', true); seg('pr-mao', 'mao'); seg('pr-notacao', 'notacao'); seg('pr-voltas', 'voltas', true);
    const af = $('#pr-afin', r); if (af) af.onchange = () => { DADOS.mudarPerfil({ afin: af.value }); resumo(); };
    const me = $('#pr-metro', r); if (me) me.onchange = () => DADOS.mudarPerfil({ metronomo: me.checked });
    const co = $('#pr-conta', r); if (co) co.onchange = () => DADOS.mudarPerfil({ contagem: co.checked });
    r.querySelectorAll('[data-vol]').forEach(x => x.oninput = () => { const vol = { ...DADOS.aparelho().vol, [x.dataset.vol]: +x.value / 100 }; DADOS.mudarAparelho({ vol }); SOM.volumes(vol); });
    const t = $('#vol-testar', r);
    if (t) t.onclick = () => { if (!SOM.audio()) return; SOM.preparar([45, 52, 57], ['metronomo-forte', 'bumbo', 'caixa']).then(() => { const q = SOM.tempo() + .05; SOM.peca('metronomo-forte', q); SOM.peca('bumbo', q + .5); SOM.peca('caixa', q + 1); [45, 52, 57].forEach((m, i) => SOM.nota(m, q + 1.5 + i * .03, 1.2, .8)); }); };
  },
};

/* ================= início do app ================= */
function montarNavegacao() {
  $('#nav').innerHTML = NAV.map(([id, nome, ic, mais]) => `<button type="button" class="kf-nav-it" data-rota="${id}"${mais ? ' data-kf-mais' : ''} aria-current="false"><span class="kf-nav-ic">${ic}</span><span class="kf-nav-l">${nome}</span></button>`).join('')
    + KitFacil.nav.ajustes('nav');
  $('#trilho').innerHTML = NAV.map(([id, nome, ic]) => `<button type="button" class="kf-trilho-it" data-rota="${id}" aria-current="false">${ic}<span>${nome}</span></button>`).join('');
  $('#trilho-ajustes').outerHTML = KitFacil.nav.ajustes('trilho');
  $$('.kf-marca-ic').forEach(el => { el.innerHTML = MARCA_SVG; });
}

KitFacil.iniciar({
  app: 'guitarra-facil', nome: 'Guitarra Fácil', versao: VERSAO, icone: 'icons/icon-192.png',
  resumo: 'Treinos de guitarra elétrica do primeiro contato ao estudo avançado, com o braço, a tablatura e o som juntos.',
  tela: () => APP.rota().nome,
  exemploDados: 'os treinos, as ideias do Estúdio, os favoritos e as metas',
  abrirAjustes: secao => { if (secao || APP.rota().nome !== 'ajustes') APP.ir('ajustes'); else APP.voltar(); },
  emAjustes: () => APP.rota().nome === 'ajustes',
  novidades: [{ versao: '0.2.0', itens: ['Com o teclado aberto, a janela fica acima dele, e o campo em que você digita não fica escondido.', 'Quando uma janela muda de tamanho ou de lugar, ela desliza até a nova posição, em vez de pular.', 'Os avisos rápidos não cobrem mais os botões de uma janela aberta.', 'Nas janelas, a explicação curta vem logo abaixo do título.', 'No guia, o dedo não cobre o que você está digitando, e o cartão do guia não cobre a parte que você está conhecendo.'] }, { versao: '0.1.0', itens: [
    'O app foi refeito do zero, no padrão dos apps da família: barra de cima, Ajustes, janelas e avisos iguais aos outros.',
    'Toda tela principal tem título e uma linha dizendo para que serve; as listas mostram um item por linha.',
    'Treinos com roteiro antes de tocar, braço e tablatura juntos no palco e a pergunta "Saiu limpo?" no fim. Na sessão, o próximo só começa quando você toca.',
    'Guia em dois níveis, Simplificado e Completo, em Ajustes → Preferências gerais.',
    'Saíram o fogo e a barra de amplificadores, o baixo e as cordas de fundo e o gravador de treino. Ajustes do app agora ficam na guia Prática.',
  ] }],
  apresentacao: { frase: 'Treinos de guitarra elétrica, do primeiro contato ao estudo avançado.', pontos: [
    ['Veja a sessão de hoje', 'No Início, escolha quanto tempo tem: o app monta os treinos do dia.'],
    ['Ouça antes de tocar', 'Cada treino mostra as partes desenhadas no braço, com um botão para ouvir.'],
    ['Toque no tempo', 'O braço e a tablatura acompanham o som. No fim, diga se saiu limpo.'] ] },
  guia: GUIA,
  boasVindas: { novo: () => !DADOS.temDados() },
  copia: { descricao: 'Baixe um arquivo com os treinos registrados, os favoritos, as ideias do Estúdio, as metas e os ajustes de prática.',
    baixar: () => KitFacil.copia.baixar(DADOS.copia(), 1),
    restaurar: async f => {
      const env = await KitFacil.copia.ler(f, { antigos: false });
      if (!env || !env.dados) { KitFacil.avisar('Este arquivo não é uma cópia do Guitarra Fácil. Escolha o arquivo baixado em Cópia de segurança.'); return; }
      KitFacil.dialogo.confirmar({ titulo: 'Restaurar a cópia?', texto: 'Os dados deste aparelho serão trocados pelos da cópia.', ok: 'Restaurar', aoConfirmar: () => { DADOS.restaurar(env.dados); SY.agendar(); APP.redesenhar(); KitFacil.avisar('Cópia restaurada.'); } });
    } },
  privacidade: [
    'Os treinos registrados, o andamento de cada exercício, os favoritos, as ideias do Estúdio, as metas e os ajustes ficam neste aparelho.',
    'Com a sincronização ligada, os mesmos dados vão criptografados para um gist secreto na sua conta do GitHub. Os volumes e a sessão do dia ficam só neste aparelho.',
    'O afinador usa o microfone só quando você liga e analisa o som na memória do aparelho. Nada é gravado nem enviado, e o app não dá nota à sua execução.',
  ],
  textos: { notificacoes: 'O Guitarra Fácil não envia notificações. Para lembrar de treinar, use o alarme do aparelho.' },
});
KitFacil.tema.iniciar({ chave: 'guitarrafacil.pref', cores: { claro: '#EDEDF0', escuro: '#0B0B0D' }, padrao: 'escuro' });
const SY = KitFacil.sync.criar({
  app: 'guitarra-facil', nome: 'Guitarra Fácil', chave: 'guitarrafacil.sync',
  dados: 'os treinos, as ideias, os favoritos e as metas',
  aplicar: r => DADOS.aplicar(r), pacote: () => DADOS.pacote(), mesmo: (a, r) => DADOS.igual(a, r),
  redesenhar: () => APP.redesenhar(),
  ocupado: () => KitFacil.dialogo.aberto() || KitFacil.guia.ativo() || TREINO.ativo || /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || ''),
  textoLigada: () => `Sincronização ligada. ${plural(DADOS.praticas().length, 'treino registrado', 'treinos registrados')} neste aparelho.`,
});
DADOS.aoMudar = () => SY.agendar();
SOM.volumes(DADOS.aparelho().vol);

montarNavegacao();
document.addEventListener('click', e => {
  const ir = e.target.closest('[data-ir]'); if (ir && !ir.disabled) { e.preventDefault(); APP.ir(ir.dataset.ir); return; }
  const r = e.target.closest('[data-rota]'); if (r && r.closest('.kf-nav, .kf-trilho')) { e.preventDefault(); APP.ir(r.dataset.rota); return; }
  if (e.target.closest('#voltar')) { APP.voltar(); return; }
  const a = e.target.closest('#acoes [data-acao]'); if (a && !a.disabled) { const t = APP.tela(); if (t && t.acao) t.acao(a.dataset.acao, APP.rota().args); }
});
window.addEventListener('hashchange', () => APP.render());
const linkSync = SY.tokenDoLink();
if (linkSync) try { history.replaceState(null, '', location.pathname + location.search); } catch {}
APP.render();
SY.iniciar({ token: linkSync, silencioso: true, textoConfirmar: 'Os treinos, as ideias e os favoritos deste aparelho se juntam aos da nuvem.' });
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(e => console.warn('sw', e));

/* Guitarra Fácil · app web (PWA) do Projeto Integrador: rotas, navegação, Ajustes, desenho das telas e início do Kit.
   O resto mora em arquivos por responsabilidade (ver claude/arquitetura.md e o README): base.js, dados.js,
   exercicios.js, som.js, pratica.js, tela-*.js, ferramentas.js, plano.js e janela-treino.js. Tudo fica neste
   aparelho; a sincronização opcional e a moldura vêm do Kit Fácil (comum/). */
'use strict';
/* ================= navegação ================= */
// Navegação por intenção. Teoria/Braço e Biblioteca/Músicas compartilham destinos únicos.
const NAV = [
  ['inicio', 'Início', I.inicio], ['treinos', 'Treinos', I.treinos], ['explorar', 'Explorar', I.braco], ['estudio', 'Estúdio', I.estudio],
  ['afinador', 'Afinador', I.afinador, true], ['metronomo', 'Metrônomo', I.metronomo, true], ['bateria', 'Bateria', I.bateria, true], ['biblioteca', 'Biblioteca', I.biblioteca, true],
  ['acordes', 'Acordes', I.acordes, true], ['progresso', 'Progresso', I.progresso, true],
];
const caminho = () => location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
const parte = i => caminho()[i] || '';
const subRota = () => parte(1);
// endereços das versões anteriores: hoje → início; ferramentas/x → a tela da ferramenta
const ANTIGAS = { hoje: 'inicio', ferramentas: 'metronomo', braco: 'explorar' };
const INTERNAS = ['dia', 'favoritos', 'plano', 'caminho', 'sessao', 'jornada']; // telas que se abrem pelo Início
const rota = () => { const r = parte(0) || 'inicio'; return NAV.some(n => n[0] === r) || r === 'ajustes' || INTERNAS.includes(r) ? r : 'inicio'; };
function corrigirEndereco() {
  const [r, s] = caminho();
  if (r === 'ferramentas') history.replaceState(null, '', '#/' + (s === 'braco' ? 'explorar' : ['metronomo', 'bateria', 'afinador', 'acordes'].includes(s) ? s : 'metronomo'));
  else if (r === 'teoria') history.replaceState(null, '', '#/explorar/' + ({ circulo: 'harmonia', ritmo: 'ritmo', acordes: 'acorde', escalas: 'escala', intervalos: 'intervalos' }[s] || ''));
  else if (r === 'musicas') history.replaceState(null, '', '#/biblioteca/' + (s === 'playlists' || String(s || '').startsWith('pl-') ? 'inspiracoes' : 'minhas'));
  else if (ANTIGAS[r]) history.replaceState(null, '', '#/' + ANTIGAS[r]);
}
let telaAtual = null, torreRolagem = 0, torreDestino = '';

function ir(t) {
  const agora = caminho().filter(Boolean).join('/');
  if (t === agora && t !== 'ajustes') return;
  if (t === 'ajustes' && rota() === 'ajustes') { history.back(); return; }
  if (rota() === 'inicio') { torreRolagem = window.scrollY; torreDestino = t; }
  history.pushState(null, '', '#/' + t); render();
}
// Voltar do aparelho: troca de tela; dentro dos Ajustes, as guias são do Kit
window.addEventListener('popstate', () => { if (telaAtual === 'inicio') torreRolagem = window.scrollY; if (!(rota() === 'ajustes' && telaAtual === 'ajustes')) render(); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-ir]');
  if (!b) return;
  e.preventDefault();
  if (b.matches('.amp-hq') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (document.querySelector('.amp-hq.amp-escolhido')) return;
    b.classList.add('amp-escolhido');
    setTimeout(() => { if (b.isConnected) ir(b.dataset.ir); }, 280);
  } else ir(b.dataset.ir);
});

function desenharNav() {
  const r = rota();
  const it = ([id, nome, ic, mais]) => `<button type="button" class="kf-nav-it" data-ir="${id}" aria-current="${r === id ? 'page' : 'false'}"${mais ? ' data-kf-mais' : ''}><span class="kf-nav-ic">${ic}</span><span class="kf-nav-l">${nome}</span></button>`;
  const tr = ([id, nome, ic]) => `<button type="button" class="kf-trilho-it" data-ir="${id}">${ic}<span>${nome}</span></button>`;
  $('#nav').innerHTML = NAV.map(it).join('') + KitFacil.nav.ajustes('nav');
  $('#trilho').innerHTML = NAV.map(tr).join('');
  $('#trilho-ajustes').innerHTML = KitFacil.nav.ajustes('trilho');
}

VIEWS.ajustes = () => KitFacil.ajustes.html({
  produto: [{ id: 'palco', titulo: 'Menu e efeitos', icone: '<path d="M4 5h16v14H4zM8 9h8M8 13h8"/>', resumo: 'HQ em chamas, movimento e som', html: palcoAjustes() }, { id: 'pratica', titulo: 'Prática', icone: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>', resumo: `Meta de ${DB.cfg.meta} min por dia`,
    html: `<div class="kf-bloco"><h3>Meta diária</h3>
      <div class="campo"><label class="kf-rotulo" for="aj-meta">Minutos de prática por dia</label><select id="aj-meta">${[10, 15, 20, 30, 45, 60, 90].map(m => `<option value="${m}"${DB.cfg.meta === m ? ' selected' : ''}>${m} minutos</option>`).join('')}</select></div>
      <p class="apoio">Treinos, metrônomo e bateria contam para a meta.</p></div>` }],
  extras: { sobre: `<div class="kf-bloco"><h3>Sons</h3><p class="apoio">Guitarra, bateria e metrônomo do banco Fluid (R3), de Frank Wen (2000–2002, 2008), com a versão mono de Michael Cowgill (2014–2016), sob a licença MIT. A licença completa acompanha o app, no arquivo <a href="sons/LICENCA-FluidR3.txt" target="_blank" rel="noopener">sons/LICENCA-FluidR3.txt</a>.</p></div>` },
});
// a Teoria leva aos treinos: a escala e a posição equivalentes no catálogo

/* ================= desenho ================= */
function render() {
  corrigirEndereco();
  const r = rota(), chave = caminho().filter(Boolean).join('/') || 'inicio';
  if (r !== 'metronomo' && metro.ligado) metroParar();
  if (r !== 'afinador') afinadorDesligar();
  if (r !== 'bateria') bateriaParar();
  desenharNav();
  const m = $('#main'), trocou = telaAtual !== chave;
  m.dataset.tela = r;
  m.innerHTML = (r === 'inicio' ? '' : `<div class="torre-retorno"><button type="button" class="kf-btn kf-sec torre-voltar" data-ir="inicio">${I.voltar || '←'}Voltar à torre</button></div>`) + palcoCabecalho(r) + VIEWS[r]();
  if (r === 'ajustes') KitFacil.ajustes.ligar(m);
  ligar(m, r);
  KitFacil.topo.atualizar();
  if (typeof PalcoFX !== 'undefined') PalcoFX.atualizar();
  if (trocou) {
    if (r !== 'inicio') KitFacil.movimento.entrar(m, { de: 'tela' });
    window.scrollTo(0, r === 'inicio' ? torreRolagem : 0);
    if (r === 'inicio' && torreDestino) requestAnimationFrame(() => {
      window.scrollTo(0, torreRolagem);
      m.querySelector(`.torre-modulo[data-ir="${torreDestino}"]`)?.focus({ preventScroll: true });
    });
  }
  if (r === 'musicas' && PLAYLISTS.some(p => p.id === subRota())) { const sec = $('#' + subRota()); if (sec) requestAnimationFrame(() => sec.scrollIntoView({ block: 'start', behavior: KitFacil.movimento.reduzido() ? 'auto' : 'smooth' })); }
  telaAtual = chave;
}
function ligar(m, r) {
  // treinos: abrir pelo modelo (com a duração escolhida), sortear da lista e continuar o último
  const comTam = b => b.dataset.tam ? { cfg: { tam: b.dataset.tam } } : {};
  $$('[data-tr-modelo]', m).forEach(b => b.onclick = () => abrirTreino(b.dataset.trModelo, comTam(b)));
  $$('[data-tr-sortear]', m).forEach(b => b.onclick = () => { const L = b.dataset.trSortear.split(' '); abrirTreino(L[Math.floor(Math.random() * L.length)], comTam(b)); });
  $$('[data-caminho-pular]', m).forEach(b => b.onclick = escolherNivelCaminho);
  if (r === 'treinos') ligarBusca(m);
  if (r === 'sessao') ligarSessao(m);
  if (r === 'estudio') ligarEstudio(m);
  if (r === 'biblioteca') { ligarBiblioteca(m); ligarMusicas(m); }
  if (r === 'progresso' || r === 'jornada') { ligarMetas(m); ligarCompetencias(m); }
  if (r === 'jornada') ligarPrimeiraVez(m);
  if (r === 'caminho' && subRota()) { const e = $('#etapa-' + subRota(), m); if (e) setTimeout(() => e.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }), 320); } // depois da entrada da tela
  $$('[data-tr-ultimo]', m).forEach(b => b.onclick = () => { const u = ultimoTreino(); if (u) abrirTreino(u.id, { cfg: u.cfg, bpm: u.bpm }); });
  $$('[data-dia]', m).forEach(b => b.onclick = () => abrirTreino(null, { fila: treinoDoDia(+b.dataset.dia) }));
  $$('[data-plano-treino]', m).forEach(b => b.onclick = () => abrirTreino(b.dataset.planoTreino, { bpm: +b.dataset.planoBpm }));
  $$('[data-plano-criar]', m).forEach(b => b.onclick = () => { const [tec, nivel, ini, meta] = b.dataset.planoCriar.split('|'); DB.cfg.plano = { tec, nivel: +nivel, ini: +ini, meta: +meta, em: Date.now() }; commit(); ir('plano'); KitFacil.avisar('Plano criado: quatro semanas até ' + meta + ' bpm.'); });
  $$('[data-plano-fim]', m).forEach(b => b.onclick = () => { const p = DB.cfg.plano; DB.cfg.plano = null; commit(); render(); if (!p.fim) KitFacil.avisar('Plano encerrado.', { label: 'Desfazer', run: () => { DB.cfg.plano = p; commit(); render(); } }); });
  $$('[data-bpm]', m).forEach(b => b.onclick = () => mudarBpm(DB.cfg.bpm + +b.dataset.bpm));
  if (r === 'metronomo') {
    $('#bpm-r', m).addEventListener('input', e => mudarBpm(+e.target.value));
    $('#metro', m).onclick = () => metro.ligado ? metroParar() : metroLigar();
    $('#toque-ritmo', m).onclick = tocarRitmo;
    $$('[data-compasso]', m).forEach(b => b.onclick = () => { DB.cfg.compasso = +b.dataset.compasso; commit(); const lig = metro.ligado; if (lig) metroParar(); redesenhar(); if (lig) metroLigar(); });
  }
  if (r === 'afinador') {
    $$('[data-corda]', m).forEach(b => b.onclick = () => { const a = audio(); if (a) tocarCorda(afinacao()[+b.dataset.corda], a.currentTime + .02, 1.8); });
    $('#af-ligar', m).onclick = () => afinador.ligado ? afinadorDesligar() : afinadorLigar();
    $('#af-afinacao', m).addEventListener('change', e => { DB.cfg.afinacao = e.target.value; commit(); redesenhar(); });
  }
  if (r === 'bateria') {
    $$('[data-estilo]', m).forEach(b => b.onclick = () => { DB.cfg.estilo = b.dataset.estilo; commit(); $$('[data-estilo]', m).forEach(x => x.setAttribute('aria-pressed', x === b)); if (bateria.ligada) { bateriaParar(); ligarBateria(m); } });
    $('#bat-ligar', m).onclick = () => { if (bateria.ligada) bateriaParar(); else ligarBateria(m); const b = $('#bat-ligar', m); b.innerHTML = bateria.ligada ? I.stop : I.play; b.classList.toggle('on', bateria.ligada); b.setAttribute('aria-label', bateria.ligada ? 'Parar a bateria' : 'Tocar a bateria'); if (!bateria.ligada) $$('.batidas span', m).forEach(x => x.classList.remove('on')); };
  }
  if (r === 'explorar') ligarExplorar(m);
  if (r === 'acordes') ligarAcordes(m);
  $$('[data-musica-nova]', m).forEach(b => b.onclick = () => janelaMusica());
  $$('[data-musica]', m).forEach(b => b.onclick = () => janelaMusica(b.dataset.musica));
  $$('[data-pl-add]', m).forEach(b => b.onclick = () => {
    const [pid, i] = b.dataset.plAdd.split('|'), [t, a] = PLAYLISTS.find(x => x.id === pid).musicas[+i];
    DB.musicas.push({ id: uid(), titulo: t, artista: a, estado: 'quero', obs: '', criada: Date.now() }); commit();
    redesenhar(); KitFacil.avisar(`${t} está na sua lista.`);
  });
  if (r === 'ajustes') $('#aj-meta', m)?.addEventListener('change', e => { DB.cfg.meta = +e.target.value; commit(); KitFacil.avisar('Meta salva.'); });
}

// redesenha a tela atual sem perder as seções abertas nem a rolagem
function redesenhar() {
  const m = $('#main'), r = rota(), abertos = $$('details[open]', m).map(x => x.id).filter(Boolean), y = window.scrollY;
  m.innerHTML = (r === 'inicio' ? '' : `<div class="torre-retorno"><button type="button" class="kf-btn kf-sec torre-voltar" data-ir="inicio">${I.voltar || '←'}Voltar à torre</button></div>`) + palcoCabecalho(r) + VIEWS[r]();
  $$('details[data-kf-secao]', m).forEach(x => { if (x.id) x.open = abertos.includes(x.id); });
  if (r === 'ajustes') KitFacil.ajustes.ligar(m);
  ligar(m, r); window.scrollTo(0, y);
}
function ligarBateria(m) {
  bateriaLigar(DB.cfg.estilo, () => DB.cfg.bpm, b => { $$('.batidas span', m).forEach((x, i) => x.classList.toggle('on', i === b)); });
}


/* ================= guia do app em 3 níveis (Kit 2.11) ================= */
const irTela = async t => { if (rota() !== t) ir(t); await new Promise(r => setTimeout(r, 160)); };
const naTela = (t, titulo, texto, nivel) => ({ nivel, ir: () => irTela(t), sel: '#main .kf-cab', alt: '#main', t: titulo, d: texto });
const GUIA = [
  { nivel: 1, ir: () => irTela('inicio'), sel: '.torre-modulo[data-ir="treinos"]', alt: '.torre-modulo', t: 'A torre', d: 'Cada amplificador da torre abre uma parte do app. Role para ver todos; o Voltar à torre traz você de volta.' },
  naTela('afinador', 'Afinador', 'Toque uma corda solta: o app ouve pelo microfone e mostra se a nota está alta ou baixa.', 1),
  naTela('treinos', 'Treinos', 'Os exercícios por técnica, nível e objetivo. Cada um abre um roteiro desenhado no braço antes de tocar.', 1),
  naTela('metronomo', 'Metrônomo', 'Marque o tempo do treino. Comece devagar e suba o andamento quando sair limpo.', 1),
  naTela('explorar', 'Explorar', 'O braço virtual com escalas, acordes, intervalos, harmonia e ritmo. Toque nas casas para ouvir.', 2),
  naTela('estudio', 'Estúdio', 'Crie riffs e ideias pelo braço ou pela tablatura, com ritmo, técnicas e reprodução.', 2),
  naTela('biblioteca', 'Biblioteca', 'Suas músicas e as inspirações, com links para ouvir e tocar junto.', 2),
  naTela('progresso', 'Progresso', 'O tempo de prática, os andamentos de cada treino e as conquistas.', 2),
  naTela('bateria', 'Bateria', 'Uma levada de bateria no estilo e no andamento que você escolher, para treinar com groove.', 3),
  naTela('acordes', 'Acordes', 'Os desenhos dos acordes no braço, com o som de cada um.', 3),
];

/* ================= Kit Fácil ================= */
KitFacil.iniciar({
  app: 'guitarra-facil', nome: 'Guitarra Fácil', versao: VERSAO,
  resumo: 'Aprenda, explore e crie na guitarra com recursos visuais e interativos.', icone: 'icons/icon-192.png',
  tela: () => rota(), exemploDados: 'os treinos, as músicas e o tempo de prática',
  privacidade: ['Os treinos, os andamentos, as conquistas, as músicas e o tempo de prática ficam guardados neste aparelho.', 'O som dos treinos, do metrônomo, da bateria, dos acordes e das notas sai de gravações que acompanham o app e toca aqui no aparelho.', 'O afinador usa o microfone só enquanto está ligado, com a sua permissão: o som é analisado em memória, não é gravado nem enviado.', 'No treino, o microfone só é usado quando você liga "Gravar": a gravação fica só neste aparelho, é apagada ao fechar a janela do treino e nunca é enviada nem avaliada.', 'O plano de 4 semanas fica guardado com os seus treinos.'],
  abrirAjustes: secao => { if (rota() !== 'ajustes') ir('ajustes'); else if (!secao) history.back(); },
  emAjustes: () => rota() === 'ajustes',
  copia: { descricao: 'Baixe um arquivo com os treinos, as músicas e o tempo de prática.',
    baixar: () => KitFacil.copia.baixar({ db: DB }, 1),
    restaurar: async f => { const j = await KitFacil.copia.ler(f); if (!j || !j.dados || !j.dados.db) { KitFacil.avisar('Esse arquivo não é uma cópia do Guitarra Fácil.'); return; } DB = { ...vazio(), ...j.dados.db }; commit(); snapTodos(); render(); KitFacil.avisar('Cópia restaurada.'); } },
  novidades: [{ versao: '0.25.2', itens: ['No celular, o destaque do guia acompanha a tela sem atraso.'] }, { versao: '0.25.1', itens: ['O guia do app não cobre mais o que está destacado, nem em telas baixas.'] }, { versao: '0.25.0', itens: ['Apresentação curta ao abrir o app e guia em 3 níveis: essencial, exploração e completo. Dá para desligar a apresentação em Ajustes.'] }, { versao: '0.24.1', itens: ['Cartões com o mesmo canto dos outros apps da família.'] }, { versao: '0.24.0', itens: ['Torre de palco: todos os módulos em amplificadores encaixados, com nomes pintados e luzes independentes.', 'O cenário acompanha a rolagem. Sai a barra inferior; Voltar à torre mantém o ponto em que você estava.', 'Seu roteiro, perfil inicial e sequência ficam no amplificador Minha jornada.'] }, { versao: '0.23.0', itens: ['HQ em chamas: amplificadores independentes, luzes pulsantes, controles em movimento e reação elástica ao toque.', 'Fogo redesenhado conforme a prévia escolhida. Os controles de som e movimento ficam em Ajustes → Menu e efeitos.'] }, { versao: '0.22.0', itens: ['Novo em Ajustes › Privacidade e segurança: Restaurar padrões de fábrica. O app volta como novo neste aparelho, sem dados nem ajustes.'] }, { versao: '0.21.0', itens: ['Amplificadores desenhados à mão, com nomes incorporados à arte e sem o antigo banner.', 'Chamas fluidas em camadas, brasas e luz ambiente; crepitação de fogo com volume, pausa e controle para silenciar.'] }, { versao: '0.20.1', itens: ['O menu virou uma pilha de amplificadores, com textura própria e luz de ligado para a tela atual.'] }, { versao: '0.20.0', itens: ['Edição Backstage: arte de palco, painéis de amplificador e ilustrações PNG próprias em todo o app.', 'Seis estudos de mãos acompanham as demonstrações por etapas de bends, slides, ligados, tapping e vibrato.'] }, { versao: '0.19.0', itens: ["Antes de tocar, um roteiro mostra cada parte do treino no braço, com a ordem das notas e um botão para ouvir.", "Na sessão, o som para entre um treino e outro; você segue quando quiser.", "1-2-3-4 previsível, sessão mais curta e metrônomo com bloco de madeira."] }, { versao: '0.18.0', itens: ["Treinos agora ocupam a tela inteira, com tablatura, braço e controles no mesmo ambiente de foco.", "Explorar reúne braço e teoria; Biblioteca reúne prática, repertório pessoal e inspirações.", "Acordes ganhou mais de 100 formas, busca, filtros, diagramas para destros e canhotos e explicações passo a passo.", "Exercícios aparecem por número e objetivo, sem nomes fantasiosos nem escolha por gênero."] }, { versao: '0.17.0', itens: ["Demonstrações lentas de bends, slides, ligados, tapping e vibrato, com etapas, pausa e controle do movimento.", "Andamento e reprodução sempre visíveis no rodapé do treino; tablatura com arcos de ligados e slides direcionais.", "Grafia musical coerente no círculo das quintas e no campo harmônico; descrições de nível específicas por técnica."] }, { versao: '0.16.1', itens: ["Correção: a aba Competências não rola mais para o lado no tablet."] }, { versao: '0.16.0', itens: ["Baixo e cordas de fundo acompanham os treinos, cada parte com o seu volume em Ajustes do treino.", "Biblioteca: obras em domínio público (Grieg, Beethoven, Bach) e riffs originais para aplicar a técnica."] }, { versao: '0.15.0', itens: ["Estúdio: escreva seus riffs pelo braço e pela tablatura, ouça na hora e treine com bateria.", "Do Braço, leve as notas escolhidas para uma ideia nova no Estúdio."] }, { versao: '0.14.0', itens: ["O Braço virou um laboratório: notas, escalas, acordes, intervalos e um modo livre que diz o nome do acorde que você montou.", "Nos treinos com escala, \"Ver no braço\" mostra a escala inteira."] }, { versao: '0.13.0', itens: ["Sessão de hoje: diga quanto tempo tem e o app monta preparo, aquecimento, treino principal, aplicação e encerramento. Troque o que quiser.", "Guarde sessões como rotinas.", "Mapa de competências e metas de curto, médio e longo prazo em Progresso."] }, { versao: '0.12.0', itens: ["Buscar e filtrar treinos por técnica, competência, nível, tamanho, mão e objetivo.", "A tablatura mostra o ritmo de cada nota.", "Toque numa nota da tablatura para vê-la no braço, e vice-versa."] }, { versao: '0.11.0', itens: ['Títulos com fonte nova, de mais personalidade.', 'Por dentro, o app ficou organizado para receber filtros, sessões e o mapa de competências.'] }, { versao: '0.10.0', itens: ['O app abre no tema escuro. O claro e o automático continuam em Ajustes.', 'O microfone do treino só grava: ouça a gravação junto com o exemplo e julgue você mesmo. Saiu a nota automática de ritmo.', '"Saiu limpo" aparece como marcado por você: o app registra a prática, mas não mede a execução.'] }, { versao: '0.9.0', itens: ['Caminho do iniciante: cinco etapas, do primeiro toque numa corda solta ao primeiro bend, com os dedos no braço e uma dica em cada passo.', 'Início novo: o próximo passo em destaque e o caminho inteiro, com "Você está aqui".', 'Já toca? Escolha onde começar ou vá direto ao treino do dia.'] }, { versao: '0.8.0', itens: ['Som novo: guitarra limpa, bateria e metrônomo gravados de instrumentos de verdade, mais altos e por igual. Funciona sem internet.', 'O braço do treino fica sempre no mesmo tamanho e desliza até as notas da vez.', 'Bends, slides, ligados e vibratos se movem no braço junto com a nota.', 'Braço e tablatura juntos; em Ajustes do treino dá para esconder um ou outro.', 'O toque duplo não dá mais zoom no app.'] }, { versao: '0.7.0', itens: ['Repita só um trecho: toque nos compassos embaixo da tablatura para tocar só eles em laço.', 'Andamento em porcentagem da meta (50%, 70%, 85% ou 100%) e a porcentagem sempre embaixo do número.', 'Bateria no treino, no lugar do metrônomo: do pulso reto a padrões rápidos, sincopados e em meio tempo.', 'Segunda guitarra em harmonia: terças, quintas ou oitava junto com a sua linha.', 'Conferir o ritmo pelo microfone (só o tempo de cada palhetada) e gravar o treino para ouvir depois; nada sai do aparelho.', 'Plano de 4 semanas: escolha a técnica, o nível e a meta de andamento; o app monta quatro treinos por semana até lá.'] }, { versao: '0.6.0', itens: [`Catálogo amplo: ${MODELOS.length.toLocaleString('pt-BR')} treinos em riffs, solos e técnica, com grande variedade interna e 17 técnicas.`, 'Cada nível tem os seus treinos; a dificuldade vem da complexidade: técnicas misturadas, quiálteras, compassos ímpares e polirritmia.', 'O tamanho agora é o tamanho da linha: curto (1 compasso), moderado (2 a 4), longo (8, partes A e B) e muito longo (16 ou mais, com riff, breakdown e solo).', 'Afinações drop e sete cordas, com palm mute, pinch, harmônicos, notas mortas e alavanca.', 'Treino do dia, favoritos e aviso antes de trocar de etapa.', 'Visual mais escuro, com o vermelho do pedal.'] }, { versao: '0.5.0', itens: ['Cada função na sua tela: Início com menu de botões grandes, Treinos, Afinador, Teoria e, em Mais, Metrônomo, Bateria, Mapa do braço, Acordes, Músicas e Progresso.', `Catálogo com ${MODELOS.length} treinos em escalas, sequências, arpejos, licks, riffs e técnica, nos 12 tons e em todo o braço.`, 'Escolha um toque por vez: categoria, nível (iniciante, intermediário, avançado) e duração (2, 5, 10 ou 20 minutos).', 'Treinos longos percorrem as posições do braço e os tons sozinhos, com relógio na tela.', 'Janela do treino mais limpa: braço, tablatura, andamento e um botão grande; o resto fica em Ajustes.', 'Afinador com ponteiro, a corda mais perto e outras afinações; metrônomo com compasso e toque no ritmo; acordes para ouvir.'] }, { versao: '0.4.0', itens: ['O app agora é feito de treinos: sem trilha de aulas, sem teste de nível e sem professor.', 'Treino com o braço desenhado: a nota da vez acende, a próxima fica marcada e a tablatura rola junto.', 'Cromático 1-2-3-4 com as 24 combinações dos dedos: escolha a casa, as cordas e a figura, ou siga, sorteie e suba de casa a cada volta.', 'Escalas nos cinco desenhos, em qualquer tom, e um botão Treinar na Teoria.', 'Andamento de 1 em 1 ou de 5 em 5 bpm, e subida automática a cada volta.', 'Sequência de dias, a semana na tela Hoje, resumo da semana e 13 conquistas.'] }, { versao: '0.3.0', itens: ['Treinos com som e tablatura rolando, Teoria com o braço desenhado, bateria de acompanhamento e playlists recomendadas.'] }, { versao: '0.2.0', itens: ['Afinador pelo microfone, mapa das notas no braço e dez acordes. Ícone novo: o pedal de efeito.'] }, { versao: '0.1.0', itens: ['Primeira versão em testes: metrônomo, notas para afinar, primeiros acordes e lista de músicas.'] }],
  // sem boas-vindas do Kit: o Início já é o menu de tudo
  boasVindas: { novo: () => PRIMEIRO_USO },
  apresentacao: { primeiroUso: true, frase: 'Aprenda, explore e crie na guitarra com o braço virtual, a tablatura e o som juntos.', pontos: [
    ['Afine e aqueça', 'O afinador ouve pelo microfone; o metrônomo e a bateria marcam o tempo.'],
    ['Treine um passo por vez', 'Cada treino mostra no braço onde começar e a ordem das notas, a 60 bpm.'],
    ['Explore e crie', 'Escalas, acordes e harmonia no braço virtual; riffs no Estúdio.']] },
  guia: { get passos() { return GUIA; } },
});
KitFacil.tema.iniciar({ chave: KEY + 'pref', cores: { claro: '#E4E4E8', escuro: '#08080A' }, padrao: 'escuro' }); // Documento Mestre, decisão 3A: escuro de fábrica
const SY = KitFacil.sync.criar({ app: 'guitarra-facil', nome: 'Guitarra Fácil', chave: KEY + 'sync', dados: 'os treinos, as músicas e o tempo de prática',
  carimbar, aplicar, pacote, mesmo: (a, r) => KitFacil.canon(a) === KitFacil.canon({ v: 1, cfg: r.cfg, feitas: r.feitas, musicas: r.musicas, praticas: r.praticas, andamentos: r.andamentos || [], treinos: r.treinos || [], conquistas: r.conquistas || [], favoritos: r.favoritos || [], st: r.st, del: r.del }),
  redesenhar: () => render() });
$('#marca').innerHTML = I.marca; $('#marca-trilho').innerHTML = I.marca;
$('#topo').innerHTML = KitFacil.topo.html({ principal: true });
conferirConquistas(false);
render();
// o índice do catálogo (filtros e busca) é montado depois que a tela aparece, sem atrapalhar o primeiro toque
setTimeout(() => prepararIndice(), 1500);
const link = SY.tokenDoLink();
if (link) history.replaceState(null, '', location.pathname + location.hash);
SY.iniciar({ token: link, textoConfirmar: 'Os treinos, as músicas e a prática deste aparelho se juntam aos da nuvem.' });
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

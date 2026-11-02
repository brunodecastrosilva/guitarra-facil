/* Guitarra Fácil · Treinos: categorias, listas, treino do dia e favoritos */
'use strict';
/* Treinos: categoria › estilo ou técnica › nível › tamanho › lista, um toque por vez */
function miniDesenho(ex) {
  const P = ex.evs.flatMap(e => e.n), N = ex.afin ? ex.afin.length : 6; if (!P.length) return '<svg class="mini-braco" viewBox="0 0 92 64" aria-hidden="true"></svg>';
  const ks = P.map(n => n[1]), a = Math.min(...ks), b = Math.max(...ks), C = Math.max(4, Math.min(12, b - a + 1));
  const W = 92, H = 64, x = k => 8 + (Math.min(k, a + C - 1) - a + .5) * ((W - 16) / C), y = c => 8 + (N - 1 - c) * ((H - 16) / (N - 1));
  let s = `<svg class="mini-braco" viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
  for (let c = 0; c < N; c++) s += `<line x1="6" y1="${y(c)}" x2="${W - 6}" y2="${y(c)}" class="mi-l"/>`;
  for (let k = 0; k <= C; k++) s += `<line x1="${8 + k * ((W - 16) / C)}" y1="5" x2="${8 + k * ((W - 16) / C)}" y2="${H - 5}" class="mi-t"/>`;
  new Set(P.map(n => n[0] + ',' + n[1])).forEach(ch => { const [c, k] = ch.split(',').map(Number); s += `<circle cx="${x(k)}" cy="${y(c)}" r="3.8" class="mi-n${ex.raiz != null && pc(ex.afin[c] + k) === ex.raiz ? ' raiz' : ''}"/>`; });
  return s + '</svg>';
}
const iluTamanho = n => ilu(Array.from({ length: Math.min(16, n) }, (_, i) => `<rect x="${4 + (i % 8) * 7.2}" y="${n > 8 ? (i < 8 ? 12 : 27) : 20}" width="5.6" height="11" rx="1.5" class="${i === Math.min(16, n) - 1 ? 'il-a' : 'il-n'}"/>`).join('') + '<path d="M4 44h56" class="il-l"/>');
const desenhoDe = id => { const m = modelo(id); return m ? miniDesenho(volta(m, cfgPadrao(m))) : ''; };
const listaDe = (cat, sub, nivel, tam) => MODELOS.filter(m => m.cat === cat && (!sub || m.sub === sub) && m.nivel === nivel && (cat === 'escalas' || m.tamanho === tam));
const itemTreino = (m, tam) => { const v = volta(m, { ...cfgPadrao(m), tam, ...((DB.cfg.trCfg || {})[m.id] || {}) }), b = melhorLimpo(m.id); return `<li><button type="button" class="tr-item" data-tr-modelo="${m.id}"${tam ? ` data-tam="${tam}"` : ''}>${miniDesenho(v)}<span class="ld-tx"><b>${favorito(m.id) ? '<span class="fav-ic" aria-label="favorito">★</span> ' : ''}${esc(m.nome)}</b><small>${esc(typeof m.resumo === 'function' ? m.resumo() : m.resumo)}${b ? ` · seu melhor: ${b} bpm` : ''}</small></span>${I.seta}</button></li>`; };
VIEWS.treinos = () => {
  const [, cat, a, b, c] = caminho(), C = CATEGORIAS.find(x => x[0] === cat);
  if (cat === 'buscar') return telaBusca();
  if (!C) return KitFacil.ui.cabecalho({ titulo: 'Treinos', sub: `${MODELOS.length.toLocaleString('pt-BR')} treinos de rock e metal, em três níveis e quatro tamanhos.` })
    + `<form class="busca-ini" data-busca-form role="search"><label class="kf-rotulo" for="busca-ini">Buscar treinos</label><div class="busca-linha"><input id="busca-ini" type="search" class="kf-entrada" placeholder="galope, thrash, bend, pentatônica…" value="${esc(BUSCA.busca)}"><button type="submit" class="kf-btn kf-pri">${I.busca || ''}Buscar</button></div>
      <button type="button" class="kf-btn kf-sec busca-filtros" data-ir="treinos/buscar">${I.ajustes}Filtrar por técnica, competência, mão e mais</button></form>`
    + `<div class="ladrilhos">${CATEGORIAS.map(([id, nome, d]) => ladrilho({ ir: 'treinos/' + id, ilu: ILU[id], nome, sub: d, selo: MODELOS.filter(m => m.cat === id).length.toLocaleString('pt-BR') })).join('')}</div>`;
  const base = 'treinos/' + C[0], temSub = C[0] !== 'escalas';
  const SUBS = C[0] === 'tecnica' ? TECNICAS_TREINO.map(t => [t.id, t.nome, t.d]) : ESTILOS.map(e => [e.id, e.nome, `No estilo de ${e.inspira}.`]);
  const S = temSub ? SUBS.find(x => x[0] === a) : null;
  if (temSub && !S) return migalhas([['treinos', 'Treinos'], [null, C[1]]]) + KitFacil.ui.cabecalho({ titulo: C[1], sub: C[0] === 'tecnica' ? 'Escolha a técnica.' : 'Escolha o estilo. Os riffs e solos são originais do app, inspirados nas bandas de cada estilo.' })
    + `<div class="ladrilhos">${SUBS.map(([id, nome, d]) => ladrilho({ ir: `${base}/${id}`, ilu: desenhoDe(`${C[0]}:${id}:2:curto:0`), nome, sub: d, classe: 'sub' })).join('')}</div>`;
  const bs = temSub ? `${base}/${S[0]}` : base, nv = temSub ? b : a, N = NIVEIS.find(n => n[1] === nv), cam = [['treinos', 'Treinos'], [base, C[1]], ...(temSub ? [[bs, S[1]]] : [])], titulo = temSub ? S[1] : C[1];
  if (!N) return migalhas([...cam.slice(0, -1), [null, cam[cam.length - 1][1]]]) + KitFacil.ui.cabecalho({ titulo, sub: 'Escolha o nível. Cada nível tem os seus treinos.' })
    + `<div class="ladrilhos l1">${NIVEIS.map(([n, id, nome, d]) => ladrilho({ ir: `${bs}/${id}`, ilu: iluNivel(n), nome, sub: d, selo: String(MODELOS.filter(m => m.cat === C[0] && (!temSub || m.sub === S[0]) && m.nivel === n).length), classe: 'largo' })).join('')}</div>`;
  const bn = `${bs}/${N[1]}`, tm = temSub ? c : b, TM = TAMANHOS.find(t => t[0] === tm);
  if (!TM) return migalhas([...cam, [null, N[2]]]) + KitFacil.ui.cabecalho({ titulo, sub: `${N[2]}. Escolha o tamanho da linha.` })
    + `<div class="ladrilhos">${TAMANHOS.map(([id, nome, n, d]) => ladrilho({ ir: `${bn}/${id}`, ilu: iluTamanho(n), nome, sub: d, selo: `${n}${n >= 16 ? '+' : ''} comp.` })).join('')}</div>`;
  const L = listaDe(C[0], temSub ? S[0] : null, N[0], TM[0]);
  return migalhas([...cam, [bn, N[2]], [null, TM[1]]]) + KitFacil.ui.cabecalho({ titulo, sub: `${N[2]} · ${TM[1].toLowerCase()}: ${TM[3].toLowerCase()}` })
    + `<div class="pilha"><button type="button" class="kf-btn kf-sec sortear" data-tr-sortear="${esc(L.map(m => m.id).join(' '))}" data-tam="${TM[0]}">${I.sortear}Sortear um treino</button>
      <ul class="tr-lista">${L.map(m => itemTreino(m, C[0] === 'escalas' ? TM[0] : null)).join('')}</ul></div>`;
};
// treino do dia: escolher o nível e começar; a lista mostra o que vem
VIEWS.dia = () => migalhas([['inicio', 'Início'], [null, 'Treino do dia']]) + KitFacil.ui.cabecalho({ titulo: 'Treino do dia', sub: 'Quatro treinos seguidos: técnica, riff, solo e uma linha muito longa. Cada um por algumas voltas; o app avisa antes de trocar.' })
  + `<div class="pilha">${NIVEIS.map(([n, id, nome]) => `<section class="cartao dia-nivel"><div class="dia-cab"><span class="ld-ilu">${iluNivel(n)}</span><h2>${nome}</h2></div>
    <ol class="dia-lista">${treinoDoDia(n).map(id => { const m = modelo(id); return m ? `<li><b>${esc(m.cat === 'tecnica' ? 'Técnica' : m.cat === 'riffs' ? (m.tamanho === 'muito-longo' ? 'Linha longa' : 'Riff') : 'Solo')}</b> · ${esc(tituloDe(m))}</li>` : ''; }).join('')}</ol>
    <button type="button" class="kf-btn kf-pri dia-ir" data-dia="${n}">${I.play}Começar o treino ${nome.toLowerCase()}</button></section>`).join('')}</div>`;
VIEWS.favoritos = () => {
  const L = DB.favoritos.map(f => modelo(f.id)).filter(Boolean);
  return migalhas([['inicio', 'Início'], [null, 'Favoritos']]) + KitFacil.ui.cabecalho({ titulo: 'Favoritos', sub: 'Os treinos que você marcou com a estrela.' })
    + (L.length ? `<ul class="tr-lista">${L.map(m => itemTreino(m, m.cat === 'escalas' ? 'moderado' : null)).join('')}</ul>` : KitFacil.ui.vazio({ titulo: 'Nenhum favorito ainda', texto: 'Abra um treino e toque na estrela, no canto do braço. Ele aparece aqui.', acao: '<button type="button" class="kf-btn kf-pri" data-ir="treinos">Ir para os treinos</button>' }));
};

VIEWS.afinador = () => {
  const A = afinacao(), nomes = A.map((_, i) => `${A.length - i}ª`);
  return KitFacil.ui.cabecalho({ titulo: 'Afinador', sub: 'Toque uma corda solta. O som é analisado aqui e não é gravado.' })
  + `<div class="pilha afin">
    <div class="af-palco" aria-live="polite">
      <svg class="af-medidor" viewBox="0 0 240 140" aria-hidden="true"><path d="M20 128a100 100 0 0 1 200 0" class="af-arco"/><path d="M104 30a100 100 0 0 1 32 0" class="af-certo"/>${Array.from({ length: 11 }, (_, i) => { const a = (-80 + i * 16) * Math.PI / 180; return `<line x1="${120 + 88 * Math.sin(a)}" y1="${128 - 88 * Math.cos(a)}" x2="${120 + (i === 5 ? 74 : 80) * Math.sin(a)}" y2="${128 - (i === 5 ? 74 : 80) * Math.cos(a)}" class="af-tick"/>`; }).join('')}<g id="af-ponteiro" class="af-ponteiro"><line x1="120" y1="128" x2="120" y2="40"/><circle cx="120" cy="128" r="7"/></g></svg>
      <div class="af-nota" id="af-nota">–</div>
      <p class="apoio" id="af-msg">Ligue o microfone e toque uma corda solta.</p>
    </div>
    <button type="button" class="kf-btn ${afinador.ligado ? 'kf-sec' : 'kf-pri'} af-ligar" id="af-ligar">${afinador.ligado ? I.stop + 'Desligar o microfone' : I.mic + 'Ligar o microfone'}</button>
    <div class="cordas" role="group" aria-label="Ouvir cada corda" style="grid-template-columns:repeat(${A.length},minmax(0,1fr))">${A.map((m, i) => `<button type="button" class="corda-bt" data-corda="${i}" aria-label="Ouvir a ${nomes[i]} corda, ${NOTAS[pc(m)]}"><b>${CIFRA[pc(m)]}</b><small>${nomes[i]}</small></button>`).join('')}</div>
    <div class="campo af-tipo"><label class="kf-rotulo" for="af-afinacao">Afinação</label><select id="af-afinacao">${AFINACOES.map(([k, n]) => `<option value="${k}"${(DB.cfg.afinacao || 'padrao') === k ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
  </div>`;
};

/* busca e filtros combinados (Documento Mestre, seção 6): os filtros ficam guardados enquanto o app está aberto */
const BUSCA = { busca: '', categoria: '', estilo: '', tecnica: '', nivel: '', tamanho: '', mao: '', competencia: '', objetivo: '', n: 30 };
const FILTROS = () => [
  ['categoria', 'Categoria', [...CATEGORIAS.map(c => [c[0], c[1]]), ['caminho', 'Caminho do iniciante'], ...(typeof OBRAS !== 'undefined' ? [['biblioteca', 'Biblioteca']] : []), ['estudio', 'Suas criações']]],
  ['competencia', 'Competência', COMPETENCIAS.map(c => [c[0], c[1]])],
  ['tecnica', 'Técnica', Object.entries(TECNICAS_NOTAS)],
  ['estilo', 'Estilo', ESTILOS.map(e => [e.id, e.nome])],
  ['nivel', 'Nível', NIVEIS.map(n => [n[0], n[2]])],
  ['tamanho', 'Tamanho', TAMANHOS.map(t => [t[0], t[1]])],
  ['mao', 'Mão trabalhada', MAOS],
  ['objetivo', 'Objetivo', OBJETIVOS],
];
const precisaIndice = () => !!(BUSCA.mao || BUSCA.competencia || BUSCA.tecnica);
function telaBusca() {
  return migalhas([['treinos', 'Treinos'], [null, 'Buscar e filtrar']]) + KitFacil.ui.cabecalho({ titulo: 'Buscar e filtrar', sub: 'Combine o que quiser: técnica, competência, estilo, nível, tamanho, mão e objetivo.' })
    + `<div class="pilha"><section class="cartao filtros-cx"><div class="campo"><label class="kf-rotulo" for="busca-q">Buscar</label><input id="busca-q" type="search" class="kf-entrada" placeholder="galope, thrash, bend, pentatônica…" value="${esc(BUSCA.busca)}"></div>
      <div class="filtros">${FILTROS().map(([k, rot, ops]) => `<div class="campo"><label class="kf-rotulo" for="f-${k}">${rot}</label><select id="f-${k}" data-filtro="${k}"><option value="">Todos</option>${ops.map(([v, n]) => `<option value="${esc(String(v))}"${String(BUSCA[k]) === String(v) ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></div>`).join('')}</div>
      <button type="button" class="kf-btn kf-sec" data-filtro-limpar>Limpar os filtros</button></section>
      <div id="busca-res" aria-live="polite"></div></div>`;
}
function pintarBusca(m) {
  const res = $('#busca-res', m); if (!res) return;
  if (precisaIndice() && !indice.pronto) { res.innerHTML = `<p class="apoio">Preparando o catálogo: ${indice.feitos.toLocaleString('pt-BR')} de ${MODELOS.length.toLocaleString('pt-BR')} treinos classificados…</p>`; prepararIndice(() => pintarBusca(m)); clearTimeout(pintarBusca.t); pintarBusca.t = setTimeout(() => { if (!indice.pronto) pintarBusca(m); }, 400); return; }
  const f = { ...BUSCA }, L = filtrarExercicios(f), V = L.slice(0, BUSCA.n);
  res.innerHTML = L.length ? `<p class="apoio busca-n"><b>${L.length.toLocaleString('pt-BR')}</b> ${L.length === 1 ? 'treino encontrado' : 'treinos encontrados'}${L.length > 1 ? ` · <button type="button" class="kf-link" data-tr-sortear="${esc(L.slice(0, 400).map(x => x.id).join(' '))}">sortear um</button>` : ''}</p>
      <ul class="tr-lista">${V.map(x => itemTreino(x, x.cat === 'escalas' ? (BUSCA.tamanho || 'moderado') : null)).join('')}</ul>${L.length > V.length ? `<button type="button" class="kf-btn kf-sec busca-mais" data-busca-mais>Mostrar mais ${Math.min(30, L.length - V.length)}</button>` : ''}`
    : KitFacil.ui.vazio({ titulo: 'Nenhum treino com esses filtros', texto: 'Tire um filtro ou troque a busca. Os filtros se somam: cada um a mais deixa a lista menor.', acao: '<button type="button" class="kf-btn kf-pri" data-filtro-limpar>Limpar os filtros</button>' });
  const comTam = b => b.dataset.tam ? { cfg: { tam: b.dataset.tam } } : {};
  $$('[data-tr-modelo]', res).forEach(b => b.onclick = () => abrirTreino(b.dataset.trModelo, comTam(b)));
  $$('[data-tr-sortear]', res).forEach(b => b.onclick = () => { const L2 = b.dataset.trSortear.split(' '); abrirTreino(L2[Math.floor(Math.random() * L2.length)]); });
  $$('[data-busca-mais]', res).forEach(b => b.onclick = () => { BUSCA.n += 30; pintarBusca(m); });
  $$('[data-filtro-limpar]', res).forEach(b => b.onclick = limparFiltros);
}
function limparFiltros() { Object.keys(BUSCA).forEach(k => { BUSCA[k] = k === 'n' ? 30 : ''; }); redesenhar(); }
function ligarBusca(m) {
  const f = $('[data-busca-form]', m);
  if (f) f.addEventListener('submit', e => { e.preventDefault(); BUSCA.busca = $('#busca-ini', m).value.trim(); BUSCA.n = 30; ir('treinos/buscar'); });
  if (parte(1) !== 'buscar') return;
  const q = $('#busca-q', m); let t = 0;
  q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { BUSCA.busca = q.value.trim(); BUSCA.n = 30; pintarBusca(m); }, 220); });
  $$('[data-filtro]', m).forEach(sel => sel.addEventListener('change', () => { BUSCA[sel.dataset.filtro] = sel.value; BUSCA.n = 30; pintarBusca(m); }));
  $$('[data-filtro-limpar]', m).forEach(b => b.onclick = limparFiltros);
  pintarBusca(m);
}

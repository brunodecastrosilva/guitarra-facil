/* Guitarra Fácil · telas principais: Início, Treinos, Biblioteca, Acordes e Progresso, e as peças comuns das telas.
   Cada tela é { titulo, sub, principal, html(args), ligar(raiz, args), acoes?(args), sair?() }; o app.js monta a moldura. */
'use strict';

const TELAS = {};

/* ---------- peças comuns ---------- */
const notacao = () => ({ cifra: DADOS.perfil().notacao === 'cifras' });
const canhoto = () => DADOS.perfil().mao === 'canhoto';
const afin = () => DADOS.perfil().afin;
function subEx(ex) {
  if (ex.tipo === 'preparo') return `Preparo · cerca de ${Math.max(1, Math.round(ex.seg / 60))} min`;
  const partes = [CATALOGO.NIVEIS[ex.nivel], ex.familia === 'biblioteca' ? ex.autor : CATALOGO.nomeCompetencia(ex.competencia), `${ex.bpm.ini} a ${ex.bpm.meta} bpm`];
  return partes.filter(Boolean).join(' · ');
}
function seloEx(id) {
  const e = DADOS.estadoEx(id);
  if (e.limpos) return `<span class="gf-selo gf-ok">${ICONE.check}Limpo ${e.limpos > 1 ? e.limpos + ' vezes' : '1 vez'}</span>`;
  if (e.vezes) return `<span class="gf-selo">Praticado ${e.vezes > 1 ? e.vezes + ' vezes' : '1 vez'}</span>`;
  return '';
}
/* linha de um exercício: número e objetivo, com nível, competência e andamento embaixo */
function linhaEx(ex, { rota, extra = '' } = {}) {
  const num = ex.num ? `#${ex.id}` : '';
  return `<li><button type="button" class="gf-linha" data-ir="${esc(rota || 'treino/' + ex.id)}">
    ${num ? `<span class="gf-num">${num}</span>` : ''}<span class="gf-linha-tx"><b>${esc(ex.objetivo)}</b><small>${esc(subEx(ex))}</small>${seloEx(ex.id)}${extra}</span>${ICONE.seta}</button></li>`;
}
const secao = (titulo, corpo, { aberta = true, resumo = '', attrs = '' } = {}) =>
  `<details data-kf-secao class="gf-secao" ${aberta ? 'open' : ''} ${attrs}><summary><span class="gf-secao-t">${esc(titulo)}</span>${resumo ? `<small data-kf-secao-resumo>${esc(resumo)}</small>` : ''}</summary><div class="gf-pilha gf-secao-in">${corpo}</div></details>`;
const dados = pares => `<dl class="kf-dados">${pares.map(([r, v]) => `<div><dt>${esc(r)}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
/* segmento do Kit; a opção pode ter um nome completo para o leitor de tela quando o texto visível é curto */
const segmento = (nome, rotulo, opcoes, atual) => `<div class="gf-campo"><span class="kf-rotulo" id="seg-${nome}">${esc(rotulo)}</span><div class="kf-seg" role="group" aria-labelledby="seg-${nome}">${opcoes.map(([v, t, longo]) =>
  `<button type="button" data-seg-${nome}="${esc(v)}" aria-pressed="${String(v) === String(atual)}"${longo ? ` aria-label="${esc(longo)}" title="${esc(longo)}"` : ''}>${esc(t)}</button>`).join('')}</div></div>`;
const escolhaHTML = (id, rotulo, opcoes, atual) => `<div class="gf-campo"><label class="kf-rotulo" for="${id}">${esc(rotulo)}</label><select id="${id}" class="kf-entrada">${opcoes.map(([v, t]) =>
  `<option value="${esc(v)}" ${String(v) === String(atual) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>`;
const minTxt = seg => { const m = Math.round(seg / 60); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`; };

/* ---------- sessão de hoje: cinco etapas dentro do tempo escolhido ---------- */
const SESSAO = (() => {
  const ETAPAS = [['preparo', 'Preparação', .1], ['aquecimento', 'Aquecimento', .15], ['principal', 'Treino principal', .4], ['aplicacao', 'Aplicação musical', .25], ['encerramento', 'Encerramento', .1]];
  const semente = () => { const d = new Date(); return d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate(); };
  const girar = (lista, n) => lista.length ? lista.map((x, i) => lista[(i + n) % lista.length]) : lista;
  function pool(etapa, perfil) {
    const nv = perfil.nivel, L = CATALOGO.LISTA;
    if (etapa === 'preparo') return L.filter(e => e.tipo === 'preparo' && e.objetivo !== 'Soltar o corpo depois de tocar').map(e => e.id);
    if (etapa === 'encerramento') return [L.find(e => e.objetivo === 'Soltar o corpo depois de tocar').id, ...L.filter(e => e.familia === 'ritmo' && e.nivel <= nv).map(e => e.id)];
    if (etapa === 'aquecimento') return L.filter(e => ['dedos', 'palhetada'].includes(e.familia) && e.nivel <= nv).map(e => e.id);
    if (etapa === 'aplicacao') return [...BIBLIOTECA.OBRAS.filter(o => o.nivel <= nv).map(o => 'b-' + o.id), ...L.filter(e => ['acordes', 'power', 'arpejos'].includes(e.familia) && e.nivel === nv).map(e => e.id)];
    // principal: o caminho do iniciante enquanto não termina; depois, a competência menos praticada
    if (nv === 1) { const falta = CATALOGO.CAMINHO.filter(id => CATALOGO.porId(id).tipo !== 'preparo' && !DADOS.estadoEx(id).limpos); if (falta.length) return falta; }
    const comp = DADOS.competencias();
    const ordem = CATALOGO.COMPETENCIAS.map(c => c[0]).filter(c => c !== 'preparo').sort((a, b) => comp[a].seg - comp[b].seg);
    return ordem.flatMap(c => L.filter(e => e.competencia === c && e.nivel === nv).map(e => e.id));
  }
  function montar(minutos) {
    const perfil = DADOS.perfil(), n = Math.max(3, Math.round(minutos / 4)), s = semente();
    const etapas = ETAPAS.map(([id, nome, pct]) => {
      let q = Math.round(n * pct);
      if (id === 'preparo' || id === 'principal') q = Math.max(1, q);
      if (id === 'aquecimento' && minutos >= 10) q = Math.max(1, q);
      const p = id === 'principal' && perfil.nivel === 1 ? pool(id, perfil) : girar(pool(id, perfil), s);
      return { id, nome, itens: p.slice(0, q) };
    });
    return { dia: hojeISO(), minutos, etapas, pos: 0, alvo: Math.round(minutos * 60 / Math.max(1, etapas.reduce((t, e) => t + e.itens.length, 0))) };
  }
  function atual() {
    const a = DADOS.aparelho().sessao;
    return a && a.dia === hojeISO() ? a : null;
  }
  const guardar = s => DADOS.mudarAparelho({ sessao: s });
  const fila = s => s.etapas.flatMap(e => e.itens);
  /* na sessão, cada treino repete até ocupar a sua parte do tempo (no mínimo as repetições dos Ajustes) */
  function voltas(s, ex) {
    if (ex.tipo === 'preparo') return 1;
    const uma = CATALOGO.segundos(ex, DADOS.andamento(ex.id) || ex.bpm.ini) || 1;
    return limitar(Math.round((s.alvo || 240) / uma), DADOS.perfil().voltas, 40);
  }
  const duracao = s => fila(s).reduce((t, id) => { const ex = DADOS.buscar(id); return t + (ex ? CATALOGO.segundos(ex, DADOS.andamento(id) || ex.bpm.ini) * voltas(s, ex) : 0); }, 0);
  /* outro treino do mesmo tipo para a etapa, que ainda não esteja na sessão */
  function trocar(s, etapa, i) {
    const e = s.etapas.find(x => x.id === etapa), usados = new Set(fila(s));
    const opcoes = pool(etapa, DADOS.perfil()).filter(id => !usados.has(id));
    if (!opcoes.length) return false;
    e.itens[i] = opcoes[Math.floor(Math.random() * opcoes.length)]; guardar(s); return true;
  }
  return { ETAPAS, montar, atual, guardar, fila, duracao, trocar, voltas };
})();

/* ================= Início ================= */
TELAS.inicio = {
  titulo: 'Início', principal: true,
  sub: 'Seu próximo passo na guitarra.',
  html() {
    const p = DADOS.perfil(), sem = DADOS.semana(), seq = DADOS.sequencia();
    const minutosSessao = (SESSAO.atual() || {}).minutos || DADOS.aparelho().minutosSessao || 20;
    const caminho = CATALOGO.CAMINHO.map(id => CATALOGO.porId(id));
    const proximo = caminho.find(e => !DADOS.estadoEx(e.id).limpos);
    const ultimo = DADOS.praticas()[0], exUlt = ultimo && DADOS.buscar(ultimo.ex);
    const favs = DADOS.favoritos().map(DADOS.buscar).filter(Boolean).slice(0, 5);
    const feitos = caminho.filter(e => DADOS.estadoEx(e.id).limpos).length;
    return `
      <section class="gf-pilha" aria-labelledby="h-sessao">
        <h2 class="gf-h" id="h-sessao">Sessão de hoje</h2>
        <p class="gf-apoio">Preparação, aquecimento, treino principal, aplicação e encerramento, no tempo que você tem.</p>
        ${segmento('min', 'Tempo disponível', [[10, '10 min'], [20, '20 min'], [30, '30 min'], [45, '45 min']], minutosSessao)}
        <button type="button" class="kf-btn kf-pri" id="ver-sessao">Ver a sessão de hoje</button>
      </section>
      ${p.nivel === 1 && proximo ? `<section class="gf-pilha" aria-labelledby="h-prox"><h2 class="gf-h" id="h-prox">Próximo passo</h2><ul class="gf-lista">${linhaEx(proximo)}</ul></section>` : ''}
      ${exUlt ? `<section class="gf-pilha" aria-labelledby="h-cont"><h2 class="gf-h" id="h-cont">Continuar</h2><ul class="gf-lista">${linhaEx(exUlt)}</ul></section>` : ''}
      <section class="gf-pilha" aria-labelledby="h-semana">
        <h2 class="gf-h" id="h-semana">Esta semana</h2>
        ${dados([['Tempo tocado', `${minTxt(sem.seg)} de ${p.metaSemana} min`], ['Dias com treino', `${sem.dias} de 7`], ['Dias seguidos', plural(seq, 'dia', 'dias')], ['Treinos', String(sem.treinos)], ['Saíram limpos', String(sem.limpos)]])}
        ${sem.treinos ? '' : '<p class="gf-apoio">Ainda sem treinos nesta semana. Toque em Ver a sessão de hoje para começar.</p>'}
      </section>
      ${favs.length ? `<section class="gf-pilha" aria-labelledby="h-fav"><h2 class="gf-h" id="h-fav">Favoritos</h2><ul class="gf-lista">${favs.map(e => linhaEx(e)).join('')}</ul></section>` : ''}
      ${secao('Caminho do iniciante', `<p class="gf-apoio">Do primeiro toque às primeiras frases, em ${caminho.length} passos. Siga na ordem ou pule para onde quiser.</p><ol class="gf-lista" id="caminho">${caminho.map(e => linhaEx(e)).join('')}</ol>`, { aberta: p.nivel === 1, resumo: `${feitos} de ${caminho.length}` })}`;
  },
  ligar(r) {
    r.querySelectorAll('[data-seg-min]').forEach(b => b.onclick = () => {
      DADOS.mudarAparelho({ minutosSessao: +b.dataset.segMin });
      r.querySelectorAll('[data-seg-min]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    });
    $('#ver-sessao', r).onclick = () => {
      const m = DADOS.aparelho().minutosSessao || 20, s = SESSAO.atual();
      if (!s || s.minutos !== m) SESSAO.guardar(SESSAO.montar(m));
      APP.ir('sessao');
    };
  },
};

/* ================= Treinos ================= */
const FILTRO = { texto: '', nivel: '', competencia: '', mao: '', aba: 'todos', mostrar: 30 };
TELAS.treinos = {
  titulo: 'Treinos', principal: true,
  sub: 'Todos os exercícios, pelo número e pelo objetivo.',
  html() {
    const todos = CATALOGO.filtrar(FILTRO), favs = DADOS.favoritos().map(DADOS.buscar).filter(Boolean);
    const lista = FILTRO.aba === 'favoritos' ? favs : todos;
    return `
      ${KitFacil.ui.abas({ itens: [['todos', 'Catálogo', CATALOGO.LISTA.length], ['favoritos', 'Favoritos', favs.length]], atual: FILTRO.aba, rotulo: 'Partes de Treinos', dado: 'aba-treinos' })}
      ${FILTRO.aba === 'todos' ? `<div class="gf-pilha">
        <div class="gf-campo"><label class="kf-rotulo" for="busca">Buscar</label><input id="busca" class="kf-entrada" type="search" placeholder="Número ou objetivo, por exemplo: 0030 ou escala" value="${esc(FILTRO.texto)}" autocomplete="off"></div>
        ${segmento('nivel', 'Nível', [['', 'Todos'], [1, 'Iniciante'], [2, 'Interm.', 'Intermediário'], [3, 'Avançado']], FILTRO.nivel)}
        ${escolhaHTML('f-comp', 'Competência', [['', 'Todas'], ...CATALOGO.COMPETENCIAS], FILTRO.competencia)}
        ${escolhaHTML('f-mao', 'Mão trabalhada', [['', 'As duas e cada uma'], ...Object.entries(CATALOGO.MAOS)], FILTRO.mao)}
        <p class="gf-apoio" role="status">${plural(todos.length, 'exercício encontrado', 'exercícios encontrados')}</p>
      </div>` : ''}
      ${lista.length ? `<ul class="gf-lista" id="lista-treinos">${lista.slice(0, FILTRO.mostrar).map(e => linhaEx(e)).join('')}</ul>
        ${lista.length > FILTRO.mostrar ? '<button type="button" class="kf-btn kf-sec" id="mais-treinos">Mostrar mais</button>' : ''}`
        : FILTRO.aba === 'favoritos'
          ? KitFacil.ui.vazio({ titulo: 'Nenhum favorito ainda', texto: 'Abra um treino e toque na estrela para guardá-lo aqui.' })
          : KitFacil.ui.vazio({ titulo: 'Nenhum exercício com esses filtros', texto: 'Apague a busca ou escolha outro nível.' })}`;
  },
  ligar(r) {
    const re = (foco) => { FILTRO.mostrar = 30; APP.redesenhar({ foco }); };
    r.querySelectorAll('[data-aba-treinos]').forEach(b => b.onclick = () => { FILTRO.aba = b.dataset.abaTreinos; APP.redesenhar(); });
    const busca = $('#busca', r);
    if (busca) { let t; busca.oninput = () => { clearTimeout(t); t = setTimeout(() => { FILTRO.texto = busca.value; re('#busca'); }, 250); }; }
    r.querySelectorAll('[data-seg-nivel]').forEach(b => b.onclick = () => { FILTRO.nivel = b.dataset.segNivel; re(); });
    const fc = $('#f-comp', r); if (fc) fc.onchange = () => { FILTRO.competencia = fc.value; re(); };
    const fm = $('#f-mao', r); if (fm) fm.onchange = () => { FILTRO.mao = fm.value; re(); };
    const mais = $('#mais-treinos', r); if (mais) mais.onclick = () => { FILTRO.mostrar += 30; APP.redesenhar(); };
  },
};

/* ================= Biblioteca ================= */
let ORIGEM_BIB = '';
TELAS.biblioteca = {
  titulo: 'Biblioteca', principal: true,
  sub: 'Obras em domínio público e riffs originais para aplicar a técnica.',
  html() {
    const obras = BIBLIOTECA.OBRAS.filter(o => !ORIGEM_BIB || o.origem === ORIGEM_BIB).map(o => BIBLIOTECA.comoExercicio(o.id));
    return `${segmento('origem', 'Mostrar', [['', 'Tudo'], ['dominio', 'Domínio público'], ['original', 'Riffs originais']], ORIGEM_BIB)}
      <ul class="gf-lista">${obras.map(e => linhaEx(e, { extra: `<small>${esc(e.origem)}${e.ano ? ' · ' + e.ano : ''}</small>` })).join('')}</ul>
      ${KitFacil.ui.faixa({ tipo: 'dica', html: 'Tirou uma música de ouvido? Escreva no Estúdio, só para você.', acao: '<button type="button" class="kf-btn kf-sec" data-ir="estudio">Abrir o Estúdio</button>' })}`;
  },
  ligar(r) { r.querySelectorAll('[data-seg-origem]').forEach(b => b.onclick = () => { ORIGEM_BIB = b.dataset.segOrigem; APP.redesenhar(); }); },
};

/* ================= Acordes ================= */
const FILTRO_AC = { texto: '', familia: '', forma: '', mostrar: 40 };
function nomeAcorde(f) { const t = TEORIA.tipoAcorde(f.tipo); return `${TEORIA.nome(f.raiz, { bemol: TEORIA.usaBemol(f.raiz, f.tipo === 'menor') })} ${t.nome}`; }
function abrirAcorde(id) {
  const f = FORMAS.porId(id); if (!f) return;
  const t = TEORIA.tipoAcorde(f.tipo), cif = notacao().cifra;
  // notas na ordem do acorde (tônica, terça, quinta…), só as que a forma toca
  const tocam = new Set(f.notas.map(([c, k]) => TEORIA.pcDe(c, k)));
  const notas = t.s.map(x => TEORIA.mod(f.raiz + x)).filter((pc, i, a) => tocam.has(pc) && a.indexOf(pc) === i).map(pc => TEORIA.nome(pc, { cifra: cif, bemol: TEORIA.usaBemol(f.raiz, t.s.includes(3)) }));
  const formula = t.s.map(s => TEORIA.intervalo(s).sigla).join(' · ');
  const tocadas = f.notas.map(n => n[0]), abafa = [0, 1, 2, 3, 4, 5].filter(c => !tocadas.includes(c)).map(c => DESENHO.ORD[c]);
  KitFacil.dialogo.abrir({ titulo: f.cifra, sub: nomeAcorde(f), classe: 'kf-curto',
    corpo: `${DESENHO.diagrama(f, { canhoto: canhoto(), rotulo: `Diagrama de ${f.cifra}` })}
      ${dados([['Notas', esc(notas.join(', '))], ['Fórmula', esc(formula)], ['Forma', esc(f.forma)], ['Não tocar', esc(abafa.length ? abafa.join(', ') + (abafa.length > 1 ? ' cordas' : ' corda') : 'Todas as cordas soam')]])}
      <p class="kf-texto">${f.pestana ? `O dedo 1 deita na casa ${f.pestana.k}, da ${DESENHO.ORD[f.pestana.de]} à 1ª corda. ` : ''}Os números dentro das bolinhas são os dedos: 1 indicador, 2 médio, 3 anelar, 4 mínimo.</p>`,
    pe: `<button type="button" class="kf-btn kf-sec" data-ver-braco>Ver no Explorar</button><button type="button" class="kf-btn kf-pri" data-ouvir>Ouvir</button>`,
    aoMontar: d => {
      $('[data-ouvir]', d).onclick = () => TOCADOR.rasgar(f.notas, afin());
      $('[data-ver-braco]', d).onclick = () => { KitFacil.dialogo.fechar(true); EXPLORAR.mostrarAcorde(f.raiz, f.tipo); };
    } });
}
TELAS.acordes = {
  titulo: 'Acordes', principal: true,
  sub: `${FORMAS.TODAS.length} formas, abertas e com pestana, com diagrama, notas e som.`,
  html() {
    const q = FILTRO_AC.texto.trim().toLowerCase();
    const lista = FORMAS.TODAS.filter(f => (!FILTRO_AC.familia || TEORIA.tipoAcorde(f.tipo).familia === FILTRO_AC.familia)
      && (!FILTRO_AC.forma || (FILTRO_AC.forma === 'aberta' ? f.forma === 'Aberta' : f.forma.startsWith(FILTRO_AC.forma)))
      && (!q || f.cifra.toLowerCase() === q || f.cifra.toLowerCase().startsWith(q) || nomeAcorde(f).toLowerCase().includes(q)));
    return `<div class="gf-pilha">
        <div class="gf-campo"><label class="kf-rotulo" for="busca-ac">Buscar</label><input id="busca-ac" class="kf-entrada" type="search" placeholder="Cifra ou nome, por exemplo: Am ou ré menor" value="${esc(FILTRO_AC.texto)}" autocomplete="off"></div>
        ${escolhaHTML('ac-fam', 'Família', [['', 'Todas'], ['maiores', 'Maiores'], ['menores', 'Menores'], ['setima', 'Com sétima'], ['outros', 'Outros (sus, power chord, diminuto…)']], FILTRO_AC.familia)}
        ${escolhaHTML('ac-forma', 'Forma', [['', 'Todas'], ['aberta', 'Abertas'], ['Forma de Mi', 'Com pestana, forma de Mi'], ['Forma de Lá', 'Com pestana, forma de Lá']], FILTRO_AC.forma)}
        <p class="gf-apoio" role="status">${plural(lista.length, 'forma encontrada', 'formas encontradas')}</p></div>
      ${lista.length ? `<ul class="gf-lista">${lista.slice(0, FILTRO_AC.mostrar).map(f => `<li><button type="button" class="gf-linha" data-acorde="${esc(f.id)}">
        <span class="gf-linha-fig">${DESENHO.diagrama(f, { pequeno: true, canhoto: canhoto(), rotulo: f.cifra })}</span>
        <span class="gf-linha-tx"><b>${esc(f.cifra)}</b><small>${esc(nomeAcorde(f))} · ${esc(f.forma)}</small></span>${ICONE.seta}</button></li>`).join('')}</ul>
        ${lista.length > FILTRO_AC.mostrar ? '<button type="button" class="kf-btn kf-sec" id="mais-ac">Mostrar mais</button>' : ''}`
        : KitFacil.ui.vazio({ titulo: 'Nenhuma forma encontrada', texto: 'Tente só a letra do acorde, como C ou Am.' })}`;
  },
  ligar(r) {
    const b = $('#busca-ac', r); let t;
    b.oninput = () => { clearTimeout(t); t = setTimeout(() => { FILTRO_AC.texto = b.value; FILTRO_AC.mostrar = 40; APP.redesenhar({ foco: '#busca-ac' }); }, 250); };
    $('#ac-fam', r).onchange = e => { FILTRO_AC.familia = e.target.value; APP.redesenhar(); };
    $('#ac-forma', r).onchange = e => { FILTRO_AC.forma = e.target.value; APP.redesenhar(); };
    r.querySelectorAll('[data-acorde]').forEach(x => x.onclick = () => abrirAcorde(x.dataset.acorde));
    const m = $('#mais-ac', r); if (m) m.onclick = () => { FILTRO_AC.mostrar += 40; APP.redesenhar(); };
  },
};

/* ================= Progresso ================= */
let ABA_PROG = 'semana';
TELAS.progresso = {
  titulo: 'Progresso', principal: true,
  sub: 'O que você praticou e o que marcou como limpo.',
  html() {
    const p = DADOS.perfil(), ps = DADOS.praticas();
    const aviso = KitFacil.ui.faixa({ tipo: 'info', html: 'O app registra o tempo que você toca e o que você marca como limpo. Ele não ouve nem avalia a sua execução.' });
    let corpo = '';
    if (ABA_PROG === 'semana') {
      const sem = DADOS.semana(), ini = inicioSemana();
      const dias = Array.from({ length: 7 }, (x, i) => { const t = ini + i * 864e5, iso = hojeISO(t); const seg = ps.filter(q => hojeISO(q.em) === iso).reduce((s, q) => s + q.seg, 0); return [new Date(t).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' }), seg ? minTxt(seg) : '—']; });
      corpo = `${dados([['Tempo tocado', `${minTxt(sem.seg)} de ${p.metaSemana} min`], ['Dias com treino', `${sem.dias} de 7`], ['Dias seguidos', plural(DADOS.sequencia(), 'dia', 'dias')], ['Treinos', String(sem.treinos)], ['Saíram limpos', String(sem.limpos)]])}
        <h2 class="gf-h">Dia a dia</h2>${dados(dias)}`;
    } else if (ABA_PROG === 'competencias') {
      const c = DADOS.competencias();
      corpo = `<ul class="gf-lista">${CATALOGO.COMPETENCIAS.map(([id, nome]) => {
        const x = c[id];
        return `<li><button type="button" class="gf-linha" data-comp="${id}"><span class="gf-linha-tx"><b>${esc(nome)}</b><small>${x.treinos ? `${minTxt(x.seg)} praticados · ${plural(x.limpos, 'treino limpo', 'treinos limpos')}` : 'Ainda não praticada'}</small></span>${ICONE.seta}</button></li>`;
      }).join('')}</ul>`;
    } else if (ABA_PROG === 'historico') {
      const vis = ps.filter(q => DADOS.buscar(q.ex));
      corpo = vis.length ? `<ul class="gf-lista">${vis.slice(0, 60).map(q => {
        const ex = DADOS.buscar(q.ex);
        const marca = q.limpo === true ? 'Saiu limpo' : q.limpo === false ? 'Ainda não saiu limpo' : 'Sem marcação';
        return `<li><button type="button" class="gf-linha" data-ir="treino/${esc(ex.id)}"><span class="gf-linha-tx"><b>${esc(ex.num ? CATALOGO.rotulo(ex) : ex.objetivo)}</b><small>${esc(dataCurta(q.em))} · ${esc(minTxt(q.seg))}${q.bpm ? ` · ${q.bpm} bpm` : ''} · ${marca}</small></span>${ICONE.seta}</button></li>`;
      }).join('')}</ul>` : KitFacil.ui.vazio({ titulo: 'Nenhum treino registrado', texto: 'Cada treino que você toca aparece aqui, com a data, o tempo e o andamento.', acao: '<button type="button" class="kf-btn kf-sec" data-ir="treinos">Ver os treinos</button>' });
    } else {
      const sem = DADOS.semana();
      corpo = `<div class="gf-pilha">
        ${escolhaHTML('meta-semana', 'Minutos por semana', [[30, '30 minutos'], [60, '1 hora'], [90, '1 h 30 min'], [120, '2 horas'], [180, '3 horas'], [300, '5 horas']], p.metaSemana)}
        <p class="gf-apoio">Nesta semana: ${minTxt(sem.seg)} de ${p.metaSemana} min.</p>
        <div class="gf-campo"><label class="kf-rotulo" for="meta-mes">Meta para este mês <span class="kf-opcional">opcional</span></label><input id="meta-mes" class="kf-entrada" maxlength="120" value="${esc(p.metaMes)}" placeholder="Por exemplo: tocar a #0030 a 90 bpm"></div>
        <div class="gf-campo"><label class="kf-rotulo" for="meta-tri">Meta para os próximos 3 meses <span class="kf-opcional">opcional</span></label><input id="meta-tri" class="kf-entrada" maxlength="120" value="${esc(p.metaTri)}" placeholder="Por exemplo: tocar Para Elisa inteira"></div>
        <button type="button" class="kf-btn kf-pri" id="salvar-metas">Salvar metas</button></div>`;
    }
    return `${KitFacil.ui.abas({ itens: [['semana', 'Semana'], ['competencias', 'Competências'], ['historico', 'Histórico'], ['metas', 'Metas']], atual: ABA_PROG, rotulo: 'Partes do Progresso', dado: 'aba-prog' })}
      ${ABA_PROG === 'metas' ? '' : aviso}${corpo}`;
  },
  ligar(r) {
    r.querySelectorAll('[data-aba-prog]').forEach(b => b.onclick = () => { ABA_PROG = b.dataset.abaProg; APP.redesenhar(); });
    r.querySelectorAll('[data-comp]').forEach(b => b.onclick = () => { Object.assign(FILTRO, { aba: 'todos', competencia: b.dataset.comp, texto: '', nivel: '' }); APP.ir('treinos'); });
    const s = $('#salvar-metas', r);
    if (s) s.onclick = () => { DADOS.mudarPerfil({ metaSemana: +$('#meta-semana', r).value, metaMes: $('#meta-mes', r).value.trim(), metaTri: $('#meta-tri', r).value.trim() }); KitFacil.avisar('Metas salvas.'); APP.redesenhar(); };
  },
};

/* Guitarra Fácil · treino e sessão (telas internas).
   Todo treino abre no roteiro: cada parte desenhada no braço (onde começa, a ordem das notas com setas e o dedo), um
   botão para ouvir só a parte e o Começar preso no pé (Regras do app, Art. 7º). No palco, o braço e a tablatura
   acompanham o som. No fim, o som para; a pessoa diz se saiu limpo e, na sessão, vê o próximo e segue com um toque. */
'use strict';

const TREINO = { ex: null, id: '', modo: 'roteiro', sessao: false, bpm: 60, inicio: 0, ativo: false, volta: 1, ouvindo: -1, ultimo: null, timer: 0 };

function exDoTreino(id) { return DADOS.buscar(id); }
function bpmDe(ex) { return DADOS.andamento(ex.id) || ex.bpm.ini; }
function proximoDaSessao(id) {
  const s = SESSAO.atual(); if (!s) return null;
  const f = SESSAO.fila(s), i = f.indexOf(id, Math.max(0, Math.min(s.pos, f.length - 1)));
  const j = i < 0 ? f.indexOf(id) : i;
  return j >= 0 && j + 1 < f.length ? { id: f[j + 1], n: j + 2, total: f.length } : null;
}
function posNaSessao(id) { const s = SESSAO.atual(); if (!s) return null; const f = SESSAO.fila(s); const i = f.indexOf(id); return i < 0 ? null : { n: i + 1, total: f.length }; }
/* índice da parte de um evento do trecho completo */
function parteDoEvento(ex, i) { let soma = 0; for (let p = 0; p < ex.partes.length; p++) { soma += ex.partes[p].evs.length; if (i < soma) return p; } return ex.partes.length - 1; }
const compassos = (ex, evs) => Math.round(CATALOGO.total(evs) / ex.compasso);

TELAS.treino = {
  principal: false,
  titulo: ([id]) => { const ex = exDoTreino(id); return ex ? (ex.num ? `#${ex.id}` : ex.nome || 'Treino') : 'Treino'; },
  /* ao chegar na tela (novo = a rota mudou), o treino abre no roteiro; ao redesenhar, fica onde estava */
  preparar([id, modo], novo) {
    const ex = exDoTreino(id);
    if (novo || TREINO.id !== id) Object.assign(TREINO, { ex, id, modo: 'roteiro', bpm: ex ? bpmDe(ex) : 60, ultimo: null, ouvindo: -1 });
    TREINO.ex = ex; TREINO.sessao = modo === 'sessao';
  },
  html([id]) {
    const ex = TREINO.ex;
    if (!ex) return KitFacil.ui.vazio({ titulo: 'Treino não encontrado', texto: 'Ele pode ter sido apagado em outro aparelho.', acao: '<button type="button" class="kf-btn kf-sec" data-ir="treinos">Ver os treinos</button>' });
    const pos = TREINO.sessao ? posNaSessao(id) : null;
    const cab = `<header class="gf-pilha"><h2 class="gf-h">${esc(ex.objetivo)}</h2><p class="gf-apoio">${esc(subEx(ex))}${ex.tipo === 'preparo' ? '' : ` · ${plural(ex.partes.length, 'parte', 'partes')}`}</p>
      ${pos ? `<p class="gf-apoio">Sessão de hoje: treino ${pos.n} de ${pos.total}</p>` : ''}</header>`;
    if (TREINO.modo === 'fim') return cab + this.htmlFim(ex);
    if (ex.tipo === 'preparo') return cab + `${KitFacil.ui.faixa({ tipo: 'dica', html: esc(ex.dica) })}
      <p class="gf-tempo" id="tempo" aria-live="off">${Math.floor(ex.seg / 60)}:${String(ex.seg % 60).padStart(2, '0')}</p>
      <ol class="gf-passos" id="passos">${ex.passos.map(([t, d]) => `<li><span><b>${esc(t)}</b>${esc(d)}</span></li>`).join('')}</ol>`;
    if (TREINO.modo === 'palco') {
      const j = DESENHO.janela(ex.evs, 5), unicas = new Map();
      ex.evs.forEach(e => (e.n || []).forEach(([c, k]) => unicas.set(c + ':' + k, { c, k, tipo: 'fantasma' })));
      return cab + `<p class="gf-contagem" id="contagem" aria-live="assertive"></p>
        <p class="gf-apoio" id="onde" aria-live="polite">Toque em Começar. Antes, o metrônomo conta um compasso.</p>
        <figure class="gf-figura" id="palco-braco">${DESENHO.braco({ ...j, notas: [...unicas.values()], canhoto: canhoto(), rotulo: 'Braço com as notas do treino', larg: 44 })}</figure>
        <div id="palco-tab"></div>`;
    }
    return cab + `${KitFacil.ui.faixa({ tipo: 'dica', html: esc(ex.dica) })}
      ${ex.partes.map((p, i) => `<section class="gf-pilha" aria-labelledby="parte-${i}">
        <h3 class="gf-h" id="parte-${i}" style="font-size:var(--kf-t-cartao)">Parte ${i + 1} · ${esc(p.nome)}</h3>
        <figure class="gf-figura">${DESENHO.parte(p.evs, { canhoto: canhoto(), rotulo: `Desenho da parte ${i + 1}: a nota vermelha é onde começa; as setas mostram a ordem e os números, os dedos` })}
          <figcaption>${plural(compassos(ex, p.evs), 'compasso', 'compassos')}. A nota vermelha é onde começa; os números são os dedos.</figcaption></figure>
        <button type="button" class="kf-btn kf-sec" data-ouvir-parte="${i}">${TREINO.ouvindo === i ? 'Parar' : 'Ouvir esta parte'}</button></section>`).join('')}`;
  },
  htmlFim(ex) {
    const u = TREINO.ultimo, prox = TREINO.sessao ? proximoDaSessao(ex.id) : null, exP = prox && DADOS.buscar(prox.id);
    const reg = u ? `Registrado: ${minTxt(u.seg)}${u.bpm ? ` a ${u.bpm} bpm` : ''}.${u.limpo === true ? ' Você marcou que saiu limpo.' : u.limpo === false ? ' Você marcou que ainda não saiu limpo.' : ''}` : 'O treino terminou.';
    return `${KitFacil.ui.faixa({ tipo: 'ok', html: esc(reg) })}
      ${exP ? `<section class="gf-pilha" aria-labelledby="h-seguir"><h2 class="gf-h" id="h-seguir">A seguir</h2><ul class="gf-lista">${linhaEx(exP, { rota: `treino/${exP.id}/sessao` })}</ul>
        ${exP.tipo === 'preparo' ? '' : `<figure class="gf-figura">${DESENHO.parte(exP.partes[0].evs, { canhoto: canhoto(), rotulo: 'Desenho da primeira parte do próximo treino' })}</figure>`}</section>`
        : TREINO.sessao ? `<section class="gf-pilha"><h2 class="gf-h">Sessão concluída</h2><p class="gf-apoio">Bom trabalho. O tempo de hoje já está no Progresso.</p></section>` : ''}`;
  },
  ligar(r) {
    const ex = TREINO.ex; if (!ex) return;
    r.querySelectorAll('[data-ouvir-parte]').forEach(b => b.onclick = () => {
      const i = +b.dataset.ouvirParte;
      if (TREINO.ouvindo === i) { TOCADOR.parar(); return; }
      TREINO.ouvindo = i;
      r.querySelectorAll('[data-ouvir-parte]').forEach(x => { x.textContent = +x.dataset.ouvirParte === i ? 'Parar' : 'Ouvir esta parte'; });
      TOCADOR.tocar({ evs: ex.partes[i].evs, bpm: TREINO.bpm, compasso: ex.compasso, afin: ex.familia === 'biblioteca' ? 'padrao' : afin(), voltas: 1,
        aoFim: () => fimOuvir(r), aoParar: () => fimOuvir(r) });
    });
    if (TREINO.modo === 'palco') desenharTab();
  },
  acoes() {
    const ex = TREINO.ex; if (!ex) return '';
    if (TREINO.modo === 'fim') {
      const prox = TREINO.sessao ? proximoDaSessao(ex.id) : null;
      if (prox) return `<button type="button" class="kf-btn kf-sec" data-acao="repetir">Repetir</button><button type="button" class="kf-btn kf-pri" data-acao="proximo">Ver o próximo</button>`;
      return `<button type="button" class="kf-btn kf-sec" data-acao="repetir">Tocar de novo</button><button type="button" class="kf-btn kf-pri" data-acao="${TREINO.sessao ? 'inicio' : 'roteiro'}">${TREINO.sessao ? 'Voltar ao Início' : 'Ver o roteiro'}</button>`;
    }
    const fav = DADOS.favorito(ex.id);
    const estrela = `<button type="button" class="kf-btn kf-sec gf-icone" data-acao="favorito" aria-pressed="${fav}" aria-label="${fav ? 'Tirar dos favoritos' : 'Guardar nos favoritos'}" title="Favorito">${fav ? ICONE.estrela.replace('<path', '<path fill="currentColor"') : ICONE.estrela}</button>`;
    if (ex.tipo === 'preparo') return TREINO.modo === 'palco'
      ? `<button type="button" class="kf-btn kf-pri" data-acao="parar">${ICONE.parar}Parar</button>`
      : `${estrela}<button type="button" class="kf-btn kf-pri" data-acao="comecar">${ICONE.play}Começar</button>`;
    if (TREINO.modo === 'palco') {
      const tocando = TREINO.ativo;
      return `<button type="button" class="kf-btn kf-sec gf-icone" data-acao="roteiro" aria-label="Roteiro" title="Roteiro">${ICONE.roteiro}</button>
        <span class="gf-andamento"><button type="button" class="kf-btn kf-sec gf-icone" data-acao="mais-lento" aria-label="Mais devagar">${ICONE.menos}</button>
        <output id="bpm" aria-live="polite" aria-label="Andamento">${TREINO.bpm}<small>bpm</small></output>
        <button type="button" class="kf-btn kf-sec gf-icone" data-acao="mais-rapido" aria-label="Mais depressa">${ICONE.mais}</button></span>
        ${tocando ? `<button type="button" class="kf-btn kf-pri" data-acao="parar">${ICONE.parar}Parar</button>` : `<button type="button" class="kf-btn kf-pri" data-acao="tocar">${ICONE.play}Começar</button>`}`;
    }
    return `${estrela}<button type="button" class="kf-btn kf-pri" data-acao="comecar">${ICONE.play}Começar</button>`;
  },
  acao(nome) {
    const ex = TREINO.ex;
    if (nome === 'favorito') { const f = DADOS.alternarFavorito(ex.id); KitFacil.avisar(f ? 'Guardado nos favoritos.' : 'Tirado dos favoritos.'); APP.redesenharAcoes(); return; }
    if (nome === 'comecar') { TOCADOR.parar(); TREINO.modo = 'palco'; APP.redesenhar(); if (ex.tipo === 'preparo') comecarPreparo(); else tocarTreino(); return; }
    if (nome === 'tocar') { tocarTreino(); return; }
    if (nome === 'parar') { pararTreino(); if (ex.tipo === 'preparo') { TREINO.modo = 'roteiro'; APP.redesenhar(); } return; }
    if (nome === 'roteiro') { pararTreino(true); TREINO.modo = 'roteiro'; APP.redesenhar(); return; }
    if (nome === 'mais-lento' || nome === 'mais-rapido') {
      TREINO.bpm = limitar(TREINO.bpm + (nome === 'mais-lento' ? -5 : 5), 30, 240); DADOS.guardarAndamento(ex.id, TREINO.bpm);
      const o = $('#bpm'); if (o) o.innerHTML = `${TREINO.bpm}<small>bpm</small>`;
      if (TREINO.ativo) { pararTreino(true); tocarTreino(); }
      return;
    }
    if (nome === 'repetir') { TREINO.modo = 'palco'; APP.redesenhar(); if (ex.tipo === 'preparo') comecarPreparo(); else tocarTreino(); return; }
    if (nome === 'proximo') { const p = proximoDaSessao(ex.id); const s = SESSAO.atual(); if (s && p) { s.pos = p.n - 1; SESSAO.guardar(s); } if (p) APP.ir(`treino/${p.id}/sessao`); return; }
    if (nome === 'inicio') { APP.ir('inicio'); return; }
  },
  sair() { pararTreino(true); TREINO.ouvindo = -1; },
};

function fimOuvir(r) { TREINO.ouvindo = -1; r.querySelectorAll('[data-ouvir-parte]').forEach(x => { x.textContent = 'Ouvir esta parte'; }); }

function desenharTab() {
  const box = $('#palco-tab'); if (!box || !TREINO.ex) return;
  box.innerHTML = DESENHO.tablatura(TREINO.ex.evs, { compasso: TREINO.ex.compasso, largura: box.clientWidth || 340 });
}
function acender(i) {
  const ex = TREINO.ex; if (!ex) return;
  $$('#palco-tab .gf-on').forEach(x => x.classList.remove('gf-on'));
  const t = $(`#palco-tab [data-i="${i}"]`);
  if (t) { t.classList.add('gf-on'); const svg = t.closest('svg'); if (svg && svg.dataset.vista !== '1') { $$('#palco-tab svg').forEach(s => { s.dataset.vista = ''; }); svg.dataset.vista = '1'; svg.scrollIntoView({ block: 'nearest', behavior: KitFacil.movimento.reduzido() ? 'auto' : 'smooth' }); } }
  $$('#palco-braco .gf-ativa').forEach(x => x.classList.remove('gf-ativa'));
  (ex.evs[i].n || []).forEach(([c, k]) => { const g = $(`#palco-braco .gf-nota[data-c="${c}"][data-k="${k}"]`); if (g) g.classList.add('gf-ativa'); });
  const p = parteDoEvento(ex, i), onde = $('#onde');
  if (onde) onde.textContent = `Parte ${p + 1} de ${ex.partes.length} · ${ex.partes[p].nome} · volta ${TREINO.volta} de ${TREINO.voltas}`;
}
async function tocarTreino() {
  const ex = TREINO.ex, perfil = DADOS.perfil(), s = TREINO.sessao && SESSAO.atual();
  TREINO.voltas = s ? SESSAO.voltas(s, ex) : perfil.voltas;
  TREINO.volta = 1; TREINO.inicio = 0; TREINO.ativo = true;
  APP.redesenharAcoes();
  const ok = await TOCADOR.tocar({ evs: ex.evs, bpm: TREINO.bpm, compasso: ex.compasso, afin: ex.familia === 'biblioteca' ? 'padrao' : perfil.afin,
    metronomo: perfil.metronomo, contagem: perfil.contagem, voltas: TREINO.voltas,
    aoContagem: n => { const c = $('#contagem'); if (c) c.textContent = n; },
    aoNota: (i, v) => { if (!TREINO.inicio) { TREINO.inicio = performance.now(); const c = $('#contagem'); if (c) c.textContent = ''; } TREINO.volta = v + 1; acender(i); },
    aoFim: () => terminar(),
  });
  if (!ok) { TREINO.ativo = false; APP.redesenharAcoes(); KitFacil.avisar('Este navegador não consegue tocar som.'); }
}
/* para no meio: registra o tempo tocado (a partir de 10 segundos), sem perguntar se saiu limpo */
function pararTreino(silencioso) {
  const ex = TREINO.ex, estava = TREINO.ativo, ini = TREINO.inicio;
  TREINO.ativo = false; TREINO.inicio = 0;
  if (TREINO.timer) { clearInterval(TREINO.timer); TREINO.timer = 0; }
  TOCADOR.parar();
  if (estava && ini > 0 && ex) {
    const seg = (performance.now() - ini) / 1000, bpm = ex.tipo === 'preparo' ? 0 : TREINO.bpm;
    if (seg >= 10) {
      const id = DADOS.registrarPratica({ ex: TREINO.id, seg, bpm });
      if (!silencioso) { TREINO.ultimo = { id, seg, bpm, limpo: null }; KitFacil.avisar(`Registrado: ${minTxt(seg)} de treino.`); }
    }
  }
  $$('#palco-tab .gf-on, #palco-braco .gf-ativa').forEach(x => x.classList.remove('gf-on', 'gf-ativa'));
  const c = $('#contagem'); if (c) c.textContent = '';
  if (TELAS.treino === APP.tela()) APP.redesenharAcoes();
}
/* fim das voltas: o som para, o tempo é registrado e a pessoa diz se saiu limpo */
function terminar() {
  const ex = TREINO.ex, seg = TREINO.inicio > 0 ? (performance.now() - TREINO.inicio) / 1000 : CATALOGO.segundos(ex, TREINO.bpm) * (TREINO.voltas || 1);
  TREINO.inicio = 0; TREINO.ativo = false;
  const id = DADOS.registrarPratica({ ex: TREINO.id, seg, bpm: ex.tipo === 'preparo' ? 0 : TREINO.bpm });
  TREINO.ultimo = { id, seg, bpm: ex.tipo === 'preparo' ? 0 : TREINO.bpm, limpo: null };
  const mostrarFim = () => { TREINO.modo = 'fim'; if (TELAS.treino === APP.tela()) APP.redesenhar(); };
  if (ex.tipo === 'preparo') { mostrarFim(); return; }
  KitFacil.dialogo.abrir({ titulo: 'Saiu limpo?', classe: 'kf-curto', nome: 'limpo',
    corpo: '<p class="kf-texto">Marque Saiu limpo só se tocou do começo ao fim, no tempo, sem errar. O app não ouve a sua execução: quem decide é você.</p>',
    pe: '<button type="button" class="kf-btn kf-sec" data-limpo="0">Ainda não</button><button type="button" class="kf-btn kf-pri" data-limpo="1">Saiu limpo</button>',
    aoMontar: d => d.querySelectorAll('[data-limpo]').forEach(b => b.onclick = () => { const l = b.dataset.limpo === '1'; DADOS.marcarLimpo(id, l); TREINO.ultimo.limpo = l; KitFacil.dialogo.fechar(true); mostrarFim(); }),
    aoFechar: () => { if (TREINO.modo !== 'fim') mostrarFim(); } });
}
/* preparo: os passos seguem no tempo, sem som */
function comecarPreparo() {
  const ex = TREINO.ex, n = ex.passos.length, fim = Date.now() + ex.seg * 1000;
  TREINO.inicio = performance.now(); TREINO.ativo = true;
  clearInterval(TREINO.timer);
  const tique = () => {
    const resto = Math.max(0, Math.round((fim - Date.now()) / 1000)), t = $('#tempo');
    if (t) t.textContent = `${Math.floor(resto / 60)}:${String(resto % 60).padStart(2, '0')}`;
    const p = Math.min(n - 1, Math.floor((ex.seg - resto) / (ex.seg / n)));
    $$('#passos li').forEach((li, i) => li.classList.toggle('gf-on', i === p));
    if (resto <= 0) { clearInterval(TREINO.timer); TREINO.timer = 0; terminar(); }
  };
  TREINO.timer = setInterval(tique, 250); tique();
  APP.redesenharAcoes();
}

/* ================= Sessão de hoje ================= */
TELAS.sessao = {
  principal: false, titulo: () => 'Sessão de hoje',
  html() {
    let s = SESSAO.atual();
    if (!s) { s = SESSAO.montar(DADOS.aparelho().minutosSessao || 20); SESSAO.guardar(s); }
    const total = SESSAO.fila(s).length;
    return `<header class="gf-pilha"><h2 class="gf-h">${plural(total, 'treino', 'treinos')} · cerca de ${minTxt(SESSAO.duracao(s))}</h2>
        <p class="gf-apoio">Toque numa etapa para ver, trocar, tirar ou mudar a ordem dos treinos.</p></header>
      ${segmento('min-s', 'Tempo disponível', [[10, '10 min'], [20, '20 min'], [30, '30 min'], [45, '45 min']], s.minutos)}
      ${s.etapas.map(e => secao(e.nome, e.itens.length ? `<ul class="gf-lista">${e.itens.map((id, i) => { const ex = DADOS.buscar(id); if (!ex) return ''; return linhaEx(ex, { rota: `treino/${id}/sessao`, extra: '' }) +
        `<li><div class="kf-acoes" style="padding:8px 14px"><button type="button" class="kf-btn kf-sec kf-p" data-trocar="${e.id}:${i}">Trocar</button>${i ? `<button type="button" class="kf-btn kf-sec kf-p" data-subir="${e.id}:${i}">Subir</button>` : ''}<button type="button" class="kf-btn kf-sec kf-p" data-tirar="${e.id}:${i}">Tirar</button></div></li>`; }).join('')}</ul>`
        : '<p class="gf-apoio">Nenhum treino nesta etapa.</p>', { aberta: false, resumo: plural(e.itens.length, 'treino', 'treinos'), attrs: `data-etapa="${e.id}"` })).join('')}`;
  },
  ligar(r) {
    const s = SESSAO.atual(); if (!s) return;
    const alvo = v => { const [e, i] = v.split(':'); return [s.etapas.find(x => x.id === e), +i]; };
    r.querySelectorAll('[data-seg-min-s]').forEach(b => b.onclick = () => { const m = +b.dataset.segMinS; DADOS.mudarAparelho({ minutosSessao: m }); SESSAO.guardar(SESSAO.montar(m)); APP.redesenhar(); });
    const refazer = etapa => { APP.redesenhar(); const d = $(`[data-etapa="${etapa}"]`); if (d) d.open = true; };
    r.querySelectorAll('[data-trocar]').forEach(b => b.onclick = () => { const [e, i] = alvo(b.dataset.trocar); if (!SESSAO.trocar(s, e.id, i)) KitFacil.avisar('Não há outro treino para esta etapa.'); refazer(e.id); });
    r.querySelectorAll('[data-tirar]').forEach(b => b.onclick = () => { const [e, i] = alvo(b.dataset.tirar); e.itens.splice(i, 1); SESSAO.guardar(s); refazer(e.id); });
    r.querySelectorAll('[data-subir]').forEach(b => b.onclick = () => { const [e, i] = alvo(b.dataset.subir); [e.itens[i - 1], e.itens[i]] = [e.itens[i], e.itens[i - 1]]; SESSAO.guardar(s); refazer(e.id); });
  },
  acoes() { const s = SESSAO.atual(); return s && SESSAO.fila(s).length ? `<button type="button" class="kf-btn kf-pri" data-acao="comecar">${ICONE.play}Começar</button>` : ''; },
  acao(nome) { if (nome !== 'comecar') return; const s = SESSAO.atual(); if (!s) return; s.pos = 0; SESSAO.guardar(s); APP.ir(`treino/${SESSAO.fila(s)[0]}/sessao`); },
};

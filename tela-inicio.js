/* Guitarra Fácil · Início e caminho do iniciante */
'use strict';
/* o caminho de quem nunca tocou: um passo conta quando sai limpo; quem já toca pula etapas (DB.cfg.caminhoDe) */
const passoFeito = id => DB.treinos.some(t => t.ex === id && limpo(t));
const caminhoEstado = () => { const de = DB.cfg.caminhoDe || 0; return CAMINHO.map((e, i) => { const feitos = i < de ? e.ids.length : e.ids.filter(passoFeito).length; return { e, i, feitos, total: e.ids.length, feita: feitos === e.ids.length, pulada: i < de }; }); };
const proximoPasso = () => { const de = DB.cfg.caminhoDe || 0; for (let i = de; i < CAMINHO.length; i++) { const e = CAMINHO[i], id = e.ids.find(x => !passoFeito(x)); if (id) return { e, i, id, n: e.ids.indexOf(id) + 1 }; } return null; };
function escolherNivelCaminho() {
  const ops = [[0, 1, 'Nunca toquei', 'Começar do primeiro passo'], [3, 2, 'Sei alguns acordes', 'Começar nos primeiros riffs'], [CAMINHO.length, 3, 'Já toco músicas', 'Ir direto ao treino do dia']];
  KitFacil.dialogo.abrir({ titulo: 'Onde você quer começar?', sub: 'Dá para mudar depois: o caminho continua em Minha jornada.', nome: 'caminho-nivel',
    corpo: `<div class="ladrilhos l1">${ops.map(([de, n, nome, sub]) => ladrilho({ attrs: `data-caminho-de="${de}"`, ilu: iluNivel(n), nome, sub, classe: 'largo' })).join('')}</div>`,
    aoMontar: d => $$('[data-caminho-de]', d).forEach(b => b.onclick = () => { DB.cfg.caminhoDe = +b.dataset.caminhoDe; LS.set('visto', true); commit(); KitFacil.dialogo.fechar(); render(); KitFacil.avisar(+b.dataset.caminhoDe >= CAMINHO.length ? 'Pronto: Minha jornada mostra o treino do dia.' : `Pronto: você começa em ${CAMINHO[+b.dataset.caminhoDe].nome}.`); }) });
}
const listaCaminho = (est, atual) => `<ol class="cam-lista">${est.map(({ e, i, feitos, total, feita, pulada }) => `<li class="${feita ? 'feita' : ''}${i === atual ? ' atual' : ''}"><button type="button" data-ir="caminho/${i + 1}"><span class="cam-n" aria-hidden="true">${feita ? I.check : i + 1}</span><span class="ld-tx"><b>${esc(e.nome)}</b><small>${pulada ? 'Pulada' : feita ? 'Feita' : i === atual ? `Você está aqui · ${feitos} de ${total} passos` : `${feitos} de ${total} passos`}</small></span>${I.seta}</button></li>`).join('')}</ol>`;
// Início: a sequência numa linha e, em destaque, o que fazer agora: o próximo passo do caminho ou o treino do dia
const ATALHOS = [['favoritos', 'Favoritos', 'favoritos', () => DB.favoritos.length ? `${DB.favoritos.length} ${DB.favoritos.length === 1 ? 'treino' : 'treinos'}` : 'Marque com a estrela'],
  ['estudio', 'Estúdio', 'estudio', () => DB.ideias.length ? `${DB.ideias.length} ${DB.ideias.length === 1 ? 'ideia' : 'ideias'}` : 'Crie seus riffs'],
  ['plano', 'Plano de 4 semanas', 'plano', () => { const p = planoAtual(); return p && !p.fim ? `Semana ${semanaDoPlano(p)} de 4 · ${progressoPlano(p)[0]}/16` : 'Uma meta, quatro semanas'; }]];
/* primeira experiência (Documento Mestre, seção 16): experiência, objetivos, tempo e uma apresentação visual.
   Gêneros não determinam mais o percurso. Dá para pular; nada é obrigatório além da primeira
   pergunta, que diz onde o caminho começa. */
const OBJETIVOS_PERFIL = [['zero', 'Aprender do zero'], ['tecnica', 'Técnica e velocidade'], ['riffs', 'Tocar riffs'], ['solos', 'Fazer solos'], ['teoria', 'Entender o braço'], ['criar', 'Criar meus riffs']];
const PASSOS_1A = ['exp', 'objetivos', 'tempo', 'conheca'];
let ONB = null;
const primeiraVez = () => !DB.cfg.perfil && !DB.treinos.length && DB.cfg.caminhoDe == null;
function primeiraVezHTML() {
  if (!ONB) ONB = { i: 0, exp: null, objetivos: [], min: DB.cfg.meta || 20 };
  const k = PASSOS_1A[ONB.i], chip = (attr, v, nome, on) => `<button type="button" class="chip-1a" data-${attr}="${v}" aria-pressed="${on}">${on ? I.check : ''}${esc(nome)}</button>`;
  const corpo = {
    exp: `<h2 id="pv-t">Você já toca guitarra?</h2><p class="apoio">O app começa no ponto certo. Dá para mudar depois.</p><div class="ladrilhos l1 pv-op">${[[0, 1, 'Nunca toquei', 'Começa do primeiro toque'], [1, 2, 'Sei alguns acordes', 'Começa nos primeiros riffs'], [2, 3, 'Já toco músicas', 'Vai direto às sessões']].map(([v, n, nome, sub]) => ladrilho({ attrs: `data-pv-exp="${v}" aria-pressed="${ONB.exp === v}"`, ilu: iluNivel(n), nome, sub, classe: 'largo' + (ONB.exp === v ? ' on' : '') })).join('')}</div>`,
    objetivos: `<h2 id="pv-t">O que você quer agora?</h2><p class="apoio">Escolha quantos quiser. As sessões seguem isso.</p><div class="chips-1a">${OBJETIVOS_PERFIL.map(([v, n]) => chip('pv-obj', v, n, ONB.objetivos.includes(v))).join('')}</div>`,
    tempo: `<h2 id="pv-t">Quanto tempo por dia?</h2><p class="apoio">A sessão de hoje se monta nesse tempo. Pouco todo dia vale mais que muito de vez em quando.</p><div class="kf-seg" role="group" aria-labelledby="pv-t">${DURACOES.map(d => `<button type="button" data-pv-min="${d}" aria-pressed="${ONB.min === d}">${d} min</button>`).join('')}</div>`,
    conheca: `<h2 id="pv-t">Como o app ensina</h2><div class="pv-tour">${[
      [ilu('<rect x="4" y="12" width="56" height="26" rx="3" class="il-f"/><path d="M4 17h56M4 23h56M4 29h56M4 35h56M18 12v26M32 12v26M46 12v26" class="il-l"/><circle cx="25" cy="23" r="5" class="il-a"/><circle cx="39" cy="29" r="4" class="il-o"/>'), 'O braço mostra onde tocar', 'A nota acesa é a da vez; a tracejada, a próxima. O número é o dedo.'],
      [ilu('<path d="M4 12h56M4 18h56M4 24h56M4 30h56" class="il-l"/><rect x="12" y="15" width="8" height="7" rx="2" class="il-a"/><rect x="30" y="21" width="8" height="7" rx="2" class="il-n"/><path d="M16 34v10M34 34v10M16 44h18" class="il-l il-g"/>'), 'A tablatura mostra o ritmo', 'Toque numa nota dela para ver no braço.'],
      [ilu('<rect x="10" y="8" width="44" height="8" rx="3" class="il-n"/><rect x="10" y="20" width="44" height="8" rx="3" class="il-a"/><rect x="10" y="32" width="44" height="8" rx="3" class="il-f il-l"/>'), 'A sessão se monta sozinha', 'Você diz o tempo; o app escolhe e você troca o que quiser.'],
    ].map(([il, n, d]) => `<div class="pv-tour-it"><span class="ld-ilu">${il}</span><span class="ld-tx"><b>${n}</b><small>${d}</small></span></div>`).join('')}</div>`,
  }[k];
  return `<section class="cartao primeira-vez" aria-labelledby="pv-t"><div class="pv-topo"><span class="apoio">Primeiro passo ${ONB.i + 1} de ${PASSOS_1A.length}</span><span class="pv-pontos" aria-hidden="true">${PASSOS_1A.map((_, j) => `<i class="${j <= ONB.i ? 'on' : ''}"></i>`).join('')}</span></div>
    ${corpo}<p class="pv-erro" id="pv-erro" role="alert"></p>
    <div class="pv-bts">${ONB.i ? `<button type="button" class="kf-btn kf-sec" data-pv-voltar>Voltar</button>` : ''}<button type="button" class="kf-btn kf-pri" data-pv-seguir>${ONB.i === PASSOS_1A.length - 1 ? `${I.play}Começar` : 'Continuar'}</button></div>
    <button type="button" class="kf-link pv-pular" data-pv-pular>Agora não, quero só explorar</button></section>`;
}
function ligarPrimeiraVez(m) {
  const cx = $('.primeira-vez', m); if (!cx) return;
  const de = () => { cx.outerHTML = primeiraVezHTML(); ligarPrimeiraVez(m); };
  $$('[data-pv-exp]', cx).forEach(b => b.onclick = () => { ONB.exp = +b.dataset.pvExp; de(); });
  $$('[data-pv-obj]', cx).forEach(b => b.onclick = () => { const v = b.dataset.pvObj; ONB.objetivos = ONB.objetivos.includes(v) ? ONB.objetivos.filter(x => x !== v) : [...ONB.objetivos, v]; de(); });
  $$('[data-pv-min]', cx).forEach(b => b.onclick = () => { ONB.min = +b.dataset.pvMin; de(); });
  const voltar = $('[data-pv-voltar]', cx); if (voltar) voltar.onclick = () => { ONB.i--; de(); };
  $('[data-pv-seguir]', cx).onclick = () => {
    if (PASSOS_1A[ONB.i] === 'exp' && ONB.exp == null) { $('#pv-erro', cx).textContent = 'Escolha uma opção para continuar.'; return; }
    if (ONB.i < PASSOS_1A.length - 1) { ONB.i++; de(); return; }
    DB.cfg.perfil = { exp: ONB.exp, objetivos: ONB.objetivos, min: ONB.min, em: Date.now() };
    DB.cfg.meta = ONB.min; DB.cfg.sessaoMin = ONB.min; DB.cfg.caminhoDe = ONB.exp === 0 ? 0 : ONB.exp === 1 ? 3 : CAMINHO.length;
    ONB = null; SESSAO = null; commit(); render(); KitFacil.avisar('Pronto: Minha jornada já mostra o seu próximo passo.');
  };
  $('[data-pv-pular]', cx).onclick = () => { DB.cfg.perfil = { pulado: true, em: Date.now() }; ONB = null; commit(); render(); };
}
VIEWS.inicio = () => '';
VIEWS.jornada = () => {
  const meta = DB.cfg.meta, min = minutosHoje(), seg = diasSeguidos(), ul = ultimoTreino(), p = Math.min(100, Math.round(min / meta * 100));
  const m = ul && modelo(ul.id), v = m && volta(m, { ...cfgPadrao(m), ...ul.cfg }), px = proximoPasso();
  const seqHTML = `<section class="seq" aria-label="Sua sequência"><span class="seq-ic">${I.chama}</span>
      <span class="seq-tx"><b>${seg ? `${seg} ${seg === 1 ? 'dia seguido' : 'dias seguidos'}` : 'Comece sua sequência hoje'}</b><span class="apoio">${min} de ${meta} min hoje${min >= meta ? ' · meta batida' : ''}</span></span>
      <span class="seq-sem" aria-hidden="true">${semanaAtual().map(d => `<i class="${d.feito ? 'feito' : ''}${d.hoje ? ' hoje' : ''}" title="${d.nome}"></i>`).join('')}</span>
      <span class="barra-prog seq-barra" role="progressbar" aria-label="Meta de hoje" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p}%"></span></span></section>`;
  const metas = PRAZOS.map(([pz]) => cartaoMeta(pz, true)).join(''), metasHTML = metas ? `<section class="metas-ini" aria-label="Suas metas">${metas}</section>` : '';
  const atalhos = extra => `<nav class="ladrilhos" aria-label="Atalhos">${[...extra, ...ATALHOS].map(([ir, nome, il, sub]) => ladrilho({ ir, ilu: ILU[il], nome, sub: sub() })).join('')}</nav>`;
  const pv = primeiraVez() ? primeiraVezHTML() : '';
  if (px) {
    const mp = modelo(px.id), vp = volta(mp, cfgPadrao(mp));
    return `<div class="pilha">${pv}${seqHTML}
    <button type="button" class="continuar passo-hero" data-tr-modelo="${px.id}"><span class="ct-ilu">${miniDesenho(vp)}</span><span class="ld-tx"><small>Seu próximo passo · ${px.n} de ${px.e.ids.length} · ${esc(px.e.nome)}</small><b>${esc(tituloDe(mp))}</b><small>${esc(mp.resumo)}</small></span><span class="ct-play">${I.play}</span></button>
    ${metasHTML}
    <section class="cartao caminho" aria-labelledby="cam-t"><h2 id="cam-t">Seu caminho</h2>${listaCaminho(caminhoEstado(), px.i)}
      <button type="button" class="kf-btn kf-sec cam-pular" data-caminho-pular>Já toco: escolher onde começar</button></section>
    ${atalhos([['sessao', 'Sessão de hoje', 'plano', () => `${DB.cfg.sessaoMin || meta} min, em etapas`], ['dia', 'Treino do dia', 'dia', () => 'Para quem já toca']])}
  </div>`;
  }
  const S = sessaoAtual();
  return `<div class="pilha">${pv}${seqHTML}
    <button type="button" class="dia-hero sessao-hero" data-ir="sessao"><span class="ld-ilu">${ILU.plano}</span><span class="ld-tx"><small>Sessão de hoje · ${minutosSessao(S)} min</small><b>${S.etapas.map(e => nomeEtapa(e.tipo)).join(', ')}</b><small>Foco em ${(COMPETENCIAS.find(c => c[0] === competenciaDaVez()) || [, ''])[1].toLowerCase()}. Troque o que quiser antes de começar.</small></span><span class="ct-play">${I.play}</span></button>
    ${v ? `<button type="button" class="continuar" data-tr-ultimo><span class="ct-ilu">${miniDesenho(v)}</span><span class="ld-tx"><small>Continuar · ${quando(ul.em)}</small><b>${esc(tituloDe(m))}</b><small>${esc(v.sub)} · ${ul.bpm} bpm</small></span>${I.seta}</button>` : ''}
    ${metasHTML}
    ${atalhos([['dia', 'Treino do dia', 'dia', () => 'Técnica, riff, solo e linha longa'], ['caminho', 'Caminho do iniciante', 'treinar', () => 'Rever os primeiros passos']])}
  </div>`;
};
// o caminho inteiro: cada etapa com os seus passos
VIEWS.caminho = () => {
  const est = caminhoEstado(), px = proximoPasso();
  return migalhas([['inicio', 'Início'], [null, 'Caminho do iniciante']]) + KitFacil.ui.cabecalho({ titulo: 'Caminho do iniciante', sub: 'Cinco etapas, do primeiro toque ao primeiro solo. Um passo conta quando você marca "Saiu limpo".' })
    + `<div class="pilha">${est.map(({ e, i, feitos, total, pulada }) => `<section class="cartao cam-etapa" id="etapa-${i + 1}" aria-labelledby="etapa-${i + 1}-t"><h2 id="etapa-${i + 1}-t"><span class="cam-n" aria-hidden="true">${i + 1}</span>${esc(e.nome)}</h2><p class="apoio">${esc(e.resumo)} · ${pulada ? 'pulada' : `${feitos} de ${total} passos`}</p>
      <ul class="tr-lista">${e.ids.map(id => itemTreino(modelo(id)).replace('<b>', `<b>${passoFeito(id) ? '<span class="cam-ok" aria-label="feito">✓</span> ' : px && px.id === id ? '<span class="cam-agora">Agora</span> ' : ''}`)).join('')}</ul></section>`).join('')}
      <button type="button" class="kf-btn kf-sec cam-pular" data-caminho-pular>Escolher onde começar</button></div>`;
};


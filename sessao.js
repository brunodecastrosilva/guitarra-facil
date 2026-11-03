/* Guitarra Fácil · sessões por duração e rotinas próprias (Documento Mestre, seção 5).
   A pessoa escolhe quanto tempo tem; o app monta a sessão com as etapas da seção 5.2 (preparo, aquecimento, treino
   principal, aplicação musical e encerramento), repartindo o tempo entre elas em vez de cortar no fim. Cada treino
   escolhido sai do modelo único de exercício (exercicios.js) e respeita experiência, objetivos e histórico, sem
   classificar a prática por gênero musical, e a
   competência menos treinada. Tudo pode ser trocado, tirado, acrescentado e reordenado, e a sessão pode virar uma rotina
   guardada (DB.rotinas, sincronizada). Os treinos tocam em fila na janela do treino, cada um com as suas voltas. */
'use strict';
const ETAPAS_SESSAO = [
  ['preparo', 'Preparo', 'Pulsos, mãos e ombros soltos antes de tocar.', .1],
  ['aquecimento', 'Aquecimento', 'Dedos e palhetada devagar.', .15],
  ['principal', 'Treino principal', 'A competência que mais precisa de você agora.', .4],
  ['aplicacao', 'Aplicação musical', 'Um riff ou solo para aplicar a técnica.', .25],
  ['encerramento', 'Encerramento', 'Uma escala calma para fechar.', .1],
];
const DURACOES = [10, 20, 30, 45, 60];
// o que cada objetivo do perfil pede de competência
const OBJ_COMP = { zero: ['palhetada', 'ritmo', 'acordes'], tecnica: ['palhetada', 'ligados', 'dedos', 'posicao'], riffs: ['ritmo', 'acordes', 'palhetada'], solos: ['escalas', 'bends', 'ligados'], teoria: ['escalas', 'arpejos'], criar: ['ritmo', 'escalas'] };
// os movimentos do preparo, com o desenho de cada um (traço na cor do texto, destaque vermelho do pedal)
const PREPARO = [
  ['Gire os pulsos', 'Dez voltas para cada lado, devagar.', ilu('<circle cx="32" cy="24" r="8" class="il-n"/><path d="M32 6a18 18 0 1 1-17 12" class="il-l il-g"/><path d="M12 13l3 6 6-2" class="il-r"/>')],
  ['Abra e feche as mãos', 'Dez vezes, sem forçar.', ilu('<path d="M14 34V18m6 16V14m6 20V16m6 18V20" class="il-l il-g"/><rect x="38" y="20" width="16" height="16" rx="6" class="il-a"/><path d="M8 40h48" class="il-l"/>')],
  ['Alongue os dedos', 'Puxe cada dedo de leve para trás, cinco segundos cada.', ilu('<path d="M18 38V14m8 24V10m8 28V12m8 26V18" class="il-l il-g"/><path d="M42 18l10-8" class="il-r"/><circle cx="52" cy="10" r="3" class="il-a"/>')],
  ['Solte os ombros', 'Suba e desça os ombros cinco vezes.', ilu('<circle cx="32" cy="12" r="6" class="il-n"/><path d="M12 30q20-12 40 0" class="il-l il-g"/><path d="M14 20v-6m36 6v-6" class="il-r"/><path d="M11 16l3-4 3 4m30 0l3-4 3 4" class="il-r"/>')],
];

// o perfil da primeira experiência (tela-inicio.js); sem perfil, valem padrões que servem para todos
const perfil = () => DB.cfg.perfil || {};
function nivelDaPessoa() {
  const p = perfil(), base = p.exp === 2 ? 2 : 1;
  const limposEm = n => new Set(T().filter(t => limpo(t) && modelo(t.id) && modelo(t.id).nivel === n && modelo(t.id).cat !== 'caminho').map(t => t.id)).size;
  return limposEm(3) >= 3 ? 3 : limposEm(2) >= 3 || base === 2 ? 2 : 1;
}
// minutos e treinos concluídos por competência (evolucao.js usa a mesma conta)
function porCompetencia() {
  const R = Object.fromEntries(COMPETENCIAS.map(([c]) => [c, { min: 0, concluidos: 0, nivel: 0, ultimo: 0, treinos: 0 }]));
  T().forEach(t => { const i = infoExercicio(t.id), m = modelo(t.id); if (!i || !m) return; i.competencias.forEach(c => { const r = R[c]; r.min += t.min || 0; r.treinos++; r.ultimo = Math.max(r.ultimo, t.em); if (limpo(t)) { r.concluidos++; r.nivel = Math.max(r.nivel, m.nivel || 1); } }); });
  return R;
}
function competenciaDaVez() {
  const objs = perfil().objetivos && perfil().objetivos.length ? perfil().objetivos : ['tecnica', 'riffs', 'solos'];
  const cands = [...new Set(objs.flatMap(o => OBJ_COMP[o] || []))].filter(c => Object.values(TEC_COMP).some(l => l.includes(c)));
  const R = porCompetencia();
  return cands.sort((a, b) => R[a].min - R[b].min || a.localeCompare(b))[0] || 'palhetada';
}
// duração de uma volta (s) e quantas voltas cabem em tantos minutos
const segundosDaVolta = id => { const m = modelo(id), v = volta(m, cfgPadrao(m)), bpm = Math.max(BPM_MIN, melhorLimpo(id) || m.bpm); return v.evs.reduce((s, e) => s + e.d, 0) * 60 / bpm; };
const voltasPara = (id, min) => Math.max(2, Math.min(24, Math.round(min * 60 / Math.max(2, segundosDaVolta(id)))));
// candidatos de cada etapa (sem repetir o que já está na sessão)
function candidatos(etapa, n, usados) {
  const p = perfil(), objs = p.objetivos || [];
  const livre = m => !usados.has(m.id);
  if (etapa === 'aquecimento') return MODELOS.filter(m => m.cat === 'tecnica' && ['dedos', 'alternada', 'legato', 'economia'].includes(m.sub) && m.nivel === n && m.tamanho === 'moderado' && livre(m));
  if (etapa === 'principal') {
    const px = typeof proximoPasso === 'function' ? proximoPasso() : null;
    if (px) { const ids = CAMINHO.slice(px.i).flatMap(e => e.ids).filter(id => !passoFeito(id) && !usados.has(id)); return ids.map(modelo); }
    const c = competenciaDaVez();
    return MODELOS.filter(m => m.cat === 'tecnica' && (TEC_COMP[m.sub] || []).includes(c) && m.nivel === n && (m.tamanho === 'moderado' || m.tamanho === 'longo') && livre(m));
  }
  if (etapa === 'aplicacao') {
    const cats = objs.includes('solos') && !objs.includes('riffs') ? ['solos'] : objs.includes('riffs') && !objs.includes('solos') ? ['riffs'] : ['riffs', 'solos'];
    const L = MODELOS.filter(m => cats.includes(m.cat) && m.nivel === n && m.tamanho === 'moderado' && livre(m));
    return L.length ? L : MODELOS.filter(m => cats.includes(m.cat) && m.nivel === n && m.tamanho === 'moderado' && livre(m));
  }
  if (etapa === 'encerramento') return MODELOS.filter(m => m.cat === 'escalas' && m.grupo === 'Escala' && m.nivel === Math.min(n, 2) && livre(m));
  return [];
}
// monta a sessão: o tempo de cada etapa e um treino a cada 4 minutos, sorteados pelo dia (a mesma sessão no dia todo)
function montarSessao(min) {
  const n = nivelDaPessoa(), r = sorteio(semente(`sessao:${diaNum()}:${min}:${n}`)), usados = new Set(), etapas = [];
  ETAPAS_SESSAO.forEach(([tipo, , , parte]) => {
    const em = Math.max(tipo === 'preparo' ? 1 : 2, Math.round(min * parte));
    if (tipo === 'preparo') { etapas.push({ tipo, min: Math.min(3, em), itens: [] }); return; }
    const qt = Math.max(1, Math.round(em / 4)), itens = [];
    for (let k = 0; k < qt; k++) { const L = candidatos(tipo, n, usados); if (!L.length) break; const m = tipo === 'principal' && L[0].cat === 'caminho' ? L[0] : L[r.i(L.length)]; usados.add(m.id); itens.push({ id: m.id, min: Math.max(1, Math.round(em / qt)) }); }
    if (itens.length) etapas.push({ tipo, min: em, itens });
  });
  return { min, etapas, rotina: null };
}
let SESSAO = null;
const sessaoAtual = () => { if (!SESSAO) SESSAO = montarSessao(DB.cfg.sessaoMin || DB.cfg.meta || 20); return SESSAO; };
const nomeEtapa = t => (ETAPAS_SESSAO.find(e => e[0] === t) || [, t])[1];
const minutosSessao = S => S.etapas.reduce((s, e) => s + (e.tipo === 'preparo' ? e.min : e.itens.reduce((x, i) => x + i.min, 0)), 0);

VIEWS.sessao = () => {
  const S = sessaoAtual(), rot = S.rotina && DB.rotinas.find(x => x.id === S.rotina);
  return migalhas([['inicio', 'Início'], [null, rot ? rot.nome : 'Sessão de hoje']]) + KitFacil.ui.cabecalho({ titulo: rot ? rot.nome : 'Sessão de hoje', sub: 'Diga quanto tempo você tem. O app monta as etapas; troque, tire, acrescente ou mude a ordem do que quiser.' })
    + `<div class="pilha">
    ${rot ? '' : `<section class="cartao"><span class="kf-rotulo" id="ses-dur-l">Tempo disponível</span><div class="kf-seg ses-dur" role="group" aria-labelledby="ses-dur-l">${DURACOES.map(d => `<button type="button" data-ses-min="${d}" aria-pressed="${S.min === d}">${d} min</button>`).join('')}</div>
      <p class="apoio">${S.etapas.length} etapas · cerca de ${minutosSessao(S)} min · nível ${NIVEIS.find(x => x[0] === nivelDaPessoa())[2].toLowerCase()}${proximoPasso() ? ' · o treino principal segue o caminho do iniciante' : ` · foco em ${(COMPETENCIAS.find(c => c[0] === competenciaDaVez()) || [, ''])[1].toLowerCase()}, a competência menos treinada`}</p></section>`}
    <ol class="ses-etapas">${S.etapas.map((e, ei) => { const min = e.tipo === 'preparo' ? e.min : e.itens.reduce((x, i) => x + i.min, 0), nomes = e.tipo === 'preparo' ? PREPARO.map((x, j) => j ? x[0][0].toLowerCase() + x[0].slice(1) : x[0]).join(', ') : e.itens.map(it => { const mm = modelo(it.id); return mm ? tituloDe(mm).replace(/^#\d+ · /, '') : ''; }).filter(Boolean).join(' · ');
      return `<li class="ses-etapa"><details class="cartao" data-kf-secao id="ses-e-${e.tipo}"><summary class="ses-cab"><span class="cam-n" aria-hidden="true">${ei + 1}</span><span class="ld-tx"><b>${esc(nomeEtapa(e.tipo))} <span class="ses-min">${min} min</span></b><small>${esc(nomes || 'Sem treinos: abra para acrescentar.')}</small></span></summary>
      <div class="ses-corpo"><p class="apoio">${esc((ETAPAS_SESSAO.find(x => x[0] === e.tipo) || [, , ''])[2])}</p>
      ${e.tipo === 'preparo' ? `<div class="ses-preparo">${PREPARO.map(([n, d, il]) => `<div class="ses-mov"><span class="ld-ilu">${il}</span><small><b>${esc(n)}</b>${esc(d)}</small></div>`).join('')}</div>`
        : `<ul class="tr-lista ses-itens">${e.itens.map((it, ii) => { const m = modelo(it.id); if (!m) return ''; const v = volta(m, cfgPadrao(m)), titulo = tituloDe(m); return `<li class="ses-item">${miniDesenho(v)}<span class="ld-tx"><b>${esc(titulo)}</b><small>${esc(m.grupo || nomeCategoria(m.cat))} · ${voltasPara(it.id, it.min)} voltas · ${it.min} min</small></span>
          <span class="ses-acoes"><button type="button" class="kf-btn kf-sec ses-mini" data-ses-subir="${ei}:${ii}" aria-label="Subir ${esc(titulo)}"${ii === 0 ? ' disabled' : ''}>↑</button><button type="button" class="kf-btn kf-sec ses-mini" data-ses-trocar="${ei}:${ii}" aria-label="Trocar ${esc(titulo)}">${I.sortear}</button><button type="button" class="kf-btn kf-sec ses-mini" data-ses-tirar="${ei}:${ii}" aria-label="Tirar ${esc(titulo)}">×</button></span></li>`; }).join('')}</ul>
        <button type="button" class="kf-btn kf-sec ses-mais" data-ses-mais="${ei}">${I.mais || '+'}Mais um treino nesta etapa</button>`}
      <div class="ses-etapa-acoes"><button type="button" class="kf-btn kf-sec" data-ses-etapa-subir="${ei}"${ei === 0 ? ' disabled' : ''}>↑ Subir a etapa</button><button type="button" class="kf-btn kf-sec" data-ses-etapa-tirar="${ei}">× Tirar a etapa</button></div></div></details></li>`; }).join('')}</ol>
    <p class="apoio ses-dica">Toque numa etapa para ver os treinos, trocar, tirar ou mudar a ordem.</p>
    ${S.etapas.length < ETAPAS_SESSAO.length ? `<div class="ses-volta">${ETAPAS_SESSAO.filter(([t]) => !S.etapas.some(e => e.tipo === t)).map(([t, nome]) => `<button type="button" class="kf-btn kf-sec" data-ses-etapa-por="${t}">${I.mais || '+'}${esc(nome)}</button>`).join('')}</div>` : ''}
    <div class="ses-fim"><button type="button" class="kf-btn kf-sec" data-ses-guardar>${rot ? 'Guardar as mudanças' : 'Guardar como rotina'}</button>${rot ? '<button type="button" class="kf-btn kf-sec" data-ses-nova>Voltar para a sessão de hoje</button>' : ''}</div>
    <section class="cartao" aria-labelledby="rot-t"><h2 id="rot-t">Suas rotinas</h2>${DB.rotinas.length ? `<ul class="rot-lista">${DB.rotinas.map(x => `<li><span class="ld-tx"><b>${esc(x.nome)}</b><small>${x.etapas.length} etapas · ${minutosSessao(x)} min</small></span><button type="button" class="kf-btn kf-pri ses-mini" data-rot-ir="${x.id}" aria-label="Começar ${esc(x.nome)}">${I.play}</button><button type="button" class="kf-btn kf-sec" data-rot-abrir="${x.id}">Abrir</button><button type="button" class="kf-btn kf-sec ses-mini" data-rot-apagar="${x.id}" aria-label="Apagar ${esc(x.nome)}">×</button></li>`).join('')}</ul>`
      : KitFacil.ui.vazio({ titulo: 'Nenhuma rotina guardada', texto: 'Monte a sessão do seu jeito e toque em "Guardar como rotina". Ela aparece aqui para você repetir quando quiser.' })}</section>
    <div class="ses-pe"><button type="button" class="kf-btn kf-pri ses-comecar" data-ses-comecar${S.etapas.some(e => e.itens.length) ? '' : ' disabled'}>${I.play}Começar · ${minutosSessao(S)} min</button></div></div>`;
};
function ligarSessao(m) {
  const S = sessaoAtual(), mexeu = () => redesenhar();
  const par = s => s.split(':').map(Number);
  $$('[data-ses-min]', m).forEach(b => b.onclick = () => { DB.cfg.sessaoMin = +b.dataset.sesMin; LS.set('db', DB); SESSAO = montarSessao(+b.dataset.sesMin); mexeu(); });
  $$('[data-ses-subir]', m).forEach(b => b.onclick = () => { const [e, i] = par(b.dataset.sesSubir), L = S.etapas[e].itens; [L[i - 1], L[i]] = [L[i], L[i - 1]]; mexeu(); });
  $$('[data-ses-tirar]', m).forEach(b => b.onclick = () => { const [e, i] = par(b.dataset.sesTirar), it = S.etapas[e].itens.splice(i, 1)[0]; mexeu(); KitFacil.avisar('Treino tirado da sessão.', { label: 'Desfazer', run: () => { S.etapas[e].itens.splice(i, 0, it); redesenhar(); } }); });
  $$('[data-ses-trocar]', m).forEach(b => b.onclick = () => { const [e, i] = par(b.dataset.sesTrocar), it = S.etapas[e].itens[i], usados = new Set(S.etapas.flatMap(x => x.itens.map(y => y.id))); const L = candidatos(S.etapas[e].tipo, nivelDaPessoa(), usados); if (!L.length) { KitFacil.avisar('Não há outro treino parecido para trocar.'); return; } it.id = L[Math.floor(Math.random() * L.length)].id; mexeu(); });
  $$('[data-ses-mais]', m).forEach(b => b.onclick = () => { const e = S.etapas[+b.dataset.sesMais], usados = new Set(S.etapas.flatMap(x => x.itens.map(y => y.id))), L = candidatos(e.tipo, nivelDaPessoa(), usados); if (!L.length) { KitFacil.avisar('Não há mais treinos parecidos para esta etapa.'); return; } e.itens.push({ id: L[Math.floor(Math.random() * L.length)].id, min: 4 }); mexeu(); });
  $$('[data-ses-etapa-subir]', m).forEach(b => b.onclick = () => { const i = +b.dataset.sesEtapaSubir; [S.etapas[i - 1], S.etapas[i]] = [S.etapas[i], S.etapas[i - 1]]; mexeu(); });
  $$('[data-ses-etapa-tirar]', m).forEach(b => b.onclick = () => { const i = +b.dataset.sesEtapaTirar, e = S.etapas.splice(i, 1)[0]; mexeu(); KitFacil.avisar(`Etapa ${nomeEtapa(e.tipo).toLowerCase()} tirada.`, { label: 'Desfazer', run: () => { S.etapas.splice(i, 0, e); redesenhar(); } }); });
  $$('[data-ses-etapa-por]', m).forEach(b => b.onclick = () => { const t = b.dataset.sesEtapaPor, ordem = ETAPAS_SESSAO.map(x => x[0]); const nova = montarSessao(S.min).etapas.find(e => e.tipo === t) || { tipo: t, min: 3, itens: [] }; S.etapas.push(nova); S.etapas.sort((a, c) => ordem.indexOf(a.tipo) - ordem.indexOf(c.tipo)); mexeu(); });
  $$('[data-ses-comecar]', m).forEach(b => b.onclick = () => comecarSessao(S));
  $$('[data-ses-guardar]', m).forEach(b => b.onclick = () => guardarRotina(S));
  $$('[data-ses-nova]', m).forEach(b => b.onclick = () => { SESSAO = null; mexeu(); });
  $$('[data-rot-ir]', m).forEach(b => b.onclick = () => { const x = DB.rotinas.find(r => r.id === b.dataset.rotIr); if (x) comecarSessao({ ...x, etapas: JSON.parse(JSON.stringify(x.etapas)), rotina: x.id }); });
  $$('[data-rot-abrir]', m).forEach(b => b.onclick = () => { const x = DB.rotinas.find(r => r.id === b.dataset.rotAbrir); if (!x) return; SESSAO = { min: x.min, etapas: JSON.parse(JSON.stringify(x.etapas)), rotina: x.id }; mexeu(); window.scrollTo(0, 0); });
  $$('[data-rot-apagar]', m).forEach(b => b.onclick = () => { const i = DB.rotinas.findIndex(r => r.id === b.dataset.rotApagar); if (i < 0) return; const x = DB.rotinas.splice(i, 1)[0]; if (SESSAO && SESSAO.rotina === x.id) SESSAO = null; commit(); mexeu(); KitFacil.avisar(`Rotina "${x.nome}" apagada.`, { label: 'Desfazer', run: () => { DB.rotinas.splice(i, 0, x); commit(); redesenhar(); } }); });
}
function guardarRotina(S) {
  const rot = S.rotina && DB.rotinas.find(x => x.id === S.rotina);
  if (rot) { rot.etapas = JSON.parse(JSON.stringify(S.etapas)); rot.min = minutosSessao(S); commit(); KitFacil.avisar(`Rotina "${rot.nome}" guardada.`); return; }
  KitFacil.dialogo.abrir({ titulo: 'Guardar como rotina', sub: 'Dê um nome para achar depois.', nome: 'rotina',
    corpo: `<form class="pilha" data-rot-form><div class="campo"><label class="kf-rotulo" for="rot-nome">Nome da rotina</label><input id="rot-nome" class="kf-entrada" maxlength="40" required placeholder="Antes do ensaio"></div><button type="submit" class="kf-btn kf-pri">${I.check}Guardar</button></form>`,
    aoMontar: d => { const f = $('[data-rot-form]', d), i = $('#rot-nome', d); i.focus(); f.addEventListener('submit', e => { e.preventDefault(); const nome = i.value.trim(); if (!nome) { i.focus(); return; } const x = { id: uid(), nome, min: minutosSessao(S), etapas: JSON.parse(JSON.stringify(S.etapas)), em: Date.now() }; DB.rotinas.push(x); S.rotina = x.id; commit(); KitFacil.dialogo.fechar(); redesenhar(); KitFacil.avisar(`Rotina "${nome}" guardada. Ela fica em Sessão de hoje.`); }); } });
}
// começa: o preparo (se houver) com os movimentos no tempo, depois os treinos em fila
function comecarSessao(S) {
  const itens = S.etapas.flatMap(e => e.itens), fila = itens.map(i => i.id).filter(id => modelo(id)), voltas = itens.filter(i => modelo(i.id)).map(i => voltasPara(i.id, i.min));
  const rotulo = S.rotina ? (DB.rotinas.find(x => x.id === S.rotina) || {}).nome || 'Sessão' : 'Sessão de hoje';
  const tocar = () => { if (fila.length) abrirTreino(null, { fila, voltas, rotulo, marca: 'sessao' }); };
  const prep = S.etapas.find(e => e.tipo === 'preparo');
  if (!prep) return tocar();
  const seg = Math.max(20, Math.round(prep.min * 60 / PREPARO.length));
  let k = 0, falta = seg, t = null;
  KitFacil.dialogo.abrir({ titulo: 'Preparo', sub: `${PREPARO.length} movimentos, ${seg} segundos cada. Depois, os treinos.`, nome: 'preparo',
    corpo: `<div class="prep" aria-live="polite"><span class="prep-ilu" id="prep-ilu"></span><b id="prep-n"></b><p class="apoio" id="prep-d"></p><output id="prep-t" class="prep-t"></output><p class="apoio" id="prep-k"></p></div>`,
    pe: `<button type="button" class="kf-btn kf-sec" data-prep-pular>Pular o preparo</button><button type="button" class="kf-btn kf-pri" data-prep-ir>${I.play}Ir para os treinos</button>`,
    aoFechar: () => clearInterval(t),
    aoMontar: d => {
      const pintar = () => { const [n, txt, il] = PREPARO[k]; $('#prep-ilu', d).innerHTML = il; $('#prep-n', d).textContent = n; $('#prep-d', d).textContent = txt; $('#prep-t', d).textContent = `${falta} s`; $('#prep-k', d).textContent = `Movimento ${k + 1} de ${PREPARO.length}`; };
      const ir = () => { clearInterval(t); KitFacil.dialogo.fechar(); setTimeout(tocar, 320); };
      pintar(); t = setInterval(() => { falta--; if (falta <= 0) { k++; if (k >= PREPARO.length) return ir(); falta = seg; } pintar(); }, 1000);
      $('[data-prep-pular]', d).onclick = ir; $('[data-prep-ir]', d).onclick = ir;
    } });
}

/* Guitarra Fácil · app web (PWA) do Projeto Integrador.
   Ensina guitarra elétrica para quem começa do zero e para quem já toca: o teste de nível escolhe o ponto de partida
   da trilha. Tudo fica neste aparelho; a sincronização opcional e a moldura vêm do Kit Fácil (comum/). */
'use strict';
const VERSAO = '0.3.0';
const KEY = 'guitarrafacil.';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = KitFacil.esc;
const LS = {
  get(k, d) { try { const v = localStorage.getItem(KEY + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch {} },
};
const uid = () => KitFacil.novoId();
const svg = p => `<svg class="kf-i" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const I = {
  // marca: pedal de efeito (escolha do Bruno, 30/10/2026)
  marca: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2.6" fill="#C7432F"/><circle cx="9" cy="7" r="1.9" fill="#1C1C1F"/><circle cx="15" cy="7" r="1.9" fill="#1C1C1F"/><circle cx="12" cy="10.6" r=".9" fill="#FFB2A8"/><rect x="7" y="13" width="10" height="6.5" rx="1.4" fill="#A43524"/><circle cx="12" cy="16.2" r="1.9" fill="#E4E4E9"/></svg>',
  afinador: svg('<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-6"/>'),
  braco: svg('<path d="M3 7h18M3 12h18M3 17h18M8 5v14M14 5v14"/>'),
  acorde: svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 8h14M5 13h14M9.5 3v18M14.5 3v18"/>'),
  teoria: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18"/>'),
  mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
  externo: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  bateria: svg('<ellipse cx="12" cy="9" rx="8" ry="3"/><path d="M4 9v6c0 1.7 3.6 3 8 3s8-1.3 8-3V9M8 3l3 5M16 3l-3 5"/>'),
  hoje: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  trilha: svg('<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16"/>'),
  ferramentas: svg('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>'),
  musicas: svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
  progresso: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  seta: svg('<path d="m9 6 6 6-6 6"/>'),
  play: svg('<path d="M7 4v16l13-8z"/>'),
  stop: svg('<rect x="6" y="6" width="12" height="12" rx="1.5"/>'),
  menos: svg('<path d="M5 12h14"/>'),
  mais: svg('<path d="M12 5v14M5 12h14"/>'),
  pratica: svg('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>'),
};

/* ================= conteúdo: a trilha (aulas.js) ================= */
const LICOES = TRILHA.flatMap(n => n.aulas.map(a => ({ ...a, nivel: n.id })));
// teste de nível: cada resposta escolhe o módulo em que a trilha começa
const NIVEIS_INICIO = [
  ['zero', 'Nunca toquei', 'Começa em Começo.', 'm1'],
  ['acordes', 'Já sei alguns acordes', 'Começa em Rock: power chords e ritmo.', 'm3'],
  ['musicas', 'Já toco músicas inteiras', 'Começa em Pentatônica e blues.', 'm5'],
];
const ESTADOS_MUSICA = [['quero', 'Quero aprender'], ['aprendendo', 'Aprendendo'], ['toco', 'Já toco']];

/* ================= dados ================= */
// coleções sincronizadas registro a registro (a mudança mais recente vence), como nos outros apps da família
const COLS = ['feitas', 'musicas', 'praticas', 'andamentos', 'treinos'];
const vazio = () => ({ v: 1, cfg: { nivel: null, meta: 20, bpm: 80, estilo: 'rock' }, feitas: [], musicas: [], praticas: [], andamentos: [], treinos: [] });
let DB = (() => { const d = LS.get('db', null); return d && d.v === 1 ? { ...vazio(), ...d, cfg: { ...vazio().cfg, ...(d.cfg || {}) } } : vazio(); })();
const PRIMEIRO_USO = !DB.cfg.nivel;
let SNAP = {};
const snapTodos = () => { SNAP = {}; COLS.forEach(c => DB[c].forEach(x => SNAP[c + ':' + x.id] = JSON.stringify(x))); SNAP.cfg = JSON.stringify(DB.cfg); };
snapTodos();
function carimbar() {
  const st = SY.estado.st, del = SY.estado.del, agora = Date.now(), vistos = new Set(['cfg']);
  COLS.forEach(c => DB[c].forEach(x => {
    const k = c + ':' + x.id, j = JSON.stringify(x); vistos.add(k);
    if (SNAP[k] !== j) { SNAP[k] = j; st[k] = agora; delete del[k]; }
  }));
  const jc = JSON.stringify(DB.cfg); if (SNAP.cfg !== jc) { SNAP.cfg = jc; st.cfg = agora; }
  Object.keys(SNAP).forEach(k => { if (!vistos.has(k)) { delete SNAP[k]; delete st[k]; del[k] = agora; } });
  SY.salvar();
}
function commit() { LS.set('db', DB); carimbar(); SY.agendar(); }
function aplicar(R) {
  const st = { ...SY.estado.st }, del = { ...SY.estado.del }, rs = R.st || {};
  for (const k in (R.del || {})) del[k] = Math.max(del[k] || 0, R.del[k]);
  const antes = KitFacil.canon(DB);
  for (const c of COLS) {
    const rm = new Map((R[c] || []).map(x => [x.id, x])), usados = new Set(), out = [];
    const lt = id => st[c + ':' + id] || 0, rt = id => rs[c + ':' + id] || 0, dl = id => del[c + ':' + id] || 0;
    for (const x of DB[c]) {
      usados.add(x.id); const r = rm.get(x.id);
      if (r) { if (dl(x.id) && dl(x.id) >= Math.max(lt(x.id), rt(x.id))) continue; if (rt(x.id) > lt(x.id)) { out.push(r); st[c + ':' + x.id] = rt(x.id); } else out.push(x); }
      else if (!(dl(x.id) && dl(x.id) >= lt(x.id))) out.push(x);
    }
    for (const r of (R[c] || [])) if (!usados.has(r.id) && !(dl(r.id) && dl(r.id) >= rt(r.id))) { out.push(r); if (rt(r.id)) st[c + ':' + r.id] = rt(r.id); }
    DB[c] = out;
  }
  if (R.cfg && (rs.cfg || 0) > (st.cfg || 0)) { DB.cfg = { ...DB.cfg, ...R.cfg }; st.cfg = rs.cfg; }
  SY.estado.st = st; SY.estado.del = del;
  LS.set('db', DB); snapTodos(); SY.salvar();
  return antes !== KitFacil.canon(DB);
}
const pacote = () => ({ v: 1, cfg: DB.cfg, feitas: DB.feitas, musicas: DB.musicas, praticas: DB.praticas, andamentos: DB.andamentos, treinos: DB.treinos, st: SY.estado.st, del: SY.estado.del });

/* ================= navegação ================= */
const NAV = [
  ['hoje', 'Hoje', I.hoje], ['trilha', 'Trilha', I.trilha], ['ferramentas', 'Ferramentas', I.ferramentas],
  ['musicas', 'Músicas', I.musicas], ['teoria', 'Teoria', I.teoria, true], ['progresso', 'Progresso', I.progresso, true],
];
const subRota = () => (location.hash.replace(/^#\/?/, '').split('/')[1] || '');
const rota = () => { const r = (location.hash.replace(/^#\/?/, '') || 'hoje').split('/')[0]; return NAV.some(n => n[0] === r) || r === 'ajustes' ? r : 'hoje'; };
let telaAtual = null;
function ir(t) {
  if (t === rota() + (subRota() ? '/' + subRota() : '') && t !== 'ajustes') return;
  if (t === 'ajustes' && rota() === 'ajustes') { history.back(); return; }
  history.pushState(null, '', '#/' + t); render();
}
// Voltar do aparelho: troca de tela; dentro dos Ajustes, as guias são do Kit
window.addEventListener('popstate', () => { if (!(rota() === 'ajustes' && telaAtual === 'ajustes')) render(); });
document.addEventListener('click', e => { const b = e.target.closest('[data-ir]'); if (b) { e.preventDefault(); ir(b.dataset.ir); } });

function desenharNav() {
  const r = rota();
  const it = ([id, nome, ic, mais]) => `<button type="button" class="kf-nav-it" data-ir="${id}" aria-current="${r === id ? 'page' : 'false'}"${mais ? ' data-kf-mais' : ''}><span class="kf-nav-ic">${ic}</span><span class="kf-nav-l">${nome}</span></button>`;
  const tr = ([id, nome, ic]) => `<button type="button" class="kf-trilho-it" data-ir="${id}" aria-current="${r === id ? 'page' : 'false'}">${ic}<span>${nome}</span></button>`;
  $('#nav').innerHTML = NAV.map(it).join('') + KitFacil.nav.ajustes('nav');
  $('#trilho').innerHTML = NAV.map(tr).join('');
  $('#trilho-ajustes').innerHTML = KitFacil.nav.ajustes('trilho');
}

/* ================= telas ================= */
const feita = id => DB.feitas.some(f => f.id === id);
const inicioTrilha = () => (NIVEIS_INICIO.find(n => n[0] === DB.cfg.nivel) || NIVEIS_INICIO[0])[3];
const licoesDaVez = () => { const k = TRILHA.findIndex(n => n.id === inicioTrilha()); return TRILHA.slice(Math.max(0, k)).flatMap(n => LICOES.filter(l => l.nivel === n.id)); };
const proxima = () => licoesDaVez().find(l => !feita(l.id));
const pct = () => { const L = licoesDaVez(); return L.length ? Math.round(L.filter(l => feita(l.id)).length / L.length * 100) : 0; };
const melhorAndamento = id => DB.andamentos.filter(a => a.licao === id).reduce((m, a) => Math.max(m, a.bpm), 0);
// plano do dia (como estudar): a meta em minutos dividida em blocos fixos, sempre na mesma ordem
const BLOCOS = [['Aquecimento', 'Exercício 1-2-3-4 no metrônomo.', .15], ['Aula da vez', 'Leia a aula e faça o exercício.', .35], ['Técnica', 'O exercício da aula, subindo o andamento aos poucos.', .3], ['Repertório', 'Uma música da sua lista.', .2]];
const plano = () => { const m = DB.cfg.meta; let resto = m; return BLOCOS.map(([n, t, f], i) => { const v = i === BLOCOS.length - 1 ? resto : Math.max(1, Math.round(m * f)); resto -= v; return [n, t, v]; }); };
const minutosHoje = () => { const d = new Date().toDateString(); return Math.round(DB.praticas.filter(p => new Date(p.em).toDateString() === d).reduce((s, p) => s + p.min, 0)); };

/* ================= o professor do app =================
   Sem IA: regras de ensino sobre o que a pessoa fez (aulas, treinos com o microfone, andamentos e tempo de prática).
   Cada fala tem um motivo e, quando dá, um botão que leva direto à ação. */
const ultimoTreino = () => DB.treinos.slice().sort((a, b) => b.em - a.em)[0];
const exDaVez = () => { const p = proxima(); return (p && EXERCICIOS.find(e => e.licao === p.id)) || EXERCICIOS.find(e => e.nivel === nivelNum()) || EXERCICIOS[0]; };
const nivelNum = () => ({ zero: 1, acordes: 2, musicas: 4 })[DB.cfg.nivel] || 1;
const melhorTreino = id => DB.treinos.filter(t => t.ex === id && t.acerto >= 90).reduce((m, t) => Math.max(m, t.bpm), 0);
const diasSeguidos = () => { const dias = new Set(DB.praticas.concat(DB.treinos).map(p => new Date(p.em).toDateString())); let n = 0; const d = new Date(); if (!dias.has(d.toDateString())) d.setDate(d.getDate() - 1); while (dias.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); } return n; };
function professor() {
  const falas = [], ex = exDaVez(), ul = ultimoTreino(), p = proxima(), min = minutosHoje(), seg = diasSeguidos();
  if (ul) {
    const e = EXERCICIOS.find(x => x.id === ul.ex);
    if (ul.acerto >= 90) falas.push([`Último treino: ${e ? e.nome : ''} com ${ul.acerto}% de notas certas a ${ul.bpm} bpm. Está pronto para ${ul.bpm + 5} bpm.`, 'Treinar mais rápido', `treino:${ul.ex}:${ul.bpm + 5}`]);
    else if (ul.acerto >= 60) falas.push([`Último treino: ${ul.acerto}% de notas certas. Repita no mesmo andamento até passar de 90%.`, 'Repetir o treino', `treino:${ul.ex}:${ul.bpm}`]);
    else falas.push([`Último treino: ${ul.acerto}% de notas certas. Vamos mais devagar: ${Math.max(40, ul.bpm - 15)} bpm, com o som de guia ligado.`, 'Treinar mais devagar', `treino:${ul.ex}:${Math.max(40, ul.bpm - 15)}`]);
    if (ul.cents != null && ul.cents > 15) falas.push([`As notas certas saíram em média ${ul.cents} cents fora do centro: aperte logo atrás do traste e confira a afinação antes de começar.`, 'Abrir o afinador', 'ir:ferramentas/afinador']);
  } else falas.push([`Primeiro treino com o microfone: ${ex.nome} a ${ex.bpm} bpm. Eu toco junto e confiro cada nota.`, 'Começar o treino', `treino:${ex.id}:${ex.bpm}`]);
  if (p) falas.push([`Aula da vez: ${p.nome}. ${p.objetivo || p.resumo}`, 'Abrir a aula', `aula:${p.id}`]);
  if (min >= DB.cfg.meta) falas.push([`Meta de hoje batida (${min} min). ${seg > 1 ? `São ${seg} dias seguidos praticando.` : 'Volte amanhã para começar uma sequência.'}`]);
  else if (seg > 1) falas.push([`${seg} dias seguidos praticando. Faltam ${DB.cfg.meta - min} minutos para a meta de hoje.`]);
  const pl = PLAYLISTS.find(x => x.nivel === nivelNum());
  if (pl && DB.feitas.length >= 3) falas.push([`Para tocar junto com a gravação original, a playlist ${pl.nome} combina com o seu nível.`, 'Ver a playlist', `ir:musicas/${pl.id}`]);
  return falas.slice(0, 3);
}
function acaoProfessor(v) {
  const [t, a, b] = v.split(':');
  if (t === 'treino') abrirTreino(a, +b); else if (t === 'aula') abrirAula(a); else if (t === 'ir') ir(a + (b ? ':' + b : ''));
}
const professorHTML = () => `<section class="prof" aria-label="Professor"><div class="prof-cab"><span class="prof-av" aria-hidden="true">${I.marca}</span><b>Professor</b><span class="apoio">baseado no que você tocou</span></div>
  ${professor().map(([t, rot, acao]) => `<div class="prof-fala"><p>${esc(t)}</p>${rot ? `<button type="button" class="kf-btn kf-sec" data-prof="${esc(acao)}">${esc(rot)}</button>` : ''}</div>`).join('')}</section>`;

const VIEWS = {};
VIEWS.hoje = () => {
  if (!DB.cfg.nivel) return `<div class="pilha">
    <div class="ola"><h1>Vamos tocar guitarra.</h1><p class="apoio">Diga onde você está agora e a trilha começa no ponto certo. Dá para mudar depois, nos Ajustes.</p></div>
    <div class="kf-escolhas" role="group" aria-label="Seu nível">${NIVEIS_INICIO.map(([k, l, h]) => `<button type="button" class="kf-escolha" data-nivel="${k}"><span class="kf-escolha-ic">${I.trilha}</span><span class="kf-escolha-tx"><b>${l}</b><small>${h}</small></span>${I.seta}</button>`).join('')}</div>
  </div>`;
  const p = proxima(), n = p && TRILHA.find(x => x.id === p.nivel), meta = DB.cfg.meta, min = minutosHoje();
  return `<div class="pilha">
    <div class="ola"><p class="apoio">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, c => c.toUpperCase())}</p><h1>${p ? 'Próxima aula' : 'Trilha concluída'}</h1></div>
    ${p ? `<section class="passo" aria-label="Próxima aula"><span class="apoio">${esc(n.nome)}</span><h2>${esc(p.nome)}</h2><p>${esc(p.resumo)}</p>
      <div class="barra-prog" role="progressbar" aria-label="Trilha" aria-valuenow="${pct()}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct()}%"></span></div>
      <button type="button" class="kf-btn" data-aula="${p.id}">Abrir a aula</button></section>`
      : `<section class="passo"><h2>Você terminou a trilha.</h2><p>Escolha uma música nova em Músicas e siga praticando.</p></section>`}
    ${professorHTML()}
    <section class="cartao" aria-label="Plano de hoje"><h3>Plano de hoje · ${meta} minutos</h3>
      <ol class="blocos">${plano().map(([n, t, v]) => `<li><b>${v} min</b><span><b>${n}</b><span class="apoio">${t}</span></span></li>`).join('')}</ol>
      <p>${min} de ${meta} minutos praticados${min >= meta ? ' · meta batida' : ''}</p>
      <div class="barra-prog"><span style="width:${Math.min(100, Math.round(min / meta * 100))}%"></span></div>
      <p class="apoio">O tempo com o metrônomo ligado conta como prática. A meta muda em Ajustes, Prática.</p>
      <button type="button" class="kf-btn kf-sec" data-ir="ferramentas/metronomo">Abrir o metrônomo</button></section>
  </div>`;
};
VIEWS.trilha = () => KitFacil.ui.cabecalho({ titulo: 'Trilha', sub: 'Seis módulos, do primeiro acorde ao primeiro solo. Toque na aula para abrir; no círculo, para marcar como feita.' })
  + `<div class="pilha">${TRILHA.map(n => {
    const L = LICOES.filter(l => l.nivel === n.id), f = L.filter(l => feita(l.id)).length, aberto = n.id === (proxima() || {}).nivel;
    return `<details class="cartao" data-kf-secao="grupo"${aberto ? ' open' : ''}><summary><span class="nivel-tt"><h2 style="font-size:19px">${esc(n.nome)}</h2><span class="apoio" data-kf-secao-resumo>${esc(n.resumo)}</span></span><span class="selo${f === L.length ? ' ok' : ''}">${f}/${L.length}</span></summary>
      <ul class="licoes">${L.map(l => `<li class="licao"><button type="button" class="marca-feita" data-feita="${l.id}" aria-pressed="${feita(l.id)}" aria-label="${esc(l.nome)}: ${feita(l.id) ? 'feita' : 'marcar como feita'}">${I.check}</button><button type="button" class="licao-abre" data-aula="${l.id}"><span><b>${esc(l.nome)}</b><span class="apoio">${esc(l.resumo)}</span></span>${I.seta}</button></li>`).join('')}</ul></details>`;
  }).join('')}</div>`;
VIEWS.ferramentas = () => {
  const sub = subRota(), ab = k => (sub ? sub === k : k === 'treinos') ? ' open' : '';
  return KitFacil.ui.cabecalho({ titulo: 'Ferramentas', sub: 'Treinos com o professor, metrônomo, bateria, afinador, mapa do braço e acordes.' })
  + `<div class="pilha">
    <details class="cartao" data-kf-secao id="f-treinos"${ab('treinos')}><summary><span class="nivel-tt"><h2 style="font-size:19px">Treinos com o professor</h2><span class="apoio" data-kf-secao-resumo>O app toca junto e confere suas notas pelo microfone</span></span></summary>
      <ul class="treinos">${EXERCICIOS.map(e => { const m = melhorTreino(e.id); return `<li><button type="button" class="musica" data-treino="${e.id}"><span><b>${esc(e.nome)}</b><span class="apoio">nível ${e.nivel} · ${e.bpm} a ${e.alvo} bpm${m ? ` · seu melhor: ${m} bpm` : ''}</span></span>${I.seta}</button></li>`; }).join('')}</ul></details>
    <details class="cartao" data-kf-secao id="f-bateria"${ab('bateria')}><summary><span class="nivel-tt"><h2 style="font-size:19px">Bateria</h2><span class="apoio" data-kf-secao-resumo>Uma banda para você tocar junto</span></span></summary>
      <div class="kf-opcoes estilos" role="group" aria-label="Estilo">${ESTILOS_BATERIA.map(([k, n]) => `<button type="button" class="chip-est" data-estilo="${k}" aria-pressed="${DB.cfg.estilo === k}">${n}</button>`).join('')}</div>
      <div class="metro-bpm"><button type="button" class="kf-btn kf-sec" data-bpm="-5" aria-label="5 batidas a menos">${I.menos}</button><output class="bpm-v" aria-live="polite">${DB.cfg.bpm}</output><button type="button" class="kf-btn kf-sec" data-bpm="5" aria-label="5 batidas a mais">${I.mais}</button></div>
      <div class="batidas bat-bateria" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      <button type="button" class="kf-btn kf-pri" id="bat-ligar">${bateria.ligada ? I.stop + 'Parar a bateria' : I.bateria + 'Tocar a bateria'}</button>
      <p class="apoio">O andamento é o mesmo do metrônomo. Toque a progressão da aula da vez por cima.</p></details>
    <details class="cartao" data-kf-secao id="f-metronomo"${ab('metronomo')}><summary><span class="nivel-tt"><h2 style="font-size:19px">Metrônomo</h2><span class="apoio" data-kf-secao-resumo>${DB.cfg.bpm} batidas por minuto</span></span></summary>
      <div class="metro-bpm"><button type="button" class="kf-btn kf-sec" data-bpm="-5" aria-label="5 batidas a menos">${I.menos}</button><output id="bpm" aria-live="polite">${DB.cfg.bpm}</output><button type="button" class="kf-btn kf-sec" data-bpm="5" aria-label="5 batidas a mais">${I.mais}</button></div>
      <p class="apoio" style="text-align:center">batidas por minuto</p>
      <input type="range" id="bpm-r" min="40" max="208" step="1" value="${DB.cfg.bpm}" aria-label="Batidas por minuto">
      <div class="batidas" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      <button type="button" class="kf-btn kf-pri" id="metro">${metro.ligado ? I.stop + 'Parar' : I.play + 'Começar'}</button></details>
    <details class="cartao" data-kf-secao id="f-afinador"${ab('afinador')}><summary><span class="nivel-tt"><h2 style="font-size:19px">Afinador</h2><span class="apoio" data-kf-secao-resumo>Pelo microfone ou de ouvido</span></span></summary>
      <div class="afinador" aria-live="polite"><div class="af-nota" id="af-nota">–</div><div class="af-escala" aria-hidden="true"><span class="af-zero"></span><span class="af-ponteiro" id="af-ponteiro"></span></div><p class="apoio" id="af-msg">Toque uma corda solta depois de ligar o afinador.</p></div>
      <button type="button" class="kf-btn kf-pri" id="af-ligar">${afinador.ligado ? I.stop + 'Desligar o afinador' : I.afinador + 'Ligar o afinador'}</button>
      <p class="apoio">O som do microfone é analisado aqui no aparelho e não é gravado nem enviado.</p>
      <h3>Notas de referência</h3>
      <div class="cordas">${CORDAS.map(([n, nome], i) => `<button type="button" class="kf-btn kf-sec" data-corda="${i}" aria-label="Tocar ${nome}">${n}<small>${6 - i}ª</small></button>`).join('')}</div></details>
    <details class="cartao" data-kf-secao id="f-braco"${ab('braco')}><summary><span class="nivel-tt"><h2 style="font-size:19px">Mapa do braço</h2><span class="apoio" data-kf-secao-resumo>As notas em cada casa, até a 12</span></span></summary>
      <div class="kf-seg" role="group" aria-label="Notas mostradas"><button type="button" data-braco="naturais" aria-pressed="${DB.cfg.braco !== 'todas'}">Naturais</button><button type="button" data-braco="todas" aria-pressed="${DB.cfg.braco === 'todas'}">Todas</button></div>
      <div class="braco-wrap">${bracoSVG(DB.cfg.braco === 'todas')}</div>
      <p class="apoio">Toque numa nota para ouvir. As bolinhas nas casas 3, 5, 7, 9 e 12 são as marcações do braço.</p></details>
    <details class="cartao" data-kf-secao id="f-acordes"${ab('acordes')}><summary><span class="nivel-tt"><h2 style="font-size:19px">Acordes essenciais</h2><span class="apoio" data-kf-secao-resumo>Nove acordes abertos e o Fá com pestana</span></span></summary>
      <div class="acordes">${ACORDES.map(([nome, casas, dedos]) => `<figure class="acorde" style="margin:0">${diagrama(casas, dedos, nome)}<figcaption><b>${esc(nome)}</b></figcaption></figure>`).join('')}</div>
      <p class="apoio">X: não toque a corda. O: corda solta. Os números são os dedos da mão esquerda; a barra é a pestana.</p></details>
  </div>`;
};
VIEWS.musicas = () => {
  const sub = subRota();
  const minhas = DB.musicas.length
    ? `<div class="pilha">${ESTADOS_MUSICA.map(([k, l]) => { const M = DB.musicas.filter(m => m.estado === k); return M.length ? `<section class="pilha" style="gap:8px"><h3 class="sub-h">${l}</h3><ul class="musicas">${M.map(m => `<li><button type="button" class="musica" data-musica="${m.id}"><span><b>${esc(m.titulo)}</b>${m.artista ? `<span class="apoio"> · ${esc(m.artista)}</span>` : ''}</span>${I.seta}</button></li>`).join('')}</ul></section>` : ''; }).join('')}</div>`
    : KitFacil.ui.vazio({ titulo: 'Nenhuma música ainda', texto: 'Anote as músicas que você quer aprender ou adicione das playlists abaixo. Quando conseguir tocar, marque como <b>Já toco</b>.' });
  const tem = (t, a) => DB.musicas.some(m => m.titulo === t && m.artista === a);
  return KitFacil.ui.cabecalho({ titulo: 'Músicas', sub: 'Suas músicas e playlists recomendadas por nível.', criar: { rotulo: 'Nova música', attrs: 'data-musica-nova' } })
    + `<div class="pilha">${minhas}<h2 class="sec-h">Playlists recomendadas</h2>
    ${PLAYLISTS.map(pl => `<details class="cartao playlist" data-kf-secao id="${pl.id}"${sub ? (sub === pl.id ? ' open' : '') : (pl.nivel === nivelNum() ? ' open' : '')}><summary><span class="pl-capa n${pl.nivel}" aria-hidden="true">${pl.nivel}</span><span class="nivel-tt"><h2 style="font-size:18px">${esc(pl.nome)}</h2><span class="apoio" data-kf-secao-resumo>nível ${pl.nivel} · ${pl.musicas.length} músicas · ${esc(pl.resumo)}</span></span></summary>
      <ol class="faixas">${pl.musicas.map(([t, a, por], i) => `<li><span class="fx-n">${i + 1}</span><span class="fx-t"><b>${esc(t)}</b><span class="apoio">${esc(a)} · ${esc(por)}</span></span><span class="fx-a"><a class="kf-btn kf-sec fx-l" href="${linkYoutube(t, a)}" target="_blank" rel="noopener" aria-label="Ver ${esc(t)} no YouTube">YouTube</a><a class="kf-btn kf-sec fx-l" href="${linkSpotify(t, a)}" target="_blank" rel="noopener" aria-label="Ouvir ${esc(t)} no Spotify">Spotify</a><button type="button" class="kf-btn ${tem(t, a) ? 'kf-sec' : 'kf-pri'} fx-l" data-pl-add="${esc(pl.id)}|${i}" ${tem(t, a) ? 'disabled' : ''}>${tem(t, a) ? 'Na lista' : 'Quero aprender'}</button></span></li>`).join('')}</ol></details>`).join('')}
    <p class="apoio">As músicas tocam no YouTube ou no Spotify: letras, cifras e gravações têm direitos autorais e não ficam dentro do app.</p></div>`;
};
// os últimos 12 treinos: barra = % de notas certas (linha tracejada em 90%)
function graficoTreinos() {
  const T = DB.treinos.slice(-12), W = 320, H = 120, bw = W / 12;
  return `<svg viewBox="0 0 ${W} ${H + 18}" role="img" aria-label="Precisão dos últimos ${T.length} treinos">${T.map((t, i) => { const h = Math.max(2, t.acerto / 100 * H); return `<rect x="${i * bw + 4}" y="${H - h}" width="${bw - 8}" height="${h}" rx="3" class="${t.acerto >= 90 ? 'g-ok' : t.acerto >= 60 ? 'g-med' : 'g-ruim'}"/><text x="${i * bw + bw / 2}" y="${H + 14}" text-anchor="middle" class="g-t">${t.acerto}</text>`; }).join('')}<line x1="0" y1="${H - .9 * H}" x2="${W}" y2="${H - .9 * H}" class="g-meta"/></svg>`;
}
VIEWS.progresso = () => {
  const L = licoesDaVez(), f = L.filter(l => feita(l.id)).length, total = Math.round(DB.praticas.reduce((s, p) => s + p.min, 0)), toco = DB.musicas.filter(m => m.estado === 'toco').length;
  return KitFacil.ui.cabecalho({ titulo: 'Progresso', sub: 'Aulas feitas, tempo de prática e músicas que você já toca.' })
    + `<div class="pilha"><div class="dados"><div class="dado"><b>${f}/${L.length}</b><span class="apoio">aulas feitas</span></div><div class="dado"><b>${total}</b><span class="apoio">minutos praticados</span></div><div class="dado"><b>${toco}</b><span class="apoio">músicas que você toca</span></div></div>
      <section class="cartao"><h3>Seus andamentos</h3>${(() => { const ids = [...new Set(DB.andamentos.map(a => a.licao))]; return ids.length
        ? `<ul class="andas">${ids.map(id => { const l = LICOES.find(x => x.id === id); if (!l) return ''; const b = melhorAndamento(id), al = l.exercicio ? l.exercicio.alvo : 0; return `<li><span><b>${esc(l.nome)}</b><span class="apoio">melhor: ${b} bpm${al ? ` · meta ${al}` : ''}</span></span><div class="barra-prog" style="width:96px"><span style="width:${al ? Math.min(100, Math.round(b / al * 100)) : 100}%"></span></div></li>`; }).join('')}</ul>`
        : '<p class="apoio">Registre o andamento ao fazer o exercício de uma aula: ele aparece aqui, com a meta da aula.</p>'; })()}</section>
      <section class="cartao"><h3>Treinos com o microfone</h3>${DB.treinos.length ? `<div class="grafico">${graficoTreinos()}</div><ul class="andas">${EXERCICIOS.filter(e => DB.treinos.some(t => t.ex === e.id)).map(e => { const T = DB.treinos.filter(t => t.ex === e.id), ul = T[T.length - 1], m = melhorTreino(e.id); return `<li><span><b>${esc(e.nome)}</b><span class="apoio">último: ${ul.acerto}% a ${ul.bpm} bpm · melhor com 90%+: ${m || '–'} bpm · meta ${e.alvo}</span></span><div class="barra-prog" style="width:96px"><span style="width:${Math.min(100, Math.round((m || 0) / e.alvo * 100))}%"></span></div></li>`; }).join('')}</ul>` : '<p class="apoio">Faça um treino com o professor em Ferramentas: a precisão de cada treino aparece aqui.</p>'}</section>
      <div class="dados"><div class="dado"><b>${diasSeguidos()}</b><span class="apoio">dias seguidos praticando</span></div><div class="dado"><b>${DB.treinos.length}</b><span class="apoio">treinos com o microfone</span></div></div></div>`;
};
const TEO = { raiz: 9, escala: 'penta-menor', rotulo: 'nota', desenho: -1, acRaiz: 0, acTipo: '', tom: 0 };
VIEWS.teoria = () => {
  const sub = subRota(), ab = k => (sub ? sub === k : k === 'escalas') ? ' open' : '';
  const E = ESCALAS.find(e => e[0] === TEO.escala), notas = notasEscala(TEO.raiz, TEO.escala), pentas = TEO.escala.startsWith('penta') || TEO.escala === 'blues';
  const des = pentas && TEO.desenho >= 0 ? desenhosPenta(TEO.escala === 'penta-maior' ? pc(TEO.raiz + 9) : TEO.raiz)[TEO.desenho] : null;
  const acN = notasAcorde(TEO.acRaiz, TEO.acTipo), acT = TIPOS_ACORDE.find(t => t[0] === TEO.acTipo), campo = campoHarmonico(TEO.tom);
  const optRaiz = (sel) => NOTAS.map((n, i) => `<option value="${i}"${sel === i ? ' selected' : ''}>${n} (${CIFRA[i]})</option>`).join('');
  return KitFacil.ui.cabecalho({ titulo: 'Teoria', sub: 'Escalas, acordes, tonalidades, intervalos e ritmo, desenhados no braço e prontos para ouvir.' })
  + `<div class="pilha">
    <details class="cartao" data-kf-secao id="t-escalas"${ab('escalas')}><summary><span class="nivel-tt"><h2 style="font-size:19px">Escalas no braço</h2><span class="apoio" data-kf-secao-resumo>${esc(E[1])} de ${NOTAS[TEO.raiz]}</span></span></summary>
      <div class="grade2"><div class="campo"><label class="kf-rotulo" for="te-raiz">Tônica</label><select id="te-raiz">${optRaiz(TEO.raiz)}</select></div>
      <div class="campo"><label class="kf-rotulo" for="te-esc">Escala</label><select id="te-esc">${ESCALAS.map(e => `<option value="${e[0]}"${TEO.escala === e[0] ? ' selected' : ''}>${e[1]}</option>`).join('')}</select></div></div>
      <p class="apoio">${esc(E[3])} Notas: <b>${notas.map(n => CIFRA[n]).join(' · ')}</b> · fórmula: ${E[2].map(i => GRAUS[i]).join(' ')}</p>
      <div class="kf-seg" role="group" aria-label="Rótulo das notas"><button type="button" data-te-rot="nota" aria-pressed="${TEO.rotulo === 'nota'}">Notas</button><button type="button" data-te-rot="grau" aria-pressed="${TEO.rotulo === 'grau'}">Graus</button></div>
      ${pentas ? `<div class="kf-opcoes desenhos" role="group" aria-label="Desenho da pentatônica"><button type="button" class="chip-est" data-te-des="-1" aria-pressed="${TEO.desenho < 0}">Braço inteiro</button>${[0, 1, 2, 3, 4].map(i => `<button type="button" class="chip-est" data-te-des="${i}" aria-pressed="${TEO.desenho === i}">Desenho ${i + 1}</button>`).join('')}</div>` : ''}
      <div class="braco-wrap" id="te-braco">${bracoMarcado({ notas, raiz: TEO.raiz, rotulo: TEO.rotulo, casas: 17, desenho: des, titulo: E[1] })}</div>
      <div class="legenda"><span class="lg raiz"></span>tônica<span class="lg"></span>outras notas da escala</div>
      <button type="button" class="kf-btn kf-sec" data-te-ouvir="escala">${I.play}Ouvir a escala</button></details>
    <details class="cartao" data-kf-secao id="t-acordes"${ab('acordes')}><summary><span class="nivel-tt"><h2 style="font-size:19px">Construtor de acordes</h2><span class="apoio" data-kf-secao-resumo>${nomeAcorde(TEO.acRaiz, TEO.acTipo)}: ${acN.map(n => CIFRA[n]).join(' · ')}</span></span></summary>
      <div class="grade2"><div class="campo"><label class="kf-rotulo" for="ta-raiz">Fundamental</label><select id="ta-raiz">${optRaiz(TEO.acRaiz)}</select></div>
      <div class="campo"><label class="kf-rotulo" for="ta-tipo">Tipo</label><select id="ta-tipo">${TIPOS_ACORDE.map(t => `<option value="${t[0]}"${TEO.acTipo === t[0] ? ' selected' : ''}>${t[1]}${t[0] ? ' (' + t[0] + ')' : ''}</option>`).join('')}</select></div></div>
      <div class="ac-cifra"><b>${nomeAcorde(TEO.acRaiz, TEO.acTipo)}</b><span>${acT[2].map(i => `<span class="ac-g">${i === 14 ? '9' : GRAUS[i % 12]}<small>${CIFRA[pc(TEO.acRaiz + i)]}</small></span>`).join('')}</span></div>
      <div class="braco-wrap" id="ta-braco">${bracoMarcado({ notas: acN, raiz: TEO.acRaiz, rotulo: 'grau', casas: 15, titulo: 'Notas do acorde' })}</div>
      <p class="apoio">Todas as notas do acorde no braço: escolha uma de cada corda, perto umas das outras, e você tem uma forma do acorde.</p>
      <button type="button" class="kf-btn kf-sec" data-te-ouvir="acorde">${I.play}Ouvir o acorde</button></details>
    <details class="cartao" data-kf-secao id="t-circulo"${ab('circulo')}><summary><span class="nivel-tt"><h2 style="font-size:19px">Círculo das quintas e campo harmônico</h2><span class="apoio" data-kf-secao-resumo>Tom de ${NOTAS[TEO.tom]} maior</span></span></summary>
      <div class="circ-wrap">${circuloSVG(TEO.tom)}</div>
      <p class="apoio">Toque num tom. Por fora, os tons maiores; por dentro, a relativa menor (mesmas notas). Vizinhos no círculo combinam.</p>
      <div class="campo-h">${campo.map(c => `<button type="button" class="ch-it f-${c.funcao}" data-te-campo="${c.raiz}|${c.tipo}"><small>${c.grau}</small><b>${esc(c.triade)}</b><span>${esc(c.tetrade)}</span><em>${c.funcao}</em></button>`).join('')}</div>
      <p class="apoio">Toque num acorde para ouvir. Progressões que funcionam em ${NOTAS[TEO.tom]}: <b>I–V–vi–IV</b> (${[0, 4, 5, 3].map(i => campo[i].triade).join(' – ')}), <b>ii–V–I</b> (${[1, 4, 0].map(i => campo[i].triade).join(' – ')}), <b>I–IV–V</b> (${[0, 3, 4].map(i => campo[i].triade).join(' – ')}).</p></details>
    <details class="cartao" data-kf-secao id="t-intervalos"${ab('intervalos')}><summary><span class="nivel-tt"><h2 style="font-size:19px">Intervalos</h2><span class="apoio" data-kf-secao-resumo>A distância entre duas notas, para ver e ouvir</span></span></summary>
      <div class="intervalos">${INTERVALOS.map(([n, nome, desc]) => `<button type="button" class="int-it" data-te-int="${n}"><span class="int-barra" aria-hidden="true">${Array.from({ length: 13 }, (_, k) => `<i class="${k === 0 || k === n ? 'on' : k < n ? 'meio' : ''}"></i>`).join('')}</span><b>${nome}</b><span class="apoio">${n} ${n === 1 ? 'semitom' : 'semitons'} · ${desc}</span></button>`).join('')}</div></details>
    <details class="cartao" data-kf-secao id="t-ritmo"${ab('ritmo')}><summary><span class="nivel-tt"><h2 style="font-size:19px">Ritmo e figuras</h2><span class="apoio" data-kf-secao-resumo>Quanto dura cada nota, no andamento do metrônomo</span></span></summary>
      <div class="figuras">${FIGURAS.map(([n, t]) => `<button type="button" class="fig-it" data-te-fig="${t}">${figuraSVG(t)}<b>${n}</b><span class="apoio">${t >= 1 ? t + (t === 1 ? ' tempo' : ' tempos') : t === .5 ? 'meio tempo' : '1/4 de tempo'} · ${Math.round(60 / DB.cfg.bpm * t * 1000)} ms a ${DB.cfg.bpm} bpm</span></button>`).join('')}</div>
      <p class="apoio">Num compasso 4/4 cabem 4 semínimas, 8 colcheias ou 16 semicolcheias. Toque numa figura para ouvir quatro tempos dela.</p></details>
  </div>`;
};
VIEWS.ajustes = () => KitFacil.ajustes.html({
  produto: [{ id: 'pratica', titulo: 'Prática', icone: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>', resumo: `Meta de ${DB.cfg.meta} min por dia · ${(NIVEIS_INICIO.find(n => n[0] === DB.cfg.nivel) || [, 'nível não escolhido'])[1]}`,
    html: `<div class="kf-bloco"><h3>Meta e nível</h3>
      <div class="campo"><label class="kf-rotulo" for="aj-meta">Meta de prática por dia</label><select id="aj-meta">${[10, 15, 20, 30, 45, 60].map(m => `<option value="${m}"${DB.cfg.meta === m ? ' selected' : ''}>${m} minutos</option>`).join('')}</select></div>
      <div class="campo"><label class="kf-rotulo" for="aj-nivel">Onde a trilha começa</label><select id="aj-nivel"><option value="" hidden>Escolha…</option>${NIVEIS_INICIO.map(([k, l]) => `<option value="${k}"${DB.cfg.nivel === k ? ' selected' : ''}>${l}</option>`).join('')}</select></div></div>` }],
});

/* ================= ferramentas: som ================= */
const CORDAS = [['E', 'Mi grave', 82.41], ['A', 'Lá', 110], ['D', 'Ré', 146.83], ['G', 'Sol', 196], ['B', 'Si', 246.94], ['E', 'Mi agudo', 329.63]];
let ctxAudio = null;
const audio = () => { if (!ctxAudio) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctxAudio = new C(); } if (ctxAudio.state === 'suspended') ctxAudio.resume(); return ctxAudio; };
function tocarNota(hz, dur = 2.2) {
  const a = audio(); if (!a) return;
  if (typeof tocarCorda === 'function') { tocarCorda(Math.round(12 * Math.log2(hz / 440) + 69), a.currentTime + .01, Math.min(dur, 1.8)); return; }
  const t = a.currentTime, o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain();
  o.type = 'triangle'; o.frequency.value = hz; o2.type = 'sine'; o2.frequency.value = hz * 2;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); o2.connect(g); g.connect(a.destination); o.start(t); o2.start(t); o.stop(t + dur); o2.stop(t + dur);
}
const metro = { ligado: false, t: null, prox: 0, batida: 0, inicio: 0 };
function clique(acento, quando) {
  const a = audio(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.frequency.value = acento ? 1600 : 1000;
  g.gain.setValueAtTime(0.0001, quando); g.gain.exponentialRampToValueAtTime(0.5, quando + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, quando + 0.06);
  o.connect(g); g.connect((typeof treino !== 'undefined' && treino.saida) || a.destination); o.start(quando); o.stop(quando + 0.07);
}
function metroLigar() {
  const a = audio(); metro.ligado = true; metro.batida = 0; metro.inicio = Date.now();
  metro.prox = a ? a.currentTime + 0.05 : 0;
  const passo = () => {
    const seg = 60 / DB.cfg.bpm;
    if (a) while (metro.prox < a.currentTime + 0.12) { clique(metro.batida % 4 === 0, metro.prox); const b = metro.batida % 4, atraso = Math.max(0, (metro.prox - a.currentTime) * 1000); setTimeout(() => pintarBatida(b), atraso); metro.prox += seg; metro.batida++; }
  };
  passo(); metro.t = setInterval(passo, 25);
  pintarMetro();
}
function metroParar() {
  if (!metro.ligado) return;
  clearInterval(metro.t); metro.ligado = false;
  const min = Math.round((Date.now() - metro.inicio) / 60000);
  if (min >= 1) { DB.praticas.push({ id: uid(), em: Date.now(), min }); commit(); KitFacil.avisar(`${min} min de prática registrados.`); }
  pintarMetro(); pintarBatida(-1);
}
function pintarMetro() { const b = $('#metro'); if (b) b.innerHTML = metro.ligado ? I.stop + 'Parar' : I.play + 'Começar'; }
function pintarBatida(k) { $$('.batidas span').forEach((s, i) => s.classList.toggle('on', i === k)); }
function mudarBpm(v) {
  DB.cfg.bpm = Math.max(40, Math.min(208, Math.round(v))); LS.set('db', DB);
  const o = $('#bpm'), r = $('#bpm-r'); if (o) o.textContent = DB.cfg.bpm; if (r) r.value = DB.cfg.bpm; $$('.bpm-v').forEach(x => x.textContent = DB.cfg.bpm);
  clearTimeout(mudarBpm.t); mudarBpm.t = setTimeout(commit, 600);
}
/* diagramas de acorde: 6 cordas, 4 casas; casas: -1 não toca, 0 solta */
const ACORDES = [['Mi menor', [0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0]], ['Lá menor', [-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0]], ['Ré menor', [-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1]],
  ['Mi maior', [0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]], ['Lá maior', [-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0]], ['Ré maior', [-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2]],
  ['Dó maior', [-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]], ['Sol maior', [3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3]], ['Mi 5 (power chord)', [0, 2, -1, -1, -1, -1], [0, 1, 0, 0, 0, 0]],
  ['Fá maior (pestana)', [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], 1]];
function diagrama(casas, dedos, nome, pestana) {
  pestana = pestana || (ACORDES.find(a => a[0] === nome) || [])[3];
  const x = i => 14 + i * 18, y = c => 26 + c * 22;
  let s = `<svg viewBox="0 0 118 124" role="img" aria-label="Acorde de ${esc(nome)}"><g stroke="currentColor" fill="none">`;
  if (pestana) s += `</g><rect x="${x(0) - 6}" y="${y(pestana) - 18}" width="${x(5) - x(0) + 12}" height="14" rx="7" fill="currentColor"/><g stroke="currentColor" fill="none">`;
  s += `<line x1="${x(0)}" y1="${y(0)}" x2="${x(5)}" y2="${y(0)}" stroke-width="4"/>`;
  for (let c = 1; c <= 4; c++) s += `<line x1="${x(0)}" y1="${y(c)}" x2="${x(5)}" y2="${y(c)}" stroke-width="1" opacity=".5"/>`;
  for (let i = 0; i < 6; i++) s += `<line x1="${x(i)}" y1="${y(0)}" x2="${x(i)}" y2="${y(4)}" stroke-width="1.2"/>`;
  s += '</g>';
  casas.forEach((c, i) => {
    if (c < 0) s += `<text x="${x(i)}" y="16" text-anchor="middle" font-size="12" fill="currentColor">X</text>`;
    else if (c === 0) s += `<circle cx="${x(i)}" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    else s += `<circle cx="${x(i)}" cy="${y(c) - 11}" r="7.5" fill="currentColor"/><text x="${x(i)}" y="${y(c) - 7}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--kf-surface)">${dedos[i]}</text>`;
  });
  return s + '</svg>';
}

/* ================= mapa do braço ================= */
// NOTAS, CIFRA e SOLTAS vêm de teoria.js
const freqDe = (corda, casa) => CORDAS[corda][2] * Math.pow(2, casa / 12);
function bracoSVG(todas) {
  const C = 13, L = 46, A = 26, x = k => 22 + k * L, y = c => 18 + (5 - c) * A;
  let s = `<svg class="braco" viewBox="0 0 ${x(C) + 4} ${y(0) + 30}" role="group" aria-label="Mapa das notas no braço">`;
  s += `<rect x="${x(0)}" y="${y(5) - 10}" width="${x(C) - x(0)}" height="${y(0) - y(5) + 20}" rx="4" fill="var(--kf-surface-2)"/>`;
  for (let k = 0; k <= C; k++) s += `<line x1="${x(k)}" y1="${y(5) - 10}" x2="${x(k)}" y2="${y(0) + 10}" stroke="var(--kf-line-2)" stroke-width="${k === 0 ? 5 : 1.5}"/>`;
  [3, 5, 7, 9].forEach(k => s += `<circle cx="${x(k) - L / 2}" cy="${y(0) + 22}" r="3" fill="var(--kf-muted)"/>`);
  s += `<circle cx="${x(12) - L / 2 - 6}" cy="${y(0) + 22}" r="3" fill="var(--kf-muted)"/><circle cx="${x(12) - L / 2 + 6}" cy="${y(0) + 22}" r="3" fill="var(--kf-muted)"/>`;
  for (let c = 0; c < 6; c++) s += `<line x1="${x(0)}" y1="${y(c)}" x2="${x(C)}" y2="${y(c)}" stroke="var(--kf-muted)" stroke-width="${1 + (5 - c) * .25}"/>`;
  for (let c = 0; c < 6; c++) for (let k = 0; k < C; k++) {
    const n = (SOLTAS[c] + k) % 12, nat = !CIFRA[n].includes('#');
    if (!todas && !nat) continue;
    const cx = k === 0 ? x(0) - 12 : x(k) - L / 2;
    s += `<g class="nota${nat ? '' : ' sust'}" data-nota="${c},${k}" role="button" tabindex="0" aria-label="${NOTAS[n]}, ${6 - c}ª corda, ${k ? 'casa ' + k : 'solta'}"><circle cx="${cx}" cy="${y(c)}" r="10.5"/><text x="${cx}" y="${y(c) + 4}" text-anchor="middle">${CIFRA[n]}</text></g>`;
  }
  return s + '</svg>';
}

/* ================= afinador (microfone) ================= */
/* A frequência sai da autocorrelação do sinal: rápida e boa para as cordas da guitarra (80 a 1000 Hz).
   Nada é gravado nem enviado: o áudio é analisado em memória, quadro a quadro. */
function detectarFrequencia(buf, taxa) {
  const n = buf.length; let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
  if (Math.sqrt(rms / n) < 0.01) return null; // silêncio
  const min = Math.floor(taxa / 1000), max = Math.min(Math.floor(taxa / 70), n - 1);
  let melhor = -1, melhorV = 0, c = new Float32Array(max + 2);
  for (let l = min; l <= max + 1; l++) { let soma = 0; for (let i = 0; i < n - l; i++) soma += buf[i] * buf[i + l]; c[l] = soma; }
  let e0 = 0; for (let i = 0; i < n; i++) e0 += buf[i] * buf[i];
  for (let l = min + 1; l <= max; l++) { const v = c[l] / e0; if (v > melhorV && c[l] >= c[l - 1] && c[l] >= c[l + 1] && v > 0.5) { melhorV = v; melhor = l; if (v > 0.9) break; } }
  if (melhor < 0) return null;
  const a = c[melhor - 1], b = c[melhor], d = c[melhor + 1], desl = (a - d) / (2 * (a - 2 * b + d)) || 0;
  return taxa / (melhor + desl);
}
function notaDe(f) { const m = 12 * Math.log2(f / 440) + 69, r = Math.round(m); return { nome: NOTAS[(r % 12 + 12) % 12], cifra: CIFRA[(r % 12 + 12) % 12], cents: Math.round((m - r) * 100), alvo: 440 * Math.pow(2, (r - 69) / 12) }; }
const afinador = { ligado: false, fluxo: null, raf: 0 };
async function afinadorLigar() {
  const a = audio(); if (!a || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { KitFacil.avisar('Este navegador não permite usar o microfone. Use as notas de referência.'); return; }
  try {
    afinador.fluxo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  } catch { KitFacil.avisar('Sem permissão para o microfone. Libere nas configurações do navegador ou use as notas de referência.'); return; }
  const fonte = a.createMediaStreamSource(afinador.fluxo), an = a.createAnalyser(); an.fftSize = 2048; fonte.connect(an);
  const buf = new Float32Array(an.fftSize); afinador.ligado = true; pintarAfinador();
  let suave = null, quadro = 0;
  const passo = () => {
    if (!afinador.ligado) return;
    if (quadro++ % 2) { afinador.raf = requestAnimationFrame(passo); return; } // meio quadro basta e poupa bateria
    an.getFloatTimeDomainData(buf);
    const f = detectarFrequencia(buf, a.sampleRate);
    if (f) { suave = suave && Math.abs(f - suave) / suave < 0.03 ? suave * 0.7 + f * 0.3 : f; mostrarNota(suave); }
    afinador.raf = requestAnimationFrame(passo);
  };
  passo();
}
function afinadorDesligar() {
  if (!afinador.ligado) return;
  afinador.ligado = false; cancelAnimationFrame(afinador.raf);
  if (afinador.fluxo) afinador.fluxo.getTracks().forEach(t => t.stop()); afinador.fluxo = null;
  pintarAfinador();
}
function mostrarNota(f) {
  const n = notaDe(f), el = $('#af-nota'), pt = $('#af-ponteiro'), msg = $('#af-msg'); if (!el) return;
  el.textContent = `${n.cifra}`; el.classList.toggle('ok', Math.abs(n.cents) <= 5);
  if (pt) pt.style.transform = `translateX(${Math.max(-50, Math.min(50, n.cents))}%)`;
  if (msg) msg.textContent = Math.abs(n.cents) <= 5 ? `${n.nome}: afinada` : n.cents < 0 ? `${n.nome}: baixa (${n.cents} cents). Aperte a tarraxa.` : `${n.nome}: alta (+${n.cents} cents). Afrouxe a tarraxa.`;
}
function pintarAfinador() { const b = $('#af-ligar'); if (b) b.innerHTML = afinador.ligado ? I.stop + 'Desligar o afinador' : I.afinador + 'Ligar o afinador'; if (!afinador.ligado) { const m = $('#af-msg'); if (m) m.textContent = 'Toque uma corda solta depois de ligar o afinador.'; } }

/* ================= janela do treino com o professor ================= */
function abrirTreino(id, bpmPedido) {
  const ex = EXERCICIOS.find(e => e.id === id); if (!ex) return;
  let bpm = bpmPedido || melhorTreino(id) || ex.bpm;
  const o = { ouvir: DB.cfg.trMic !== false, guia: DB.cfg.trGuia !== false, subir: !!DB.cfg.trSubir };
  const pctV = () => Math.round(bpm / ex.bpm * 100);
  KitFacil.dialogo.abrir({ titulo: ex.nome, sub: `Treino com o professor · nível ${ex.nivel}`, classe: 'kf-alto kf-largo', nome: 'treino',
    corpo: `<div class="tr-palco"><div class="tab-wrap" id="tr-tab">${tabSVG(ex)}</div><div class="tr-conta" id="tr-conta" aria-live="assertive"></div></div>
      <div class="tr-vel"><span class="kf-rotulo">Velocidade</span>
        <div class="metro-bpm"><button type="button" class="kf-btn kf-sec" data-tr-bpm="-5" aria-label="5 batidas a menos">${I.menos}</button><output id="tr-bpm">${bpm}</output><button type="button" class="kf-btn kf-sec" data-tr-bpm="5" aria-label="5 batidas a mais">${I.mais}</button></div>
        <input type="range" id="tr-r" min="40" max="${ex.alvo + 40}" step="1" value="${bpm}" aria-label="Batidas por minuto">
        <p class="apoio" id="tr-vel-t">${pctV()}% do andamento inicial · meta: ${ex.alvo} bpm</p></div>
      <div class="tr-op">
        <label class="kf-check"><input type="checkbox" id="tr-mic" ${o.ouvir ? 'checked' : ''}><span>${I.mic}Conferir minhas notas pelo microfone</span></label>
        <label class="kf-check"><input type="checkbox" id="tr-guia" ${o.guia ? 'checked' : ''}><span>Tocar o exemplo junto comigo</span></label>
        <label class="kf-check"><input type="checkbox" id="tr-subir" ${o.subir ? 'checked' : ''}><span>Subida automática: +5 bpm a cada treino com 90% ou mais</span></label></div>
      <div class="tr-res" id="tr-res" hidden></div>`,
    pe: `<button type="button" class="kf-btn kf-sec" id="tr-exemplo">${I.play}Ouvir o exemplo</button><button type="button" class="kf-btn kf-pri" id="tr-ir">${I.play}Começar</button>`,
    aoFechar: () => { if (treino.parar) treino.parar(); },
    aoMontar: d => {
      const tabW = $('#tr-tab', d), cur = $('.tab-cursor', d), conta = $('#tr-conta', d), res = $('#tr-res', d);
      const posNotas = []; { let t = 0; ex.notas.forEach(n => { posNotas.push(t); t += n[2]; }); }
      const setBpm = v => { bpm = Math.max(40, Math.min(ex.alvo + 40, Math.round(v))); $('#tr-bpm', d).textContent = bpm; $('#tr-r', d).value = bpm; $('#tr-vel-t', d).textContent = `${pctV()}% do andamento inicial · meta: ${ex.alvo} bpm`; };
      $$('[data-tr-bpm]', d).forEach(b => b.onclick = () => setBpm(bpm + +b.dataset.trBpm));
      $('#tr-r', d).addEventListener('input', e => setBpm(+e.target.value));
      ['mic', 'guia', 'subir'].forEach(k => $('#tr-' + k, d).addEventListener('change', e => { DB.cfg['tr' + k[0].toUpperCase() + k.slice(1)] = e.target.checked; commit(); }));
      const quadro = (beat, falta) => {
        conta.textContent = falta ? String(falta) : ''; conta.classList.toggle('on', !!falta);
        const x = 40 + Math.max(0, beat) * PX; cur.setAttribute('x1', x); cur.setAttribute('x2', x);
        tabW.scrollLeft = Math.max(0, x - tabW.clientWidth * .35);
        let i = -1; posNotas.forEach((p, k) => { if (beat >= p) i = k; });
        $$('.tab-n', d).forEach((g, k) => g.classList.toggle('agora', k === i && beat >= 0));
      };
      const botoes = tocando => { $('#tr-ir', d).innerHTML = tocando ? I.stop + 'Parar' : I.play + 'Começar'; $('#tr-exemplo', d).disabled = tocando; };
      let inicio = Date.now();
      const rodar = soExemplo => {
        if (treino.tocando) { treino.parar(); return; }
        inicio = Date.now();
        res.hidden = true; $$('.tab-n', d).forEach(g => g.classList.remove('ok', 'erro', 'agora'));
        botoes(true);
        treinoTocar(ex, { bpm, ouvir: !soExemplo && $('#tr-mic', d).checked, guia: soExemplo || $('#tr-guia', d).checked, aoQuadro: quadro,
          aoFim: (r, parado) => {
            botoes(false); conta.textContent = ''; conta.classList.remove('on');
            $$('.tab-n', d).forEach(g => g.classList.remove('agora'));
            const segs = (Date.now() - inicio) / 1000;
            if (!soExemplo && !parado && segs > 20) { DB.praticas.push({ id: uid(), em: Date.now(), min: Math.round(segs / 6) / 10 }); }
            if (!r) { if (!soExemplo && !parado && !$('#tr-mic', d).checked) res.innerHTML = `<p>Treino feito a ${bpm} bpm. Ligue o microfone para o professor conferir as notas.</p>`, res.hidden = false; commit(); return; }
            r.notas.forEach((n, k) => { const g = $(`.tab-n[data-i="${k}"]`, d); if (g) g.classList.add(n.ok ? 'ok' : 'erro'); });
            DB.treinos.push({ id: uid(), ex: id, bpm, acerto: r.acerto, cents: r.cents, em: Date.now() });
            let fala, prox = bpm;
            if (r.ouvidas < ex.notas.length * .3) fala = 'Quase não ouvi a guitarra. Chegue o aparelho mais perto do amplificador ou do violão e aumente o volume.';
            else if (r.acerto >= 90) { fala = `Muito bom! ${r.acerto}% das notas certas.`; if ($('#tr-subir', d).checked) { prox = Math.min(ex.alvo + 40, bpm + 5); fala += ` Subi para ${prox} bpm.`; } else fala += ' Pode subir 5 bpm.'; }
            else if (r.acerto >= 60) fala = `${r.acerto}% das notas certas. Repita neste andamento: as notas em vermelho são as que precisam de atenção.`;
            else { prox = Math.max(40, bpm - 10); fala = `${r.acerto}% das notas certas. Vamos com calma: baixei para ${prox} bpm.`; }
            if (r.cents != null && r.cents > 15) fala += ` A afinação das notas certas ficou ${r.cents} cents em média fora do centro: confira o afinador.`;
            res.innerHTML = `<div class="tr-nota ${r.acerto >= 90 ? 'ok' : r.acerto >= 60 ? 'med' : 'ruim'}"><b>${r.acerto}%</b><span>notas certas</span></div><div class="tr-nota"><b>${r.cents == null ? '–' : '±' + r.cents}</b><span>cents de afinação</span></div><p class="tr-fala"><b>Professor:</b> ${esc(fala)}</p>`;
            res.hidden = false; setBpm(prox); commit();
            if (ex.licao && r.acerto >= 90) DB.andamentos.push({ id: uid(), licao: ex.licao, bpm, em: Date.now() }), commit();
          } });
      };
      $('#tr-ir', d).onclick = () => rodar(false);
      $('#tr-exemplo', d).onclick = () => rodar(true);
    } });
}

/* ================= janela da aula ================= */
const FERRAMENTA_NOME = { metronomo: 'Abrir o metrônomo', afinador: 'Abrir o afinador', braco: 'Abrir o mapa do braço', acordes: 'Ver os acordes' };
function abrirAula(id) {
  const l = LICOES.find(x => x.id === id); if (!l) return;
  const n = TRILHA.find(x => x.id === l.nivel), ex = l.exercicio, melhor = melhorAndamento(id);
  KitFacil.dialogo.abrir({ titulo: l.nome, sub: n.nome, classe: 'kf-alto', nome: 'aula',
    corpo: `<p class="aula-obj"><b>Objetivo:</b> ${esc(l.objetivo || l.resumo)}</p>
      <ol class="aula-passos">${(l.passos || []).map(t => `<li>${esc(t)}</li>`).join('')}</ol>
      ${ex ? `<section class="exercicio" aria-labelledby="ex-t"><h3 id="ex-t">Exercício</h3><p>${esc(ex.texto)}</p>
        <p class="apoio">Comece em <b>${ex.bpm} bpm</b> e suba de 5 em 5 até <b>${ex.alvo} bpm</b>.${melhor ? ` Seu melhor: <b>${melhor} bpm</b>.` : ''}</p>
        <div class="ex-acoes">${EXERCICIOS.some(e => e.licao === id) ? `<button type="button" class="kf-btn kf-pri" data-ex-treino="${EXERCICIOS.find(e => e.licao === id).id}">${I.mic}Treinar com o professor</button>` : ''}<button type="button" class="kf-btn kf-sec" data-ex-metro="${melhor ? Math.min(ex.alvo, melhor + 5) : ex.bpm}">${I.play}Praticar a ${melhor ? Math.min(ex.alvo, melhor + 5) : ex.bpm} bpm</button></div>
        <div class="ex-registro"><label class="kf-rotulo" for="ex-bpm">Andamento que você tocou limpo</label>
          <div class="metro-bpm" style="justify-content:flex-start"><button type="button" class="kf-btn kf-sec" data-ex-mais="-5" aria-label="5 a menos">${I.menos}</button><output id="ex-bpm">${melhor || ex.bpm}</output><button type="button" class="kf-btn kf-sec" data-ex-mais="5" aria-label="5 a mais">${I.mais}</button></div>
          <button type="button" class="kf-btn kf-sec" data-ex-registrar>Registrar andamento</button></div></section>` : ''}
      ${l.dica ? `<p class="aula-dica"><b>Dica:</b> ${esc(l.dica)}</p>` : ''}
      ${l.ferramenta && l.ferramenta !== 'metronomo' ? `<button type="button" class="kf-btn kf-link" data-ex-ferramenta="${l.ferramenta}">${FERRAMENTA_NOME[l.ferramenta]}</button>` : ''}`,
    pe: `<button type="button" class="kf-btn ${feita(id) ? 'kf-sec' : 'kf-pri'}" data-aula-feita>${feita(id) ? 'Desmarcar aula' : I.check + 'Marcar como feita'}</button>`,
    aoMontar: d => {
      let v = melhor || (ex && ex.bpm) || 60;
      $$('[data-ex-mais]', d).forEach(b => b.onclick = () => { v = Math.max(40, Math.min(240, v + +b.dataset.exMais)); $('#ex-bpm', d).textContent = v; });
      $('[data-ex-registrar]', d)?.addEventListener('click', () => {
        DB.andamentos.push({ id: uid(), licao: id, bpm: v, em: Date.now() }); commit();
        KitFacil.avisar(ex && v >= ex.alvo ? `Meta da aula alcançada: ${v} bpm.` : `${v} bpm registrados.`);
      });
      $('[data-ex-metro]', d)?.addEventListener('click', e => { DB.cfg.bpm = +e.currentTarget.dataset.exMetro; commit(); KitFacil.dialogo.fechar(true); ir('ferramentas/metronomo'); if (!metro.ligado) metroLigar(); });
      $('[data-ex-treino]', d)?.addEventListener('click', e => { const t = e.currentTarget.dataset.exTreino; abrirTreino(t); });
      $('[data-ex-ferramenta]', d)?.addEventListener('click', e => { KitFacil.dialogo.fechar(true); ir('ferramentas/' + e.currentTarget.dataset.exFerramenta); });
      $('[data-aula-feita]', d).addEventListener('click', () => { alternarFeita(id); KitFacil.dialogo.fechar(true); render(); });
    } });
}
function alternarFeita(id) {
  const k = DB.feitas.findIndex(f => f.id === id);
  if (k >= 0) DB.feitas.splice(k, 1); else DB.feitas.push({ id, em: Date.now() });
  commit();
  const l = LICOES.find(x => x.id === id), L = LICOES.filter(x => x.nivel === l.nivel);
  if (k < 0 && L.every(x => feita(x.id))) KitFacil.avisar(`Módulo concluído: ${TRILHA.find(n => n.id === l.nivel).nome}.`);
  return k < 0;
}

/* ================= janela de música ================= */
function janelaMusica(id) {
  const m = id ? DB.musicas.find(x => x.id === id) : null;
  KitFacil.dialogo.abrir({ titulo: m ? 'Editar música' : 'Nova música',
    corpo: `<form id="mu-form" class="pilha" autocomplete="off">
      <div class="campo"><label class="kf-rotulo" for="mu-t">Música</label><input class="kf-entrada" id="mu-t" required value="${esc(m ? m.titulo : '')}" placeholder="Ex.: Smoke on the Water"></div>
      <div class="campo"><label class="kf-rotulo" for="mu-a">Artista <span class="kf-opcional">(opcional)</span></label><input class="kf-entrada" id="mu-a" value="${esc(m ? m.artista : '')}" placeholder="Ex.: Deep Purple"></div>
      <div class="campo"><label class="kf-rotulo" for="mu-e">Situação</label><select id="mu-e">${ESTADOS_MUSICA.map(([k, l]) => `<option value="${k}"${(m ? m.estado : 'quero') === k ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="campo"><label class="kf-rotulo" for="mu-o">Anotações <span class="kf-opcional">(opcional)</span></label><textarea class="kf-entrada" id="mu-o" rows="3" placeholder="Acordes, afinação, link da cifra">${esc(m ? m.obs || '' : '')}</textarea></div>
    </form>`,
    pe: `${m ? '<button type="button" class="kf-btn kf-perigo-sec" data-excluir>Excluir</button>' : ''}<button type="submit" form="mu-form" class="kf-btn kf-pri">Salvar</button>`,
    aoMontar: d => {
      $('#mu-form', d).addEventListener('submit', e => {
        e.preventDefault();
        const titulo = $('#mu-t', d).value.trim(); if (!titulo) { KitFacil.avisar('Escreva o nome da música.'); return; }
        const dados = { titulo, artista: $('#mu-a', d).value.trim(), estado: $('#mu-e', d).value, obs: $('#mu-o', d).value.trim() };
        if (m) Object.assign(m, dados); else DB.musicas.push({ id: uid(), criada: Date.now(), ...dados });
        commit(); KitFacil.dialogo.fechar(true); render(); KitFacil.avisar(m ? 'Música salva.' : 'Música anotada.');
      });
      $('[data-excluir]', d)?.addEventListener('click', () => {
        const k = DB.musicas.indexOf(m); DB.musicas.splice(k, 1); commit(); KitFacil.dialogo.fechar(true); render();
        KitFacil.avisar('Música excluída.', { label: 'Desfazer', run: () => { DB.musicas.splice(k, 0, m); commit(); render(); } });
      });
    } });
}

/* ================= desenho ================= */
function render() {
  const r = rota();
  if (r !== 'ferramentas') { if (metro.ligado) metroParar(); afinadorDesligar(); bateriaParar(); }
  desenharNav();
  const m = $('#main'), trocou = telaAtual !== r;
  m.innerHTML = VIEWS[r]();
  if (r === 'ajustes') KitFacil.ajustes.ligar(m);
  ligar(m, r);
  KitFacil.topo.atualizar();
  if (trocou) { KitFacil.movimento.entrar(m, { de: 'tela' }); window.scrollTo(0, 0); }
  if (subRota()) { const sec = $('#f-' + subRota()) || $('#t-' + subRota()) || $('#' + subRota()); if (sec) requestAnimationFrame(() => sec.scrollIntoView({ block: 'start', behavior: KitFacil.movimento.reduzido() ? 'auto' : 'smooth' })); }
  telaAtual = r;
}
function ligar(m, r) {
  $$('[data-nivel]', m).forEach(b => b.onclick = () => { DB.cfg.nivel = b.dataset.nivel; commit(); render(); });
  $$('[data-feita]', m).forEach(b => b.onclick = () => {
    const id = b.dataset.feita, agora = alternarFeita(id), l = LICOES.find(x => x.id === id);
    b.setAttribute('aria-pressed', agora); b.setAttribute('aria-label', `${l.nome}: ${agora ? 'feita' : 'marcar como feita'}`);
    const sec = b.closest('details'), L = LICOES.filter(x => x.nivel === l.nivel), f = L.filter(x => feita(x.id)).length, selo = sec && $('.selo', sec);
    if (selo) { selo.textContent = `${f}/${L.length}`; selo.classList.toggle('ok', f === L.length); }
  });
  $$('[data-aula]', m).forEach(b => b.onclick = () => abrirAula(b.dataset.aula));
  if (r === 'ferramentas') {
    $$('[data-bpm]', m).forEach(b => b.onclick = () => mudarBpm(DB.cfg.bpm + +b.dataset.bpm));
    $('#bpm-r', m).addEventListener('input', e => mudarBpm(+e.target.value));
    $('#metro', m).onclick = () => metro.ligado ? metroParar() : metroLigar();
    $$('[data-corda]', m).forEach(b => b.onclick = () => tocarNota(CORDAS[+b.dataset.corda][2]));
    $('#af-ligar', m).onclick = () => afinador.ligado ? afinadorDesligar() : afinadorLigar();
    $$('[data-braco]', m).forEach(b => b.onclick = () => { DB.cfg.braco = b.dataset.braco; commit(); $$('[data-braco]', m).forEach(x => x.setAttribute('aria-pressed', x === b)); const w = $('.braco-wrap', m); w.innerHTML = bracoSVG(DB.cfg.braco === 'todas'); KitFacil.movimento.entrar(w, { de: 'tela' }); });
    const toca = g => { const [c, k] = g.dataset.nota.split(',').map(Number); tocarNota(freqDe(c, k), 1.4); g.classList.add('tocou'); setTimeout(() => g.classList.remove('tocou'), 400); };
    $('.braco-wrap', m).addEventListener('click', e => { const g = e.target.closest('[data-nota]'); if (g) toca(g); });
    $('.braco-wrap', m).addEventListener('keydown', e => { const g = e.target.closest('[data-nota]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toca(g); } });
  }
  $$('[data-musica-nova]', m).forEach(b => b.onclick = () => janelaMusica());
  $$('[data-prof]', m).forEach(b => b.onclick = () => acaoProfessor(b.dataset.prof));
  $$('[data-treino]', m).forEach(b => b.onclick = () => abrirTreino(b.dataset.treino));
  $$('[data-pl-add]', m).forEach(b => b.onclick = () => {
    const [pid, i] = b.dataset.plAdd.split('|'), [t, a] = PLAYLISTS.find(x => x.id === pid).musicas[+i];
    DB.musicas.push({ id: uid(), titulo: t, artista: a, estado: 'quero', obs: '', criada: Date.now() }); commit();
    redesenhar(); KitFacil.avisar(`${t} está na sua lista.`);
  });
  if (r === 'ferramentas') {
    $$('[data-estilo]', m).forEach(b => b.onclick = () => { DB.cfg.estilo = b.dataset.estilo; commit(); $$('[data-estilo]', m).forEach(x => x.setAttribute('aria-pressed', x === b)); if (bateria.ligada) { bateriaParar(); ligarBateria(m); } });
    $('#bat-ligar', m).onclick = () => { if (bateria.ligada) bateriaParar(); else ligarBateria(m); $('#bat-ligar', m).innerHTML = bateria.ligada ? I.stop + 'Parar a bateria' : I.bateria + 'Tocar a bateria'; };
  }
  if (r === 'teoria') ligarTeoria(m);
  $$('[data-musica]', m).forEach(b => b.onclick = () => janelaMusica(b.dataset.musica));
  if (r === 'ajustes') {
    $('#aj-meta', m)?.addEventListener('change', e => { DB.cfg.meta = +e.target.value; commit(); KitFacil.avisar('Meta salva.'); });
    $('#aj-nivel', m)?.addEventListener('change', e => { DB.cfg.nivel = e.target.value; commit(); KitFacil.avisar('A trilha agora começa no nível escolhido.'); });
  }
}

// redesenha a tela atual sem perder as seções abertas nem a rolagem
function redesenhar() {
  const m = $('#main'), r = rota(), abertos = $$('details[open]', m).map(x => x.id).filter(Boolean), y = window.scrollY;
  m.innerHTML = VIEWS[r]();
  $$('details[data-kf-secao]', m).forEach(x => { if (x.id) x.open = abertos.includes(x.id); });
  if (r === 'ajustes') KitFacil.ajustes.ligar(m);
  ligar(m, r); window.scrollTo(0, y);
}
function ligarBateria(m) {
  bateriaLigar(DB.cfg.estilo, () => DB.cfg.bpm, b => { $$('.bat-bateria span', m).forEach((x, i) => x.classList.toggle('on', i === b)); });
}
function ligarTeoria(m) {
  const muda = (k, v) => { TEO[k] = v; redesenhar(); };
  $('#te-raiz', m).addEventListener('change', e => muda('raiz', +e.target.value));
  $('#te-esc', m).addEventListener('change', e => { TEO.desenho = -1; muda('escala', e.target.value); });
  $('#ta-raiz', m).addEventListener('change', e => muda('acRaiz', +e.target.value));
  $('#ta-tipo', m).addEventListener('change', e => muda('acTipo', e.target.value));
  $$('[data-te-rot]', m).forEach(b => b.onclick = () => muda('rotulo', b.dataset.teRot));
  $$('[data-te-des]', m).forEach(b => b.onclick = () => muda('desenho', +b.dataset.teDes));
  const a = () => audio();
  $$('[data-te-ouvir]', m).forEach(b => b.onclick = () => {
    const ctx = a(); if (!ctx) return; const t = ctx.currentTime + .05;
    if (b.dataset.teOuvir === 'escala') { const base = 48 + TEO.raiz, iv = ESCALAS.find(e => e[0] === TEO.escala)[2]; [...iv, 12].forEach((i, k) => tocarCorda(base + i, t + k * .32, .5)); }
    else { const base = 48 + TEO.acRaiz, iv = TIPOS_ACORDE.find(x => x[0] === TEO.acTipo)[2]; iv.forEach((i, k) => { tocarCorda(base + i, t + k * .12, 2); }); }
  });
  $('.circ-wrap', m).addEventListener('click', e => { const g = e.target.closest('[data-tom]'); if (g) muda('tom', +g.dataset.tom); });
  $('.circ-wrap', m).addEventListener('keydown', e => { const g = e.target.closest('[data-tom]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); muda('tom', +g.dataset.tom); } });
  $$('[data-te-campo]', m).forEach(b => b.onclick = () => { const [rz, tp] = b.dataset.teCampo.split('|'); const ctx = a(); if (!ctx) return; const t = ctx.currentTime + .05; notasAcorde(+rz, tp).forEach((n, k) => tocarCorda(48 + n + (n < +rz ? 12 : 0), t + k * .1, 1.8)); });
  $$('[data-te-int]', m).forEach(b => b.onclick = () => { const ctx = a(); if (!ctx) return; const t = ctx.currentTime + .05, n = +b.dataset.teInt; tocarCorda(57, t, .8); tocarCorda(57 + n, t + .6, .8); tocarCorda(57, t + 1.3, 1.2); tocarCorda(57 + n, t + 1.3, 1.2); });
  $$('[data-te-fig]', m).forEach(b => b.onclick = () => { const ctx = a(); if (!ctx) return; const t = ctx.currentTime + .05, f = +b.dataset.teFig, seg = 60 / DB.cfg.bpm; for (let k = 0; k < 4 / f; k++) tocarCorda(57, t + k * f * seg, Math.max(.12, f * seg * .9)); });
  $$('.braco-wrap', m).forEach(w => w.addEventListener('click', e => { const g = e.target.closest('[data-nota]'); if (!g) return; const [c, k] = g.dataset.nota.split(',').map(Number); const ctx = a(); if (ctx) tocarCorda(midiDe(c, k), ctx.currentTime + .02, 1.2); g.classList.add('tocou'); setTimeout(() => g.classList.remove('tocou'), 400); }));
}

/* ================= Kit Fácil ================= */
KitFacil.iniciar({
  app: 'guitarra-facil', nome: 'Guitarra Fácil', versao: VERSAO,
  resumo: 'Guitarra do primeiro acorde aos solos, no seu ritmo.', icone: 'icons/icon-192.png',
  tela: () => rota(), exemploDados: 'as aulas feitas, as músicas e o tempo de prática',
  privacidade: ['As aulas feitas, os andamentos, as músicas e o tempo de prática ficam guardados neste aparelho.', 'O som do metrônomo e das notas é gerado aqui no aparelho.', 'O afinador e os treinos usam o microfone só enquanto estão ligados, com a sua permissão: o som é analisado em memória, não é gravado nem enviado.'],
  abrirAjustes: secao => { if (rota() !== 'ajustes') ir('ajustes'); else if (!secao) history.back(); },
  emAjustes: () => rota() === 'ajustes',
  copia: { descricao: 'Baixe um arquivo com as aulas feitas, as músicas e o tempo de prática.',
    baixar: () => KitFacil.copia.baixar({ db: DB }, 1),
    restaurar: async f => { const j = await KitFacil.copia.ler(f); if (!j || !j.dados || !j.dados.db) { KitFacil.avisar('Esse arquivo não é uma cópia do Guitarra Fácil.'); return; } DB = { ...vazio(), ...j.dados.db }; commit(); snapTodos(); render(); KitFacil.avisar('Cópia restaurada.'); } },
  novidades: [{ versao: '0.3.0', itens: ['Professor: lê seus treinos e diz o que fazer a seguir, com um botão para cada sugestão.', 'Treinos com o professor: o app toca junto, a tablatura rola, o microfone confere cada nota e dá a sua precisão. Velocidade ajustável e subida automática de andamento.', 'Teoria: escalas no braço (com os cinco desenhos da pentatônica), construtor de acordes, círculo das quintas, campo harmônico, intervalos e figuras rítmicas, tudo para ouvir.', 'Bateria de acompanhamento em seis estilos.', 'Playlists recomendadas por nível, com links para o YouTube e o Spotify.'] }, { versao: '0.2.0', itens: ['Trilha nova em seis módulos, com 33 aulas escritas: objetivo, passo a passo, exercício com andamento e dica.', 'Plano de hoje: a meta de prática dividida em aquecimento, aula, técnica e repertório.', 'Afinador pelo microfone (o som não sai do aparelho), mapa das notas no braço e dez acordes, inclusive o Fá com pestana.', 'Registre o andamento de cada exercício e acompanhe em Progresso.', 'Ícone novo: o pedal de efeito.'] }, { versao: '0.1.0', itens: ['Primeira versão em testes: trilha de aulas com teste de nível, metrônomo, notas para afinar, primeiros acordes e lista de músicas.'] }],
  // a boas-vindas é a própria tela Hoje (escolha do nível); o Kit só usa "novo" para não mostrar novidades a quem acabou de chegar
  boasVindas: { novo: () => PRIMEIRO_USO },
});
KitFacil.tema.iniciar({ chave: KEY + 'pref', cores: { claro: '#F3F3F1', escuro: '#111113' } });
const SY = KitFacil.sync.criar({ app: 'guitarra-facil', nome: 'Guitarra Fácil', chave: KEY + 'sync', dados: 'as aulas feitas, as músicas e o tempo de prática',
  carimbar, aplicar, pacote, mesmo: (a, r) => KitFacil.canon(a) === KitFacil.canon({ v: 1, cfg: r.cfg, feitas: r.feitas, musicas: r.musicas, praticas: r.praticas, andamentos: r.andamentos || [], treinos: r.treinos || [], st: r.st, del: r.del }),
  redesenhar: () => render() });
$('#marca').innerHTML = I.marca; $('#marca-trilho').innerHTML = I.marca;
$('#topo').innerHTML = KitFacil.topo.html({ principal: true });
render();
const link = SY.tokenDoLink();
if (link) history.replaceState(null, '', location.pathname + location.hash);
SY.iniciar({ token: link, textoConfirmar: 'As aulas, as músicas e a prática deste aparelho se juntam às da nuvem.' });
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

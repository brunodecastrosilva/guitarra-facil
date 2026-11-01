/* Guitarra Fácil · app web (PWA) do Projeto Integrador.
   Treinos de guitarra elétrica com o braço desenhado: o app conta, toca junto, acende a nota da vez e rola a
   tablatura, no andamento que você escolher. Tudo fica neste aparelho; a sincronização opcional e a moldura vêm do
   Kit Fácil (comum/). */
'use strict';
const VERSAO = '0.4.0';
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
  teoria: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18"/>'),
  externo: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  bateria: svg('<ellipse cx="12" cy="9" rx="8" ry="3"/><path d="M4 9v6c0 1.7 3.6 3 8 3s8-1.3 8-3V9M8 3l3 5M16 3l-3 5"/>'),
  hoje: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  treinos: svg('<path d="M8.5 3h7l3.5 18H5z"/><path d="M12 16 17 7"/><path d="M7.5 13h9"/>'),
  ferramentas: svg('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>'),
  musicas: svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
  progresso: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  medalha: svg('<circle cx="12" cy="15" r="5.5"/><path d="M8.6 10.6 6 3h4l2 5 2-5h4l-2.6 7.6"/><path d="m12 12.6.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z"/>'),
  chama: svg('<path d="M12 3c.8 3.6 5.5 5.3 5.5 10.2a5.5 5.5 0 0 1-11 0c0-2.6 1.4-3.9 2.2-5.6.9 1.5 1.5 2.3 2.6 2.4-.2-2.6-.4-4.6.7-7z"/>'),
  sortear: svg('<path d="M3 7h3.5c2 0 3 1 4.5 3.5l2 3.5c1.5 2.5 2.5 3.5 4.5 3.5H21M18 14.5l3 3-3 3M3 17.5h3.5c1.3 0 2.2-.4 3-1.3M14 7.8c.8-.9 1.7-1.3 3-1.3H21M18 3.5l3 3-3 3"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  seta: svg('<path d="m9 6 6 6-6 6"/>'),
  play: svg('<path d="M7 4v16l13-8z"/>'),
  stop: svg('<rect x="6" y="6" width="12" height="12" rx="1.5"/>'),
  menos: svg('<path d="M5 12h14"/>'),
  mais: svg('<path d="M12 5v14M5 12h14"/>'),
};
const ESTADOS_MUSICA = [['quero', 'Quero aprender'], ['aprendendo', 'Aprendendo'], ['toco', 'Já toco']];

/* ================= dados ================= */
// coleções sincronizadas registro a registro (a mudança mais recente vence), como nos outros apps da família
// feitas e andamentos vêm da versão com aulas (até a 0.3.0): continuam guardados e sincronizados, mas não aparecem
const COLS = ['feitas', 'musicas', 'praticas', 'andamentos', 'treinos', 'conquistas'];
const vazio = () => ({ v: 1, cfg: { meta: 20, bpm: 80, estilo: 'rock' }, feitas: [], musicas: [], praticas: [], andamentos: [], treinos: [], conquistas: [] });
let DB = (() => { const d = LS.get('db', null); return d && d.v === 1 ? { ...vazio(), ...d, cfg: { ...vazio().cfg, ...(d.cfg || {}) } } : vazio(); })();
const PRIMEIRO_USO = !DB.cfg.nivel && !DB.praticas.length && !DB.treinos.length && !DB.musicas.length && !LS.get('visto', false);
LS.set('visto', true);
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
const pacote = () => ({ v: 1, cfg: DB.cfg, feitas: DB.feitas, musicas: DB.musicas, praticas: DB.praticas, andamentos: DB.andamentos, treinos: DB.treinos, conquistas: DB.conquistas, st: SY.estado.st, del: SY.estado.del });

/* ================= navegação ================= */
// barra de baixo: Hoje, Treinos, Teoria, Ferramentas e Mais (Músicas, Progresso e Ajustes) — escolha do Bruno, 01/11/2026
const NAV = [
  ['hoje', 'Hoje', I.hoje], ['treinos', 'Treinos', I.treinos], ['teoria', 'Teoria', I.teoria],
  ['ferramentas', 'Ferramentas', I.ferramentas], ['musicas', 'Músicas', I.musicas, true], ['progresso', 'Progresso', I.progresso, true],
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

/* ================= constância ================= */
const DIA = 864e5;
const meiaNoite = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const diaNum = (t = Date.now()) => Math.round(meiaNoite(t) / DIA); // conta dias no fuso do aparelho
const diasPraticados = () => new Set(DB.praticas.concat(DB.treinos).map(p => diaNum(p.em)));
const minutosNoDia = n => DB.praticas.filter(p => diaNum(p.em) === n).reduce((s, p) => s + p.min, 0);
const minutosHoje = () => Math.round(minutosNoDia(diaNum()));
const minutosEntre = (de, ate) => Math.round(DB.praticas.filter(p => { const n = diaNum(p.em); return n >= de && n <= ate; }).reduce((s, p) => s + p.min, 0));
const minutosSemana = () => minutosEntre(diaNum() - 6, diaNum());
function diasSeguidos() { const D = diasPraticados(); let n = diaNum(), k = 0; if (!D.has(n)) n--; while (D.has(n)) { k++; n--; } return k; }
function maiorSequencia() { const D = [...diasPraticados()].sort((a, b) => a - b); let m = 0, k = 0; D.forEach((d, i) => { k = i && d === D[i - 1] + 1 ? k + 1 : 1; m = Math.max(m, k); }); return m; }
const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], SEMANA_NOME = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
// a semana de segunda a domingo, com o que foi praticado
function semanaAtual() {
  const hoje = diaNum(), dw = new Date().getDay(), seg = hoje - ((dw + 6) % 7), D = diasPraticados();
  return Array.from({ length: 7 }, (_, i) => { const n = seg + i, w = (i + 1) % 7; return { rot: SEMANA[w], nome: SEMANA_NOME[w], feito: D.has(n), hoje: n === hoje, futuro: n > hoje }; });
}
// o treino do dia gira sozinho: uma combinação do cromático e um desenho da pentatônica por dia
const permDoDia = () => PERMS[diaNum() % 24];
const desenhoDoDia = () => diaNum() % 5;

/* ================= treinos: histórico ================= */
const idTreino = t => TREINO_ANTIGO[t.ex] || t.ex;
const limpo = t => t.limpo === true || (t.acerto != null && t.acerto >= 90);
const melhorLimpo = id => DB.treinos.filter(t => idTreino(t) === id && limpo(t)).reduce((m, t) => Math.max(m, t.bpm), 0);
const ultimoTreino = () => DB.treinos.slice().sort((a, b) => b.em - a.em)[0];
const permsTocadas = () => new Set(DB.treinos.map(idTreino).filter(i => i.startsWith('crom:')).map(i => i.slice(5)));
const quando = t => { const d = diaNum() - diaNum(t); return d <= 0 ? 'hoje' : d === 1 ? 'ontem' : `há ${d} dias`; };

/* ================= conquistas ================= */
// [id, nome, como ganhar, condição]: conferidas depois de cada prática; ficam guardadas com a data em que vieram
const melhorCromatico = () => DB.treinos.filter(t => idTreino(t).startsWith('crom:') && limpo(t)).reduce((m, t) => Math.max(m, t.bpm), 0);
const CONQUISTAS = [
  ['primeiro', 'Primeiro treino', 'Termine um treino.', () => DB.treinos.length > 0],
  ['meta', 'Meta do dia', 'Pratique os minutos da sua meta num dia.', () => [...diasPraticados()].some(n => minutosNoDia(n) >= DB.cfg.meta)],
  ['dias3', 'Três dias seguidos', 'Pratique três dias seguidos.', () => maiorSequencia() >= 3],
  ['dias7', 'Uma semana inteira', 'Pratique sete dias seguidos.', () => maiorSequencia() >= 7],
  ['dias30', 'Um mês sem parar', 'Pratique 30 dias seguidos.', () => maiorSequencia() >= 30],
  ['hora', 'Uma hora na semana', 'Some 60 minutos em sete dias.', () => minutosSemana() >= 60],
  ['horas10', 'Dez horas de guitarra', 'Some 600 minutos de prática.', () => DB.praticas.reduce((s, p) => s + p.min, 0) >= 600],
  ['crom10', 'Dez combinações', 'Toque 10 das 24 combinações do cromático.', () => permsTocadas().size >= 10],
  ['crom24', 'As 24 combinações', 'Toque todas as combinações do cromático.', () => permsTocadas().size >= 24],
  ['bpm100', 'Cromático a 100', 'Toque o cromático limpo a 100 bpm.', () => melhorCromatico() >= 100],
  ['bpm140', 'Cromático a 140', 'Toque o cromático limpo a 140 bpm.', () => melhorCromatico() >= 140],
  ['desenhos', 'Os cinco desenhos', 'Treine os cinco desenhos de uma escala.', () => new Set(DB.treinos.map(idTreino).filter(i => i.startsWith('esc:')).map(i => i.split(':')[3])).size >= 5],
  ['musica', 'Primeira música', 'Marque uma música como Já toco.', () => DB.musicas.some(m => m.estado === 'toco')],
];
const temConquista = id => DB.conquistas.find(c => c.id === id);
function conferirConquistas(avisar = true) {
  const novas = CONQUISTAS.filter(c => !temConquista(c[0]) && c[3]());
  if (!novas.length) return;
  novas.forEach(c => DB.conquistas.push({ id: c[0], em: Date.now() }));
  commit();
  if (avisar) KitFacil.avisar(novas.length === 1 ? `Conquista nova: ${novas[0][1]}.` : `Conquistas novas: ${novas.map(c => c[1]).join(', ')}.`);
}
function registrarPratica(min) { if (min > 0) { DB.praticas.push({ id: uid(), em: Date.now(), min }); commit(); } }

/* ================= telas ================= */
// plano do dia: a meta em minutos dividida em blocos, sempre na mesma ordem, cada um com o treino certo
function plano() {
  const m = DB.cfg.meta, mus = DB.musicas.find(x => x.estado === 'aprendendo') || DB.musicas.find(x => x.estado === 'quero');
  const B = [
    ['Aquecimento', `Cromático ${permTexto(permDoDia())}, a combinação de hoje.`, .2, 'crom:' + permDoDia(), 'Treinar'],
    ['Técnica', `Pentatônica de Lá menor, desenho ${desenhoDoDia() + 1}.`, .35, `esc:penta-menor:9:${desenhoDoDia()}`, 'Treinar'],
    ['Teoria', 'Uma escala ou um acorde no braço, ouvindo cada nota.', .15, 'ir:teoria', 'Abrir'],
    ['Repertório', mus ? `${mus.titulo}${mus.artista ? ', de ' + mus.artista : ''}.` : 'Um riff no tempo ou uma música da sua lista.', .3, mus ? 'ir:musicas' : 'ex-riff-estrada', mus ? 'Abrir' : 'Treinar'],
  ];
  let resto = m;
  return B.map(([n, t, f, acao, rot], i) => { const v = i === B.length - 1 ? resto : Math.max(1, Math.round(m * f)); resto -= v; return { n, t, v, acao, rot }; });
}
const VIEWS = {};
VIEWS.hoje = () => {
  const meta = DB.cfg.meta, min = minutosHoje(), seg = diasSeguidos(), ul = ultimoTreino(), sem = semanaAtual();
  const exUl = ul && montarTreino(idTreino(ul), ul.cfg), mUl = exUl && melhorLimpo(exUl.id);
  const p = Math.min(100, Math.round(min / meta * 100));
  const recente = DB.conquistas.filter(c => Date.now() - c.em < 7 * DIA).sort((a, b) => b.em - a.em)[0], cq = recente && CONQUISTAS.find(c => c[0] === recente.id);
  const mSem = minutosSemana(), mAnt = minutosEntre(diaNum() - 13, diaNum() - 7), tSem = DB.treinos.filter(t => diaNum(t.em) > diaNum() - 7).length;
  return `<div class="pilha">
    <div class="ola"><p class="apoio">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, c => c.toUpperCase())}</p><h1>Hora de tocar.</h1></div>
    <section class="passo" aria-label="Sua sequência">
      <div class="seq-cab"><span class="seq-ic">${I.chama}</span><span class="nivel-tt"><span class="apoio">Sequência</span><h2>${seg ? `${seg} ${seg === 1 ? 'dia seguido' : 'dias seguidos'}` : 'Comece hoje'}</h2></span></div>
      <ol class="semana">${sem.map(d => `<li class="${d.feito ? 'feito' : ''}${d.hoje ? ' hoje' : ''}"><span class="sem-d" aria-hidden="true">${d.rot}</span><span class="sem-c" aria-hidden="true">${d.feito ? I.check : ''}</span><span class="sr">${d.nome}${d.hoje ? ' (hoje)' : ''}: ${d.feito ? 'praticou' : d.futuro ? 'ainda não chegou' : 'sem prática'}</span></li>`).join('')}</ol>
      <p>${min} de ${meta} minutos hoje${min >= meta ? ' · meta batida' : ''}</p>
      <div class="barra-prog" role="progressbar" aria-label="Meta de hoje" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p}%"></span></div>
      <button type="button" class="kf-btn" data-tr-abrir="crom:${permDoDia()}">${I.play}Começar o aquecimento</button>
    </section>
    ${ul && exUl ? `<section class="cartao continuar" aria-label="Último treino"><span class="apoio">Último treino · ${quando(ul.em)}</span><h3>${esc(exUl.nome)}</h3>
      <p class="apoio">${esc(exUl.resumo)} · ${ul.bpm} bpm${mUl ? ` · seu melhor limpo: ${mUl} bpm` : ''} · meta ${exUl.alvo} bpm</p>
      <button type="button" class="kf-btn kf-sec" data-tr-ultimo>${I.play}Continuar a ${ul.bpm} bpm</button></section>`
    : `<section class="cartao" aria-label="Como funciona"><h3>Como funciona</h3><p>Escolha um treino e o andamento. O app conta quatro tempos, toca junto, acende a nota da vez no braço e rola a tablatura. Ao parar, diga se saiu limpo: o seu melhor andamento fica em Progresso.</p>
      <button type="button" class="kf-btn kf-sec" data-ir="treinos">Ver os treinos</button></section>`}
    <section class="cartao" aria-label="Plano de hoje"><h3>Plano de hoje · ${meta} minutos</h3>
      <ol class="blocos">${plano().map(b => `<li><b>${b.v} min</b><span><b>${b.n}</b><span class="apoio">${esc(b.t)}</span></span><button type="button" class="kf-btn kf-sec bl-acao" ${b.acao.startsWith('ir:') ? `data-ir="${b.acao.slice(3)}"` : `data-tr-abrir="${b.acao}"`} aria-label="${b.rot}: ${b.n}">${b.rot}</button></li>`).join('')}</ol>
      <p class="apoio">O tempo dos treinos e do metrônomo conta para a meta. A meta muda em Ajustes, Prática.</p></section>
    <section class="cartao" aria-label="Sua semana"><h3>Sua semana</h3>
      <div class="dados mini"><div class="dado"><b>${mSem}</b><span class="apoio">minutos em 7 dias${mAnt ? ` (${mSem >= mAnt ? '+' : ''}${mSem - mAnt} na comparação)` : ''}</span></div><div class="dado"><b>${tSem}</b><span class="apoio">${tSem === 1 ? 'treino' : 'treinos'} em 7 dias</span></div></div>
      ${cq ? `<p class="cq-nova">${I.medalha}<span><b>Conquista nova: ${esc(cq[1])}</b><span class="apoio">${esc(cq[2])}</span></span></p>` : ''}
      <button type="button" class="kf-btn kf-link" data-ir="progresso">Ver o progresso</button></section>
  </div>`;
};

/* tela Treinos: o cromático com as 24 combinações, as escalas nos cinco desenhos e os exercícios prontos */
function miniDesenho(ex) {
  const ks = ex.notas.map(n => n[1]), a = Math.min(...ks), b = Math.max(...ks), C = Math.max(4, b - a + 1);
  const W = 92, H = 64, x = k => 8 + (k - a + .5) * ((W - 16) / C), y = c => 8 + (5 - c) * ((H - 16) / 5);
  let s = `<svg class="mini-braco" viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
  for (let c = 0; c < 6; c++) s += `<line x1="6" y1="${y(c)}" x2="${W - 6}" y2="${y(c)}" class="mi-l"/>`;
  for (let k = 0; k <= C; k++) s += `<line x1="${8 + k * ((W - 16) / C)}" y1="5" x2="${8 + k * ((W - 16) / C)}" y2="${H - 5}" class="mi-t"/>`;
  new Set(ex.notas.map(n => n[0] + ',' + n[1])).forEach(ch => { const [c, k] = ch.split(',').map(Number); s += `<circle cx="${x(k)}" cy="${y(c)}" r="4.2" class="mi-n${ex.raiz != null && pc(SOLTAS[c] + k) === ex.raiz ? ' raiz' : ''}"/>`; });
  return s + '</svg>';
}
const itemTreino = e => { const m = melhorLimpo(e.id); return `<li><button type="button" class="musica" data-tr-abrir="${e.id}"><span><b>${esc(e.nome)}</b><span class="apoio">${esc(e.resumo)} · ${e.bpm} a ${e.alvo} bpm${m ? ` · seu melhor: ${m} bpm` : ''}</span></span>${I.seta}</button></li>`; };
VIEWS.treinos = () => {
  const tocadas = permsTocadas(), ce = { ...cfgEscPadrao(), ...(DB.cfg.trEsc || {}) }, E = ESCALAS.find(e => e[0] === ce.escala);
  const cab = id => { const c = CATEGORIAS_TREINO.find(x => x[0] === id); return `<h2>${c[1]}</h2><p class="apoio">${c[2]}</p>`; };
  return KitFacil.ui.cabecalho({ titulo: 'Treinos', sub: 'Escolha um exercício, ajuste o andamento e toque junto com o app.' })
  + `<div class="pilha">
    <section class="cartao" id="c-cromatico" aria-labelledby="c-cromatico-t"><div class="tr-cat-cab">${miniDesenho(treinoCromatico({ perm: permDoDia() }))}<span class="nivel-tt" id="c-cromatico-t">${cab('cromatico')}</span></div>
      <div class="perms" role="group" aria-label="As 24 combinações do cromático">${PERMS.map(p => { const m = melhorLimpo('crom:' + p), dia = p === permDoDia(); return `<button type="button" class="perm${tocadas.has(p) ? ' feita' : ''}${dia ? ' dia' : ''}" data-tr-abrir="crom:${p}" aria-label="Cromático ${permTexto(p)}${dia ? ', a combinação de hoje' : ''}${m ? `, seu melhor ${m} bpm` : tocadas.has(p) ? ', já tocada' : ''}"><b>${permTexto(p)}</b><small>${m ? m + ' bpm' : dia ? 'de hoje' : tocadas.has(p) ? 'tocada' : '–'}</small></button>`; }).join('')}</div>
      <p class="apoio">${tocadas.size} de 24 combinações tocadas. Dentro do treino, escolha a casa, as cordas, a figura e o que fazer ao fim de cada volta.</p></section>
    <section class="cartao" id="c-escalas" aria-labelledby="c-escalas-t"><span class="nivel-tt" id="c-escalas-t">${cab('escalas')}</span>
      <div class="desenhos-tr" role="group" aria-label="${esc(E[1])} de ${NOTAS[ce.raiz]}: os cinco desenhos">${[0, 1, 2, 3, 4].map(d => { const ex = treinoEscala({ ...ce, desenho: d }), m = melhorLimpo(ex.id), [i, f] = [Math.min(...ex.notas.map(n => n[1])), Math.max(...ex.notas.map(n => n[1]))]; return `<button type="button" class="des-it" data-tr-abrir="${ex.id}">${miniDesenho(ex)}<b>Desenho ${d + 1}</b><small>casas ${i} a ${f}${m ? ` · ${m} bpm` : ''}</small></button>`; }).join('')}</div>
      <p class="apoio">${esc(E[1])} de ${NOTAS[ce.raiz]}, com a tônica em vermelho. Troque o tom e a escala dentro do treino.</p>
      <ul class="treinos">${TREINOS_FIXOS.filter(e => e.cat === 'escalas').map(itemTreino).join('')}</ul></section>
    ${['tecnica', 'riffs'].map(c => `<section class="cartao" id="c-${c}" aria-labelledby="c-${c}-t"><span class="nivel-tt" id="c-${c}-t">${cab(c)}</span><ul class="treinos">${TREINOS_FIXOS.filter(e => e.cat === c).map(itemTreino).join('')}</ul></section>`).join('')}
    <p class="apoio">Os riffs e as frases são originais do app. Para tocar músicas de outros artistas, use as playlists em Músicas.</p>
  </div>`;
};
VIEWS.musicas = () => {
  const sub = subRota();
  const minhas = DB.musicas.length
    ? `<div class="pilha">${ESTADOS_MUSICA.map(([k, l]) => { const M = DB.musicas.filter(m => m.estado === k); return M.length ? `<section class="pilha" style="gap:8px"><h3 class="sub-h">${l}</h3><ul class="musicas">${M.map(m => `<li><button type="button" class="musica" data-musica="${m.id}"><span><b>${esc(m.titulo)}</b>${m.artista ? `<span class="apoio"> · ${esc(m.artista)}</span>` : ''}</span>${I.seta}</button></li>`).join('')}</ul></section>` : ''; }).join('')}</div>`
    : KitFacil.ui.vazio({ titulo: 'Nenhuma música ainda', texto: 'Anote as músicas que você quer aprender ou adicione das playlists abaixo. Quando conseguir tocar, marque como <b>Já toco</b>.' });
  const tem = (t, a) => DB.musicas.some(m => m.titulo === t && m.artista === a);
  return KitFacil.ui.cabecalho({ titulo: 'Músicas', sub: 'Suas músicas e playlists recomendadas, da mais fácil à mais difícil.', criar: { rotulo: 'Nova música', attrs: 'data-musica-nova' } })
    + `<div class="pilha">${minhas}<h2 class="sec-h">Playlists recomendadas</h2>
    ${PLAYLISTS.map(pl => `<details class="cartao playlist" data-kf-secao id="${pl.id}"${sub === pl.id ? ' open' : ''}><summary><span class="pl-capa n${pl.nivel}" aria-hidden="true">${I.musicas}</span><span class="nivel-tt"><h2 style="font-size:18px">${esc(pl.nome)}</h2><span class="apoio" data-kf-secao-resumo>${pl.musicas.length} músicas · ${esc(pl.resumo)}</span></span></summary>
      <ol class="faixas">${pl.musicas.map(([t, a, por], i) => `<li><span class="fx-n">${i + 1}</span><span class="fx-t"><b>${esc(t)}</b><span class="apoio">${esc(a)} · ${esc(por)}</span></span><span class="fx-a"><a class="kf-btn kf-sec fx-l" href="${linkYoutube(t, a)}" target="_blank" rel="noopener" aria-label="Ver ${esc(t)} no YouTube">YouTube</a><a class="kf-btn kf-sec fx-l" href="${linkSpotify(t, a)}" target="_blank" rel="noopener" aria-label="Ouvir ${esc(t)} no Spotify">Spotify</a><button type="button" class="kf-btn ${tem(t, a) ? 'kf-sec' : 'kf-pri'} fx-l" data-pl-add="${esc(pl.id)}|${i}" ${tem(t, a) ? 'disabled' : ''}>${tem(t, a) ? 'Na lista' : 'Quero aprender'}</button></span></li>`).join('')}</ol></details>`).join('')}
    <p class="apoio">As músicas tocam no YouTube ou no Spotify: letras, cifras e gravações têm direitos autorais e não ficam dentro do app.</p></div>`;
};
VIEWS.ferramentas = () => {
  const sub = subRota(), ab = k => (sub ? sub === k : k === 'metronomo') ? ' open' : '';
  return KitFacil.ui.cabecalho({ titulo: 'Ferramentas', sub: 'Metrônomo, bateria, afinador, mapa do braço e acordes.' })
  + `<div class="pilha">
    <details class="cartao" data-kf-secao id="f-metronomo"${ab('metronomo')}><summary><span class="nivel-tt"><h2 style="font-size:19px">Metrônomo</h2><span class="apoio" data-kf-secao-resumo>${DB.cfg.bpm} batidas por minuto</span></span></summary>
      <div class="metro-bpm"><button type="button" class="kf-btn kf-sec" data-bpm="-5" aria-label="5 batidas a menos">${I.menos}</button><output id="bpm" aria-live="polite">${DB.cfg.bpm}</output><button type="button" class="kf-btn kf-sec" data-bpm="5" aria-label="5 batidas a mais">${I.mais}</button></div>
      <p class="apoio" style="text-align:center">batidas por minuto</p>
      <input type="range" id="bpm-r" min="40" max="240" step="1" value="${DB.cfg.bpm}" aria-label="Batidas por minuto">
      <div class="batidas" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      <button type="button" class="kf-btn kf-pri" id="metro">${metro.ligado ? I.stop + 'Parar' : I.play + 'Começar'}</button>
      <p class="apoio">O tempo com o metrônomo ligado conta para a meta do dia.</p></details>
    <details class="cartao" data-kf-secao id="f-bateria"${ab('bateria')}><summary><span class="nivel-tt"><h2 style="font-size:19px">Bateria</h2><span class="apoio" data-kf-secao-resumo>Uma banda para você tocar junto</span></span></summary>
      <div class="kf-opcoes estilos" role="group" aria-label="Estilo">${ESTILOS_BATERIA.map(([k, n]) => `<button type="button" class="chip-est" data-estilo="${k}" aria-pressed="${DB.cfg.estilo === k}">${n}</button>`).join('')}</div>
      <div class="metro-bpm"><button type="button" class="kf-btn kf-sec" data-bpm="-5" aria-label="5 batidas a menos">${I.menos}</button><output class="bpm-v" aria-live="polite">${DB.cfg.bpm}</output><button type="button" class="kf-btn kf-sec" data-bpm="5" aria-label="5 batidas a mais">${I.mais}</button></div>
      <div class="batidas bat-bateria" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      <button type="button" class="kf-btn kf-pri" id="bat-ligar">${bateria.ligada ? I.stop + 'Parar a bateria' : I.bateria + 'Tocar a bateria'}</button>
      <p class="apoio">O andamento é o mesmo do metrônomo. Toque um riff ou uma escala por cima.</p></details>
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

// minutos de cada um dos últimos 7 dias, com a linha da meta
function graficoSemana() {
  const W = 336, H = 110, bw = W / 7, hoje = diaNum(), D = Array.from({ length: 7 }, (_, i) => hoje - 6 + i).map(n => ({ n, m: Math.round(minutosNoDia(n)) }));
  const max = Math.max(DB.cfg.meta * 1.25, ...D.map(d => d.m), 1), y = v => H - v / max * H;
  return `<svg viewBox="0 0 ${W} ${H + 34}" role="img" aria-label="Minutos praticados nos últimos 7 dias: ${D.map(d => `${SEMANA_NOME[new Date(d.n * DIA + 12 * 36e5).getDay()]} ${d.m}`).join(', ')}. Meta: ${DB.cfg.meta} por dia.">`
    + D.map((d, i) => { const h = Math.max(d.m ? 3 : 0, H - y(d.m)); return `<rect x="${i * bw + 7}" y="${H - h}" width="${bw - 14}" height="${h}" rx="4" class="${d.m >= DB.cfg.meta ? 'g-ok' : 'g-med'}"/><text x="${i * bw + bw / 2}" y="${H + 14}" text-anchor="middle" class="g-t">${d.m}</text><text x="${i * bw + bw / 2}" y="${H + 29}" text-anchor="middle" class="g-t${d.n === hoje ? ' g-hoje' : ''}">${d.n === hoje ? 'hoje' : SEMANA[new Date(d.n * DIA + 12 * 36e5).getDay()]}</text>`; }).join('')
    + `<line x1="0" y1="${y(DB.cfg.meta)}" x2="${W}" y2="${y(DB.cfg.meta)}" class="g-meta"/></svg>`;
}
VIEWS.progresso = () => {
  const total = DB.praticas.reduce((s, p) => s + p.min, 0), toco = DB.musicas.filter(m => m.estado === 'toco').length, tocadas = permsTocadas();
  const ids = [...new Set(DB.treinos.map(idTreino))].filter(i => !i.startsWith('crom:'));
  return KitFacil.ui.cabecalho({ titulo: 'Progresso', sub: 'Sua constância, o andamento de cada treino e as conquistas.' })
    + `<div class="pilha"><div class="dados"><div class="dado"><b>${diasSeguidos()}</b><span class="apoio">dias seguidos</span></div><div class="dado"><b>${maiorSequencia()}</b><span class="apoio">maior sequência</span></div><div class="dado"><b>${minutosSemana()}</b><span class="apoio">minutos em 7 dias</span></div><div class="dado"><b>${(total / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</b><span class="apoio">horas de prática</span></div></div>
      <section class="cartao"><h3>Últimos 7 dias</h3><div class="grafico">${graficoSemana()}</div><p class="apoio">Minutos por dia. A linha tracejada é a meta de ${DB.cfg.meta} minutos; as barras escuras bateram a meta.</p></section>
      <section class="cartao"><h3>Cromático: as 24 combinações</h3>
        <div class="perms perms-prog">${PERMS.map(p => { const m = melhorLimpo('crom:' + p); return `<div class="perm${tocadas.has(p) ? ' feita' : ''}"><b>${permTexto(p)}</b><small>${m ? m + ' bpm' : tocadas.has(p) ? 'tocada' : '–'}</small></div>`; }).join('')}</div>
        <p class="apoio">${tocadas.size} de 24 tocadas. O número é o melhor andamento que saiu limpo.</p></section>
      <section class="cartao"><h3>Seus andamentos</h3>${ids.length
        ? `<ul class="andas">${ids.map(id => { const e = montarTreino(id); if (!e) return ''; const b = melhorLimpo(id), T = DB.treinos.filter(t => idTreino(t) === id), ul = T[T.length - 1]; return `<li><span><b>${esc(nomeTreino(id))}</b><span class="apoio">último: ${ul.bpm} bpm · melhor limpo: ${b || '–'} · meta ${e.alvo}</span></span><div class="barra-prog" style="width:96px" role="progressbar" aria-label="${esc(e.nome)}: melhor andamento em relação à meta" aria-valuenow="${Math.min(100, Math.round(b / e.alvo * 100))}" aria-valuemin="0" aria-valuemax="100"><span style="width:${Math.min(100, Math.round(b / e.alvo * 100))}%"></span></div></li>`; }).join('')}</ul>`
        : '<p class="apoio">Termine um treino de escala, palhetada ou riff e diga se saiu limpo: o andamento aparece aqui, com a meta.</p>'}</section>
      <section class="cartao"><h3>Conquistas · ${DB.conquistas.length} de ${CONQUISTAS.length}</h3>
        <ul class="conquistas">${CONQUISTAS.map(([id, nome, como]) => { const c = temConquista(id); return `<li class="${c ? 'ganha' : ''}"><span class="cq-ic">${I.medalha}</span><span><b>${esc(nome)}</b><span class="apoio">${c ? `ganha ${quando(c.em)}` : esc(como)}</span></span></li>`; }).join('')}</ul></section>
      <div class="dados"><div class="dado"><b>${toco}</b><span class="apoio">${toco === 1 ? 'música que você toca' : 'músicas que você toca'}</span></div><div class="dado"><b>${DB.treinos.length}</b><span class="apoio">treinos feitos</span></div></div></div>`;
};
VIEWS.ajustes = () => KitFacil.ajustes.html({
  produto: [{ id: 'pratica', titulo: 'Prática', icone: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>', resumo: `Meta de ${DB.cfg.meta} min por dia`,
    html: `<div class="kf-bloco"><h3>Meta diária</h3>
      <div class="campo"><label class="kf-rotulo" for="aj-meta">Minutos de prática por dia</label><select id="aj-meta">${[10, 15, 20, 30, 45, 60, 90].map(m => `<option value="${m}"${DB.cfg.meta === m ? ' selected' : ''}>${m} minutos</option>`).join('')}</select></div>
      <p class="apoio">O plano de hoje divide a meta em aquecimento, técnica, teoria e repertório.</p></div>` }],
});

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
      <div class="te-acoes"><button type="button" class="kf-btn kf-sec" data-te-ouvir="escala">${I.play}Ouvir a escala</button>${ESCALAS_TREINO.includes(TEO.escala) ? `<button type="button" class="kf-btn kf-pri" data-tr-abrir="esc:${TEO.escala}:${TEO.raiz}:${Math.max(0, TEO.desenho)}">${I.treinos}Treinar ${TEO.desenho >= 0 ? 'este desenho' : 'o desenho 1'}</button>` : ''}</div></details>
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

/* ================= ferramentas: som ================= */
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
  if (min >= 1) { registrarPratica(min); KitFacil.avisar(`${min} min de prática registrados.`); conferirConquistas(); }
  pintarMetro(); pintarBatida(-1);
}
function pintarMetro() { const b = $('#metro'); if (b) b.innerHTML = metro.ligado ? I.stop + 'Parar' : I.play + 'Começar'; }
function pintarBatida(k) { $$('.batidas span').forEach((s, i) => s.classList.toggle('on', i === k)); }
function mudarBpm(v) {
  DB.cfg.bpm = Math.max(40, Math.min(240, Math.round(v))); LS.set('db', DB);
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

/* ================= janela do treino =================
   Em cima, o braço (a nota da vez acesa, a próxima marcada) e a tablatura rolando; embaixo, o andamento e os ajustes.
   Os ajustes mexidos durante o treino valem a partir da próxima volta. */
const FIM_OPCOES = {
  crom: [['repetir', 'Repetir a mesma'], ['proxima', 'Seguir para a próxima combinação'], ['sortear', 'Sortear outra combinação'], ['casa', 'Subir uma casa'], ['parar', 'Parar']],
  esc: [['repetir', 'Repetir o mesmo desenho'], ['proximo', 'Seguir para o próximo desenho'], ['parar', 'Parar']],
  fixo: [['repetir', 'Repetir'], ['parar', 'Parar']],
};
const SUBIDAS = [[0, 'Manter o andamento'], [1, '+1 bpm a cada volta'], [2, '+2 bpm a cada volta'], [5, '+5 bpm a cada volta']];
const BPM_MIN = 30, BPM_MAX = 240;
function abrirTreino(id, bpmPedido, cfgPedida) {
  const base = TREINO_ANTIGO[id] || id;
  let cfg = base.startsWith('crom:') ? { ...cfgCromPadrao(), ...(DB.cfg.trCrom || {}), perm: base.slice(5), ...(cfgPedida || {}) }
    : base.startsWith('esc:') ? (() => { const [, escala, raiz, desenho] = base.split(':'); return { ...cfgEscPadrao(), ...(DB.cfg.trEsc || {}), escala, raiz: +raiz, desenho: +desenho, ...(cfgPedida || {}) }; })() : null;
  const montar = () => cfg ? (cfg.perm ? treinoCromatico(cfg) : treinoEscala(cfg)) : montarTreino(base);
  let ex = montar(); if (!ex) return;
  const tipo = ex.tipo, F = DB.cfg.trFim || {};
  let bpm = Math.max(BPM_MIN, Math.min(BPM_MAX, bpmPedido || melhorLimpo(ex.id) || ex.bpm));
  const sel = (id, ops, v, rot) => `<div class="campo"><label class="kf-rotulo" for="${id}">${rot}</label><select id="${id}">${ops.map(([k, l]) => `<option value="${k}"${String(v) === String(k) ? ' selected' : ''}>${l}</option>`).join('')}</select></div>`;
  const seg = (attr, ops, v, rot) => `<div class="campo"><span class="kf-rotulo" id="${attr}-l">${rot}</span><div class="kf-seg" role="group" aria-labelledby="${attr}-l">${ops.map(([k, l]) => `<button type="button" data-${attr}="${k}" aria-pressed="${String(v) === String(k)}">${l}</button>`).join('')}</div></div>`;
  const figOps = FIGURAS_TREINO.map(([f, n, t]) => [f, `${n} · ${t}`]);
  const ajustesHTML = tipo === 'crom' ? `
      <div class="campo"><span class="kf-rotulo" id="tr-perm-l">Combinação dos dedos</span>
        <div class="perms perms-dlg" role="group" aria-labelledby="tr-perm-l">${PERMS.map(p => `<button type="button" class="perm" data-perm="${p}" aria-pressed="${p === cfg.perm}" aria-label="${permTexto(p)}"><b>${permTexto(p)}</b></button>`).join('')}</div>
        <button type="button" class="kf-btn kf-sec tr-sortear" data-sortear>${I.sortear}Sortear uma combinação</button></div>
      <div class="grade2">${sel('tr-casa', Array.from({ length: 12 }, (_, i) => [i + 1, `Casa ${i + 1} (dedo 1 na casa ${i + 1})`]), cfg.casa, 'Casa inicial')}${sel('tr-fig', figOps, cfg.fig, 'Figura')}</div>
      ${seg('percurso', PERCURSOS.map(p => [p[0], p[1]]), cfg.percurso, 'Cordas')}`
    : tipo === 'esc' ? `
      <div class="grade2">${sel('tr-esc', ESCALAS_TREINO.map(e => [e, ESCALAS.find(x => x[0] === e)[1]]), cfg.escala, 'Escala')}${sel('tr-raiz', NOTAS.map((n, i) => [i, `${n} (${CIFRA[i]})`]), cfg.raiz, 'Tônica')}</div>
      ${seg('desenho', [0, 1, 2, 3, 4].map(d => [d, String(d + 1)]), cfg.desenho, 'Desenho')}
      <div class="grade2">${seg('percurso', [['ida', 'Sobe e desce'], ['sobe', 'Só sobe']], cfg.percurso, 'Caminho')}${sel('tr-fig', figOps, cfg.fig, 'Figura')}</div>` : '';
  const vel = () => { const m = melhorLimpo(ex.id); return `meta: ${ex.alvo} bpm${m ? ` · seu melhor limpo: ${m} bpm` : ''}`; };
  KitFacil.dialogo.abrir({ titulo: ex.nome, sub: ex.resumo, classe: 'kf-alto kf-largo', nome: 'treino',
    corpo: `<div class="tr-palco"><div class="tr-braco" id="tr-braco">${bracoTreino(ex)}</div><div class="tab-wrap" id="tr-tab">${tabSVG(ex)}</div><div class="tr-conta" id="tr-conta" aria-live="assertive"></div></div>
      <p class="tr-status" id="tr-status" aria-live="polite">${ex.rotulo === 'nota' ? 'No braço, o nome de cada nota.' : 'No braço, o número é o dedo da mão esquerda; 0 é corda solta.'} A nota da vez acende em vermelho.</p>
      <div class="tr-vel"><span class="kf-rotulo" id="tr-vel-l">Andamento</span>
        <div class="metro-bpm" role="group" aria-labelledby="tr-vel-l"><button type="button" class="kf-btn kf-sec" data-tr-bpm="-5" aria-label="5 batidas a menos">−5</button><button type="button" class="kf-btn kf-sec" data-tr-bpm="-1" aria-label="1 batida a menos">−1</button><output id="tr-bpm">${bpm}</output><button type="button" class="kf-btn kf-sec" data-tr-bpm="1" aria-label="1 batida a mais">+1</button><button type="button" class="kf-btn kf-sec" data-tr-bpm="5" aria-label="5 batidas a mais">+5</button></div>
        <input type="range" id="tr-r" min="${BPM_MIN}" max="${BPM_MAX}" step="1" value="${bpm}" aria-label="Batidas por minuto">
        <p class="apoio" id="tr-vel-t">${vel()}</p></div>
      ${ajustesHTML}
      <div class="grade2">${sel('tr-fim', FIM_OPCOES[tipo], F[tipo] || 'repetir', 'Ao fim de cada volta')}${sel('tr-sobe', SUBIDAS, DB.cfg.trSobe || 0, 'Subir o andamento')}</div>
      <div class="tr-op">
        <label class="kf-check"><input type="checkbox" id="tr-guia" ${DB.cfg.trGuia !== false ? 'checked' : ''}><span>Tocar o exemplo junto comigo</span></label>
        <label class="kf-check"><input type="checkbox" id="tr-metro" ${DB.cfg.trMetro !== false ? 'checked' : ''}><span>Metrônomo</span></label></div>
      <div class="tr-res" id="tr-res" hidden></div>`,
    pe: `<button type="button" class="kf-btn kf-sec" id="tr-exemplo">${I.play}Ouvir uma volta</button><button type="button" class="kf-btn kf-pri" id="tr-ir">${I.play}Começar</button>`,
    aoFechar: () => { if (treino.tocando) treino.parar(); },
    aoMontar: d => {
      const tabW = $('#tr-tab', d), brW = $('#tr-braco', d), conta = $('#tr-conta', d), res = $('#tr-res', d), status = $('#tr-status', d);
      let desenhado = null, tabN = [], brN = [], cur = null, ultI = -2, px = pxDe(ex);
      const chave = e => e.id + JSON.stringify(e.cfg || '');
      const desenhar = e => {
        if (desenhado === chave(e)) return; desenhado = chave(e);
        brW.innerHTML = bracoTreino(e); tabW.innerHTML = tabSVG(e); tabW.scrollLeft = 0; px = pxDe(e);
        cur = $('.tab-cursor', tabW); tabN = $$('.tab-n', tabW); brN = [];
        $$('.nt', brW).forEach(g => g.dataset.i.split(' ').forEach(i => brN[+i] = g)); ultI = -2;
        const h = $('.kf-dlg-cab h2', d); if (h) h.textContent = e.nome;
      };
      desenhar(ex);
      const titulo = () => { const t = $('.kf-dlg-sub', d); if (t) t.textContent = ex.resumo; };
      const setBpm = v => { bpm = Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(v))); $('#tr-bpm', d).textContent = bpm; $('#tr-r', d).value = bpm; $('#tr-vel-t', d).textContent = vel(); };
      $$('[data-tr-bpm]', d).forEach(b => b.onclick = () => setBpm(bpm + +b.dataset.trBpm));
      $('#tr-r', d).addEventListener('input', e => setBpm(+e.target.value));
      // ajustes: guardados para a próxima vez; parado, o desenho muda na hora; tocando, na próxima volta
      const guardar = () => { if (tipo === 'crom') DB.cfg.trCrom = { ...cfg }; if (tipo === 'esc') DB.cfg.trEsc = { ...cfg }; clearTimeout(guardar.t); guardar.t = setTimeout(commit, 500); };
      const mudou = () => { ex = montar(); guardar(); titulo(); setBpm(bpm); if (!treino.tocando) desenhar(ex); else status.textContent = `Na próxima volta: ${ex.nome}, ${ex.resumo}.`; };
      const pinta = () => {
        $$('[data-perm]', d).forEach(b => b.setAttribute('aria-pressed', b.dataset.perm === cfg.perm));
        $$('[data-percurso]', d).forEach(b => b.setAttribute('aria-pressed', b.dataset.percurso === cfg.percurso));
        $$('[data-desenho]', d).forEach(b => b.setAttribute('aria-pressed', +b.dataset.desenho === cfg.desenho));
        const c = $('#tr-casa', d); if (c && +c.value !== cfg.casa) c.value = cfg.casa;
      };
      $$('[data-perm]', d).forEach(b => b.onclick = () => { cfg.perm = b.dataset.perm; pinta(); mudou(); });
      $('[data-sortear]', d)?.addEventListener('click', () => { cfg.perm = PERMS.filter(p => p !== cfg.perm)[Math.floor(Math.random() * 23)]; pinta(); mudou(); const b = $(`[data-perm="${cfg.perm}"]`, d); b && b.focus(); });
      $$('[data-percurso]', d).forEach(b => b.onclick = () => { cfg.percurso = b.dataset.percurso; pinta(); mudou(); });
      $$('[data-desenho]', d).forEach(b => b.onclick = () => { cfg.desenho = +b.dataset.desenho; pinta(); mudou(); });
      $('#tr-casa', d)?.addEventListener('change', e => { cfg.casa = +e.target.value; mudou(); });
      $('#tr-fig', d)?.addEventListener('change', e => { cfg.fig = +e.target.value; mudou(); });
      $('#tr-esc', d)?.addEventListener('change', e => { cfg.escala = e.target.value; mudou(); });
      $('#tr-raiz', d)?.addEventListener('change', e => { cfg.raiz = +e.target.value; mudou(); });
      $('#tr-fim', d).addEventListener('change', e => { DB.cfg.trFim = { ...(DB.cfg.trFim || {}), [tipo]: e.target.value }; commit(); });
      $('#tr-sobe', d).addEventListener('change', e => { DB.cfg.trSobe = +e.target.value; commit(); });
      ['guia', 'metro'].forEach(k => $('#tr-' + k, d).addEventListener('change', e => { DB.cfg['tr' + k[0].toUpperCase() + k.slice(1)] = e.target.checked; commit(); }));
      // a volta seguinte, conforme "Ao fim de cada volta" e "Subir o andamento"
      let soUma = false;
      const proxima = prev => {
        if (!prev) return { ex, bpm };
        const fim = soUma ? 'parar' : $('#tr-fim', d).value;
        if (fim === 'parar') return null;
        if (fim === 'proxima') cfg.perm = PERMS[(PERMS.indexOf(cfg.perm) + 1) % 24];
        else if (fim === 'sortear') cfg.perm = PERMS.filter(p => p !== cfg.perm)[Math.floor(Math.random() * 23)];
        else if (fim === 'casa') cfg.casa = cfg.casa >= 12 ? 1 : cfg.casa + 1;
        else if (fim === 'proximo') cfg.desenho = (cfg.desenho + 1) % 5;
        if (fim !== 'repetir') { ex = montar(); guardar(); pinta(); titulo(); }
        const sobe = +$('#tr-sobe', d).value; if (sobe) setBpm(bpm + sobe);
        return { ex, bpm };
      };
      const aoRodada = r => { desenhar(r.ex); status.textContent = `Volta ${r.n} · ${r.ex.nome} · ${r.bpm} bpm`; };
      const aoQuadro = (r, beat, falta, i) => {
        conta.textContent = falta ? String(falta) : ''; conta.classList.toggle('on', !!falta);
        const x = 40 + Math.max(0, beat) * px; cur.setAttribute('x1', x); cur.setAttribute('x2', x);
        tabW.scrollLeft = Math.max(0, x - tabW.clientWidth * .35);
        if (i === ultI) return; ultI = i;
        tabN.forEach((g, k) => g.classList.toggle('agora', k === i));
        brN.forEach(g => g && g.classList.remove('agora', 'prox'));
        const prox = i < 0 ? 0 : i + 1;
        if (brN[prox] && prox < r.ex.notas.length) brN[prox].classList.add('prox');
        if (i >= 0 && brN[i]) { brN[i].classList.remove('prox'); brN[i].classList.add('agora'); }
      };
      const botoes = tocando => { $('#tr-ir', d).innerHTML = tocando ? I.stop + 'Parar' : I.play + 'Começar'; $('#tr-exemplo', d).disabled = tocando; };
      const limpar = () => { conta.textContent = ''; conta.classList.remove('on'); tabN.forEach(g => g.classList.remove('agora')); brN.forEach(g => g && g.classList.remove('agora', 'prox')); ultI = -2; };
      const resultado = (info, exFeito) => {
        const min = Math.round(info.segs / 6) / 10;
        registrarPratica(min);
        const rec = { id: uid(), ex: exFeito.id, cfg: exFeito.cfg || null, bpm: info.bpm, voltas: info.voltas, min, limpo: null, em: Date.now() };
        DB.treinos.push(rec); commit(); conferirConquistas();
        res.innerHTML = `<div class="tr-nota"><b>${info.voltas}</b><span>${info.voltas === 1 ? 'volta' : 'voltas'}</span></div><div class="tr-nota"><b>${info.bpm}</b><span>bpm na última volta</span></div>
          <p class="tr-fala">Saiu limpo a ${info.bpm} bpm, sem errar nem atrasar? Registre para acompanhar em Progresso.</p>
          <div class="tr-limpo"><button type="button" class="kf-btn kf-pri" data-limpo="1">${I.check}Saiu limpo</button><button type="button" class="kf-btn kf-sec" data-limpo="0">Ainda não</button></div>`;
        res.hidden = false;
        $$('[data-limpo]', res).forEach(b => b.onclick = () => {
          const ok = b.dataset.limpo === '1'; rec.limpo = ok; commit(); conferirConquistas();
          const novo = ok ? Math.min(BPM_MAX, info.bpm + 5) : Math.max(BPM_MIN, info.bpm - 5); setBpm(novo);
          $('.tr-fala', res).textContent = ok ? `Registrado: ${info.bpm} bpm limpo. Na próxima, tente ${novo} bpm.` : `Sem problema: repita a ${novo} bpm até sair limpo, e depois suba de novo.`;
          $('#tr-ir', d).focus(); $('.tr-limpo', res).remove(); // o foco não se perde quando os botões saem
        });
      };
      const rodar = exemplo => {
        if (treino.tocando) { treino.parar(); return; }
        res.hidden = true; soUma = exemplo; limpar(); botoes(true);
        const ok = treinoTocar({ guia: exemplo || $('#tr-guia', d).checked, metronomo: $('#tr-metro', d).checked, proxima, aoRodada, aoQuadro,
          aoFim: info => {
            botoes(false); limpar(); status.textContent = info.voltas ? `Fim: ${info.voltas} ${info.voltas === 1 ? 'volta' : 'voltas'}, até ${info.bpm} bpm.` : 'Treino parado.';
            if (exemplo || info.segs < 15) return;
            if (info.voltas) resultado(info, info.ultima.ex); else { registrarPratica(Math.round(info.segs / 6) / 10); conferirConquistas(); }
          } });
        if (!ok) { botoes(false); KitFacil.avisar('Este navegador não consegue tocar som. Tente outro navegador.'); }
      };
      $('#tr-ir', d).onclick = () => rodar(false);
      $('#tr-exemplo', d).onclick = () => rodar(true);
    } });
}

/* ================= janela de música ================= */
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
        commit(); KitFacil.dialogo.fechar(true); render(); KitFacil.avisar(m ? 'Música salva.' : 'Música anotada.'); conferirConquistas();
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
  if (subRota()) { const sec = $('#f-' + subRota()) || $('#t-' + subRota()) || $('#c-' + subRota()) || $('#' + subRota()); if (sec) requestAnimationFrame(() => sec.scrollIntoView({ block: 'start', behavior: KitFacil.movimento.reduzido() ? 'auto' : 'smooth' })); }
  telaAtual = r;
}
function ligar(m, r) {
  // treinos: qualquer botão com data-tr-abrir abre a janela do treino; o "Continuar" reabre o último com o mesmo ajuste
  $$('[data-tr-abrir]', m).forEach(b => b.onclick = () => abrirTreino(b.dataset.trAbrir));
  $$('[data-tr-ultimo]', m).forEach(b => b.onclick = () => { const u = ultimoTreino(); if (u) abrirTreino(idTreino(u), u.bpm, u.cfg || undefined); });
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
    $$('[data-estilo]', m).forEach(b => b.onclick = () => { DB.cfg.estilo = b.dataset.estilo; commit(); $$('[data-estilo]', m).forEach(x => x.setAttribute('aria-pressed', x === b)); if (bateria.ligada) { bateriaParar(); ligarBateria(m); } });
    $('#bat-ligar', m).onclick = () => { if (bateria.ligada) bateriaParar(); else ligarBateria(m); $('#bat-ligar', m).innerHTML = bateria.ligada ? I.stop + 'Parar a bateria' : I.bateria + 'Tocar a bateria'; };
  }
  $$('[data-musica-nova]', m).forEach(b => b.onclick = () => janelaMusica());
  $$('[data-musica]', m).forEach(b => b.onclick = () => janelaMusica(b.dataset.musica));
  $$('[data-pl-add]', m).forEach(b => b.onclick = () => {
    const [pid, i] = b.dataset.plAdd.split('|'), [t, a] = PLAYLISTS.find(x => x.id === pid).musicas[+i];
    DB.musicas.push({ id: uid(), titulo: t, artista: a, estado: 'quero', obs: '', criada: Date.now() }); commit();
    redesenhar(); KitFacil.avisar(`${t} está na sua lista.`);
  });
  if (r === 'teoria') ligarTeoria(m);
  if (r === 'ajustes') $('#aj-meta', m)?.addEventListener('change', e => { DB.cfg.meta = +e.target.value; commit(); KitFacil.avisar('Meta salva.'); });
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
  resumo: 'Treinos de guitarra no seu andamento, com o braço desenhado.', icone: 'icons/icon-192.png',
  tela: () => rota(), exemploDados: 'os treinos, as músicas e o tempo de prática',
  privacidade: ['Os treinos, os andamentos, as conquistas, as músicas e o tempo de prática ficam guardados neste aparelho.', 'O som dos treinos, do metrônomo, da bateria e das notas é gerado aqui no aparelho.', 'O afinador usa o microfone só enquanto está ligado, com a sua permissão: o som é analisado em memória, não é gravado nem enviado.'],
  abrirAjustes: secao => { if (rota() !== 'ajustes') ir('ajustes'); else if (!secao) history.back(); },
  emAjustes: () => rota() === 'ajustes',
  copia: { descricao: 'Baixe um arquivo com os treinos, as músicas e o tempo de prática.',
    baixar: () => KitFacil.copia.baixar({ db: DB }, 1),
    restaurar: async f => { const j = await KitFacil.copia.ler(f); if (!j || !j.dados || !j.dados.db) { KitFacil.avisar('Esse arquivo não é uma cópia do Guitarra Fácil.'); return; } DB = { ...vazio(), ...j.dados.db }; commit(); snapTodos(); render(); KitFacil.avisar('Cópia restaurada.'); } },
  novidades: [{ versao: '0.4.0', itens: ['O app agora é feito de treinos: sem trilha de aulas, sem teste de nível e sem professor.', 'Treino com o braço desenhado: a nota da vez acende, a próxima fica marcada e a tablatura rola junto.', 'Cromático 1-2-3-4 com as 24 combinações dos dedos: escolha a casa, as cordas e a figura, ou siga, sorteie e suba de casa a cada volta.', 'Escalas nos cinco desenhos, em qualquer tom, e um botão Treinar na Teoria.', 'Andamento de 1 em 1 ou de 5 em 5 bpm, e subida automática a cada volta.', 'Sequência de dias, a semana na tela Hoje, resumo da semana e 13 conquistas.'] }, { versao: '0.3.0', itens: ['Treinos com som e tablatura rolando, Teoria com o braço desenhado, bateria de acompanhamento e playlists recomendadas.'] }, { versao: '0.2.0', itens: ['Afinador pelo microfone, mapa das notas no braço e dez acordes. Ícone novo: o pedal de efeito.'] }, { versao: '0.1.0', itens: ['Primeira versão em testes: metrônomo, notas para afinar, primeiros acordes e lista de músicas.'] }],
  // sem boas-vindas do Kit: a tela Hoje explica como funciona no primeiro uso
  boasVindas: { novo: () => PRIMEIRO_USO },
});
KitFacil.tema.iniciar({ chave: KEY + 'pref', cores: { claro: '#F3F3F1', escuro: '#111113' } });
const SY = KitFacil.sync.criar({ app: 'guitarra-facil', nome: 'Guitarra Fácil', chave: KEY + 'sync', dados: 'os treinos, as músicas e o tempo de prática',
  carimbar, aplicar, pacote, mesmo: (a, r) => KitFacil.canon(a) === KitFacil.canon({ v: 1, cfg: r.cfg, feitas: r.feitas, musicas: r.musicas, praticas: r.praticas, andamentos: r.andamentos || [], treinos: r.treinos || [], conquistas: r.conquistas || [], st: r.st, del: r.del }),
  redesenhar: () => render() });
$('#marca').innerHTML = I.marca; $('#marca-trilho').innerHTML = I.marca;
$('#topo').innerHTML = KitFacil.topo.html({ principal: true });
conferirConquistas(false);
render();
const link = SY.tokenDoLink();
if (link) history.replaceState(null, '', location.pathname + location.hash);
SY.iniciar({ token: link, textoConfirmar: 'Os treinos, as músicas e a prática deste aparelho se juntam aos da nuvem.' });
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

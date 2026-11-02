/* Guitarra Fácil · dados: o objeto salvo, sincronização, constância, histórico de treinos (praticado e concluído), treino do
   dia e conquistas */
'use strict';
/* ================= dados ================= */
// coleções sincronizadas registro a registro (a mudança mais recente vence), como nos outros apps da família
// feitas e andamentos vêm da versão com aulas (até a 0.3.0): continuam guardados e sincronizados, mas não aparecem
// rotinas e metas (0.13.0) e ideias do Estúdio (0.15.0) entram do mesmo jeito
const COLS = ['feitas', 'musicas', 'praticas', 'andamentos', 'treinos', 'conquistas', 'favoritos', 'rotinas', 'metas', 'ideias'];
const vazio = () => ({ v: 1, cfg: { meta: 20, bpm: 80, estilo: 'rock' }, feitas: [], musicas: [], praticas: [], andamentos: [], treinos: [], conquistas: [], favoritos: [], rotinas: [], metas: [], ideias: [] });
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
const pacote = () => ({ v: 1, cfg: DB.cfg, feitas: DB.feitas, musicas: DB.musicas, praticas: DB.praticas, andamentos: DB.andamentos, treinos: DB.treinos, conquistas: DB.conquistas, favoritos: DB.favoritos, rotinas: DB.rotinas, metas: DB.metas, ideias: DB.ideias, st: SY.estado.st, del: SY.estado.del });

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
// registro: { ex: modelo, cfg, voltas, bpm, min, limpo, em, dia (treino do dia) }; os ids das versões 0.3 a 0.5 viram os
// treinos de escala de hoje quando dá, e os que não existem mais ficam guardados sem aparecer
function normalizarTreino(t) {
  const id = t.ex || '', c = t.cfg || {};
  if (modelo(id)) return { id, cfg: c };
  const p = id.split(':');
  if (p[0] === 'esc' || p[0] === 'seq' || p[0] === 'arp') { const m = MODELOS.find(x => x.id.startsWith(p.slice(0, p[0] === 'seq' ? 3 : 2).join(':') + ':')); if (m) return { id: m.id, cfg: c }; }
  if (id === 'ex-penta' || id === 'ex-1234') return { id: 'esc:penta-menor:1', cfg: { raiz: 9 } };
  return { id: null, cfg: c };
}
const reg = t => { const n = normalizarTreino(t); return { ...t, id: n.id, cfg: { ...(t.cfg || {}), ...n.cfg } }; };
const limpo = t => t.limpo === true || (t.acerto != null && t.acerto >= 90);
const T = () => DB.treinos.map(reg).filter(t => t.id);
const melhorLimpo = id => T().filter(t => t.id === id && limpo(t)).reduce((m, t) => Math.max(m, t.bpm), 0);
const ultimoTreino = () => T().sort((a, b) => b.em - a.em)[0] || null;
const quando = t => { const d = diaNum() - diaNum(t); return d <= 0 ? 'hoje' : d === 1 ? 'ontem' : `há ${d} dias`; };
const fmtTempo = s => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const favorito = id => DB.favoritos.some(f => f.id === id);
function alternarFavorito(id) { const k = DB.favoritos.findIndex(f => f.id === id); if (k >= 0) DB.favoritos.splice(k, 1); else DB.favoritos.push({ id, em: Date.now() }); commit(); conferirConquistas(); return k < 0; }
// nome de um treino com o estilo ou a técnica: "Bigorna · Thrash metal"
// o nome de cada categoria, inclusive as que não estão no catálogo (caminho, biblioteca e estúdio)
const nomeCategoria = cat => (CATEGORIAS.find(c => c[0] === cat) || [0, { caminho: 'Caminho do iniciante', biblioteca: 'Biblioteca', estudio: 'Estúdio' }[cat] || cat])[1];
const tituloDe = m => m.cat === 'escalas' ? m.nome : m.cat === 'caminho' ? `${m.nome} · ${etapaDe(m.sub).nome}` : m.cat === 'estudio' ? `${m.nome} · Estúdio` : m.cat === 'biblioteca' ? `${m.nome} · ${m.autor || 'Biblioteca'}` : `${m.nome} · ${m.cat === 'tecnica' ? TECNICAS_TREINO.find(t => t.id === m.sub).nome : estiloDe(m.sub).nome}`;

/* ================= treino do dia ================= */
// quatro treinos do nível escolhido, sorteados pelo dia: aquecimento de técnica, riff, solo e uma linha muito longa
function treinoDoDia(nivel) {
  const r = sorteio(semente(`dia:${diaNum()}:${nivel}`)), um = (cat, sub, tam) => `${cat}:${sub}:${nivel}:${tam}:${r.i(N_POR_LISTA)}`;
  return [um('tecnica', r.um(TECNICAS_TREINO).id, 'moderado'), um('riffs', r.um(ESTILOS).id, 'longo'), um('solos', r.um(ESTILOS).id, 'moderado'), um('riffs', r.um(ESTILOS).id, 'muito-longo')];
}

/* ================= conquistas ================= */
// [id, nome, como ganhar, condição]: conferidas depois de cada prática; ficam guardadas com a data em que vieram
const estilosTreinados = () => new Set(T().map(t => modelo(t.id)).filter(m => m && (m.cat === 'riffs' || m.cat === 'solos')).map(m => m.sub));
const tecnicasTreinadas = () => new Set(T().map(t => modelo(t.id)).filter(m => m && m.cat === 'tecnica').map(m => m.sub));
const CONQUISTAS = [
  ['primeiro', 'Primeiro treino', 'Termine um treino.', () => DB.treinos.length > 0],
  ['meta', 'Meta do dia', 'Pratique os minutos da sua meta num dia.', () => [...diasPraticados()].some(n => minutosNoDia(n) >= DB.cfg.meta)],
  ['dias3', 'Três dias seguidos', 'Pratique três dias seguidos.', () => maiorSequencia() >= 3],
  ['dias7', 'Uma semana inteira', 'Pratique sete dias seguidos.', () => maiorSequencia() >= 7],
  ['dias30', 'Um mês sem parar', 'Pratique 30 dias seguidos.', () => maiorSequencia() >= 30],
  ['hora', 'Uma hora na semana', 'Some 60 minutos em sete dias.', () => minutosSemana() >= 60],
  ['horas10', 'Dez horas de guitarra', 'Some 600 minutos de prática.', () => DB.praticas.reduce((s, p) => s + p.min, 0) >= 600],
  ['dia', 'Treino do dia', 'Termine os quatro treinos de um treino do dia.', () => T().some(t => t.dia && t.diaFim)],
  ['estilos5', 'Cinco estilos', 'Treine riffs ou solos de cinco estilos.', () => estilosTreinados().size >= 5],
  ['estilos', 'Todos os estilos', `Treine os ${ESTILOS.length} estilos.`, () => estilosTreinados().size >= ESTILOS.length],
  ['tecnicas10', 'Dez técnicas', 'Treine dez técnicas diferentes.', () => tecnicasTreinadas().size >= 10],
  ['muito-longo', 'Linha inteira', 'Toque uma volta inteira de um treino muito longo.', () => T().some(t => (modelo(t.id) || {}).tamanho === 'muito-longo' && t.voltas >= 1)],
  ['avancado', 'Nível avançado', 'Faça um treino avançado.', () => T().some(t => (modelo(t.id) || {}).nivel === 3)],
  ['drop', 'Afinação baixa', 'Treine numa afinação drop.', () => T().some(t => String(t.cfg.afin || (modelo(t.id) || {}).afinPadrao || '').startsWith('drop'))],
  ['sete', 'Sete cordas', 'Treine numa afinação de sete cordas.', () => T().some(t => String(t.cfg.afin || (modelo(t.id) || {}).afinPadrao || '').startsWith('sete'))],
  ['limpo140', 'Rápido e limpo', 'Toque um treino limpo a 140 bpm ou mais.', () => T().some(t => limpo(t) && t.bpm >= 140)],
  ['favorito', 'Favorito', 'Marque um treino com a estrela.', () => DB.favoritos.length > 0],
  ['plano', 'Quatro semanas', 'Termine um plano de 4 semanas.', () => (DB.cfg.planosFeitos || 0) > 0],
  ['musica', 'Primeira música', 'Marque uma música como Já toco.', () => DB.musicas.some(m => m.estado === 'toco')],
];
const temConquista = id => DB.conquistas.find(c => c.id === id);
const ganhas = () => CONQUISTAS.filter(c => temConquista(c[0])).length;
function conferirConquistas(avisar = true) {
  const novas = CONQUISTAS.filter(c => !temConquista(c[0]) && c[3]());
  if (!novas.length) return;
  novas.forEach(c => DB.conquistas.push({ id: c[0], em: Date.now() }));
  commit();
  if (avisar) KitFacil.avisar(novas.length === 1 ? `Conquista nova: ${novas[0][1]}.` : `Conquistas novas: ${novas.map(c => c[1]).join(', ')}.`);
}
function registrarPratica(min) { if (min > 0) { DB.praticas.push({ id: uid(), em: Date.now(), min }); commit(); } }


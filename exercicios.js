/* Guitarra Fácil · o modelo único de exercício (Documento Mestre, seções 6 e 20; claude/arquitetura.md).
   Todo exercício, de qualquer origem (gerado pelo catálogo, fundamental como o caminho e a biblioteca, ou criado no
   Estúdio), fica em MODELOS e é descrito pelas mesmas dimensões:
     origem       'fundamental' (escrito e conferido à mão) ou 'gerado' (procedural, conferido pelos testes)
     categoria    riffs, solos, tecnica, escalas, caminho, biblioteca, estudio
     objetivo     fundamentos, tecnica, aplicacao, repertorio, criacao
     estilo       o estilo musical (riffs e solos) ou null
     tecnicas     as técnicas que aparecem nas notas (palm mute, bend, ligados…) e a técnica do treino
     competencias o que o exercício desenvolve (mapa de competências, seção 14)
     mao          palheta, braco ou ambas
   As dimensões que dependem das notas são calculadas uma vez, quando alguém pergunta (infoExercicio), e guardadas.
   Filtros e busca (filtrarExercicios) leem só estas dimensões. */
'use strict';
const COMPETENCIAS = [
  ['palhetada', 'Palhetada', 'A mão da palheta: para baixo, alternada, econômica, híbrida e tremolo.'],
  ['ritmo', 'Ritmo', 'Tempo, pausas, palm mute, galope, quiálteras e compassos ímpares.'],
  ['acordes', 'Acordes e power chords', 'Duas ou mais cordas soando juntas.'],
  ['ligados', 'Ligados e tapping', 'Ligado para cima e para baixo, tapping e trinado.'],
  ['bends', 'Bends e vibrato', 'Empurrar a corda até a nota e fazer a nota balançar.'],
  ['escalas', 'Escalas e solos', 'Pentatônica, escalas e frases de solo.'],
  ['arpejos', 'Arpejos e varredura', 'O acorde nota por nota.'],
  ['posicao', 'Troca de posição', 'Andar pelo braço sem perder o tempo.'],
  ['dedos', 'Independência dos dedos', 'Um dedo por casa, cada um sozinho.'],
  ['efeitos', 'Efeitos', 'Harmônicos, pinch, nota morta, slide e alavanca.'],
];
const OBJETIVOS = [['fundamentos', 'Primeiros passos'], ['tecnica', 'Técnica'], ['aplicacao', 'Riffs e solos'], ['repertorio', 'Repertório'], ['criacao', 'Suas criações']];
const MAOS = [['palheta', 'Mão da palheta'], ['braco', 'Mão no braço'], ['ambas', 'As duas mãos']];
const TECNICAS_NOTAS = { pm: 'Palm mute', acordes: 'Power chords e acordes', b: 'Bend', v: 'Vibrato', h: 'Ligados', t: 'Tapping', s: 'Slide', harm: 'Harmônico', pinch: 'Pinch', x: 'Nota morta', dive: 'Alavanca', tr: 'Trinado', quialteras: 'Quiálteras', pausas: 'Pausas', rapido: 'Notas rápidas', impar: 'Compasso ímpar' };
// técnicas de treino (metal.js) que dizem a mão e a competência
const TEC_COMP = { alternada: ['palhetada'], downpicking: ['palhetada', 'ritmo'], 'palm-mute': ['ritmo', 'palhetada'], galope: ['ritmo', 'palhetada'], tremolo: ['palhetada'],
  legato: ['ligados'], tapping: ['ligados'], sweep: ['arpejos', 'palhetada'], skip: ['palhetada'], economia: ['palhetada'], hibrida: ['palhetada'], bends: ['bends'],
  harmonicos: ['efeitos'], 'power-chords': ['acordes', 'ritmo'], dedos: ['dedos'], ritmo: ['ritmo'], posicao: ['posicao'] };
const TEC_MAO = { alternada: 'palheta', downpicking: 'palheta', 'palm-mute': 'palheta', galope: 'palheta', tremolo: 'palheta', sweep: 'palheta', skip: 'palheta', economia: 'palheta', hibrida: 'palheta',
  legato: 'braco', tapping: 'braco', bends: 'braco', dedos: 'braco', posicao: 'braco' };
const CAMINHO_COMP = { contato: ['dedos', 'palhetada'], ritmo: ['palhetada', 'ritmo'], power: ['acordes', 'ritmo'], riffs: ['ritmo', 'acordes'], solos: ['escalas', 'bends'] };

// registra um exercício novo (biblioteca, estúdio…): completa as dimensões que não dependem das notas
function registrarExercicio(m) {
  const i = MODELOS.findIndex(x => x.id === m.id); if (i >= 0) MODELOS.splice(i, 1);
  MODELOS.push(dimensoes(m)); infoCache.delete(m.id); return m;
}
function dimensoes(m) {
  if (!m.origem) m.origem = ['caminho', 'biblioteca'].includes(m.cat) ? 'fundamental' : m.cat === 'estudio' ? 'pessoal' : 'gerado';
  if (!m.objetivo) m.objetivo = { caminho: 'fundamentos', tecnica: 'tecnica', escalas: 'tecnica', riffs: 'aplicacao', solos: 'aplicacao', biblioteca: 'repertorio', estudio: 'criacao' }[m.cat] || 'tecnica';
  if (m.estilo === undefined) m.estilo = (m.cat === 'riffs' || m.cat === 'solos') ? m.sub : null;
  return m;
}
MODELOS.forEach(dimensoes);

// as dimensões que dependem das notas, calculadas uma vez
const infoCache = new Map();
function infoExercicio(m) {
  if (typeof m === 'string') m = modelo(m); if (!m) return null;
  if (infoCache.has(m.id)) return infoCache.get(m.id);
  let v = null; try { v = volta(m, cfgPadrao(m)); } catch { v = null; }
  const evs = v ? v.evs : [], T = new Set();
  evs.forEach(e => tecs(e).forEach(t => T.add(t === 'b2' || t === 'r' ? 'b' : t === 'p' ? 'h' : t)));
  if (evs.some(e => e.n.length >= 2)) T.add('acordes');
  if (evs.some(e => Math.abs(e.d - 1 / 6) < .01 || Math.abs(e.d - 1 / 3) < .01)) T.add('quialteras');
  if (evs.some(e => !e.n.length)) T.add('pausas');
  if (evs.some(e => e.d <= .25 + 1e-6)) T.add('rapido');
  const [cn, cp] = (v && v.compasso) || [4, 1]; if (cn * cp !== 4 && cn * cp !== 3 && cn * cp !== 2) T.add('impar');
  // troca de posição: a mão salta 5 casas ou mais pelo menos duas vezes
  let saltos = 0, ant = null; evs.forEach(e => { const ks = e.n.map(n => n[1]).filter(k => k > 0); if (!ks.length) return; const k = Math.min(...ks); if (ant != null && Math.abs(k - ant) >= 5) saltos++; ant = k; });
  const C = new Set();
  if (m.cat === 'tecnica') (TEC_COMP[m.sub] || []).forEach(c => C.add(c));
  if (m.cat === 'caminho') (CAMINHO_COMP[m.sub] || []).forEach(c => C.add(c));
  if (m.cat === 'riffs') C.add('ritmo');
  if (m.cat === 'solos') C.add('escalas');
  if (m.cat === 'biblioteca' || m.cat === 'estudio') C.add(m.melodia ? 'escalas' : 'ritmo');
  if (m.cat === 'escalas') C.add(m.grupo === 'Arpejo' ? 'arpejos' : 'escalas');
  if (T.has('pm') || T.has('pausas') || T.has('quialteras') || T.has('impar')) C.add('ritmo');
  if (T.has('acordes')) C.add('acordes');
  if (T.has('h') || T.has('t') || T.has('tr')) C.add('ligados');
  if (T.has('b') || T.has('v')) C.add('bends');
  if (T.has('harm') || T.has('pinch') || T.has('x') || T.has('dive') || T.has('s')) C.add('efeitos');
  if (T.has('rapido') && m.cat !== 'escalas') C.add('palhetada');
  if (saltos >= 2) C.add('posicao');
  const pal = [...C].some(c => c === 'palhetada' || c === 'ritmo' || c === 'acordes'), bra = [...C].some(c => ['ligados', 'bends', 'dedos', 'posicao'].includes(c));
  const mao = TEC_MAO[m.sub] && m.cat === 'tecnica' ? TEC_MAO[m.sub] : pal && bra ? 'ambas' : pal ? 'palheta' : bra ? 'braco' : 'ambas';
  const info = { tecnicas: [...T], competencias: [...C], mao, notas: evs.filter(e => e.n.length).length, compassos: v ? compassosDe(v) : 0 };
  infoCache.set(m.id, info); return info;
}
// texto sem acento e em minúsculas, para a busca
const semAcento = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// tudo o que a busca encontra num exercício: nome, resumo, estilo, técnica, categoria, competências e técnicas
function textoDeBusca(m) {
  if (m._busca) return m._busca;
  const est = m.estilo && typeof estiloDe === 'function' ? estiloDe(m.estilo) : null, tec = m.cat === 'tecnica' ? TECNICAS_TREINO.find(t => t.id === m.sub) : null;
  const inf = infoCache.get(m.id);
  m._busca = semAcento([m.nome, inf ? inf.tecnicas.map(t => TECNICAS_NOTAS[t]).join(' ') : '', inf ? inf.competencias.map(c => (COMPETENCIAS.find(x => x[0] === c) || [])[1]).join(' ') : '', typeof m.resumo === 'string' ? m.resumo : '', est && est.nome, tec && tec.nome, m.grupo, (CATEGORIAS.find(c => c[0] === m.cat) || [])[1], m.cat === 'caminho' ? 'caminho iniciante' : '', m.cat === 'biblioteca' ? 'biblioteca repertorio' : '', m.autor || '', m.obra || ''].filter(Boolean).join(' '));
  return m._busca;
}
/* índice: as dimensões de todo o catálogo, calculadas em segundo plano, aos poucos, e guardadas neste aparelho até
   a próxima versão do app (o catálogo é gerado sempre igual, então o índice só muda quando o app muda) */
const indice = { pronto: false, feitos: 0, ouvintes: [] };
const IDX_CHAVE = () => KEY + 'indice';
function indiceGravar() {
  const d = {}; MODELOS.forEach(m => { const i = infoCache.get(m.id); if (i) d[m.id] = [i.competencias.join(','), i.tecnicas.join(','), i.mao, i.notas, i.compassos].join('|'); });
  try { localStorage.setItem(IDX_CHAVE(), JSON.stringify({ v: VERSAO, n: MODELOS.length, d })); } catch {}
}
function indiceLer() {
  try { const x = JSON.parse(localStorage.getItem(IDX_CHAVE()) || 'null'); if (!x || x.v !== VERSAO) return false;
    Object.entries(x.d).forEach(([id, s]) => { if (infoCache.has(id)) return; const [c, t, mao, n, k] = s.split('|'); infoCache.set(id, { competencias: c ? c.split(',') : [], tecnicas: t ? t.split(',') : [], mao, notas: +n, compassos: +k }); });
    return MODELOS.every(m => infoCache.has(m.id));
  } catch { return false; }
}
function prepararIndice(aoFim) {
  if (aoFim) indice.ouvintes.push(aoFim);
  if (indice.pronto) { indice.ouvintes.splice(0).forEach(f => f()); return; }
  if (indice.rodando) return; indice.rodando = true;
  if (indiceLer()) return fim();
  const fila = MODELOS.filter(m => !infoCache.has(m.id));
  const passo = () => { const t = performance.now(); while (fila.length && performance.now() - t < 12) { infoExercicio(fila.shift()); } indice.feitos = MODELOS.length - fila.length; if (fila.length) setTimeout(passo, 0); else { indiceGravar(); fim(); } };
  setTimeout(passo, 0);
  function fim() { indice.pronto = true; indice.rodando = false; MODELOS.forEach(m => { delete m._busca; }); indice.ouvintes.splice(0).forEach(f => f()); }
}
/* filtros combinados (todos opcionais): { busca, categoria, estilo, nivel, tamanho, objetivo, mao, competencia, tecnica }.
   Os que dependem das notas (mao, competencia, tecnica) calculam infoExercicio só dos que passaram nos outros. */
function filtrarExercicios(f = {}, limite = Infinity) {
  const termos = semAcento(f.busca).split(/\s+/).filter(Boolean), r = [];
  for (const m of MODELOS) {
    if (f.categoria && m.cat !== f.categoria) continue;
    if (f.estilo && m.estilo !== f.estilo) continue;
    if (f.nivel && m.nivel !== +f.nivel) continue;
    if (f.tamanho && m.cat !== 'escalas' && m.tamanho !== f.tamanho) continue;
    if (f.objetivo && m.objetivo !== f.objetivo) continue;
    if (termos.length) { const t = textoDeBusca(m); if (!termos.every(x => t.includes(x))) continue; }
    if (f.mao || f.competencia || f.tecnica) {
      const i = infoExercicio(m); if (!i) continue;
      if (f.mao && i.mao !== f.mao && i.mao !== 'ambas') continue;
      if (f.competencia && !i.competencias.includes(f.competencia)) continue;
      if (f.tecnica && !(i.tecnicas.includes(f.tecnica) || (m.cat === 'tecnica' && m.sub === f.tecnica))) continue;
    }
    r.push(m); if (r.length >= limite) break;
  }
  return r;
}

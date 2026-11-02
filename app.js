/* Guitarra Fácil · app web (PWA) do Projeto Integrador.
   Treinos de guitarra elétrica com o braço desenhado. Cada função tem a sua tela: Início (menu), Treinos (categoria,
   nível, duração e lista, um toque por vez), Afinador, Teoria, Metrônomo, Bateria, Mapa do braço, Acordes, Músicas e
   Progresso. Tudo fica neste aparelho; a sincronização opcional e a moldura vêm do Kit Fácil (comum/). */
'use strict';
const VERSAO = '0.5.0';
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
  inicio: svg('<path d="M4 11 12 4l8 7v8.5a1 1 0 0 1-1 1h-4.5V15h-5v5.5H5a1 1 0 0 1-1-1z"/>'),
  treinos: svg('<path d="M8.5 3h7l3.5 18H5z"/><path d="M12 16 17 7"/><path d="M7.5 13h9"/>'),
  afinador: svg('<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-6"/>'),
  teoria: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18"/>'),
  metronomo: svg('<path d="M9 3h6l4 18H5z"/><path d="m12 15 5-8"/>'),
  bateria: svg('<ellipse cx="12" cy="9" rx="8" ry="3"/><path d="M4 9v6c0 1.7 3.6 3 8 3s8-1.3 8-3V9M8 3l3 5M16 3l-3 5"/>'),
  braco: svg('<path d="M3 7h18M3 12h18M3 17h18M8 5v14M14 5v14"/>'),
  acordes: svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 8h14M5 13h14M9.5 3v18M14.5 3v18"/>'),
  musicas: svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
  progresso: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
  medalha: svg('<circle cx="12" cy="15" r="5.5"/><path d="M8.6 10.6 6 3h4l2 5 2-5h4l-2.6 7.6"/><path d="m12 12.6.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z"/>'),
  chama: svg('<path d="M12 3c.8 3.6 5.5 5.3 5.5 10.2a5.5 5.5 0 0 1-11 0c0-2.6 1.4-3.9 2.2-5.6.9 1.5 1.5 2.3 2.6 2.4-.2-2.6-.4-4.6.7-7z"/>'),
  sortear: svg('<path d="M3 7h3.5c2 0 3 1 4.5 3.5l2 3.5c1.5 2.5 2.5 3.5 4.5 3.5H21M18 14.5l3 3-3 3M3 17.5h3.5c1.3 0 2.2-.4 3-1.3M14 7.8c.8-.9 1.7-1.3 3-1.3H21M18 3.5l3 3-3 3"/>'),
  ajustes: svg('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
  ouvir: svg('<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  seta: svg('<path d="m9 6 6 6-6 6"/>'),
  play: svg('<path d="M7 4v16l13-8z"/>'),
  stop: svg('<rect x="6" y="6" width="12" height="12" rx="1.5"/>'),
  menos: svg('<path d="M5 12h14"/>'),
  mais: svg('<path d="M12 5v14M5 12h14"/>'),
};
/* ilustrações dos botões grandes (64 × 48): traço na cor do texto, destaque vermelho do pedal */
const ilu = p => `<svg viewBox="0 0 64 48" aria-hidden="true" class="ilu">${p}</svg>`;
const fret = '<rect x="6" y="10" width="52" height="28" rx="3" class="il-f"/><path d="M6 15h52M6 21h52M6 27h52M6 33h52M19 10v28M32 10v28M45 10v28" class="il-l"/>';
const ILU = {
  treinar: ilu(fret + '<circle cx="12.5" cy="33" r="3.4" class="il-n"/><circle cx="25.5" cy="27" r="3.4" class="il-n"/><circle cx="38.5" cy="21" r="4" class="il-a"/><circle cx="51.5" cy="15" r="3.4" class="il-o"/>'),
  afinador: ilu('<path d="M10 38a22 22 0 0 1 44 0" class="il-l il-g"/><path d="M32 16v4M20 20l2 3M44 20l-2 3M14 29l3 1M50 29l-3 1" class="il-l"/><path d="M32 38 39 21" class="il-r"/><circle cx="32" cy="38" r="3.5" class="il-a"/>'),
  metronomo: ilu('<path d="M24 6h16l8 36H16z" class="il-f il-l"/><path d="M18 34h28" class="il-l"/><path d="m32 34 9-22" class="il-r"/><circle cx="38.5" cy="18" r="3.5" class="il-a"/>'),
  bateria: ilu('<ellipse cx="32" cy="22" rx="20" ry="7" class="il-f il-l"/><path d="M12 22v12c0 4 9 7 20 7s20-3 20-7V22" class="il-l"/><path d="M20 4l9 14M44 4l-9 14" class="il-r"/>'),
  teoria: ilu('<circle cx="32" cy="24" r="19" class="il-f il-l"/><circle cx="32" cy="24" r="10" class="il-l"/>' + Array.from({ length: 12 }, (_, i) => { const a = (i * 30 - 90) * Math.PI / 180; return `<circle cx="${(32 + 15 * Math.cos(a)).toFixed(1)}" cy="${(24 + 15 * Math.sin(a)).toFixed(1)}" r="${i ? 2 : 3.4}" class="${i ? 'il-n' : 'il-a'}"/>`; }).join('')),
  braco: ilu(fret + '<g class="il-tx"><text x="12.5" y="18">A</text><text x="25.5" y="24">C</text><text x="38.5" y="30">E</text><text x="51.5" y="36">G</text></g>'),
  acordes: ilu('<rect x="18" y="6" width="28" height="36" rx="2" class="il-f"/><path d="M18 6h28" class="il-l il-g"/><path d="M18 15h28M18 24h28M18 33h28M23.6 6v36M29.2 6v36M34.8 6v36M40.4 6v36" class="il-l"/><circle cx="29.2" cy="19.5" r="3.2" class="il-n"/><circle cx="34.8" cy="19.5" r="3.2" class="il-n"/><circle cx="40.4" cy="28.5" r="3.2" class="il-a"/>'),
  musicas: ilu('<path d="M24 36V12l22-5v24" class="il-l il-g"/><circle cx="19" cy="36" r="5.5" class="il-n"/><circle cx="41" cy="31" r="5.5" class="il-a"/>'),
  progresso: ilu('<path d="M8 42h48" class="il-l"/><rect x="12" y="28" width="8" height="14" rx="2" class="il-n"/><rect x="24" y="20" width="8" height="22" rx="2" class="il-n"/><rect x="36" y="14" width="8" height="28" rx="2" class="il-n"/><rect x="48" y="6" width="8" height="36" rx="2" class="il-a"/>'),
  escalas: ilu(fret + [12.5, 25.5, 38.5, 51.5].map((x, i) => `<circle cx="${x}" cy="${33 - i * 6}" r="3.4" class="${i === 3 ? 'il-a' : 'il-n'}"/>`).join('')),
  sequencias: ilu(fret + '<path d="M12.5 33 25.5 21 25.5 27 38.5 15 38.5 21 51.5 15" class="il-r"/><circle cx="51.5" cy="15" r="3.6" class="il-a"/>'),
  arpejos: ilu(fret + '<circle cx="12.5" cy="33" r="3.4" class="il-n"/><circle cx="25.5" cy="21" r="3.4" class="il-n"/><circle cx="38.5" cy="27" r="3.4" class="il-n"/><circle cx="51.5" cy="15" r="3.8" class="il-a"/>'),
  licks: ilu('<path d="M6 30c6-14 10-14 14 0s8 14 12 0 8-18 14-4" class="il-r"/><path d="M46 26c3-8 6-10 10-12" class="il-l il-g"/><circle cx="56" cy="14" r="4" class="il-a"/>'),
  riffs: ilu('<path d="M6 36h52M6 30h52" class="il-l il-g"/><path d="M34 6 24 24h9l-5 16 14-22h-9l5-12z" class="il-a"/>'),
  tecnica: ilu(fret + [1, 2, 3, 4].map((n, i) => `<circle cx="${12.5 + i * 13}" cy="27" r="5" class="${i === 3 ? 'il-a' : 'il-n'}"/><text x="${12.5 + i * 13}" y="30.5" class="il-num">${n}</text>`).join('')),
  'te-escalas': ilu(fret + '<circle cx="12.5" cy="21" r="3.2" class="il-a"/><circle cx="25.5" cy="15" r="3.2" class="il-n"/><circle cx="25.5" cy="27" r="3.2" class="il-n"/><circle cx="38.5" cy="33" r="3.2" class="il-n"/><circle cx="38.5" cy="21" r="3.2" class="il-n"/><circle cx="51.5" cy="27" r="3.2" class="il-n"/>'),
  'te-acordes': ilu('<path d="M8 14h48M8 22h48M8 30h48M8 38h48" class="il-l"/><circle cx="32" cy="34" r="4.4" class="il-a"/><circle cx="32" cy="26" r="4.4" class="il-n"/><circle cx="32" cy="18" r="4.4" class="il-n"/>'),
  'te-circulo': ilu('<circle cx="32" cy="24" r="19" class="il-f il-l"/>' + Array.from({ length: 12 }, (_, i) => { const a = (i * 30 - 90) * Math.PI / 180; return `<circle cx="${(32 + 15 * Math.cos(a)).toFixed(1)}" cy="${(24 + 15 * Math.sin(a)).toFixed(1)}" r="${i ? 2 : 3.4}" class="${i ? 'il-n' : 'il-a'}"/>`; }).join('') + '<circle cx="32" cy="24" r="6" class="il-l"/>'),
  'te-intervalos': ilu('<path d="M8 40h48" class="il-l"/><circle cx="16" cy="34" r="5" class="il-n"/><circle cx="48" cy="18" r="5" class="il-a"/><path d="M19 29C26 14 36 10 43 15" class="il-l il-g"/>'),
  'te-ritmo': ilu('<ellipse cx="14" cy="36" rx="6" ry="4.4" class="il-n"/><path d="M19.5 35V10" class="il-l il-g"/><ellipse cx="34" cy="36" rx="6" ry="4.4" class="il-n"/><ellipse cx="50" cy="32" rx="6" ry="4.4" class="il-a"/><path d="M39.5 35V12h16v19" class="il-l il-g"/><path d="M39.5 12h16" class="il-l il-g"/>'),
};
const iluNivel = n => ilu([0, 1, 2].map(i => `<rect x="${14 + i * 14}" y="${30 - i * 9}" width="10" height="${12 + i * 9}" rx="2" class="${i < n ? (i === n - 1 ? 'il-a' : 'il-n') : 'il-f il-l'}"/>`).join(''));
const iluDuracao = min => { const f = { 2: .1, 5: .25, 10: .5, 20: 1 }[min], a = f * 2 * Math.PI - Math.PI / 2, x = 32 + 17 * Math.cos(a), y = 25 + 17 * Math.sin(a); return ilu(`<circle cx="32" cy="25" r="17" class="il-f il-l"/>${f >= 1 ? '<circle cx="32" cy="25" r="17" class="il-a"/>' : `<path d="M32 25V8A17 17 0 ${f > .5 ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)}z" class="il-a"/>`}<circle cx="32" cy="25" r="2.5" class="il-n"/>`); };
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
// barra: Início, Treinos, Afinador, Teoria e Mais (Metrônomo, Bateria, Mapa do braço, Acordes, Músicas, Progresso e
// Ajustes) — escolha do Bruno, 01/11/2026: cada função na sua tela
const NAV = [
  ['inicio', 'Início', I.inicio], ['treinos', 'Treinos', I.treinos], ['afinador', 'Afinador', I.afinador], ['teoria', 'Teoria', I.teoria],
  ['metronomo', 'Metrônomo', I.metronomo, true], ['bateria', 'Bateria', I.bateria, true], ['braco', 'Mapa do braço', I.braco, true],
  ['acordes', 'Acordes', I.acordes, true], ['musicas', 'Músicas', I.musicas, true], ['progresso', 'Progresso', I.progresso, true],
];
const caminho = () => location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
const parte = i => caminho()[i] || '';
const subRota = () => parte(1);
// endereços das versões anteriores: hoje → início; ferramentas/x → a tela da ferramenta
const ANTIGAS = { hoje: 'inicio', ferramentas: 'metronomo' };
const rota = () => { const r = parte(0) || 'inicio'; return NAV.some(n => n[0] === r) || r === 'ajustes' ? r : 'inicio'; };
function corrigirEndereco() {
  const [r, s] = caminho();
  if (r === 'ferramentas') history.replaceState(null, '', '#/' + (['metronomo', 'bateria', 'afinador', 'braco', 'acordes'].includes(s) ? s : 'metronomo'));
  else if (ANTIGAS[r]) history.replaceState(null, '', '#/' + ANTIGAS[r]);
}
let telaAtual = null;
function ir(t) {
  const agora = caminho().filter(Boolean).join('/');
  if (t === agora && t !== 'ajustes') return;
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
/* peças de tela: o caminho até aqui (para voltar um passo) e o botão grande ilustrado */
const migalhas = passos => `<nav class="migalhas" aria-label="Caminho">${passos.map(([ir, nome], i) => (i ? '<span aria-hidden="true">›</span>' : '') + (ir ? `<button type="button" data-ir="${esc(ir)}">${esc(nome)}</button>` : `<span aria-current="page">${esc(nome)}</span>`)).join('')}</nav>`;
const ladrilho = ({ ir, attrs = '', ilu: il = '', nome, sub = '', selo = '', classe = '' }) => `<button type="button" class="ladrilho ${classe}" ${ir ? `data-ir="${esc(ir)}"` : ''} ${attrs}><span class="ld-ilu">${il}</span><span class="ld-tx"><b>${esc(nome)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span>${selo ? `<span class="ld-selo">${esc(selo)}</span>` : ''}</button>`;

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
// cada registro: { ex: modelo, cfg, cat, nivel, dur, concluido, bpm, voltas, min, limpo, em, perms, posicoes, tons }
const reg = t => { const n = normalizarTreino(t); return { ...t, id: n.id, cfg: { ...(t.cfg || {}), ...n.cfg } }; };
const limpo = t => t.limpo === true || (t.acerto != null && t.acerto >= 90);
const melhorLimpo = id => DB.treinos.map(reg).filter(t => t.id === id && limpo(t)).reduce((m, t) => Math.max(m, t.bpm), 0);
const ultimoTreino = () => { const t = DB.treinos.slice().sort((a, b) => b.em - a.em)[0]; return t && modelo(reg(t).id) ? reg(t) : null; };
const permsTocadas = () => new Set(DB.treinos.map(reg).filter(t => t.id.startsWith('tec:crom')).flatMap(t => t.perms || [t.cfg.perm || '1234']));
const quando = t => { const d = diaNum() - diaNum(t); return d <= 0 ? 'hoje' : d === 1 ? 'ontem' : `há ${d} dias`; };
const fmtTempo = s => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

/* ================= conquistas ================= */
// [id, nome, como ganhar, condição]: conferidas depois de cada prática; ficam guardadas com a data em que vieram
const T = () => DB.treinos.map(reg);
const melhorCromatico = () => T().filter(t => t.id.startsWith('tec:crom') && limpo(t)).reduce((m, t) => Math.max(m, t.bpm), 0);
const CONQUISTAS = [
  ['primeiro', 'Primeiro treino', 'Termine um treino.', () => DB.treinos.length > 0],
  ['meta', 'Meta do dia', 'Pratique os minutos da sua meta num dia.', () => [...diasPraticados()].some(n => minutosNoDia(n) >= DB.cfg.meta)],
  ['dias3', 'Três dias seguidos', 'Pratique três dias seguidos.', () => maiorSequencia() >= 3],
  ['dias7', 'Uma semana inteira', 'Pratique sete dias seguidos.', () => maiorSequencia() >= 7],
  ['dias30', 'Um mês sem parar', 'Pratique 30 dias seguidos.', () => maiorSequencia() >= 30],
  ['hora', 'Uma hora na semana', 'Some 60 minutos em sete dias.', () => minutosSemana() >= 60],
  ['horas10', 'Dez horas de guitarra', 'Some 600 minutos de prática.', () => DB.praticas.reduce((s, p) => s + p.min, 0) >= 600],
  ['categorias', 'De tudo um pouco', 'Treine as seis categorias.', () => new Set(T().map(t => (modelo(t.id) || {}).cat).filter(Boolean)).size >= 6],
  ['longo', 'Fôlego', 'Termine um treino longo.', () => T().some(t => t.concluido && (t.dur === 'longo' || t.dur === 'muito-longo'))],
  ['tons12', 'Os 12 tons', 'Termine um treino muito longo, que passa pelos 12 tons.', () => T().some(t => t.concluido && t.dur === 'muito-longo')],
  ['avancado', 'Nível avançado', 'Faça um treino avançado.', () => T().some(t => (modelo(t.id) || {}).nivel === 3)],
  ['licks10', 'Dez licks', 'Toque 10 licks diferentes.', () => new Set(T().filter(t => t.id.startsWith('lick:')).map(t => t.id)).size >= 10],
  ['crom10', 'Dez combinações', 'Toque 10 das 24 combinações do cromático.', () => permsTocadas().size >= 10],
  ['crom24', 'As 24 combinações', 'Toque todas as combinações do cromático.', () => permsTocadas().size >= 24],
  ['bpm100', 'Cromático a 100', 'Toque o cromático limpo a 100 bpm.', () => melhorCromatico() >= 100],
  ['bpm140', 'Cromático a 140', 'Toque o cromático limpo a 140 bpm.', () => melhorCromatico() >= 140],
  ['desenhos', 'Os cinco desenhos', 'Passe pelas cinco posições da pentatônica.', () => new Set(T().filter(t => t.id === 'esc:penta-menor').flatMap(t => t.posicoes || [t.cfg.pos || 0])).size >= 5],
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
const VIEWS = {};
// Início: a sequência numa linha, o último treino para continuar e o menu de botões grandes
const MENU = [
  ['treinos', 'Treinar', 'treinar', `${MODELOS.length} treinos`], ['afinador', 'Afinar', 'afinador', 'Pelo microfone'], ['metronomo', 'Metrônomo', 'metronomo', 'Toque no tempo'],
  ['bateria', 'Bateria', 'bateria', 'Uma banda junto'], ['teoria', 'Teoria', 'teoria', 'Escalas e acordes'], ['braco', 'Mapa do braço', 'braco', 'Todas as notas'],
  ['acordes', 'Acordes', 'acordes', 'Os essenciais'], ['musicas', 'Músicas', 'musicas', 'Sua lista'], ['progresso', 'Progresso', 'progresso', 'Andamentos e conquistas'],
];
VIEWS.inicio = () => {
  const meta = DB.cfg.meta, min = minutosHoje(), seg = diasSeguidos(), ul = ultimoTreino(), p = Math.min(100, Math.round(min / meta * 100));
  const m = ul && modelo(ul.id), v = m && volta(m, { ...cfgPadrao(m), ...ul.cfg });
  return `<div class="pilha">
    <section class="seq" aria-label="Sua sequência"><span class="seq-ic">${I.chama}</span>
      <span class="seq-tx"><b>${seg ? `${seg} ${seg === 1 ? 'dia seguido' : 'dias seguidos'}` : 'Comece sua sequência hoje'}</b><span class="apoio">${min} de ${meta} min hoje${min >= meta ? ' · meta batida' : ''}</span></span>
      <span class="seq-sem" aria-hidden="true">${semanaAtual().map(d => `<i class="${d.feito ? 'feito' : ''}${d.hoje ? ' hoje' : ''}" title="${d.nome}"></i>`).join('')}</span>
      <span class="barra-prog seq-barra" role="progressbar" aria-label="Meta de hoje" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p}%"></span></span></section>
    ${v ? `<button type="button" class="continuar" data-tr-ultimo><span class="ct-ilu">${miniDesenho(v)}</span><span class="ld-tx"><small>Continuar · ${quando(ul.em)}</small><b>${esc(v.nome)}</b><small>${esc(v.sub ? v.sub + ' · ' : '')}${ul.bpm} bpm · ${(DURACOES.find(d => d[0] === ul.dur) || DURACOES[0])[2]} min</small></span><span class="ct-play">${I.play}</span></button>` : ''}
    <nav class="ladrilhos" aria-label="Menu">${MENU.map(([ir, nome, il, sub], i) => ladrilho({ ir, ilu: ILU[il], nome, sub, classe: i === 0 && !v ? 'destaque' : '' })).join('')}</nav>
  </div>`;
};

/* Treinos: categoria › nível › duração › lista, um toque por vez */
const contar = (cat, nivel) => MODELOS.filter(m => m.cat === cat && (!nivel || m.nivel === nivel)).length;
function miniDesenho(ex) {
  const ks = ex.notas.map(n => n[1]), a = Math.min(...ks), b = Math.max(...ks), C = Math.max(4, b - a + 1);
  const W = 92, H = 64, x = k => 8 + (k - a + .5) * ((W - 16) / C), y = c => 8 + (5 - c) * ((H - 16) / 5);
  let s = `<svg class="mini-braco" viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
  for (let c = 0; c < 6; c++) s += `<line x1="6" y1="${y(c)}" x2="${W - 6}" y2="${y(c)}" class="mi-l"/>`;
  for (let k = 0; k <= C; k++) s += `<line x1="${8 + k * ((W - 16) / C)}" y1="5" x2="${8 + k * ((W - 16) / C)}" y2="${H - 5}" class="mi-t"/>`;
  new Set(ex.notas.map(n => n[0] + ',' + n[1])).forEach(ch => { const [c, k] = ch.split(',').map(Number); s += `<circle cx="${x(k)}" cy="${y(c)}" r="4" class="mi-n${ex.raiz != null && pc(SOLTAS[c] + k) === ex.raiz ? ' raiz' : ''}"/>`; });
  return s + '</svg>';
}
VIEWS.treinos = () => {
  const [, cat, nv, dur] = caminho(), C = CATEGORIAS.find(c => c[0] === cat), N = NIVEIS.find(n => n[1] === nv), D = DURACOES.find(d => d[0] === dur);
  if (!C) return KitFacil.ui.cabecalho({ titulo: 'Treinos', sub: `${MODELOS.length} treinos, em 12 tons e em todo o braço. Escolha o que treinar.` })
    + `<div class="ladrilhos">${CATEGORIAS.map(([id, nome, d]) => ladrilho({ ir: 'treinos/' + id, ilu: ILU[id], nome, sub: d, selo: String(contar(id)) })).join('')}</div>`;
  const base = 'treinos/' + C[0];
  if (!N) return migalhas([['treinos', 'Treinos'], [null, C[1]]]) + KitFacil.ui.cabecalho({ titulo: C[1], sub: 'Escolha o nível.' })
    + `<div class="ladrilhos l1">${NIVEIS.map(([n, id, nome, d]) => ladrilho({ ir: `${base}/${id}`, ilu: iluNivel(n), nome, sub: d, selo: String(contar(C[0], n)), classe: 'largo' })).join('')}</div>`;
  const bn = `${base}/${N[1]}`;
  if (!D) return migalhas([['treinos', 'Treinos'], [base, C[1]], [null, N[2]]]) + KitFacil.ui.cabecalho({ titulo: C[1], sub: `${N[2]}. Escolha por quanto tempo.` })
    + `<div class="ladrilhos">${DURACOES.map(([id, nome, min, d]) => ladrilho({ ir: `${bn}/${id}`, ilu: iluDuracao(min), nome, sub: d, selo: `${min} min` })).join('')}</div>`;
  const L = MODELOS.filter(m => m.cat === C[0] && m.nivel === N[0]);
  return migalhas([['treinos', 'Treinos'], [base, C[1]], [bn, N[2]], [null, `${D[2]} min`]]) + KitFacil.ui.cabecalho({ titulo: C[1], sub: `${N[2]} · ${D[1].toLowerCase()}, ${D[2]} min: ${D[3].toLowerCase()}` })
    + `<div class="pilha"><button type="button" class="kf-btn kf-sec sortear" data-tr-sortear="${esc(L.map(m => m.id).join(' '))}" data-dur="${D[0]}">${I.sortear}Sortear um treino</button>
      <ul class="tr-lista">${L.map(m => { const v = volta(m, { ...cfgPadrao(m), ...((DB.cfg.trCfg || {})[m.id] || {}) }), b = melhorLimpo(m.id); return `<li><button type="button" class="tr-item" data-tr-modelo="${m.id}" data-dur="${D[0]}">${miniDesenho(v)}<span class="ld-tx"><b>${esc(m.nome)}</b><small>${esc(m.resumo)}${b ? ` · seu melhor: ${b} bpm` : ''}</small></span>${I.seta}</button></li>`; }).join('')}</ul></div>`;
};

/* Afinador: a nota, o ponteiro e as seis cordas para ouvir */
VIEWS.afinador = () => {
  const A = afinacao(), nomes = ['6ª', '5ª', '4ª', '3ª', '2ª', '1ª'];
  return KitFacil.ui.cabecalho({ titulo: 'Afinador', sub: 'Toque uma corda solta. O som é analisado aqui e não é gravado.' })
  + `<div class="pilha afin">
    <div class="af-palco" aria-live="polite">
      <svg class="af-medidor" viewBox="0 0 240 140" aria-hidden="true"><path d="M20 128a100 100 0 0 1 200 0" class="af-arco"/><path d="M104 30a100 100 0 0 1 32 0" class="af-certo"/>${Array.from({ length: 11 }, (_, i) => { const a = (-80 + i * 16) * Math.PI / 180; return `<line x1="${120 + 88 * Math.sin(a)}" y1="${128 - 88 * Math.cos(a)}" x2="${120 + (i === 5 ? 74 : 80) * Math.sin(a)}" y2="${128 - (i === 5 ? 74 : 80) * Math.cos(a)}" class="af-tick"/>`; }).join('')}<g id="af-ponteiro" class="af-ponteiro"><line x1="120" y1="128" x2="120" y2="40"/><circle cx="120" cy="128" r="7"/></g></svg>
      <div class="af-nota" id="af-nota">–</div>
      <p class="apoio" id="af-msg">Ligue o microfone e toque uma corda solta.</p>
    </div>
    <button type="button" class="kf-btn ${afinador.ligado ? 'kf-sec' : 'kf-pri'} af-ligar" id="af-ligar">${afinador.ligado ? I.stop + 'Desligar o microfone' : I.mic + 'Ligar o microfone'}</button>
    <div class="cordas" role="group" aria-label="Ouvir cada corda">${A.map((m, i) => `<button type="button" class="corda-bt" data-corda="${i}" aria-label="Ouvir a ${nomes[i]} corda, ${NOTAS[pc(m)]}"><b>${CIFRA[pc(m)]}</b><small>${nomes[i]}</small></button>`).join('')}</div>
    <div class="campo af-tipo"><label class="kf-rotulo" for="af-afinacao">Afinação</label><select id="af-afinacao">${AFINACOES.map(([k, n]) => `<option value="${k}"${(DB.cfg.afinacao || 'padrao') === k ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
  </div>`;
};
/* Metrônomo: o número grande, a batida e um botão */
VIEWS.metronomo = () => KitFacil.ui.cabecalho({ titulo: 'Metrônomo', sub: 'O tempo com o metrônomo ligado conta para a meta do dia.' })
  + `<div class="pilha palco-ferr">
    <div class="batidas grande" aria-hidden="true">${Array.from({ length: DB.cfg.compasso || 4 }, () => '<span></span>').join('')}</div>
    <div class="metro-bpm"><button type="button" class="kf-btn kf-sec" data-bpm="-5" aria-label="5 batidas a menos">−5</button><button type="button" class="kf-btn kf-sec" data-bpm="-1" aria-label="1 batida a menos">−1</button><output id="bpm" aria-live="polite">${DB.cfg.bpm}</output><button type="button" class="kf-btn kf-sec" data-bpm="1" aria-label="1 batida a mais">+1</button><button type="button" class="kf-btn kf-sec" data-bpm="5" aria-label="5 batidas a mais">+5</button></div>
    <input type="range" id="bpm-r" min="40" max="240" step="1" value="${DB.cfg.bpm}" aria-label="Batidas por minuto">
    <button type="button" class="play-grande${metro.ligado ? ' on' : ''}" id="metro" aria-label="${metro.ligado ? 'Parar o metrônomo' : 'Começar o metrônomo'}">${metro.ligado ? I.stop : I.play}</button>
    <div class="linha-ferr"><div class="kf-seg" role="group" aria-label="Compasso">${[2, 3, 4, 6].map(c => `<button type="button" data-compasso="${c}" aria-pressed="${(DB.cfg.compasso || 4) === c}">${c === 6 ? '6/8' : c + '/4'}</button>`).join('')}</div>
      <button type="button" class="kf-btn kf-sec" id="toque-ritmo">Toque no ritmo</button></div>
  </div>`;
/* Bateria: estilos ilustrados pelo próprio desenho do ritmo */
const iluRitmo = ([, , ppb, P]) => { const n = ppb * 4, w = 56 / n; return ilu(['h', 'c', 'b'].map((k, r) => Array.from({ length: n }, (_, i) => P[k].includes(i) ? `<rect x="${4 + i * w + .6}" y="${8 + r * 12}" width="${w - 1.2}" height="9" rx="1.5" class="${k === 'b' ? 'il-a' : 'il-n'}"/>` : '').join('')).join('') + '<path d="M4 44h56" class="il-l"/>'); };
VIEWS.bateria = () => KitFacil.ui.cabecalho({ titulo: 'Bateria', sub: 'Escolha o estilo e toque junto, no andamento do metrônomo.' })
  + `<div class="pilha palco-ferr">
    <div class="ladrilhos estilos" role="group" aria-label="Estilo">${ESTILOS_BATERIA.map(e => ladrilho({ attrs: `data-estilo="${e[0]}" aria-pressed="${DB.cfg.estilo === e[0]}"`, ilu: iluRitmo(e), nome: e[1], classe: 'peq' })).join('')}</div>
    <div class="batidas grande" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
    <div class="metro-bpm"><button type="button" class="kf-btn kf-sec" data-bpm="-5" aria-label="5 batidas a menos">−5</button><output id="bpm" aria-live="polite">${DB.cfg.bpm}</output><button type="button" class="kf-btn kf-sec" data-bpm="5" aria-label="5 batidas a mais">+5</button></div>
    <button type="button" class="play-grande${bateria.ligada ? ' on' : ''}" id="bat-ligar" aria-label="${bateria.ligada ? 'Parar a bateria' : 'Tocar a bateria'}">${bateria.ligada ? I.stop : I.play}</button>
  </div>`;
VIEWS.braco = () => KitFacil.ui.cabecalho({ titulo: 'Mapa do braço', sub: 'Toque numa nota para ouvir.' })
  + `<div class="pilha"><div class="kf-seg" role="group" aria-label="Notas mostradas"><button type="button" data-braco="naturais" aria-pressed="${DB.cfg.braco !== 'todas'}">Naturais</button><button type="button" data-braco="todas" aria-pressed="${DB.cfg.braco === 'todas'}">Todas</button></div>
    <div class="braco-wrap">${bracoSVG(DB.cfg.braco === 'todas')}</div></div>`;
VIEWS.acordes = () => KitFacil.ui.cabecalho({ titulo: 'Acordes', sub: 'Toque num acorde para ouvir. Os números são os dedos.' })
  + `<div class="acordes">${ACORDES.map(([nome, casas, dedos], i) => `<button type="button" class="acorde" data-acorde="${i}" aria-label="Ouvir ${esc(nome)}">${diagrama(casas, dedos, nome)}<b>${esc(nome)}</b></button>`).join('')}</div>
  <p class="apoio" style="margin-top:12px">X: não toque a corda. O: corda solta. A barra é a pestana.</p>`;

VIEWS.musicas = () => {
  const sub = subRota(), aba = sub === 'playlists' || PLAYLISTS.some(p => p.id === sub) ? 'playlists' : 'minhas';
  const minhas = DB.musicas.length
    ? `<div class="pilha">${ESTADOS_MUSICA.map(([k, l]) => { const M = DB.musicas.filter(m => m.estado === k); return M.length ? `<section class="pilha" style="gap:8px"><h3 class="sub-h">${l}</h3><ul class="musicas">${M.map(m => `<li><button type="button" class="musica" data-musica="${m.id}"><span><b>${esc(m.titulo)}</b>${m.artista ? `<span class="apoio"> · ${esc(m.artista)}</span>` : ''}</span>${I.seta}</button></li>`).join('')}</ul></section>` : ''; }).join('')}</div>`
    : KitFacil.ui.vazio({ titulo: 'Nenhuma música ainda', texto: 'Anote as músicas que você quer aprender ou adicione das playlists. Quando conseguir tocar, marque como <b>Já toco</b>.' });
  const tem = (t, a) => DB.musicas.some(m => m.titulo === t && m.artista === a);
  const abas = `<div class="kf-seg abas" role="group" aria-label="Mostrar"><button type="button" data-ir="musicas" aria-pressed="${aba === 'minhas'}">Minhas músicas</button><button type="button" data-ir="musicas/playlists" aria-pressed="${aba === 'playlists'}">Playlists</button></div>`;
  if (aba === 'minhas') return KitFacil.ui.cabecalho({ titulo: 'Músicas', sub: 'As músicas que você quer aprender e as que já toca.', criar: { rotulo: 'Nova música', attrs: 'data-musica-nova' } }) + abas + minhas;
  return KitFacil.ui.cabecalho({ titulo: 'Músicas', sub: 'Playlists recomendadas, da mais fácil à mais difícil.' }) + abas
    + `<div class="pilha">
    ${PLAYLISTS.map(pl => `<details class="cartao playlist" data-kf-secao id="${pl.id}"${sub === pl.id ? ' open' : ''}><summary><span class="pl-capa n${pl.nivel}" aria-hidden="true">${I.musicas}</span><span class="nivel-tt"><h2 style="font-size:18px">${esc(pl.nome)}</h2><span class="apoio" data-kf-secao-resumo>${pl.musicas.length} músicas · ${esc(pl.resumo)}</span></span></summary>
      <ol class="faixas">${pl.musicas.map(([t, a, por], i) => `<li><span class="fx-n">${i + 1}</span><span class="fx-t"><b>${esc(t)}</b><span class="apoio">${esc(a)} · ${esc(por)}</span></span><span class="fx-a"><a class="kf-btn kf-sec fx-l" href="${linkYoutube(t, a)}" target="_blank" rel="noopener" aria-label="Ver ${esc(t)} no YouTube">YouTube</a><a class="kf-btn kf-sec fx-l" href="${linkSpotify(t, a)}" target="_blank" rel="noopener" aria-label="Ouvir ${esc(t)} no Spotify">Spotify</a><button type="button" class="kf-btn ${tem(t, a) ? 'kf-sec' : 'kf-pri'} fx-l" data-pl-add="${esc(pl.id)}|${i}" ${tem(t, a) ? 'disabled' : ''}>${tem(t, a) ? 'Na lista' : 'Quero aprender'}</button></span></li>`).join('')}</ol></details>`).join('')}
    <p class="apoio">As músicas tocam no YouTube ou no Spotify: letras, cifras e gravações têm direitos autorais e não ficam dentro do app.</p></div>`;
};
// minutos de cada um dos últimos 7 dias, com a linha da meta
function graficoSemana() {
  const W = 336, H = 110, bw = W / 7, hoje = diaNum(), D = Array.from({ length: 7 }, (_, i) => hoje - 6 + i).map(n => ({ n, m: Math.round(minutosNoDia(n)) }));
  const max = Math.max(DB.cfg.meta * 1.25, ...D.map(d => d.m), 1), y = v => H - v / max * H, dia = n => new Date(n * DIA + 12 * 36e5).getDay();
  return `<svg viewBox="0 0 ${W} ${H + 34}" role="img" aria-label="Minutos praticados nos últimos 7 dias: ${D.map(d => `${SEMANA_NOME[dia(d.n)]} ${d.m}`).join(', ')}. Meta: ${DB.cfg.meta} por dia.">`
    + D.map((d, i) => { const h = Math.max(d.m ? 3 : 0, H - y(d.m)); return `<rect x="${i * bw + 7}" y="${H - h}" width="${bw - 14}" height="${h}" rx="4" class="${d.m >= DB.cfg.meta ? 'g-ok' : 'g-med'}"/><text x="${i * bw + bw / 2}" y="${H + 14}" text-anchor="middle" class="g-t">${d.m}</text><text x="${i * bw + bw / 2}" y="${H + 29}" text-anchor="middle" class="g-t${d.n === hoje ? ' g-hoje' : ''}">${d.n === hoje ? 'hoje' : SEMANA[dia(d.n)]}</text>`; }).join('')
    + `<line x1="0" y1="${y(DB.cfg.meta)}" x2="${W}" y2="${y(DB.cfg.meta)}" class="g-meta"/></svg>`;
}
VIEWS.progresso = () => {
  const aba = ['andamentos', 'conquistas'].includes(subRota()) ? subRota() : 'semana', total = DB.praticas.reduce((s, p) => s + p.min, 0);
  const abas = `<div class="kf-seg abas" role="group" aria-label="Mostrar">${[['semana', 'Semana'], ['andamentos', 'Andamentos'], ['conquistas', 'Conquistas']].map(([k, n]) => `<button type="button" data-ir="progresso${k === 'semana' ? '' : '/' + k}" aria-pressed="${aba === k}">${n}</button>`).join('')}</div>`;
  let corpo;
  if (aba === 'semana') corpo = `<div class="dados"><div class="dado"><b>${diasSeguidos()}</b><span class="apoio">dias seguidos</span></div><div class="dado"><b>${minutosSemana()}</b><span class="apoio">min em 7 dias</span></div><div class="dado"><b>${(total / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</b><span class="apoio">horas no total</span></div></div>
      <section class="cartao"><div class="grafico">${graficoSemana()}</div><p class="apoio">Minutos por dia. A linha tracejada é a meta de ${DB.cfg.meta} min; as barras escuras bateram a meta. Maior sequência: ${maiorSequencia()} dias.</p></section>`;
  else if (aba === 'andamentos') {
    const ids = [...new Set(T().map(t => t.id))].filter(id => modelo(id));
    corpo = ids.length ? `<ul class="andas cartao">${ids.map(id => { const m = modelo(id), b = melhorLimpo(id), X = T().filter(t => t.id === id), ul = X[X.length - 1], pr = Math.min(100, Math.round(b / m.alvo * 100)); return `<li><span><b>${esc(m.nome)}</b><span class="apoio">${esc(CATEGORIAS.find(c => c[0] === m.cat)[1])} · último ${ul.bpm} bpm · melhor limpo ${b || '–'} · meta ${m.alvo}</span></span><span class="barra-prog" style="width:80px" role="progressbar" aria-label="${esc(m.nome)}: melhor andamento em relação à meta" aria-valuenow="${pr}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pr}%"></span></span></li>`; }).join('')}</ul>`
      : KitFacil.ui.vazio({ titulo: 'Nenhum andamento ainda', texto: 'Termine um treino e diga se saiu limpo: o seu melhor andamento aparece aqui, com a meta.', acao: '<button type="button" class="kf-btn kf-pri" data-ir="treinos">Ir para os treinos</button>' });
  } else corpo = `<p class="apoio">${DB.conquistas.length} de ${CONQUISTAS.length} conquistas.</p><ul class="conquistas">${CONQUISTAS.map(([id, nome, como]) => { const c = temConquista(id); return `<li class="${c ? 'ganha' : ''}"><span class="cq-ic">${I.medalha}</span><span><b>${esc(nome)}</b><span class="apoio">${c ? `ganha ${quando(c.em)}` : esc(como)}</span></span></li>`; }).join('')}</ul>`;
  return KitFacil.ui.cabecalho({ titulo: 'Progresso', sub: 'Sua constância, seus andamentos e as conquistas.' }) + abas + `<div class="pilha">${corpo}</div>`;
};
VIEWS.ajustes = () => KitFacil.ajustes.html({
  produto: [{ id: 'pratica', titulo: 'Prática', icone: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>', resumo: `Meta de ${DB.cfg.meta} min por dia`,
    html: `<div class="kf-bloco"><h3>Meta diária</h3>
      <div class="campo"><label class="kf-rotulo" for="aj-meta">Minutos de prática por dia</label><select id="aj-meta">${[10, 15, 20, 30, 45, 60, 90].map(m => `<option value="${m}"${DB.cfg.meta === m ? ' selected' : ''}>${m} minutos</option>`).join('')}</select></div>
      <p class="apoio">Treinos, metrônomo e bateria contam para a meta.</p></div>` }],
});
// a Teoria leva aos treinos: a escala e a posição equivalentes no catálogo
function modeloDaTeoria() {
  const e = TEO.escala, d = Math.max(0, TEO.desenho);
  if (e === 'penta-menor') return ['esc:penta-menor', d];
  if (e === 'penta-maior') return ['esc:penta-maior', (d + 4) % 5];
  if (e === 'blues') return ['esc:blues', [0, 1, 2, 4, 5][d]];
  const m = MODELOS.find(x => x.cat === 'escalas' && x.escala === e && x.id !== 'esc:maior-3' && x.id !== 'esc:menor-3') || MODELOS.find(x => x.cat === 'escalas' && x.escala === e);
  return m ? [m.id, 0] : null;
}

const TEO = { raiz: 9, escala: 'penta-menor', rotulo: 'nota', desenho: -1, acRaiz: 0, acTipo: '', tom: 0 };
const TEORIA = [
  ['escalas', 'Escalas no braço', 'Todas as escalas e modos, em qualquer tom.'],
  ['acordes', 'Construtor de acordes', 'Monte um acorde e veja as notas no braço.'],
  ['circulo', 'Círculo das quintas', 'Os tons vizinhos e o campo harmônico.'],
  ['intervalos', 'Intervalos', 'A distância entre duas notas.'],
  ['ritmo', 'Ritmo e figuras', 'Quanto dura cada nota.'],
];
VIEWS.teoria = () => {
  const sec = parte(1), S = TEORIA.find(x => x[0] === sec);
  if (!S) return KitFacil.ui.cabecalho({ titulo: 'Teoria', sub: 'Escolha um assunto. Tudo desenhado no braço e pronto para ouvir.' })
    + `<div class="ladrilhos">${TEORIA.map(([id, n, d]) => ladrilho({ ir: 'teoria/' + id, ilu: ILU['te-' + id], nome: n, sub: d })).join('')}</div>`;
  const E = ESCALAS.find(e => e[0] === TEO.escala), notas = notasEscala(TEO.raiz, TEO.escala), pentas = TEO.escala.startsWith('penta') || TEO.escala === 'blues';
  const des = pentas && TEO.desenho >= 0 ? desenhosPenta(TEO.escala === 'penta-maior' ? pc(TEO.raiz + 9) : TEO.raiz)[TEO.desenho] : null;
  const acN = notasAcorde(TEO.acRaiz, TEO.acTipo), acT = TIPOS_ACORDE.find(t => t[0] === TEO.acTipo), campo = campoHarmonico(TEO.tom);
  const optRaiz = (sel) => NOTAS.map((n, i) => `<option value="${i}"${sel === i ? ' selected' : ''}>${n} (${CIFRA[i]})</option>`).join('');
  return migalhas([['teoria', 'Teoria'], [null, S[1]]]) + KitFacil.ui.cabecalho({ titulo: S[1], sub: S[2] })
  + `<div class="pilha">
    ${sec === 'escalas' ? `<section class="cartao te-sec" id="t-escalas">
      <div class="grade2"><div class="campo"><label class="kf-rotulo" for="te-raiz">Tônica</label><select id="te-raiz">${optRaiz(TEO.raiz)}</select></div>
      <div class="campo"><label class="kf-rotulo" for="te-esc">Escala</label><select id="te-esc">${ESCALAS.map(e => `<option value="${e[0]}"${TEO.escala === e[0] ? ' selected' : ''}>${e[1]}</option>`).join('')}</select></div></div>
      <p class="apoio">${esc(E[3])} Notas: <b>${notas.map(n => CIFRA[n]).join(' · ')}</b> · fórmula: ${E[2].map(i => GRAUS[i]).join(' ')}</p>
      <div class="kf-seg" role="group" aria-label="Rótulo das notas"><button type="button" data-te-rot="nota" aria-pressed="${TEO.rotulo === 'nota'}">Notas</button><button type="button" data-te-rot="grau" aria-pressed="${TEO.rotulo === 'grau'}">Graus</button></div>
      ${pentas ? `<div class="kf-opcoes desenhos" role="group" aria-label="Desenho da pentatônica"><button type="button" class="chip-est" data-te-des="-1" aria-pressed="${TEO.desenho < 0}">Braço inteiro</button>${[0, 1, 2, 3, 4].map(i => `<button type="button" class="chip-est" data-te-des="${i}" aria-pressed="${TEO.desenho === i}">Desenho ${i + 1}</button>`).join('')}</div>` : ''}
      <div class="braco-wrap" id="te-braco">${bracoMarcado({ notas, raiz: TEO.raiz, rotulo: TEO.rotulo, casas: 17, desenho: des, titulo: E[1] })}</div>
      <div class="legenda"><span class="lg raiz"></span>tônica<span class="lg"></span>outras notas da escala</div>
      <div class="te-acoes"><button type="button" class="kf-btn kf-sec" data-te-ouvir="escala">${I.play}Ouvir a escala</button>${modeloDaTeoria() ? `<button type="button" class="kf-btn kf-pri" data-te-treinar>${I.treinos}Treinar ${TEO.desenho >= 0 ? 'este desenho' : 'esta escala'}</button>` : ''}</div></section>` : ''}
    ${sec === 'acordes' ? `<section class="cartao te-sec" id="t-acordes">
      <div class="grade2"><div class="campo"><label class="kf-rotulo" for="ta-raiz">Fundamental</label><select id="ta-raiz">${optRaiz(TEO.acRaiz)}</select></div>
      <div class="campo"><label class="kf-rotulo" for="ta-tipo">Tipo</label><select id="ta-tipo">${TIPOS_ACORDE.map(t => `<option value="${t[0]}"${TEO.acTipo === t[0] ? ' selected' : ''}>${t[1]}${t[0] ? ' (' + t[0] + ')' : ''}</option>`).join('')}</select></div></div>
      <div class="ac-cifra"><b>${nomeAcorde(TEO.acRaiz, TEO.acTipo)}</b><span>${acT[2].map(i => `<span class="ac-g">${i === 14 ? '9' : GRAUS[i % 12]}<small>${CIFRA[pc(TEO.acRaiz + i)]}</small></span>`).join('')}</span></div>
      <div class="braco-wrap" id="ta-braco">${bracoMarcado({ notas: acN, raiz: TEO.acRaiz, rotulo: 'grau', casas: 15, titulo: 'Notas do acorde' })}</div>
      <p class="apoio">Todas as notas do acorde no braço: escolha uma de cada corda, perto umas das outras, e você tem uma forma do acorde.</p>
      <button type="button" class="kf-btn kf-sec" data-te-ouvir="acorde">${I.play}Ouvir o acorde</button></section>` : ''}
    ${sec === 'circulo' ? `<section class="cartao te-sec" id="t-circulo">
      <div class="circ-wrap">${circuloSVG(TEO.tom)}</div>
      <p class="apoio">Toque num tom. Por fora, os tons maiores; por dentro, a relativa menor (mesmas notas). Vizinhos no círculo combinam.</p>
      <div class="campo-h">${campo.map(c => `<button type="button" class="ch-it f-${c.funcao}" data-te-campo="${c.raiz}|${c.tipo}"><small>${c.grau}</small><b>${esc(c.triade)}</b><span>${esc(c.tetrade)}</span><em>${c.funcao}</em></button>`).join('')}</div>
      <p class="apoio">Toque num acorde para ouvir. Progressões que funcionam em ${NOTAS[TEO.tom]}: <b>I–V–vi–IV</b> (${[0, 4, 5, 3].map(i => campo[i].triade).join(' – ')}), <b>ii–V–I</b> (${[1, 4, 0].map(i => campo[i].triade).join(' – ')}), <b>I–IV–V</b> (${[0, 3, 4].map(i => campo[i].triade).join(' – ')}).</p></section>` : ''}
    ${sec === 'intervalos' ? `<section class="cartao te-sec" id="t-intervalos">
      <div class="intervalos">${INTERVALOS.map(([n, nome, desc]) => `<button type="button" class="int-it" data-te-int="${n}"><span class="int-barra" aria-hidden="true">${Array.from({ length: 13 }, (_, k) => `<i class="${k === 0 || k === n ? 'on' : k < n ? 'meio' : ''}"></i>`).join('')}</span><b>${nome}</b><span class="apoio">${n} ${n === 1 ? 'semitom' : 'semitons'} · ${desc}</span></button>`).join('')}</div></section>` : ''}
    ${sec === 'ritmo' ? `<section class="cartao te-sec" id="t-ritmo">
      <div class="figuras">${FIGURAS.map(([n, t]) => `<button type="button" class="fig-it" data-te-fig="${t}">${figuraSVG(t)}<b>${n}</b><span class="apoio">${t >= 1 ? t + (t === 1 ? ' tempo' : ' tempos') : t === .5 ? 'meio tempo' : '1/4 de tempo'} · ${Math.round(60 / DB.cfg.bpm * t * 1000)} ms a ${DB.cfg.bpm} bpm</span></button>`).join('')}</div>
      <p class="apoio">Num compasso 4/4 cabem 4 semínimas, 8 colcheias ou 16 semicolcheias. Toque numa figura para ouvir quatro tempos dela.</p></section>` : ''}
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
    const cp = DB.cfg.compasso || 4;
    if (a) while (metro.prox < a.currentTime + 0.12) { clique(metro.batida % cp === 0, metro.prox); const b = metro.batida % cp, atraso = Math.max(0, (metro.prox - a.currentTime) * 1000); setTimeout(() => pintarBatida(b), atraso); metro.prox += seg; metro.batida++; }
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
function pintarMetro() { const b = $('#metro'); if (b) { b.innerHTML = metro.ligado ? I.stop : I.play; b.setAttribute('aria-label', metro.ligado ? 'Parar o metrônomo' : 'Começar o metrônomo'); b.classList.toggle('on', metro.ligado); } }
function pintarBatida(k) { $$('.batidas span').forEach((s, i) => s.classList.toggle('on', i === k)); }
// toque no ritmo: a média dos últimos toques vira o andamento
const toques = [];
function tocarRitmo() { const t = performance.now(); if (toques.length && t - toques[toques.length - 1] > 2000) toques.length = 0; toques.push(t); if (toques.length > 5) toques.shift(); if (toques.length >= 2) { const m = (toques[toques.length - 1] - toques[0]) / (toques.length - 1); mudarBpm(60000 / m); } }
function mudarBpm(v) {
  DB.cfg.bpm = Math.max(40, Math.min(240, Math.round(v))); LS.set('db', DB);
  const o = $('#bpm'), r = $('#bpm-r'); if (o) o.textContent = DB.cfg.bpm; if (r) r.value = DB.cfg.bpm; const fg = $('#fig-ms'); if (fg) fg.textContent = Math.round(60000 / DB.cfg.bpm); $$('.bpm-v').forEach(x => x.textContent = DB.cfg.bpm);
  clearTimeout(mudarBpm.t); mudarBpm.t = setTimeout(commit, 600);
}
/* diagramas de acorde: 6 cordas, 4 casas; casas: -1 não toca, 0 solta */
const ACORDES = [['Mi menor', [0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0]], ['Lá menor', [-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0]], ['Ré menor', [-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1]],
  ['Mi maior', [0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]], ['Lá maior', [-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0]], ['Ré maior', [-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2]],
  ['Dó maior', [-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]], ['Sol maior', [3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3]], ['Mi 5 (power chord)', [0, 2, -1, -1, -1, -1], [0, 1, 0, 0, 0, 0]],
  ['Fá maior (pestana)', [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], 1]];
function tocarAcorde(casas) { const a = audio(); if (!a) return; const t = a.currentTime + .03; casas.forEach((k, s) => { if (k >= 0) tocarCorda(midiDe(s, k), t + s * .035, 1.8, .35); }); }
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
const AFINACOES = [['padrao', 'Padrão', [40, 45, 50, 55, 59, 64]], ['meio', 'Meio tom abaixo', [39, 44, 49, 54, 58, 63]], ['drop-d', 'Drop D', [38, 45, 50, 55, 59, 64]], ['tom', 'Um tom abaixo', [38, 43, 48, 53, 57, 62]]];
const afinacao = () => (AFINACOES.find(a => a[0] === DB.cfg.afinacao) || AFINACOES[0])[2];
function mostrarNota(f) {
  const n = notaDe(f), el = $('#af-nota'), pt = $('#af-ponteiro'), msg = $('#af-msg'); if (!el) return;
  const ok = Math.abs(n.cents) <= 5, m = 12 * Math.log2(f / 440) + 69, A = afinacao();
  el.textContent = n.cifra; el.classList.toggle('ok', ok);
  if (pt) pt.style.transform = `rotate(${Math.max(-50, Math.min(50, n.cents)) * 1.6}deg)`;
  // a corda mais perto do som, na afinação escolhida
  const k = A.reduce((b, x, i) => Math.abs(m - x) < Math.abs(m - A[b]) ? i : b, 0);
  $$('[data-corda]').forEach(b => b.classList.toggle('perto', +b.dataset.corda === k && Math.abs(m - A[k]) < 1.5));
  if (msg) msg.textContent = ok ? `${n.nome}: afinada` : n.cents < 0 ? `${n.nome}: baixa (${n.cents} cents). Aperte a tarraxa.` : `${n.nome}: alta (+${n.cents} cents). Afrouxe a tarraxa.`;
}
function pintarAfinador() { const b = $('#af-ligar'); if (b) { b.innerHTML = afinador.ligado ? I.stop + 'Desligar o microfone' : I.mic + 'Ligar o microfone'; b.classList.toggle('kf-sec', afinador.ligado); b.classList.toggle('kf-pri', !afinador.ligado); } if (!afinador.ligado) { const m = $('#af-msg'); if (m) m.textContent = 'Ligue o microfone e toque uma corda solta.'; const n = $('#af-nota'); if (n) { n.textContent = '–'; n.classList.remove('ok'); } const p = $('#af-ponteiro'); if (p) p.style.transform = 'rotate(0deg)'; $$('[data-corda]').forEach(x => x.classList.remove('perto')); } }


/* ================= janela do treino =================
   Duas vistas, uma de cada vez: o palco (braço, tablatura, relógio, andamento e o botão grande de tocar) e os ajustes
   (tom, posição, escala, combinação, figura, duração, subida do andamento, som). A sessão dura o tempo escolhido e
   passa pelas etapas do plano (posições e tons), uma por volta, no mesmo ritmo do relógio. */
const SUBIDAS = [[0, 'Manter o andamento'], [1, '+1 bpm a cada volta'], [2, '+2 bpm a cada volta'], [5, '+5 bpm a cada volta']];
const BPM_MIN = 30, BPM_MAX = 240;
function abrirTreino(id, op = {}) {
  const m = modelo(id); if (!m) return;
  const salvo = (DB.cfg.trCfg || {})[m.id] || {};
  let cfg = { ...cfgPadrao(m), ...salvo, ...(op.cfg || {}) }, dur = op.dur || DB.cfg.trDur || 'curto';
  let plano = planoSessao(m, cfg, dur), etapa = 0, ex = volta(m, plano[0]);
  let bpm = Math.max(BPM_MIN, Math.min(BPM_MAX, op.bpm || melhorLimpo(m.id) || m.bpm));
  const segs = () => (DURACOES.find(d => d[0] === dur) || DURACOES[0])[2] * 60;
  const sel = (id, ops, v, rot) => `<div class="campo"><label class="kf-rotulo" for="${id}">${rot}</label><select id="${id}">${ops.map(([k, l]) => `<option value="${esc(String(k))}"${String(v) === String(k) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
  const seg = (attr, ops, v, rot) => `<div class="campo"><span class="kf-rotulo" id="tr-${attr}-l">${rot}</span><div class="kf-seg" role="group" aria-labelledby="tr-${attr}-l">${ops.map(([k, l]) => `<button type="button" data-${attr}="${k}" aria-pressed="${String(v) === String(k)}">${l}</button>`).join('')}</div></div>`;
  const ajustesHTML = () => `
    ${m.usaTom ? sel('tr-raiz', NOTAS.map((n, i) => [i, `${n} (${CIFRA[i]})`]), cfg.raiz, 'Tom') : ''}
    ${m.trocaEscala ? sel('tr-esc', ESCALAS_SEQ.map(e => [e, nomeEscala(e)]), cfg.escala, 'Escala') : ''}
    ${m.regioes(cfg).length > 1 ? sel('tr-pos', m.regioes(cfg).map((r, i) => [i, r]), cfg.pos, m.usaTom ? 'Posição no braço' : 'Casa do dedo 1') : ''}
    ${m.temPerm && !m.variaPerm ? `<div class="campo"><span class="kf-rotulo" id="tr-perm-l">Ordem dos dedos</span><div class="perms" role="group" aria-labelledby="tr-perm-l">${PERMS.map(p => `<button type="button" class="perm" data-perm="${p}" aria-pressed="${p === cfg.perm}"><b>${permTexto(p)}</b></button>`).join('')}</div></div>` : ''}
    ${m.cat !== 'licks' && m.cat !== 'riffs' ? sel('tr-fig', FIGURAS_TREINO.map(([f, n, t]) => [f, `${n} · ${t}`]), cfg.fig, 'Figura') : ''}
    ${seg('dur', DURACOES.map(([k, n, min]) => [k, `${min} min`]), dur, 'Duração')}
    ${sel('tr-sobe', SUBIDAS, DB.cfg.trSobe || 0, 'Subir o andamento')}
    ${seg('rot', [['dedo', 'Dedos'], ['nota', 'Notas'], ...(m.usaTom ? [['grau', 'Graus']] : [])], cfg.rotulo || m.rotulo || 'nota', 'No braço, mostrar')}
    <div class="tr-op"><label class="kf-check"><input type="checkbox" id="tr-guia" ${DB.cfg.trGuia !== false ? 'checked' : ''}><span>Tocar o exemplo junto comigo</span></label>
      <label class="kf-check"><input type="checkbox" id="tr-metro" ${DB.cfg.trMetro !== false ? 'checked' : ''}><span>Metrônomo</span></label></div>
    <button type="button" class="kf-btn kf-pri" data-tr-pronto>${I.check}Pronto</button>`;
  KitFacil.dialogo.abrir({ titulo: ex.nome, sub: ex.sub, classe: 'kf-alto kf-largo', nome: 'treino',
    corpo: `<div class="tr-vista" id="tr-v-palco">
        <div class="tr-palco"><div class="tr-topo"><span class="tr-chip" id="tr-tempo" aria-label="Tempo que falta">${fmtTempo(segs())}</span><span class="tr-chip" id="tr-etapa">${plano.length > 1 ? `Etapa 1 de ${plano.length}` : 'Etapa única'}</span></div>
          <div class="tr-braco" id="tr-braco">${bracoTreino(ex)}</div><div class="tab-wrap" id="tr-tab">${tabSVG(ex)}</div><div class="tr-conta" id="tr-conta" aria-live="assertive"></div></div>
        ${m.temTec ? `<p class="tr-legenda">${Object.entries(TECNICAS).map(([k, t]) => `<b>${k}</b> ${t}`).join(' · ')}</p>` : ''}
        <div class="tr-ctrl"><div class="tr-bpm" role="group" aria-label="Andamento"><button type="button" class="kf-btn kf-sec" data-tr-bpm="-5" aria-label="5 batidas a menos">−5</button><button type="button" class="kf-btn kf-sec" data-tr-bpm="-1" aria-label="1 batida a menos">−1</button><span class="tr-bpm-v"><output id="tr-bpm">${bpm}</output><small>bpm</small></span><button type="button" class="kf-btn kf-sec" data-tr-bpm="1" aria-label="1 batida a mais">+1</button><button type="button" class="kf-btn kf-sec" data-tr-bpm="5" aria-label="5 batidas a mais">+5</button></div>
          <button type="button" class="play-grande" id="tr-ir" aria-label="Começar">${I.play}</button></div>
        <p class="tr-status" id="tr-status" aria-live="polite">Meta: ${m.alvo} bpm${melhorLimpo(m.id) ? ` · seu melhor limpo: ${melhorLimpo(m.id)} bpm` : ''}</p>
        <div class="tr-res" id="tr-res" hidden></div></div>
      <div class="tr-vista pilha" id="tr-v-ajustes" hidden></div>`,
    pe: `<button type="button" class="kf-btn kf-sec" id="tr-aj">${I.ajustes}Ajustes</button><button type="button" class="kf-btn kf-sec" id="tr-exemplo">${I.ouvir}Ouvir uma volta</button>`,
    aoFechar: () => { if (treino.tocando) treino.parar(); },
    aoMontar: d => {
      const vP = $('#tr-v-palco', d), vA = $('#tr-v-ajustes', d), tabW = $('#tr-tab', d), brW = $('#tr-braco', d), conta = $('#tr-conta', d), res = $('#tr-res', d), status = $('#tr-status', d), tempo = $('#tr-tempo', d), etp = $('#tr-etapa', d);
      let desenhado = null, tabN = [], brN = [], cur = null, ultI = -2, px = pxDe(ex), visitadas = new Set([0]);
      const titulo = e => { const h = $('.kf-dlg-cab h2', d), s = $('.kf-dlg-sub', d); if (h) h.textContent = e.nome; if (s) s.textContent = e.sub; };
      const desenhar = e => {
        const ch = JSON.stringify([e.id, e.cfg, e.rotulo]); if (desenhado === ch) return; desenhado = ch;
        brW.innerHTML = bracoTreino(e); tabW.innerHTML = tabSVG(e); tabW.scrollLeft = 0; px = pxDe(e);
        cur = $('.tab-cursor', tabW); tabN = $$('.tab-n', tabW); brN = [];
        $$('.nt', brW).forEach(g => g.dataset.i.split(' ').forEach(i => brN[+i] = g)); ultI = -2; titulo(e);
      };
      desenhar(ex);
      const setBpm = v => { bpm = Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(v))); $('#tr-bpm', d).textContent = bpm; };
      $$('[data-tr-bpm]', d).forEach(b => b.onclick = () => setBpm(bpm + +b.dataset.trBpm));
      const guardar = () => { DB.cfg.trCfg = { ...(DB.cfg.trCfg || {}), [m.id]: { raiz: cfg.raiz, pos: cfg.pos, fig: cfg.fig, escala: cfg.escala, perm: cfg.perm, rotulo: cfg.rotulo } }; DB.cfg.trDur = dur; commit(); };
      const replanejar = () => { plano = planoSessao(m, cfg, dur); etapa = 0; ex = volta(m, plano[0]); visitadas = new Set([0]); desenhar(ex); tempo.textContent = fmtTempo(segs()); etp.textContent = plano.length > 1 ? `Etapa 1 de ${plano.length}` : 'Etapa única'; };
      // ajustes: uma vista no lugar do palco; os campos mudam o treino na hora (sem tocar)
      const abrirAjustes = () => {
        if (treino.tocando) return;
        vA.innerHTML = ajustesHTML(); vP.hidden = true; vA.hidden = false; $('#tr-aj', d).setAttribute('aria-pressed', 'true'); KitFacil.movimento.entrar(vA, { de: 'tela' });
        const muda = () => { guardar(); replanejar(); };
        ligarAj();
        function ligarAj() {
          $('#tr-raiz', vA)?.addEventListener('change', e => { cfg.raiz = +e.target.value; muda(); });
          $('#tr-esc', vA)?.addEventListener('change', e => { cfg.escala = e.target.value; cfg.pos = 0; muda(); const p = $('#tr-pos', vA); if (p) { p.innerHTML = m.regioes(cfg).map((r, i) => `<option value="${i}">${esc(r)}</option>`).join(''); p.value = '0'; } });
          $('#tr-pos', vA)?.addEventListener('change', e => { cfg.pos = +e.target.value; muda(); });
          $('#tr-fig', vA)?.addEventListener('change', e => { cfg.fig = +e.target.value; muda(); });
          $('#tr-sobe', vA)?.addEventListener('change', e => { DB.cfg.trSobe = +e.target.value; commit(); });
          $$('[data-perm]', vA).forEach(b => b.onclick = () => { cfg.perm = b.dataset.perm; $$('[data-perm]', vA).forEach(x => x.setAttribute('aria-pressed', x === b)); muda(); });
          $$('[data-dur]', vA).forEach(b => b.onclick = () => { dur = b.dataset.dur; $$('[data-dur]', vA).forEach(x => x.setAttribute('aria-pressed', x === b)); muda(); });
          $$('[data-rot]', vA).forEach(b => b.onclick = () => { cfg.rotulo = b.dataset.rot; $$('[data-rot]', vA).forEach(x => x.setAttribute('aria-pressed', x === b)); muda(); });
          ['guia', 'metro'].forEach(k => $('#tr-' + k, vA).addEventListener('change', e => { DB.cfg['tr' + k[0].toUpperCase() + k.slice(1)] = e.target.checked; commit(); }));
          $('[data-tr-pronto]', vA).onclick = fecharAjustes;
        }
      };
      const fecharAjustes = () => { vA.hidden = true; vP.hidden = false; $('#tr-aj', d).setAttribute('aria-pressed', 'false'); KitFacil.movimento.entrar(vP, { de: 'tela' }); $('#tr-ir', d).focus(); };
      $('#tr-aj', d).onclick = () => vA.hidden ? abrirAjustes() : fecharAjustes();
      // a próxima volta: segue o relógio pelas etapas do plano, sem pular nenhuma
      let soUma = false;
      const proxima = (prev, tocado) => {
        if (!prev) return { ex, bpm };
        if (soUma || tocado >= segs() - .5) return null;
        const alvo = Math.floor(tocado / segs() * plano.length), nova = Math.min(plano.length - 1, Math.max(etapa, Math.min(etapa + 1, alvo)));
        if (nova !== etapa) { etapa = nova; visitadas.add(etapa); ex = volta(m, plano[etapa]); }
        const sobe = DB.cfg.trSobe || 0; if (sobe) setBpm(Math.min(m.alvo + 40, bpm + sobe));
        return { ex, bpm };
      };
      const aoRodada = r => { desenhar(r.ex); etp.textContent = plano.length > 1 ? `Etapa ${etapa + 1} de ${plano.length}` : `Volta ${r.n}`; status.textContent = `Volta ${r.n} · ${r.bpm} bpm`; };
      const aoQuadro = (r, beat, falta, i, decorrido) => {
        conta.textContent = falta ? String(falta) : ''; conta.classList.toggle('on', !!falta);
        if (!soUma) tempo.textContent = fmtTempo(segs() - decorrido);
        const x = 40 + Math.max(0, beat) * px; cur.setAttribute('x1', x); cur.setAttribute('x2', x);
        tabW.scrollLeft = Math.max(0, x - tabW.clientWidth * .35);
        if (i === ultI) return; ultI = i;
        tabN.forEach((g, k) => g.classList.toggle('agora', k === i));
        brN.forEach(g => g && g.classList.remove('agora', 'prox'));
        const prox = i < 0 ? 0 : i + 1;
        if (brN[prox] && prox < r.ex.notas.length) brN[prox].classList.add('prox');
        if (i >= 0 && brN[i]) { brN[i].classList.remove('prox'); brN[i].classList.add('agora'); }
      };
      const botoes = tocando => { const b = $('#tr-ir', d); b.innerHTML = tocando ? I.stop : I.play; b.setAttribute('aria-label', tocando ? 'Parar' : 'Começar'); b.classList.toggle('on', tocando); $('#tr-exemplo', d).disabled = tocando; $('#tr-aj', d).disabled = tocando; };
      const limpar = () => { conta.textContent = ''; conta.classList.remove('on'); tabN.forEach(g => g.classList.remove('agora')); brN.forEach(g => g && g.classList.remove('agora', 'prox')); ultI = -2; };
      const resultado = info => {
        const min = Math.round(info.segs / 6) / 10, concluido = info.tocado >= segs() - 1, P = [...visitadas].map(k => plano[k]);
        registrarPratica(min);
        const rec = { id: uid(), ex: m.id, cfg: { ...plano[0] }, dur, concluido, bpm: info.bpm, voltas: info.voltas, min, limpo: null, em: Date.now(),
          ...(m.temPerm ? { perms: [...new Set(P.map(c => c.perm || '1234'))] } : {}), ...(m.usaTom ? { posicoes: [...new Set(P.map(c => c.pos))], tons: [...new Set(P.map(c => c.raiz))].length } : {}) };
        DB.treinos.push(rec); commit(); conferirConquistas();
        res.innerHTML = `<p class="tr-fim"><b>${concluido ? 'Treino concluído.' : 'Treino parado.'}</b> ${info.voltas} ${info.voltas === 1 ? 'volta' : 'voltas'} · até ${info.bpm} bpm · ${fmtTempo(info.tocado)}</p>
          <p class="apoio">Saiu limpo, sem errar nem atrasar?</p>
          <div class="tr-limpo"><button type="button" class="kf-btn kf-pri" data-limpo="1">${I.check}Saiu limpo</button><button type="button" class="kf-btn kf-sec" data-limpo="0">Ainda não</button></div>`;
        res.hidden = false;
        $$('[data-limpo]', res).forEach(b => b.onclick = () => {
          const ok = b.dataset.limpo === '1'; rec.limpo = ok; commit(); conferirConquistas();
          const novo = ok ? Math.min(BPM_MAX, info.bpm + 5) : Math.max(BPM_MIN, info.bpm - 5); setBpm(novo);
          $('#tr-ir', d).focus(); // o foco não se perde quando os botões saem
          res.innerHTML = `<p class="tr-fim">${ok ? `Registrado: ${info.bpm} bpm limpo. Na próxima, ${novo} bpm.` : `Sem problema: repita a ${novo} bpm até sair limpo.`}</p>`;
        });
      };
      const rodar = exemplo => {
        if (treino.tocando) { treino.parar(); return; }
        res.hidden = true; soUma = exemplo; limpar(); botoes(true);
        if (!exemplo) { etapa = 0; visitadas = new Set([0]); ex = volta(m, plano[0]); }
        const ok = treinoTocar({ guia: exemplo || DB.cfg.trGuia !== false, metronomo: DB.cfg.trMetro !== false, proxima, aoRodada, aoQuadro,
          aoFim: info => {
            botoes(false); limpar(); if (!exemplo) tempo.textContent = fmtTempo(Math.max(0, segs() - info.tocado));
            status.textContent = `Meta: ${m.alvo} bpm${melhorLimpo(m.id) ? ` · seu melhor limpo: ${melhorLimpo(m.id)} bpm` : ''}`;
            if (exemplo || (info.segs < 15 && info.tocado < segs() - 1)) return; // menos de 15 s não conta, a não ser que a sessão tenha chegado ao fim
            if (info.voltas) resultado(info); else { registrarPratica(Math.round(info.segs / 6) / 10); conferirConquistas(); }
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
  corrigirEndereco();
  const r = rota(), chave = caminho().filter(Boolean).join('/') || 'inicio';
  if (r !== 'metronomo' && metro.ligado) metroParar();
  if (r !== 'afinador') afinadorDesligar();
  if (r !== 'bateria') bateriaParar();
  desenharNav();
  const m = $('#main'), trocou = telaAtual !== chave;
  m.innerHTML = VIEWS[r]();
  if (r === 'ajustes') KitFacil.ajustes.ligar(m);
  ligar(m, r);
  KitFacil.topo.atualizar();
  if (trocou) { KitFacil.movimento.entrar(m, { de: 'tela' }); window.scrollTo(0, 0); }
  if (r === 'musicas' && PLAYLISTS.some(p => p.id === subRota())) { const sec = $('#' + subRota()); if (sec) requestAnimationFrame(() => sec.scrollIntoView({ block: 'start', behavior: KitFacil.movimento.reduzido() ? 'auto' : 'smooth' })); }
  telaAtual = chave;
}
function ligar(m, r) {
  // treinos: abrir pelo modelo (com a duração escolhida), sortear da lista e continuar o último
  $$('[data-tr-modelo]', m).forEach(b => b.onclick = () => abrirTreino(b.dataset.trModelo, { dur: b.dataset.dur }));
  $$('[data-tr-sortear]', m).forEach(b => b.onclick = () => { const L = b.dataset.trSortear.split(' '); abrirTreino(L[Math.floor(Math.random() * L.length)], { dur: b.dataset.dur }); });
  $$('[data-tr-ultimo]', m).forEach(b => b.onclick = () => { const u = ultimoTreino(); if (u) abrirTreino(u.id, { cfg: u.cfg, dur: u.dur, bpm: u.bpm }); });
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
  if (r === 'braco') {
    $$('[data-braco]', m).forEach(b => b.onclick = () => { DB.cfg.braco = b.dataset.braco; commit(); $$('[data-braco]', m).forEach(x => x.setAttribute('aria-pressed', x === b)); const w = $('.braco-wrap', m); w.innerHTML = bracoSVG(DB.cfg.braco === 'todas'); KitFacil.movimento.entrar(w, { de: 'tela' }); });
    const toca = g => { const [c, k] = g.dataset.nota.split(',').map(Number); tocarNota(freqDe(c, k), 1.4); g.classList.add('tocou'); setTimeout(() => g.classList.remove('tocou'), 400); };
    $('.braco-wrap', m).addEventListener('click', e => { const g = e.target.closest('[data-nota]'); if (g) toca(g); });
    $('.braco-wrap', m).addEventListener('keydown', e => { const g = e.target.closest('[data-nota]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toca(g); } });
  }
  if (r === 'acordes') $$('[data-acorde]', m).forEach(b => b.onclick = () => tocarAcorde(ACORDES[+b.dataset.acorde][1]));
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
  bateriaLigar(DB.cfg.estilo, () => DB.cfg.bpm, b => { $$('.batidas span', m).forEach((x, i) => x.classList.toggle('on', i === b)); });
}
function ligarTeoria(m) {
  const muda = (k, v) => { TEO[k] = v; redesenhar(); };
  $('#te-raiz', m)?.addEventListener('change', e => muda('raiz', +e.target.value));
  $('#te-esc', m)?.addEventListener('change', e => { TEO.desenho = -1; muda('escala', e.target.value); });
  $('#ta-raiz', m)?.addEventListener('change', e => muda('acRaiz', +e.target.value));
  $('#ta-tipo', m)?.addEventListener('change', e => muda('acTipo', e.target.value));
  $$('[data-te-rot]', m).forEach(b => b.onclick = () => muda('rotulo', b.dataset.teRot));
  $$('[data-te-des]', m).forEach(b => b.onclick = () => muda('desenho', +b.dataset.teDes));
  $('[data-te-treinar]', m)?.addEventListener('click', () => { const [id, pos] = modeloDaTeoria(); abrirTreino(id, { cfg: { raiz: TEO.raiz, pos } }); });
  const a = () => audio();
  $$('[data-te-ouvir]', m).forEach(b => b.onclick = () => {
    const ctx = a(); if (!ctx) return; const t = ctx.currentTime + .05;
    if (b.dataset.teOuvir === 'escala') { const base = 48 + TEO.raiz, iv = ESCALAS.find(e => e[0] === TEO.escala)[2]; [...iv, 12].forEach((i, k) => tocarCorda(base + i, t + k * .32, .5)); }
    else { const base = 48 + TEO.acRaiz, iv = TIPOS_ACORDE.find(x => x[0] === TEO.acTipo)[2]; iv.forEach((i, k) => { tocarCorda(base + i, t + k * .12, 2); }); }
  });
  $('.circ-wrap', m)?.addEventListener('click', e => { const g = e.target.closest('[data-tom]'); if (g) muda('tom', +g.dataset.tom); });
  $('.circ-wrap', m)?.addEventListener('keydown', e => { const g = e.target.closest('[data-tom]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); muda('tom', +g.dataset.tom); } });
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
  privacidade: ['Os treinos, os andamentos, as conquistas, as músicas e o tempo de prática ficam guardados neste aparelho.', 'O som dos treinos, do metrônomo, da bateria, dos acordes e das notas é gerado aqui no aparelho.', 'O afinador usa o microfone só enquanto está ligado, com a sua permissão: o som é analisado em memória, não é gravado nem enviado.'],
  abrirAjustes: secao => { if (rota() !== 'ajustes') ir('ajustes'); else if (!secao) history.back(); },
  emAjustes: () => rota() === 'ajustes',
  copia: { descricao: 'Baixe um arquivo com os treinos, as músicas e o tempo de prática.',
    baixar: () => KitFacil.copia.baixar({ db: DB }, 1),
    restaurar: async f => { const j = await KitFacil.copia.ler(f); if (!j || !j.dados || !j.dados.db) { KitFacil.avisar('Esse arquivo não é uma cópia do Guitarra Fácil.'); return; } DB = { ...vazio(), ...j.dados.db }; commit(); snapTodos(); render(); KitFacil.avisar('Cópia restaurada.'); } },
  novidades: [{ versao: '0.5.0', itens: ['Cada função na sua tela: Início com menu de botões grandes, Treinos, Afinador, Teoria e, em Mais, Metrônomo, Bateria, Mapa do braço, Acordes, Músicas e Progresso.', `Catálogo com ${MODELOS.length} treinos em escalas, sequências, arpejos, licks, riffs e técnica, nos 12 tons e em todo o braço.`, 'Escolha um toque por vez: categoria, nível (iniciante, intermediário, avançado) e duração (2, 5, 10 ou 20 minutos).', 'Treinos longos percorrem as posições do braço e os tons sozinhos, com relógio na tela.', 'Janela do treino mais limpa: braço, tablatura, andamento e um botão grande; o resto fica em Ajustes.', 'Afinador com ponteiro, a corda mais perto e outras afinações; metrônomo com compasso e toque no ritmo; acordes para ouvir.'] }, { versao: '0.4.0', itens: ['O app agora é feito de treinos: sem trilha de aulas, sem teste de nível e sem professor.', 'Treino com o braço desenhado: a nota da vez acende, a próxima fica marcada e a tablatura rola junto.', 'Cromático 1-2-3-4 com as 24 combinações dos dedos: escolha a casa, as cordas e a figura, ou siga, sorteie e suba de casa a cada volta.', 'Escalas nos cinco desenhos, em qualquer tom, e um botão Treinar na Teoria.', 'Andamento de 1 em 1 ou de 5 em 5 bpm, e subida automática a cada volta.', 'Sequência de dias, a semana na tela Hoje, resumo da semana e 13 conquistas.'] }, { versao: '0.3.0', itens: ['Treinos com som e tablatura rolando, Teoria com o braço desenhado, bateria de acompanhamento e playlists recomendadas.'] }, { versao: '0.2.0', itens: ['Afinador pelo microfone, mapa das notas no braço e dez acordes. Ícone novo: o pedal de efeito.'] }, { versao: '0.1.0', itens: ['Primeira versão em testes: metrônomo, notas para afinar, primeiros acordes e lista de músicas.'] }],
  // sem boas-vindas do Kit: o Início já é o menu de tudo
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

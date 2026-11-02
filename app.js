/* Guitarra Fácil · app web (PWA) do Projeto Integrador.
   Treinos de guitarra elétrica com o braço desenhado. Cada função tem a sua tela: Início (menu), Treinos (categoria,
   nível, duração e lista, um toque por vez), Afinador, Teoria, Metrônomo, Bateria, Mapa do braço, Acordes, Músicas e
   Progresso. Tudo fica neste aparelho; a sincronização opcional e a moldura vêm do Kit Fácil (comum/). */
'use strict';
const VERSAO = '0.10.0';
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
  solos: null, dia: null, favoritos: null,
  'te-escalas': ilu(fret + '<circle cx="12.5" cy="21" r="3.2" class="il-a"/><circle cx="25.5" cy="15" r="3.2" class="il-n"/><circle cx="25.5" cy="27" r="3.2" class="il-n"/><circle cx="38.5" cy="33" r="3.2" class="il-n"/><circle cx="38.5" cy="21" r="3.2" class="il-n"/><circle cx="51.5" cy="27" r="3.2" class="il-n"/>'),
  'te-acordes': ilu('<path d="M8 14h48M8 22h48M8 30h48M8 38h48" class="il-l"/><circle cx="32" cy="34" r="4.4" class="il-a"/><circle cx="32" cy="26" r="4.4" class="il-n"/><circle cx="32" cy="18" r="4.4" class="il-n"/>'),
  'te-circulo': ilu('<circle cx="32" cy="24" r="19" class="il-f il-l"/>' + Array.from({ length: 12 }, (_, i) => { const a = (i * 30 - 90) * Math.PI / 180; return `<circle cx="${(32 + 15 * Math.cos(a)).toFixed(1)}" cy="${(24 + 15 * Math.sin(a)).toFixed(1)}" r="${i ? 2 : 3.4}" class="${i ? 'il-n' : 'il-a'}"/>`; }).join('') + '<circle cx="32" cy="24" r="6" class="il-l"/>'),
  'te-intervalos': ilu('<path d="M8 40h48" class="il-l"/><circle cx="16" cy="34" r="5" class="il-n"/><circle cx="48" cy="18" r="5" class="il-a"/><path d="M19 29C26 14 36 10 43 15" class="il-l il-g"/>'),
  'te-ritmo': ilu('<ellipse cx="14" cy="36" rx="6" ry="4.4" class="il-n"/><path d="M19.5 35V10" class="il-l il-g"/><ellipse cx="34" cy="36" rx="6" ry="4.4" class="il-n"/><ellipse cx="50" cy="32" rx="6" ry="4.4" class="il-a"/><path d="M39.5 35V12h16v19" class="il-l il-g"/><path d="M39.5 12h16" class="il-l il-g"/>'),
};
ILU.solos = ILU.licks; ILU.escalas = ILU.escalas || ILU['te-escalas'];
ILU.dia = ilu('<rect x="10" y="8" width="44" height="34" rx="4" class="il-f il-l"/><path d="M10 17h44M20 4v8M44 4v8" class="il-l il-g"/><path d="M32 22c1 4 6 5 6 10a6 6 0 0 1-12 0c0-3 2-4 2.5-6 1 1.6 1.6 2.4 2.8 2.5-.2-2.8-.4-4.3.7-6.5z" class="il-a"/>');
ILU.plano = ilu('<rect x="8" y="8" width="48" height="34" rx="4" class="il-f il-l"/><path d="M8 17h48" class="il-l il-g"/>' + [0, 1, 2, 3].map(i => `<rect x="${13 + i * 11}" y="${37 - (i + 1) * 4.5}" width="7" height="${(i + 1) * 4.5}" rx="1.5" class="${i === 3 ? 'il-a' : 'il-n'}"/>`).join(''));
ILU.favoritos = ilu('<path d="M32 6l7.6 15.4 17 2.5-12.3 12 2.9 16.9L32 44.8l-15.2 8 2.9-16.9-12.3-12 17-2.5z" class="il-a" transform="scale(.85) translate(5.6 0)"/>');
const iluNivel = n => ilu([0, 1, 2].map(i => `<rect x="${14 + i * 14}" y="${30 - i * 9}" width="10" height="${12 + i * 9}" rx="2" class="${i < n ? (i === n - 1 ? 'il-a' : 'il-n') : 'il-f il-l'}"/>`).join(''));
const iluDuracao = min => { const f = { 2: .1, 5: .25, 10: .5, 20: 1 }[min], a = f * 2 * Math.PI - Math.PI / 2, x = 32 + 17 * Math.cos(a), y = 25 + 17 * Math.sin(a); return ilu(`<circle cx="32" cy="25" r="17" class="il-f il-l"/>${f >= 1 ? '<circle cx="32" cy="25" r="17" class="il-a"/>' : `<path d="M32 25V8A17 17 0 ${f > .5 ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)}z" class="il-a"/>`}<circle cx="32" cy="25" r="2.5" class="il-n"/>`); };
const ESTADOS_MUSICA = [['quero', 'Quero aprender'], ['aprendendo', 'Aprendendo'], ['toco', 'Já toco']];


/* ================= dados ================= */
// coleções sincronizadas registro a registro (a mudança mais recente vence), como nos outros apps da família
// feitas e andamentos vêm da versão com aulas (até a 0.3.0): continuam guardados e sincronizados, mas não aparecem
const COLS = ['feitas', 'musicas', 'praticas', 'andamentos', 'treinos', 'conquistas', 'favoritos'];
const vazio = () => ({ v: 1, cfg: { meta: 20, bpm: 80, estilo: 'rock' }, feitas: [], musicas: [], praticas: [], andamentos: [], treinos: [], conquistas: [], favoritos: [] });
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
const pacote = () => ({ v: 1, cfg: DB.cfg, feitas: DB.feitas, musicas: DB.musicas, praticas: DB.praticas, andamentos: DB.andamentos, treinos: DB.treinos, conquistas: DB.conquistas, favoritos: DB.favoritos, st: SY.estado.st, del: SY.estado.del });

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
const INTERNAS = ['dia', 'favoritos', 'plano', 'caminho']; // telas que se abrem pelo Início
const rota = () => { const r = parte(0) || 'inicio'; return NAV.some(n => n[0] === r) || r === 'ajustes' || INTERNAS.includes(r) ? r : 'inicio'; };
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
const tituloDe = m => m.cat === 'escalas' ? m.nome : m.cat === 'caminho' ? `${m.nome} · ${etapaDe(m.sub).nome}` : `${m.nome} · ${m.cat === 'tecnica' ? TECNICAS_TREINO.find(t => t.id === m.sub).nome : estiloDe(m.sub).nome}`;

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

/* ================= telas ================= */
const VIEWS = {};
/* o caminho de quem nunca tocou: um passo conta quando sai limpo; quem já toca pula etapas (DB.cfg.caminhoDe) */
const passoFeito = id => DB.treinos.some(t => t.ex === id && limpo(t));
const caminhoEstado = () => { const de = DB.cfg.caminhoDe || 0; return CAMINHO.map((e, i) => { const feitos = i < de ? e.ids.length : e.ids.filter(passoFeito).length; return { e, i, feitos, total: e.ids.length, feita: feitos === e.ids.length, pulada: i < de }; }); };
const proximoPasso = () => { const de = DB.cfg.caminhoDe || 0; for (let i = de; i < CAMINHO.length; i++) { const e = CAMINHO[i], id = e.ids.find(x => !passoFeito(x)); if (id) return { e, i, id, n: e.ids.indexOf(id) + 1 }; } return null; };
function escolherNivelCaminho() {
  const ops = [[0, 1, 'Nunca toquei', 'Começar do primeiro passo'], [3, 2, 'Sei alguns acordes', 'Começar nos primeiros riffs'], [CAMINHO.length, 3, 'Já toco músicas', 'Ir direto ao treino do dia']];
  KitFacil.dialogo.abrir({ titulo: 'Onde você quer começar?', sub: 'Dá para mudar depois: o caminho continua no Início.', nome: 'caminho-nivel',
    corpo: `<div class="ladrilhos l1">${ops.map(([de, n, nome, sub]) => ladrilho({ attrs: `data-caminho-de="${de}"`, ilu: iluNivel(n), nome, sub, classe: 'largo' })).join('')}</div>`,
    aoMontar: d => $$('[data-caminho-de]', d).forEach(b => b.onclick = () => { DB.cfg.caminhoDe = +b.dataset.caminhoDe; LS.set('visto', true); commit(); KitFacil.dialogo.fechar(); render(); KitFacil.avisar(+b.dataset.caminhoDe >= CAMINHO.length ? 'Pronto: o Início mostra o treino do dia.' : `Pronto: você começa em ${CAMINHO[+b.dataset.caminhoDe].nome}.`); }) });
}
const listaCaminho = (est, atual) => `<ol class="cam-lista">${est.map(({ e, i, feitos, total, feita, pulada }) => `<li class="${feita ? 'feita' : ''}${i === atual ? ' atual' : ''}"><button type="button" data-ir="caminho/${i + 1}"><span class="cam-n" aria-hidden="true">${feita ? I.check : i + 1}</span><span class="ld-tx"><b>${esc(e.nome)}</b><small>${pulada ? 'Pulada' : feita ? 'Feita' : i === atual ? `Você está aqui · ${feitos} de ${total} passos` : `${feitos} de ${total} passos`}</small></span>${I.seta}</button></li>`).join('')}</ol>`;
// Início: a sequência numa linha e, em destaque, o que fazer agora: o próximo passo do caminho ou o treino do dia
const ATALHOS = [['favoritos', 'Favoritos', 'favoritos', () => DB.favoritos.length ? `${DB.favoritos.length} ${DB.favoritos.length === 1 ? 'treino' : 'treinos'}` : 'Marque com a estrela'],
  ['plano', 'Plano de 4 semanas', 'plano', () => { const p = planoAtual(); return p && !p.fim ? `Semana ${semanaDoPlano(p)} de 4 · ${progressoPlano(p)[0]}/16` : 'Uma meta, quatro semanas'; }]];
VIEWS.inicio = () => {
  const meta = DB.cfg.meta, min = minutosHoje(), seg = diasSeguidos(), ul = ultimoTreino(), p = Math.min(100, Math.round(min / meta * 100));
  const m = ul && modelo(ul.id), v = m && volta(m, { ...cfgPadrao(m), ...ul.cfg }), px = proximoPasso();
  const seqHTML = `<section class="seq" aria-label="Sua sequência"><span class="seq-ic">${I.chama}</span>
      <span class="seq-tx"><b>${seg ? `${seg} ${seg === 1 ? 'dia seguido' : 'dias seguidos'}` : 'Comece sua sequência hoje'}</b><span class="apoio">${min} de ${meta} min hoje${min >= meta ? ' · meta batida' : ''}</span></span>
      <span class="seq-sem" aria-hidden="true">${semanaAtual().map(d => `<i class="${d.feito ? 'feito' : ''}${d.hoje ? ' hoje' : ''}" title="${d.nome}"></i>`).join('')}</span>
      <span class="barra-prog seq-barra" role="progressbar" aria-label="Meta de hoje" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p}%"></span></span></section>`;
  const diaHTML = `<button type="button" class="dia-hero" data-ir="dia"><span class="ld-ilu">${ILU.dia}</span><span class="ld-tx"><small>Treino do dia</small><b>Técnica, riff, solo e uma linha longa</b><small>Quatro treinos seguidos, no seu nível</small></span><span class="ct-play">${I.play}</span></button>`;
  const atalhos = extra => `<nav class="ladrilhos" aria-label="Atalhos">${[...extra, ...ATALHOS].map(([ir, nome, il, sub]) => ladrilho({ ir, ilu: ILU[il], nome, sub: sub() })).join('')}</nav>`;
  if (px) {
    const mp = modelo(px.id), vp = volta(mp, cfgPadrao(mp));
    return `<div class="pilha">${seqHTML}
    <button type="button" class="continuar passo-hero" data-tr-modelo="${px.id}"><span class="ct-ilu">${miniDesenho(vp)}</span><span class="ld-tx"><small>Seu próximo passo · ${px.n} de ${px.e.ids.length} · ${esc(px.e.nome)}</small><b>${esc(mp.nome)}</b><small>${esc(mp.resumo)}</small></span><span class="ct-play">${I.play}</span></button>
    <section class="cartao caminho" aria-labelledby="cam-t"><h2 id="cam-t">Seu caminho</h2>${listaCaminho(caminhoEstado(), px.i)}
      <button type="button" class="kf-btn kf-sec cam-pular" data-caminho-pular>Já toco: escolher onde começar</button></section>
    ${atalhos([['dia', 'Treino do dia', 'dia', () => 'Para quem já toca']])}
  </div>`;
  }
  return `<div class="pilha">${seqHTML}${diaHTML}
    ${v ? `<button type="button" class="continuar" data-tr-ultimo><span class="ct-ilu">${miniDesenho(v)}</span><span class="ld-tx"><small>Continuar · ${quando(ul.em)}</small><b>${esc(tituloDe(m))}</b><small>${esc(v.sub)} · ${ul.bpm} bpm</small></span>${I.seta}</button>` : ''}
    ${atalhos([['caminho', 'Caminho do iniciante', 'treinar', () => 'Rever os primeiros passos']])}
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
  if (!C) return KitFacil.ui.cabecalho({ titulo: 'Treinos', sub: `${MODELOS.length.toLocaleString('pt-BR')} treinos de rock e metal, em três níveis e quatro tamanhos.` })
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
    const ids = [...new Set(T().map(t => t.id))].filter(id => modelo(id)).slice(-40).reverse();
    corpo = ids.length ? `<ul class="andas cartao">${ids.map(id => { const m = modelo(id), b = melhorLimpo(id), X = T().filter(t => t.id === id), ul = X[X.length - 1], pr = Math.min(100, Math.round(b / m.alvo * 100)); return `<li><span><b>${esc(tituloDe(m))}</b><span class="apoio">${esc((CATEGORIAS.find(c => c[0] === m.cat) || [0, 'Caminho do iniciante'])[1])} · último ${ul.bpm} bpm · melhor limpo ${b || '–'} · meta ${m.alvo}</span></span><span class="barra-prog" style="width:80px" role="progressbar" aria-label="${esc(m.nome)}: melhor andamento em relação à meta" aria-valuenow="${pr}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pr}%"></span></span></li>`; }).join('')}</ul>` + '<p class="apoio">Melhor limpo é o andamento que você marcou como "Saiu limpo". O app registra o que você praticou, mas não mede a execução.</p>'
      : KitFacil.ui.vazio({ titulo: 'Nenhum andamento ainda', texto: 'Termine um treino e diga se saiu limpo: o seu melhor andamento aparece aqui, com a meta.', acao: '<button type="button" class="kf-btn kf-pri" data-ir="treinos">Ir para os treinos</button>' });
  } else corpo = `<p class="apoio">${ganhas()} de ${CONQUISTAS.length} conquistas.</p><ul class="conquistas">${CONQUISTAS.map(([id, nome, como]) => { const c = temConquista(id); return `<li class="${c ? 'ganha' : ''}"><span class="cq-ic">${I.medalha}</span><span><b>${esc(nome)}</b><span class="apoio">${c ? `ganha ${quando(c.em)}` : esc(como)}</span></span></li>`; }).join('')}</ul>`;
  return KitFacil.ui.cabecalho({ titulo: 'Progresso', sub: 'Sua constância, seus andamentos e as conquistas.' }) + abas + `<div class="pilha">${corpo}</div>`;
};
VIEWS.ajustes = () => KitFacil.ajustes.html({
  produto: [{ id: 'pratica', titulo: 'Prática', icone: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>', resumo: `Meta de ${DB.cfg.meta} min por dia`,
    html: `<div class="kf-bloco"><h3>Meta diária</h3>
      <div class="campo"><label class="kf-rotulo" for="aj-meta">Minutos de prática por dia</label><select id="aj-meta">${[10, 15, 20, 30, 45, 60, 90].map(m => `<option value="${m}"${DB.cfg.meta === m ? ' selected' : ''}>${m} minutos</option>`).join('')}</select></div>
      <p class="apoio">Treinos, metrônomo e bateria contam para a meta.</p></div>` }],
  extras: { sobre: `<div class="kf-bloco"><h3>Sons</h3><p class="apoio">Guitarra, bateria e metrônomo do banco Fluid (R3), de Frank Wen (2000–2002, 2008), com a versão mono de Michael Cowgill (2014–2016), sob a licença MIT. A licença completa acompanha o app, no arquivo <a href="sons/LICENCA-FluidR3.txt" target="_blank" rel="noopener">sons/LICENCA-FluidR3.txt</a>.</p></div>` },
});
// a Teoria leva aos treinos: a escala e a posição equivalentes no catálogo
function modeloDaTeoria() {
  const e = TEO.escala, d = Math.max(0, TEO.desenho);
  const m = MODELOS.find(x => x.cat === 'escalas' && x.grupo === 'Escala' && x.escala === e);
  if (!m) return null;
  return [m.id, e === 'blues' ? [0, 1, 2, 4, 5][d] : d];
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
const audio = () => { if (!ctxAudio) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctxAudio = new C(); somPreparar(ctxAudio); } if (ctxAudio.state === 'suspended') ctxAudio.resume(); return ctxAudio; };
function tocarNota(hz, dur = 2.2) {
  const a = audio(); if (!a) return;
  tocarCorda(Math.round(12 * Math.log2(hz / 440) + 69), a.currentTime + .01, Math.min(dur, 1.8));
}
const metro = { ligado: false, t: null, prox: 0, batida: 0, inicio: 0 };
function clique(acento, quando) {
  const a = audio(); if (!a) return;
  somPeca(a, acento ? 'metronomo-forte' : 'metronomo', quando, (typeof treino !== 'undefined' && treino.saida) || somMestre(a));
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
const afinacao = () => afinacaoDe(DB.cfg.afinacao || 'padrao')[2];
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


/* ================= plano de 4 semanas =================
   uma técnica, um nível e uma meta de andamento; o caminho do andamento de hoje até a meta dividido em quatro semanas,
   cada uma com quatro treinos daquela técnica (curto, moderado, longo e muito longo). Um treino da semana está feito
   quando sai limpo no andamento da semana ou acima, depois do começo do plano. */
const planoAtual = () => DB.cfg.plano || null;
function semanasDoPlano(p) {
  const t = TAMANHOS.map(x => x[0]);
  return [1, 2, 3, 4].map(w => ({ n: w, bpm: Math.round(p.ini + (p.meta - p.ini) * w / 4), treinos: t.map(tam => `tecnica:${p.tec}:${p.nivel}:${tam}:${(w - 1) % N_POR_LISTA}`) }));
}
const feitoNoPlano = (id, bpm, desde) => DB.treinos.some(t => t.ex === id && limpo(t) && t.bpm >= bpm && t.em >= desde);
const semanaDoPlano = p => Math.min(4, Math.floor((diaNum() - diaNum(p.em)) / 7) + 1);
const progressoPlano = p => { const S = semanasDoPlano(p); let f = 0; S.forEach(s => s.treinos.forEach(id => { if (feitoNoPlano(id, s.bpm, p.em)) f++; })); return [f, 16]; };
const andamentoInicial = (tec, nivel) => { const L = MODELOS.filter(m => m.cat === 'tecnica' && m.sub === tec && m.nivel === nivel); return Math.max(L[0].bpm, ...L.map(m => melhorLimpo(m.id))); };
function verPlano() { const p = planoAtual(); if (!p || p.fim) return; const [f, t] = progressoPlano(p); if (f >= t) { DB.cfg.plano = { ...p, fim: Date.now() }; DB.cfg.planosFeitos = (DB.cfg.planosFeitos || 0) + 1; commit(); conferirConquistas(); KitFacil.avisar('Plano de 4 semanas concluído.'); } }
VIEWS.plano = () => {
  const p = planoAtual(), [, tec, nv] = caminho();
  const cam = [['inicio', 'Início'], ['plano', 'Plano de 4 semanas']];
  if (p && !tec) {
    const T2 = TECNICAS_TREINO.find(x => x.id === p.tec), N = NIVEIS.find(n => n[0] === p.nivel), S = semanasDoPlano(p), atual = semanaDoPlano(p), [f, tot] = progressoPlano(p), pct = Math.round(f / tot * 100);
    return migalhas([cam[0], [null, cam[1][1]]]) + KitFacil.ui.cabecalho({ titulo: `${T2.nome} a ${p.meta} bpm`, sub: `${N[2]} · ${p.fim ? 'plano concluído' : `semana ${atual} de 4`} · de ${p.ini} até ${p.meta} bpm` })
      + `<div class="pilha"><div class="barra-prog" role="progressbar" aria-label="Plano" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div><p class="apoio">${f} de ${tot} treinos feitos. Um treino conta quando sai limpo no andamento da semana.</p>
        ${S.map(s => `<section class="cartao semana-plano${s.n === atual && !p.fim ? ' atual' : ''}" aria-label="Semana ${s.n}"><div class="sp-cab"><h2>Semana ${s.n}</h2>${s.n === atual && !p.fim ? '<span class="sp-agora">Esta semana</span>' : ''}<span class="ld-selo sp-bpm">${s.bpm} bpm</span></div>
          <ul class="sp-lista">${s.treinos.map(id => { const m = modelo(id), ok = feitoNoPlano(id, s.bpm, p.em); return m ? `<li class="${ok ? 'ok' : ''}"><span class="sp-marca" aria-label="${ok ? 'feito' : 'a fazer'}">${ok ? I.check : ''}</span><span class="ld-tx"><b>${esc(m.nome)}</b><small>${esc(TAMANHOS.find(t => t[0] === m.tamanho)[1])} · ${esc(m.resumo())}</small></span><button type="button" class="kf-btn kf-sec" data-plano-treino="${id}" data-plano-bpm="${s.bpm}">${I.play}${s.bpm}</button></li>` : ''; }).join('')}</ul></section>`).join('')}
        <button type="button" class="kf-btn kf-sec" data-plano-fim>${p.fim ? 'Começar outro plano' : 'Encerrar o plano'}</button></div>`;
  }
  const T2 = TECNICAS_TREINO.find(x => x.id === tec);
  if (!T2) return migalhas([cam[0], [null, cam[1][1]]]) + KitFacil.ui.cabecalho({ titulo: 'Plano de 4 semanas', sub: 'Escolha a técnica. Depois, o nível e a meta de andamento: o app divide o caminho em quatro semanas.' })
    + `<div class="ladrilhos">${TECNICAS_TREINO.map(t => ladrilho({ ir: `plano/${t.id}`, ilu: desenhoDe(`tecnica:${t.id}:2:curto:0`), nome: t.nome, sub: t.d, classe: 'sub' })).join('')}</div>`;
  const N = NIVEIS.find(n => n[1] === nv);
  if (!N) return migalhas([...cam, [null, T2.nome]]) + KitFacil.ui.cabecalho({ titulo: T2.nome, sub: 'Escolha o nível do plano.' })
    + `<div class="ladrilhos l1">${NIVEIS.map(([n, id, nome, d]) => ladrilho({ ir: `plano/${tec}/${id}`, ilu: iluNivel(n), nome, sub: d, classe: 'largo' })).join('')}</div>`;
  const ini = andamentoInicial(tec, N[0]);
  return migalhas([...cam, [`plano/${tec}`, T2.nome], [null, N[2]]]) + KitFacil.ui.cabecalho({ titulo: T2.nome, sub: `${N[2]}. Você está em ${ini} bpm. Escolha a meta para daqui a quatro semanas.` })
    + `<div class="ladrilhos">${[20, 40, 60, 80].map(x => Math.min(BPM_MAX, ini + x)).map(meta => ladrilho({ attrs: `data-plano-criar="${tec}|${N[0]}|${ini}|${meta}"`, ilu: iluPlano(ini, meta), nome: `${meta} bpm`, sub: `+${meta - ini} bpm em 4 semanas`, selo: `+${Math.round((meta - ini) / 4)}/semana` })).join('')}</div>`;
};
const iluPlano = (a, b) => { const k = 3 + (b - a) / 80 * 5; return ilu([0, 1, 2, 3].map(i => `<rect x="${6 + i * 14}" y="${40 - 6 - (i + 1) * k}" width="10" height="${6 + (i + 1) * k}" rx="2" class="${i === 3 ? 'il-a' : 'il-n'}"/>`).join('') + '<path d="M4 41h56" class="il-l"/>'); }; // a subida da escada cresce com a meta

/* ================= janela do treino =================
   Duas vistas, uma de cada vez: o palco (braço, tablatura, parte da linha, andamento e o botão grande de tocar) e os
   ajustes (afinação, tom, posição, escala, figura, o que fazer a cada N voltas, subida do andamento, som, rótulos).
   No treino do dia, os quatro treinos vêm em fila: cada um por N voltas, com aviso uma volta antes da troca. */
const SUBIDAS = [[0, 'Manter o andamento'], [1, '+1 bpm a cada volta'], [2, '+2 bpm a cada volta'], [5, '+5 bpm a cada volta']];
const BPM_MIN = 30, BPM_MAX = 260;
function abrirTreino(id, op = {}) {
  const fila = op.fila || null; let filaI = 0, obsBraco = null;
  let m = modelo(fila ? fila[0] : id); if (!m) return;
  const cfgDe = (mm, extra) => ({ ...cfgPadrao(mm), ...((DB.cfg.trCfg || {})[mm.id] || {}), ...(extra || {}) });
  let cfg = cfgDe(m, op.cfg), inteiro = volta(m, cfg), trecho = null, ex = inteiro;
  const bpmDe = mm => Math.max(BPM_MIN, Math.min(BPM_MAX, melhorLimpo(mm.id) || mm.bpm));
  let bpm = op.bpm || bpmDe(m);
  const voltasEtapa = () => DB.cfg.trVoltas || 4, percurso = () => fila ? 'fila' : (DB.cfg.trPercurso || 'repetir');
  const sel = (id, ops, v, rot) => `<div class="campo"><label class="kf-rotulo" for="${id}">${rot}</label><select id="${id}">${ops.map(([k, l]) => `<option value="${esc(String(k))}"${String(v) === String(k) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
  const seg = (attr, ops, v, rot) => `<div class="campo"><span class="kf-rotulo" id="tr-${attr}-l">${rot}</span><div class="kf-seg" role="group" aria-labelledby="tr-${attr}-l">${ops.map(([k, l]) => `<button type="button" data-${attr}="${k}" aria-pressed="${String(v) === String(k)}">${l}</button>`).join('')}</div></div>`;
  const ajustesHTML = () => { const R = m.regioes(cfg), base = ex.modelo.ehRiff ? m.afinPadrao : 'padrao'; return `
    ${sel('tr-afin', afinacoesPara(m.ehRiff ? m.afinPadrao : 'padrao').map(a => [a[0], a[1]]), ex.afinId, 'Afinação')}
    ${m.usaTom ? sel('tr-raiz', NOTAS.map((n, i) => [i, `${n} (${CIFRA[i]})`]), cfg.raiz, 'Tom') : ''}
    ${m.trocaEscala ? sel('tr-esc', ESCALAS_SEQ.map(e => [e, nomeEscala(e)]), cfg.escala, 'Escala') : ''}
    ${R.length > 1 ? sel('tr-pos', R.map((r, i) => [i, r]), cfg.pos, 'Posição no braço') : ''}
    ${m.cat === 'escalas' ? sel('tr-fig', FIGURAS_TREINO.map(([f, n, t]) => [f, `${n} · ${t}`]), cfg.fig, 'Figura') : ''}
    ${m.cat === 'escalas' ? seg('tam', TAMANHOS.map(([k, n]) => [k, n]), cfg.tam, 'Tamanho') : ''}
    ${fila ? '' : sel('tr-perc', [['repetir', 'Repetir o mesmo treino'], ...(m.usaTom ? [['tom', 'Ir para o próximo tom (ciclo das quartas)']] : []), ...(R.length > 1 ? [['posicao', 'Ir para a próxima posição']] : [])], percurso(), 'A cada etapa')}
    ${seg('voltas', [[2, '2 voltas'], [4, '4 voltas'], [8, '8 voltas']], voltasEtapa(), fila ? 'Voltas de cada treino' : 'Tamanho da etapa')}
    ${sel('tr-sobe', SUBIDAS, DB.cfg.trSobe || 0, 'Subir o andamento')}
    ${seg('acomp', [['metronomo', 'Metrônomo'], ['bateria', 'Bateria'], ['nenhum', 'Nada']], acomp(), 'Acompanhamento')}
    <div id="tr-bat-campo"${acomp() === 'bateria' ? '' : ' hidden'}>${sel('tr-bat', ESTILOS_TREINO.map(k => [k, ESTILOS_BATERIA.find(e => e[0] === k)[1]]), DB.cfg.trBateria || 'metal', 'Estilo da bateria')}</div>
    ${ex.evs.some(e => e.n.length === 1) ? seg('harm', [['', 'Nenhuma'], ['tercas', 'Terças'], ['quintas', 'Quintas'], ['oitava', 'Oitava']], DB.cfg.trHarmonia || '', 'Segunda guitarra (harmonia)') : ''}
    ${seg('pct', [[50, '50%'], [70, '70%'], [85, '85%'], [100, '100%']], '', 'Ir para uma parte da meta de andamento')}
    ${seg('rot', [['dedo', 'Dedos'], ['nota', 'Notas'], ...(ex.raiz != null ? [['grau', 'Graus']] : [])], cfg.rotulo || m.rotulo || 'nota', 'No braço, mostrar')}
    <div class="tr-op"><label class="kf-check"><input type="checkbox" id="tr-verBraco" ${DB.cfg.trVerBraco !== false ? 'checked' : ''}><span>Mostrar o braço</span></label>
      <label class="kf-check"><input type="checkbox" id="tr-verTab" ${DB.cfg.trVerTab !== false ? 'checked' : ''}><span>Mostrar a tablatura</span></label>
      <label class="kf-check"><input type="checkbox" id="tr-guia" ${DB.cfg.trGuia !== false ? 'checked' : ''}><span>Tocar o exemplo junto comigo</span></label>
</div>
    <button type="button" class="kf-btn kf-pri" data-tr-pronto>${I.check}Pronto</button>`; };
  function acomp() { return DB.cfg.trAcomp || (DB.cfg.trMetro === false ? 'nenhum' : 'metronomo'); }
  const subDe = () => (fila ? `Treino do dia · ${filaI + 1} de ${fila.length} · ` : '') + ex.sub;
  const legenda = e => { const T2 = new Set(e.evs.flatMap(x => tecs(x))); const l = [...T2].filter(t => TEC_NOMES[t]).map(t => `<b>${t === 'pm' ? 'PM' : TEC_TAB[t] || (t === 'harm' ? '<12>' : t)}</b> ${TEC_NOMES[t]}`); return l.length ? l.join(' · ') : ''; };
  KitFacil.dialogo.abrir({ titulo: tituloDe(m), sub: subDe(), classe: 'kf-alto kf-largo', nome: 'treino',
    corpo: `<div class="tr-vista" id="tr-v-palco">
        <div class="tr-palco"><div class="tr-topo"><button type="button" class="tr-fav" id="tr-fav" aria-pressed="${favorito(m.id)}" aria-label="Favorito">${favorito(m.id) ? '★' : '☆'}</button><span class="tr-chip" id="tr-parte">${esc(ex.partes ? ex.partes[0].nome : m.grupo || 'Treino')}</span><span class="tr-chip" id="tr-volta">${(ex.compasso || [4, 1])[0]}/${(ex.compasso || [4, 1])[1] === 1 ? 4 : 8}</span></div>
          <div class="tr-aviso" id="tr-aviso" hidden></div>
          <div class="tr-braco" id="tr-braco"${DB.cfg.trVerBraco === false ? ' hidden' : ''}><div class="tr-braco-vis"><div class="tr-braco-trilho" id="tr-trilho">${bracoTreino(ex)}</div></div><div class="tr-braco-cordas" id="tr-cordas">${cordasBraco(ex)}</div></div><div class="tab-wrap" id="tr-tab"${DB.cfg.trVerTab === false ? ' hidden' : ''}>${tabSVG(ex)}</div><div class="tr-conta" id="tr-conta" aria-live="assertive"></div></div>
        <p class="tr-dica" id="tr-dica"></p>
        <p class="tr-legenda" id="tr-legenda">${legenda(ex)}</p>
        <div class="tr-ctrl"><div class="tr-bpm" role="group" aria-label="Andamento"><button type="button" class="kf-btn kf-sec" data-tr-bpm="-5" aria-label="5 batidas a menos">−5</button><button type="button" class="kf-btn kf-sec" data-tr-bpm="-1" aria-label="1 batida a menos">−1</button><span class="tr-bpm-v"><output id="tr-bpm">${bpm}</output><small id="tr-pct">bpm · ${Math.round(bpm / m.alvo * 100)}% da meta</small></span><button type="button" class="kf-btn kf-sec" data-tr-bpm="1" aria-label="1 batida a mais">+1</button><button type="button" class="kf-btn kf-sec" data-tr-bpm="5" aria-label="5 batidas a mais">+5</button></div>
          <div class="tr-botoes"><button type="button" class="tr-rec" id="tr-rec" aria-pressed="false" aria-label="Gravar o treino">${I.mic}<span>Gravar</span></button><button type="button" class="play-grande" id="tr-ir" aria-label="Começar">${I.play}</button><span class="tr-rec-lado" aria-hidden="true"></span></div></div>
        <div class="tr-trecho" id="tr-trecho" role="group" aria-label="Repetir só alguns compassos"></div>
        <p class="tr-status" id="tr-status" aria-live="polite"></p>
        <div class="tr-res" id="tr-res" hidden></div></div>
      <div class="tr-vista pilha" id="tr-v-ajustes" hidden></div>`,
    pe: `<button type="button" class="kf-btn kf-sec" id="tr-aj">${I.ajustes}Ajustes</button><button type="button" class="kf-btn kf-sec" id="tr-exemplo">${I.ouvir}Ouvir uma volta</button>`,
    aoFechar: () => { if (treino.tocando) treino.parar(); micDesligar().then(micApagarGravacao); if (obsBraco) obsBraco.disconnect(); if (['inicio', 'caminho'].includes(rota())) render(); },
    aoMontar: d => {
      const vP = $('#tr-v-palco', d), vA = $('#tr-v-ajustes', d), tabW = $('#tr-tab', d), brW = $('#tr-braco', d), conta = $('#tr-conta', d), res = $('#tr-res', d), status = $('#tr-status', d), parteC = $('#tr-parte', d), voltaC = $('#tr-volta', d), aviso = $('#tr-aviso', d);
      let desenhado = null, tabN = [], brN = [], cur = null, ultI = -2, px = pxDe(ex), voltasNa = 0, feitos = [];
      const meta = () => { status.textContent = `Meta: ${m.alvo} bpm${melhorLimpo(m.id) ? ` · seu melhor limpo: ${melhorLimpo(m.id)} bpm` : ''}`; };
      const titulo = e => { const h = $('.kf-dlg-cab h2', d), s = $('.kf-dlg-sub', d); if (h) h.textContent = tituloDe(e.modelo); if (s) s.textContent = subDe(); $('#tr-legenda', d).innerHTML = legenda(e); const f = $('#tr-fav', d); f.setAttribute('aria-pressed', favorito(e.modelo.id)); f.textContent = favorito(e.modelo.id) ? '★' : '☆'; };
      // o braço mostra um compasso de cada vez nas linhas longas (senão fica pequeno demais) e troca junto com a música
      let janelas = [[0, 0]], jan = -1, compTxt = '', desenhado0 = false;
      const calcJanelas = e => { const [cn, cp] = e.compasso || [4, 1], bl = cn * cp, tot = e.evs.reduce((s, x) => s + x.d, 0); if (tot <= 2 * bl + 1e-6) return [[0, e.evs.length]]; const r = []; let t = 0, ini = 0, b = 1; e.evs.forEach((x, i) => { if (t >= b * bl - 1e-6) { r.push([ini, i]); ini = i; b++; } t += x.d; }); r.push([ini, e.evs.length]); return r; };
      // o braço fica sempre no mesmo tamanho e desliza até as notas da vez; só as notas mudam de um compasso para o outro
      const trilho = $('#tr-trilho', d), vis = $('.tr-braco-vis', d); let chaveBr = null, desloc = null, ultMira = null;
      const escala = () => { const sv = $('.braco-tr', trilho); return sv ? sv.getBoundingClientRect().width / bracoLargura() || 1 : 1; };
      const mirar = (evs, mover = true) => {
        if (brW.hidden) return; const r = casasDe(evs.filter(x => x.n.length)); if (!r) return; ultMira = evs;
        const k = escala(), novo = deslocarPara(r, vis.clientWidth / k, desloc); if (novo === desloc) return; desloc = novo;
        if (!mover) { trilho.style.transition = 'none'; trilho.style.transform = `translateX(${-novo * k}px)`; void trilho.offsetWidth; trilho.style.transition = ''; }
        else trilho.style.transform = `translateX(${-novo * k}px)`;
      };
      if (window.ResizeObserver) { obsBraco = new ResizeObserver(() => { if (ultMira) { desloc = null; mirar(ultMira, false); } }); obsBraco.observe(vis); }
      const desenharBraco = (e, j, mover = true) => {
        jan = j; const ch = e.afin.join(',') + '|' + e.nome;
        if (chaveBr !== ch) { trilho.innerHTML = bracoTreino(e, ...janelas[j]); $('#tr-cordas', d).innerHTML = cordasBraco(e); chaveBr = ch; }
        else $('.bt-notas', trilho).innerHTML = notasBraco(e, ...janelas[j]);
        brN = []; $$('.nt', trilho).forEach(g => g.dataset.i.split(' ').forEach(i => (brN[+i] = brN[+i] || []).push(g)));
        voltaC.textContent = janelas.length > 1 ? `compasso ${j + 1} de ${janelas.length} · ${compTxt}` : compTxt;
        mirar(e.evs.slice(...janelas[j]), mover);
      };
      // bend, volta do bend, slide, ligados, tapping, vibrato e trinado se movem no braço junto com a nota
      const ANIMA = ['b', 'b2', 'r', 's', 'h', 'p', 't', 'v', 'tr'];
      const animar = (g, T, dur) => { ANIMA.forEach(t => g.classList.remove('an-' + t)); const t = T.filter(x => ANIMA.includes(x)); if (!t.length) return; g.style.setProperty('--d', Math.max(.12, dur).toFixed(3) + 's'); void g.getBoundingClientRect(); t.forEach(x => g.classList.add('an-' + x)); };
      const apagarNotas = () => brN.forEach(gs => gs && gs.forEach(g => { g.classList.remove('agora', 'prox'); ANIMA.forEach(t => g.classList.remove('an-' + t)); }));
      const dica = $('#tr-dica', d);
      const pintarDica = tocando => { dica.hidden = tocando; dica.textContent = m.dica ? m.dica : brW.hidden ? 'Aperte ▶ e toque junto, seguindo a tablatura.' : 'Aperte ▶ e toque a nota acesa no braço. A próxima fica tracejada.'; };
      pintarDica(false);
      const desenhar = e => {
        const ch = JSON.stringify([e.id, e.cfg, e.rotulo, e.afinId]); if (desenhado === ch) return; desenhado = ch;
        const [cn, cp] = e.compasso || [4, 1]; compTxt = `${cn}/${cp === 1 ? 4 : cp === .5 ? 8 : 16}`;
        janelas = calcJanelas(e); desenharBraco(e, 0, desenhado0); desenhado0 = true;
        tabW.innerHTML = tabSVG(e); tabW.scrollLeft = 0; px = pxDe(e);
        cur = $('.tab-cursor', tabW); tabN = []; $$('.tab-n', tabW).forEach(g => tabN[+g.dataset.i] = g); ultI = -2; titulo(e);
        parteC.textContent = e.partes ? e.partes[0].nome : e.modelo.grupo || 'Treino'; pintarDica(treino.tocando);
      };
      const aplicarVista = () => { brW.hidden = DB.cfg.trVerBraco === false; tabW.hidden = DB.cfg.trVerTab === false; pintarDica(false); if (!brW.hidden) { desloc = null; mirar(ex.evs.slice(...(janelas[jan] || [0, ex.evs.length])), false); } };
      desenhar(ex); meta();
      const setBpm = v => { bpm = Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(v))); $('#tr-bpm', d).textContent = bpm; $('#tr-pct', d).textContent = `bpm · ${Math.round(bpm / m.alvo * 100)}% da meta`; };
      $$('[data-tr-bpm]', d).forEach(b => b.onclick = () => setBpm(bpm + +b.dataset.trBpm));
      $('#tr-fav', d).onclick = () => { const on = alternarFavorito(m.id); titulo(ex); KitFacil.avisar(on ? 'Treino nos favoritos.' : 'Treino fora dos favoritos.'); };
      const guardar = () => { DB.cfg.trCfg = { ...(DB.cfg.trCfg || {}), [m.id]: { raiz: cfg.raiz, pos: cfg.pos, fig: cfg.fig, escala: cfg.escala, rotulo: cfg.rotulo, afin: cfg.afin, tam: cfg.tam } }; commit(); };
      const aplicarTrecho = () => { const n = compassosDe(inteiro); if (trecho && trecho[1] > n) trecho = null; ex = trecho ? recortarCompassos(inteiro, ...trecho) : inteiro; };
      const refazer = () => { inteiro = volta(m, cfg); aplicarTrecho(); desenhar(ex); pintarTrecho(); };
      // faixa de compassos: um toque escolhe um compasso; outro toque, o fim do trecho; tocar no único escolhido limpa
      const faixa = $('#tr-trecho', d);
      const pintarTrecho = () => {
        const n = compassosDe(inteiro); faixa.hidden = n < 2; if (n < 2) { faixa.innerHTML = ''; return; }
        faixa.innerHTML = `<span class="kf-rotulo">${trecho ? `Repetindo os compassos ${trecho[0]} a ${trecho[1]}` : 'Repetir só um trecho: toque nos compassos'}</span><div class="tr-comps">${Array.from({ length: n }, (_, i) => { const k = i + 1, on = trecho && k >= trecho[0] && k <= trecho[1]; return `<button type="button" data-comp="${k}" aria-pressed="${!!on}" aria-label="Compasso ${k}">${k}</button>`; }).join('')}</div>`;
        $$('[data-comp]', faixa).forEach(b => b.onclick = () => {
          if (treino.tocando) return; const k = +b.dataset.comp;
          if (!trecho) trecho = [k, k]; else if (trecho[0] === trecho[1] && k === trecho[0]) trecho = null; else if (trecho[0] === trecho[1]) trecho = [Math.min(k, trecho[0]), Math.max(k, trecho[0])]; else trecho = [k, k];
          aplicarTrecho(); desenhado = null; desenhar(ex); pintarTrecho();
        });
      };
      pintarTrecho();
      // ajustes: uma vista no lugar do palco; os campos mudam o treino na hora
      const abrirAjustes = () => {
        if (treino.tocando) return;
        vA.innerHTML = ajustesHTML(); vP.hidden = true; vA.hidden = false; $('#tr-aj', d).setAttribute('aria-pressed', 'true'); KitFacil.movimento.entrar(vA, { de: 'tela' });
        const muda = () => { guardar(); refazer(); };
        $('#tr-afin', vA).addEventListener('change', e => { cfg.afin = e.target.value; muda(); });
        $('#tr-raiz', vA)?.addEventListener('change', e => { cfg.raiz = +e.target.value; muda(); });
        $('#tr-esc', vA)?.addEventListener('change', e => { cfg.escala = e.target.value; cfg.pos = 0; muda(); const p = $('#tr-pos', vA); if (p) { p.innerHTML = m.regioes(cfg).map((r, i) => `<option value="${i}">${esc(r)}</option>`).join(''); p.value = '0'; } });
        $('#tr-pos', vA)?.addEventListener('change', e => { cfg.pos = +e.target.value; muda(); });
        $('#tr-fig', vA)?.addEventListener('change', e => { cfg.fig = +e.target.value; muda(); });
        $('#tr-perc', vA)?.addEventListener('change', e => { DB.cfg.trPercurso = e.target.value; commit(); });
        $('#tr-sobe', vA).addEventListener('change', e => { DB.cfg.trSobe = +e.target.value; commit(); });
        const segL = (attr, f) => $$(`[data-${attr}]`, vA).forEach(b => b.onclick = () => { $$(`[data-${attr}]`, vA).forEach(x => x.setAttribute('aria-pressed', x === b)); f(b.dataset[attr]); });
        segL('tam', v => { cfg.tam = v; muda(); });
        segL('voltas', v => { DB.cfg.trVoltas = +v; commit(); });
        segL('acomp', v => { DB.cfg.trAcomp = v; commit(); $('#tr-bat-campo', vA).hidden = v !== 'bateria'; });
        $('#tr-bat', vA).addEventListener('change', e => { DB.cfg.trBateria = e.target.value; commit(); });
        segL('harm', v => { DB.cfg.trHarmonia = v; commit(); });
        segL('pct', v => { setBpm(m.alvo * +v / 100); KitFacil.avisar(`Andamento: ${bpm} bpm, ${v}% da meta.`); });
        segL('rot', v => { cfg.rotulo = v; muda(); });
        ['guia'].forEach(k => $('#tr-' + k, vA).addEventListener('change', e => { DB.cfg['tr' + k[0].toUpperCase() + k.slice(1)] = e.target.checked; commit(); }));
        const vista = (k, outro, nome) => $('#tr-' + k, vA).addEventListener('change', e => {
          DB.cfg['tr' + k[0].toUpperCase() + k.slice(1)] = e.target.checked;
          if (!e.target.checked && DB.cfg['tr' + outro[0].toUpperCase() + outro.slice(1)] === false) { DB.cfg['tr' + outro[0].toUpperCase() + outro.slice(1)] = true; $('#tr-' + outro, vA).checked = true; KitFacil.avisar(`O treino precisa de um dos dois: ${nome} voltou.`); }
          commit(); aplicarVista();
        });
        vista('verBraco', 'verTab', 'a tablatura'); vista('verTab', 'verBraco', 'o braço');
        $('[data-tr-pronto]', vA).onclick = fecharAjustes;
      };
      const fecharAjustes = () => { vA.hidden = true; vP.hidden = false; $('#tr-aj', d).setAttribute('aria-pressed', 'false'); KitFacil.movimento.entrar(vP, { de: 'tela' }); $('#tr-ir', d).focus(); };
      $('#tr-aj', d).onclick = () => vA.hidden ? abrirAjustes() : fecharAjustes();
      // a próxima etapa: na fila do treino do dia, o próximo treino; senão, o próximo tom ou a próxima posição
      const proximaEtapa = () => {
        if (fila) { if (filaI + 1 >= fila.length) return null; const mm = modelo(fila[filaI + 1]); const cc = cfgDe(mm); return { m: mm, cfg: cc, ex: volta(mm, cc) }; }
        const p = percurso(); if (p === 'repetir') return null;
        const cc = { ...cfg, ...(p === 'tom' ? { raiz: pc((cfg.raiz || 0) + 5) } : { pos: ((cfg.pos || 0) + 1) % m.regioes(cfg).length }) };
        return { m, cfg: cc, ex: volta(m, cc) };
      };
      let soUma = false, acabou = false;
      const proxima = prev => {
        if (!prev) return { ex, bpm };
        if (soUma) return null;
        voltasNa++;
        if (voltasNa >= voltasEtapa()) {
          const pe = proximaEtapa();
          if (fila && !pe) { acabou = true; return null; }
          if (pe) { if (fila) { feitos.push({ m, cfg: { ...cfg }, voltas: voltasNa, bpm }); filaI++; bpm = bpmDe(pe.m); setBpm(bpm); trecho = null; } m = pe.m; cfg = pe.cfg; inteiro = pe.ex; aplicarTrecho(); voltasNa = 0; }
        }
        const sobe = DB.cfg.trSobe || 0; if (sobe) setBpm(Math.min(m.alvo + 40, bpm + sobe));
        return { ex, bpm };
      };
      const aoRodada = r => {
        desenhar(r.ex); status.textContent = `Volta ${voltasNa + 1}${percurso() !== 'repetir' ? ` de ${voltasEtapa()}` : ''} · ${r.bpm} bpm`;
        const pe = voltasNa === voltasEtapa() - 1 ? proximaEtapa() : null;
        aviso.hidden = !pe; if (pe) aviso.innerHTML = `<b>A seguir:</b> ${esc(fila ? tituloDe(pe.m) : pe.ex.sub)}`;
      };
      const aoQuadro = (r, beat, falta, i) => {
        conta.textContent = falta ? String(falta) : ''; conta.classList.toggle('on', !!falta);
        const x = 40 + Math.max(0, beat) * px; cur.setAttribute('x1', x); cur.setAttribute('x2', x);
        tabW.scrollLeft = Math.max(0, x - tabW.clientWidth * .35);
        if (i === ultI) return; ultI = i;
        const evs = r.ex.evs, k = i < -1 ? -1 - i : i;
        if (k >= 0) { const j = janelas.findIndex(([a, b]) => k >= a && k < b); if (j >= 0 && j !== jan) desenharBraco(r.ex, j); }
        tabN.forEach((g, j) => g && g.classList.toggle('agora', j === i));
        apagarNotas();
        let prox = k < 0 ? 0 : k + 1; while (prox < evs.length && !evs[prox].n.length) prox++;
        if (brN[prox]) brN[prox].forEach(g => g.classList.add('prox'));
        if (i >= 0 && brN[i]) { const T = tecs(evs[i]); brN[i].forEach(g => { g.classList.remove('prox'); animar(g, T, evs[i].d * r.seg); g.classList.add('agora'); }); }
        if (k >= 0 && janelas[jan]) mirar(evs.slice(Math.max(k, janelas[jan][0]), Math.min(janelas[jan][1], k + 4)));
        if (r.ex.partes && k >= 0) { const p = r.ex.partes.filter(q => q.i <= k).pop(); if (p && parteC.textContent !== p.nome) parteC.textContent = p.nome; }
      };
      const botoes = tocando => { const b = $('#tr-ir', d); b.innerHTML = tocando ? I.stop : I.play; b.setAttribute('aria-label', tocando ? 'Parar' : 'Começar'); b.classList.toggle('on', tocando); $('#tr-exemplo', d).disabled = tocando; $('#tr-aj', d).disabled = tocando; recBt.disabled = tocando; recBt.classList.toggle('gravando', tocando && !!mic.gravador); recTexto(); pintarDica(tocando); };
      const limpar = () => { if (jan > 0) desenharBraco(ex, 0); else mirar(ex.evs.slice(...janelas[0])); conta.textContent = ''; conta.classList.remove('on'); tabN.forEach(g => g && g.classList.remove('agora')); apagarNotas(); ultI = -2; aviso.hidden = true; };
      const registrar = (mm, cc, voltas, bpmR, min, extra = {}) => { const rec = { id: uid(), ex: mm.id, cfg: { ...cc }, voltas, bpm: bpmR, min, limpo: null, em: Date.now(), ...extra }; DB.treinos.push(rec); return rec; };
      // a gravação (que fica só neste aparelho): ouvir e comparar com o exemplo; o app não dá nota
      const extrasMic = () => `${mic.url ? `<div class="tr-grav"><div class="tr-grav-bts"><button type="button" class="kf-btn kf-sec" data-grav="ouvir">${I.play}Ouvir a gravação</button><button type="button" class="kf-btn kf-sec" data-grav="exemplo">${I.ouvir}Ouvir o exemplo</button><button type="button" class="kf-btn kf-sec" data-grav="apagar">Apagar</button></div><p class="apoio">A gravação fica só neste aparelho e some ao fechar a janela.</p></div>` : ''}`;
      let tocador = null;
      const ligarMic = () => $$('[data-grav]', res).forEach(b => b.onclick = () => {
        const q = b.dataset.grav;
        if (q === 'ouvir' && mic.url) { if (tocador) tocador.pause(); tocador = new Audio(mic.url); tocador.play().catch(() => KitFacil.avisar('Não deu para tocar a gravação neste navegador.')); }
        if (q === 'exemplo') { if (tocador) tocador.pause(); rodar(true); }
        if (q === 'apagar') { if (tocador) tocador.pause(); micApagarGravacao(); $('#tr-ir', d).focus(); $('.tr-grav', res)?.remove(); KitFacil.avisar('Gravação apagada.'); }
      });
      const soMic = () => { res.innerHTML = `<p class="tr-fim"><b>Treino curto:</b> não entra no histórico.</p>${extrasMic()}`; res.hidden = false; ligarMic(); };
      const resultado = info => {
        const min = Math.round(info.segs / 6) / 10; registrarPratica(min);
        feitos.forEach(f => registrar(f.m, f.cfg, f.voltas, f.bpm, 0, { dia: true }));
        const rec = registrar(m, { ...cfg, ...(trecho ? { trecho } : {}) }, Math.max(0, info.voltas - feitos.reduce((s, f) => s + f.voltas, 0)), info.bpm, min, fila ? { dia: true, diaFim: acabou } : {});
        feitos = []; commit(); conferirConquistas(); verPlano();
        res.innerHTML = `<p class="tr-fim"><b>${acabou ? 'Treino do dia concluído.' : 'Treino parado.'}</b> ${info.voltas} ${info.voltas === 1 ? 'volta' : 'voltas'} · até ${info.bpm} bpm · ${fmtTempo(info.tocado)}</p>
          ${extrasMic()}
          <div class="tr-limpo-bloco"><p class="apoio">Saiu limpo, sem errar nem atrasar? Quem decide é você: o app não mede a execução.</p>
          <div class="tr-limpo"><button type="button" class="kf-btn kf-pri" data-limpo="1">${I.check}Saiu limpo</button><button type="button" class="kf-btn kf-sec" data-limpo="0">Ainda não</button></div></div>`;
        res.hidden = false; ligarMic();
        $$('[data-limpo]', res).forEach(b => b.onclick = () => {
          const ok = b.dataset.limpo === '1'; rec.limpo = ok; commit(); conferirConquistas(); verPlano();
          const novo = ok ? Math.min(BPM_MAX, info.bpm + 5) : Math.max(BPM_MIN, info.bpm - 5); setBpm(novo);
          $('#tr-ir', d).focus(); // o foco não se perde quando os botões saem
          $('.tr-limpo-bloco', res).outerHTML = `<p class="tr-fim">${ok ? `Marcado por você: ${info.bpm} bpm limpo. Na próxima, ${novo} bpm.` : `Sem problema: repita a ${novo} bpm até sair limpo.`}</p>`;
          meta();
        });
      };
      const recBt = $('#tr-rec', d);
      const recTexto = () => { const on = recBt.getAttribute('aria-pressed') === 'true'; $('span', recBt).textContent = recBt.classList.contains('gravando') ? 'Gravando' : on ? 'Vai gravar' : 'Gravar'; };
      recBt.onclick = () => { if (treino.tocando) return; if (!window.MediaRecorder) { KitFacil.avisar('Este navegador não grava áudio. O treino segue sem gravar.'); return; } const on = recBt.getAttribute('aria-pressed') !== 'true'; recBt.setAttribute('aria-pressed', on); recTexto(); KitFacil.avisar(on ? 'O próximo treino será gravado. A gravação fica só neste aparelho.' : 'Gravação desligada.'); };
      const rodar = async exemplo => {
        if (treino.tocando) { treino.parar(); return; }
        if (rodar.ocupado) return; rodar.ocupado = true;
        if (!exemplo) res.hidden = true; soUma = exemplo; acabou = false; voltasNa = 0; feitos = []; limpar(); botoes(true);
        if (!exemplo && fila && filaI > 0) { filaI = 0; m = modelo(fila[0]); cfg = cfgDe(m); inteiro = volta(m, cfg); trecho = null; aplicarTrecho(); pintarTrecho(); setBpm(bpmDe(m)); }
        const gravar = !exemplo && recBt.getAttribute('aria-pressed') === 'true';
        if (gravar) { micApagarGravacao(); const r = await micLigar(true); if (r !== 'ok') KitFacil.avisar(r === 'negado' ? 'Sem permissão para o microfone: o treino segue sem gravar.' : 'Este navegador não usa o microfone: o treino segue sem gravar.'); }
        botoes(true); // agora o botão de gravar mostra se está gravando
        { let el = vP.parentElement; while (el && el.scrollHeight <= el.clientHeight + 1) el = el.parentElement; if (el && el.scrollTop > 0) el.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } // o braço volta para a vista
        const ac = acomp();
        const ok = treinoTocar({ guia: exemplo || DB.cfg.trGuia !== false, metronomo: ac === 'metronomo', bateria: ac === 'bateria' ? (DB.cfg.trBateria || 'metal') : null, harmonia: DB.cfg.trHarmonia || null,
          proxima, aoRodada, aoQuadro,
          aoFim: async info => {
            botoes(false); limpar(); meta();
            await micDesligar();
            if (exemplo) return;
            if (info.segs < 15 && !acabou) { if (mic.url) soMic(); return; } // menos de 15 s não conta
            if (info.voltas) resultado(info); else { registrarPratica(Math.round(info.segs / 6) / 10); conferirConquistas(); if (mic.url) soMic(); }
          } });
        rodar.ocupado = false;
        if (!ok) { botoes(false); micDesligar(); KitFacil.avisar('Este navegador não consegue tocar som. Tente outro navegador.'); }
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
  const comTam = b => b.dataset.tam ? { cfg: { tam: b.dataset.tam } } : {};
  $$('[data-tr-modelo]', m).forEach(b => b.onclick = () => abrirTreino(b.dataset.trModelo, comTam(b)));
  $$('[data-tr-sortear]', m).forEach(b => b.onclick = () => { const L = b.dataset.trSortear.split(' '); abrirTreino(L[Math.floor(Math.random() * L.length)], comTam(b)); });
  $$('[data-caminho-pular]', m).forEach(b => b.onclick = escolherNivelCaminho);
  if (r === 'caminho' && subRota()) { const e = $('#etapa-' + subRota(), m); if (e) setTimeout(() => e.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }), 320); } // depois da entrada da tela
  $$('[data-tr-ultimo]', m).forEach(b => b.onclick = () => { const u = ultimoTreino(); if (u) abrirTreino(u.id, { cfg: u.cfg, bpm: u.bpm }); });
  $$('[data-dia]', m).forEach(b => b.onclick = () => abrirTreino(null, { fila: treinoDoDia(+b.dataset.dia) }));
  $$('[data-plano-treino]', m).forEach(b => b.onclick = () => abrirTreino(b.dataset.planoTreino, { bpm: +b.dataset.planoBpm }));
  $$('[data-plano-criar]', m).forEach(b => b.onclick = () => { const [tec, nivel, ini, meta] = b.dataset.planoCriar.split('|'); DB.cfg.plano = { tec, nivel: +nivel, ini: +ini, meta: +meta, em: Date.now() }; commit(); ir('plano'); KitFacil.avisar('Plano criado: quatro semanas até ' + meta + ' bpm.'); });
  $$('[data-plano-fim]', m).forEach(b => b.onclick = () => { const p = DB.cfg.plano; DB.cfg.plano = null; commit(); render(); if (!p.fim) KitFacil.avisar('Plano encerrado.', { label: 'Desfazer', run: () => { DB.cfg.plano = p; commit(); render(); } }); });
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
  $('[data-te-treinar]', m)?.addEventListener('click', () => { const [id, pos] = modeloDaTeoria(); abrirTreino(id, { cfg: { raiz: TEO.raiz, pos, tam: 'moderado' } }); });
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
  resumo: 'Treinos de guitarra de rock e metal, com o braço desenhado.', icone: 'icons/icon-192.png',
  tela: () => rota(), exemploDados: 'os treinos, as músicas e o tempo de prática',
  privacidade: ['Os treinos, os andamentos, as conquistas, as músicas e o tempo de prática ficam guardados neste aparelho.', 'O som dos treinos, do metrônomo, da bateria, dos acordes e das notas sai de gravações que acompanham o app e toca aqui no aparelho.', 'O afinador usa o microfone só enquanto está ligado, com a sua permissão: o som é analisado em memória, não é gravado nem enviado.', 'No treino, o microfone só é usado quando você liga "Gravar": a gravação fica só neste aparelho, é apagada ao fechar a janela do treino e nunca é enviada nem avaliada.', 'O plano de 4 semanas fica guardado com os seus treinos.'],
  abrirAjustes: secao => { if (rota() !== 'ajustes') ir('ajustes'); else if (!secao) history.back(); },
  emAjustes: () => rota() === 'ajustes',
  copia: { descricao: 'Baixe um arquivo com os treinos, as músicas e o tempo de prática.',
    baixar: () => KitFacil.copia.baixar({ db: DB }, 1),
    restaurar: async f => { const j = await KitFacil.copia.ler(f); if (!j || !j.dados || !j.dados.db) { KitFacil.avisar('Esse arquivo não é uma cópia do Guitarra Fácil.'); return; } DB = { ...vazio(), ...j.dados.db }; commit(); snapTodos(); render(); KitFacil.avisar('Cópia restaurada.'); } },
  novidades: [{ versao: '0.10.0', itens: ['O app abre no tema escuro. O claro e o automático continuam em Ajustes.', 'O microfone do treino só grava: ouça a gravação junto com o exemplo e julgue você mesmo. Saiu a nota automática de ritmo.', '"Saiu limpo" aparece como marcado por você: o app registra a prática, mas não mede a execução.'] }, { versao: '0.9.0', itens: ['Caminho do iniciante: cinco etapas, do primeiro toque numa corda solta ao primeiro bend, com os dedos no braço e uma dica em cada passo.', 'Início novo: o próximo passo em destaque e o caminho inteiro, com "Você está aqui".', 'Já toca? Escolha onde começar ou vá direto ao treino do dia.'] }, { versao: '0.8.0', itens: ['Som novo: guitarra limpa, bateria e metrônomo gravados de instrumentos de verdade, mais altos e por igual. Funciona sem internet.', 'O braço do treino fica sempre no mesmo tamanho e desliza até as notas da vez.', 'Bends, slides, ligados e vibratos se movem no braço junto com a nota.', 'Braço e tablatura juntos; em Ajustes do treino dá para esconder um ou outro.', 'O toque duplo não dá mais zoom no app.'] }, { versao: '0.7.0', itens: ['Repita só um trecho: toque nos compassos embaixo da tablatura para tocar só eles em laço.', 'Andamento em porcentagem da meta (50%, 70%, 85% ou 100%) e a porcentagem sempre embaixo do número.', 'Bateria no treino, no lugar do metrônomo: bumbo duplo, blast beat, d-beat, thrash, galope, meio tempo e outros.', 'Segunda guitarra em harmonia: terças, quintas ou oitava junto com a sua linha.', 'Conferir o ritmo pelo microfone (só o tempo de cada palhetada) e gravar o treino para ouvir depois; nada sai do aparelho.', 'Plano de 4 semanas: escolha a técnica, o nível e a meta de andamento; o app monta quatro treinos por semana até lá.'] }, { versao: '0.6.0', itens: [`Rock e metal: ${MODELOS.length.toLocaleString('pt-BR')} treinos em riffs, solos e técnica, de 17 estilos (do hard rock ao djent) e 17 técnicas.`, 'Cada nível tem os seus treinos; a dificuldade vem da complexidade: técnicas misturadas, quiálteras, compassos ímpares e polirritmia.', 'O tamanho agora é o tamanho da linha: curto (1 compasso), moderado (2 a 4), longo (8, partes A e B) e muito longo (16 ou mais, com riff, breakdown e solo).', 'Afinações drop e sete cordas, com palm mute, pinch, harmônicos, notas mortas e alavanca.', 'Treino do dia, favoritos e aviso antes de trocar de etapa.', 'Visual mais escuro, com o vermelho do pedal.'] }, { versao: '0.5.0', itens: ['Cada função na sua tela: Início com menu de botões grandes, Treinos, Afinador, Teoria e, em Mais, Metrônomo, Bateria, Mapa do braço, Acordes, Músicas e Progresso.', `Catálogo com ${MODELOS.length} treinos em escalas, sequências, arpejos, licks, riffs e técnica, nos 12 tons e em todo o braço.`, 'Escolha um toque por vez: categoria, nível (iniciante, intermediário, avançado) e duração (2, 5, 10 ou 20 minutos).', 'Treinos longos percorrem as posições do braço e os tons sozinhos, com relógio na tela.', 'Janela do treino mais limpa: braço, tablatura, andamento e um botão grande; o resto fica em Ajustes.', 'Afinador com ponteiro, a corda mais perto e outras afinações; metrônomo com compasso e toque no ritmo; acordes para ouvir.'] }, { versao: '0.4.0', itens: ['O app agora é feito de treinos: sem trilha de aulas, sem teste de nível e sem professor.', 'Treino com o braço desenhado: a nota da vez acende, a próxima fica marcada e a tablatura rola junto.', 'Cromático 1-2-3-4 com as 24 combinações dos dedos: escolha a casa, as cordas e a figura, ou siga, sorteie e suba de casa a cada volta.', 'Escalas nos cinco desenhos, em qualquer tom, e um botão Treinar na Teoria.', 'Andamento de 1 em 1 ou de 5 em 5 bpm, e subida automática a cada volta.', 'Sequência de dias, a semana na tela Hoje, resumo da semana e 13 conquistas.'] }, { versao: '0.3.0', itens: ['Treinos com som e tablatura rolando, Teoria com o braço desenhado, bateria de acompanhamento e playlists recomendadas.'] }, { versao: '0.2.0', itens: ['Afinador pelo microfone, mapa das notas no braço e dez acordes. Ícone novo: o pedal de efeito.'] }, { versao: '0.1.0', itens: ['Primeira versão em testes: metrônomo, notas para afinar, primeiros acordes e lista de músicas.'] }],
  // sem boas-vindas do Kit: o Início já é o menu de tudo
  boasVindas: { novo: () => PRIMEIRO_USO },
});
KitFacil.tema.iniciar({ chave: KEY + 'pref', cores: { claro: '#E4E4E8', escuro: '#08080A' }, padrao: 'escuro' }); // Documento Mestre, decisão 3A: escuro de fábrica
const SY = KitFacil.sync.criar({ app: 'guitarra-facil', nome: 'Guitarra Fácil', chave: KEY + 'sync', dados: 'os treinos, as músicas e o tempo de prática',
  carimbar, aplicar, pacote, mesmo: (a, r) => KitFacil.canon(a) === KitFacil.canon({ v: 1, cfg: r.cfg, feitas: r.feitas, musicas: r.musicas, praticas: r.praticas, andamentos: r.andamentos || [], treinos: r.treinos || [], conquistas: r.conquistas || [], favoritos: r.favoritos || [], st: r.st, del: r.del }),
  redesenhar: () => render() });
$('#marca').innerHTML = I.marca; $('#marca-trilho').innerHTML = I.marca;
$('#topo').innerHTML = KitFacil.topo.html({ principal: true });
conferirConquistas(false);
render();
const link = SY.tokenDoLink();
if (link) history.replaceState(null, '', location.pathname + location.hash);
SY.iniciar({ token: link, textoConfirmar: 'Os treinos, as músicas e a prática deste aparelho se juntam aos da nuvem.' });
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

/* Guitarra Fácil · base comum das telas: versão, atalhos do DOM, ícones, ilustrações e peças de tela (migalhas e botão grande).
   Carrega antes de todos os outros arquivos do app */
'use strict';
const VERSAO = '0.25.4';
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
  busca: svg('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
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
/* Ilustrações editoriais: cenas maiores e próprias do produto. Mantêm o vocabulário do braço, do sinal elétrico e
   do equipamento sem recorrer aos clichês literais do metal. São SVGs nativos, leves e nítidos em qualquer tela. */
function arteDestaque(tipo) {
  return `<figure class="arte-destaque arte-png"><img src="assets/${tipo === 'biblioteca' ? 'backstage' : 'palco'}.png" alt="${tipo === 'biblioteca' ? 'Estúdio ilustrado com amplificadores, guitarra e discos' : 'Guitarrista ilustrado sob luzes vermelhas e âmbar'}" width="1536" height="1024" decoding="async"></figure>`;
}
const AMPLIFICADORES = [['treinos', 'Treinos'], ['explorar', 'Explorar o braço'], ['estudio', 'Estúdio de criação'], ['biblioteca', 'Biblioteca'], ['afinador', 'Afinador'], ['metronomo', 'Metrônomo'], ['bateria', 'Bateria'], ['acordes', 'Acordes'], ['sessao', 'Sessão de hoje'], ['progresso', 'Progresso'], ['jornada', 'Minha jornada'], ['plano', 'Plano de 4 semanas'], ['favoritos', 'Favoritos'], ['dia', 'Treino do dia'], ['ajustes', 'Ajustes']];
function palcoAjustes() {
  return `<div class="kf-bloco"><h3>Efeitos do menu</h3><p class="apoio">HQ em chamas. O som só começa quando você o ativa; a prática e o segundo plano pausam o ambiente.</p><div class="palco-preferencias" role="group" aria-label="Efeitos do palco"><button type="button" data-palco-som aria-pressed="false">Ouvir o fogo</button><button type="button" data-palco-fogo aria-pressed="true">Fogo: animado</button><label class="palco-volume">Volume do fogo<input type="range" min="0" max="50" value="20" step="1" data-palco-volume aria-label="Volume do fogo"></label></div></div>`;
}

function palcoCabecalho(tela) {
  if (tela === 'inicio') return `<section class="palco-desenhado torre-palco" aria-label="Torre de palco"><h1 class="amp-leitor">Escolha seu próximo passo</h1><p class="torre-guia">Escolha um amplificador · role para explorar</p><nav class="amp-menu-mobile" aria-label="Menu principal">${AMPLIFICADORES.map(([id, nome], i) => `<button type="button" class="amp-hq torre-modulo" data-ir="${id}" aria-label="${nome}" style="--fase:${-i * .8}s"><span class="amp-corpo">${i === 0 ? '<i class="torre-alca" aria-hidden="true"></i>' : ''}<img class="amp-casca" src="assets/torre-${['r','a','v'][i % 3]}.webp" alt="" width="1200" height="400" decoding="async"><span class="torre-grade"><img class="torre-nome" src="assets/nome-${id}.webp" alt="" decoding="async"></span><i class="amp-knob" style="left:35%" aria-hidden="true"></i><i class="amp-knob" style="left:51.6%" aria-hidden="true"></i><i class="amp-knob" style="left:68.2%" aria-hidden="true"></i><i class="amp-luz" aria-hidden="true"></i></span></button>`).join('')}</nav><div class="torre-base" aria-hidden="true"></div></section>`;
  if (['explorar', 'biblioteca', 'acordes', 'ajustes'].includes(tela)) return '';
  const textos = { treinos: ['Forje sua técnica', 'Um objetivo. Um movimento. Uma evolução de cada vez.'], estudio: ['Faça barulho. Crie.', 'Transforme uma ideia em seu próximo riff.'], progresso: ['Sua jornada no palco', 'Acompanhe a prática e escolha o próximo desafio.'], afinador: ['Encontre seu som', 'Afine antes de entrar em cena.'], metronomo: ['Domine o pulso', 'Precisão começa com uma batida de cada vez.'], bateria: ['Toque com a banda', 'Escolha a levada e entre no ritmo.'] };
  const t = textos[tela] || ['Hora de tocar', 'Seu próximo objetivo começa com uma nota.'];
  return `<header class="palco-cab"><img src="assets/${['estudio','bateria'].includes(tela) ? 'backstage' : 'palco'}.png" alt="" width="1536" height="1024" decoding="async"><div><span class="palco-kicker">GUITARRA FÁCIL · BACKSTAGE</span><h1>${t[0]}</h1><p>${t[1]}</p></div></header>`;
}

ILU.dia = ilu('<rect x="10" y="8" width="44" height="34" rx="4" class="il-f il-l"/><path d="M10 17h44M20 4v8M44 4v8" class="il-l il-g"/><path d="M32 22c1 4 6 5 6 10a6 6 0 0 1-12 0c0-3 2-4 2.5-6 1 1.6 1.6 2.4 2.8 2.5-.2-2.8-.4-4.3.7-6.5z" class="il-a"/>');
ILU.plano = ilu('<rect x="8" y="8" width="48" height="34" rx="4" class="il-f il-l"/><path d="M8 17h48" class="il-l il-g"/>' + [0, 1, 2, 3].map(i => `<rect x="${13 + i * 11}" y="${37 - (i + 1) * 4.5}" width="7" height="${(i + 1) * 4.5}" rx="1.5" class="${i === 3 ? 'il-a' : 'il-n'}"/>`).join(''));
ILU.favoritos = ilu('<path d="M32 6l7.6 15.4 17 2.5-12.3 12 2.9 16.9L32 44.8l-15.2 8 2.9-16.9-12.3-12 17-2.5z" class="il-a" transform="scale(.85) translate(5.6 0)"/>');
const iluNivel = n => ilu([0, 1, 2].map(i => `<rect x="${14 + i * 14}" y="${30 - i * 9}" width="10" height="${12 + i * 9}" rx="2" class="${i < n ? (i === n - 1 ? 'il-a' : 'il-n') : 'il-f il-l'}"/>`).join(''));
const iluDuracao = min => { const f = { 2: .1, 5: .25, 10: .5, 20: 1 }[min], a = f * 2 * Math.PI - Math.PI / 2, x = 32 + 17 * Math.cos(a), y = 25 + 17 * Math.sin(a); return ilu(`<circle cx="32" cy="25" r="17" class="il-f il-l"/>${f >= 1 ? '<circle cx="32" cy="25" r="17" class="il-a"/>' : `<path d="M32 25V8A17 17 0 ${f > .5 ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)}z" class="il-a"/>`}<circle cx="32" cy="25" r="2.5" class="il-n"/>`); };
const ESTADOS_MUSICA = [['quero', 'Quero aprender'], ['aprendendo', 'Aprendendo'], ['toco', 'Já toco']];



/* peças de tela: o caminho até aqui (para voltar um passo) e o botão grande ilustrado */
const migalhas = passos => `<nav class="migalhas" aria-label="Caminho">${passos.map(([ir, nome], i) => (i ? '<span aria-hidden="true">›</span>' : '') + (ir ? `<button type="button" data-ir="${esc(ir)}">${esc(nome)}</button>` : `<span aria-current="page">${esc(nome)}</span>`)).join('')}</nav>`;
const ladrilho = ({ ir, attrs = '', ilu: il = '', nome, sub = '', selo = '', classe = '' }) => `<button type="button" class="ladrilho ${classe}" ${ir ? `data-ir="${esc(ir)}"` : ''} ${attrs}><span class="ld-ilu ld-raster"><img src="assets/${/estudio|biblioteca|musica|plano|favorito/i.test(ir || nome) ? 'backstage' : 'palco'}.png" alt="" width="96" height="96" loading="lazy"></span><span class="ld-tx"><b>${esc(nome)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span>${selo ? `<span class="ld-selo">${esc(selo)}</span>` : ''}</button>`;

/* telas: cada arquivo tela-*.js registra as suas aqui (VIEWS.nome = () => html) */
const VIEWS = {};

/* Guitarra Fácil · base: versão, atalhos de página, texto e ícones. Carregado antes de todos os outros arquivos do app. */
'use strict';
const VERSAO = '0.2.1';
const $ = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
const limitar = (v, a, b) => Math.max(a, Math.min(b, v));
const agora = () => Date.now();
const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const minutos = seg => Math.round((seg || 0) / 60);
const dataCurta = t => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
const hojeISO = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
/* início da semana (segunda-feira, 0 h) de uma data */
function inicioSemana(t = Date.now()) { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); }

/* ícones de traço (24 × 24, traço de 2 px, como os do Kit) */
const svgI = p => `<svg class="kf-i" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const ICONE = {
  inicio: svgI('<path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-6h4v6"/>'),
  treinos: svgI('<path d="M4 6h16M4 12h16M4 18h10"/><circle cx="19" cy="18" r="2"/>'),
  explorar: svgI('<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M8 7v10M13 7v10M18 7v10"/><circle cx="10.5" cy="12" r="1.2"/>'),
  estudio: svgI('<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
  afinador: svgI('<path d="M4 16a8 8 0 0 1 16 0"/><path d="m12 16 4-6"/><path d="M4 20h16"/>'),
  metronomo: svgI('<path d="M8 3h8l3 18H5z"/><path d="m12 15 5-8"/><path d="M8 17h8"/>'),
  bateria: svgI('<ellipse cx="12" cy="9" rx="8" ry="3"/><path d="M4 9v7c0 1.7 3.6 3 8 3s8-1.3 8-3V9"/><path d="m7 3 4 5M17 3l-4 5"/>'),
  biblioteca: svgI('<path d="M5 4h4v16H5zM10 4h4v16h-4z"/><path d="m15 5 4-1 2 15-4 1z"/>'),
  acordes: svgI('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18M13 3v18M5 8h14M5 13h14"/><circle cx="11" cy="10.5" r="1.3"/>'),
  progresso: svgI('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  play: svgI('<path d="M7 4v16l13-8z"/>'),
  parar: svgI('<rect x="6" y="6" width="12" height="12" rx="1.5"/>'),
  ouvir: svgI('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>'),
  mais: svgI('<path d="M12 5v14M5 12h14"/>'),
  menos: svgI('<path d="M5 12h14"/>'),
  voltar: svgI('<path d="m14.5 6-6 6 6 6"/>'),
  estrela: svgI('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
  check: svgI('<path d="m5 12 4 4 10-10"/>'),
  roteiro: svgI('<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
  desfazer: svgI('<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
  pausa: svgI('<path d="M9 5v14M15 5v14"/>'),
  lixo: svgI('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  reticencias: svgI('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'),
  mic: svgI('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
  seta: svgI('<path d="m9 6 6 6-6 6"/>'),
  repetir: svgI('<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>'),
};
/* marca: pedal de efeito vermelho (o mesmo desenho do ícone do app) */
const MARCA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2.5" fill="#C8231A"/><circle cx="9" cy="7" r="1.8" fill="#1B1B1F"/><circle cx="15" cy="7" r="1.8" fill="#1B1B1F"/><circle cx="12" cy="10.2" r=".9" fill="#FF6B5E"/><rect x="7.5" y="12.5" width="9" height="7" rx="1" fill="#A81C14"/><circle cx="12" cy="16" r="1.9" fill="#E9E9EC"/></svg>';

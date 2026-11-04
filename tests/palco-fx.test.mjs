import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const fonte = readFileSync(new URL('../palco-fx.js', import.meta.url), 'utf8');
function ambiente({ salvo, antigo, reduzido = false, bloquearSom = false, armazenamentoBloqueado = false } = {}) {
  const eventos = {}, memoria = new Map([...(salvo ? [['guitarrafacil.palco-fx', JSON.stringify(salvo)]] : []), ...(antigo ? [['gf-palco-fx-v1', JSON.stringify(antigo)]] : [])]);
  const botao = () => ({ disabled: false, attrs: {}, setAttribute(k,v) { this.attrs[k] = v; } });
  const som = botao(), fogo = botao(), volume = { value: 20 };
  const main = { dataset: { tela: 'inicio' } }, media = { matches: reduzido, addEventListener(_, f) { this.mudar = f; } };
  let player = false, observador, audio;
  const metricas = { audios: 0, plays: 0, pausas: 0, animado: false };
  class Audio {
    constructor(url) { metricas.audios++; this.url = url; this.paused = true; audio = this; }
    addEventListener() {}
    play() { metricas.plays++; if (bloquearSom) return Promise.reject(Error('blocked')); this.paused = false; return Promise.resolve(); }
    pause() { metricas.pausas++; this.paused = true; }
  }
  const doc = { hidden: false, documentElement: { dataset: {} }, body: { prepend() {} },
    createElement: () => ({ setAttribute() {}, querySelector() { return {}; } }), addEventListener(k,f) { eventos[k] = f; },
    querySelector: s => s === '.gf-player' ? player : s === '#main' ? main : null,
    querySelectorAll: s => s === '[data-palco-som]' ? [som] : s === '[data-palco-fogo]' ? [fogo] : s === '[data-palco-volume]' ? [volume] : [],
  };
  const contexto = vm.createContext({ document: doc, Audio, matchMedia: () => media,
    criarFogoPalco: () => ({ executar(v) { metricas.animado = v; } }),
    localStorage: { getItem: k => { if (armazenamentoBloqueado) throw Error(); return memoria.get(k); }, setItem: (k,v) => { if (armazenamentoBloqueado) throw Error(); memoria.set(k,v); }, removeItem: k => { memoria.delete(k); } },
    KEY: 'guitarrafacil.',
    MutationObserver: class { constructor(f) { observador = f; } observe() {} },
    requestAnimationFrame: f => f(), metro: { ligado: false }, bateria: { ligada: false }, treino: { tocando: false },
  });
  vm.runInContext(fonte, contexto);
  const clicar = qual => eventos.click({ target: { closest: s => s === '[data-palco-som]' ? (qual === 'som' ? som : null) : s === '[data-palco-fogo]' ? (qual === 'fogo' ? fogo : null) : null } });
  return { doc, som, fogo, media, metricas, memoria, clicar, contexto, get audio() { return audio; },
    atualizar: () => vm.runInContext('PalcoFX.atualizar()', contexto),
    player: v => { player = v; observador(); },
    visibilidade: v => { doc.hidden = v; eventos.visibilitychange(); },
    volume: v => eventos.input({ target: { matches: () => true, value: v } }),
  };
}
const resolver = () => new Promise(resolve => setImmediate(resolve));
test('fogo sonoro só começa por comando explícito e silenciar para o áudio', async () => {
  const a = ambiente();
  assert.equal(a.metricas.audios, 0); assert.equal(a.som.textContent, 'Ouvir o fogo');
  a.clicar('nav'); assert.equal(a.metricas.audios, 0);
  a.clicar('som'); await resolver();
  assert.equal(a.audio.url, 'sons/fogo.mp3'); assert.equal(a.audio.loop, true); assert.equal(a.audio.volume, .2);
  assert.equal(a.audio.paused, false); a.clicar('som');
  assert.equal(a.audio.paused, true); assert.equal(a.som.attrs['aria-pressed'], 'false');
});
test('volume e pausa visual persistem; recarregar não reproduz áudio', () => {
  const a = ambiente(); a.volume(35); a.clicar('fogo');
  const salvo = JSON.parse(a.memoria.get('guitarrafacil.palco-fx'));
  assert.equal(salvo.volume, .35); assert.equal(salvo.fogo, false);
  const b = ambiente({ salvo });
  assert.equal(b.metricas.audios, 0); assert.equal(b.metricas.animado, false);
  b.clicar('som'); assert.equal(b.audio.volume, .35);
});
test('movimento reduzido congela o renderer e acompanha mudanças do sistema', () => {
  const a = ambiente({ reduzido: true });
  assert.equal(a.fogo.disabled, true); assert.equal(a.metricas.animado, false);
  a.media.matches = false; a.media.mudar();
  assert.equal(a.fogo.disabled, false); assert.equal(a.metricas.animado, true);
  a.clicar('fogo'); assert.equal(a.metricas.animado, false);
});
test('treino, segundo plano, metrônomo e bateria pausam o ambiente', async () => {
  const a = ambiente(); a.clicar('som'); await resolver(); a.player(true);
  assert.equal(a.metricas.animado, false); assert.equal(a.audio.paused, true);
  a.player(false); await resolver(); assert.equal(a.audio.paused, false);
  a.visibilidade(true); assert.equal(a.audio.paused, true);
  a.visibilidade(false); await resolver(); assert.equal(a.audio.paused, false);
  vm.runInContext('bateria.ligada = true', a.contexto); a.atualizar(); assert.equal(a.audio.paused, true);
  vm.runInContext('bateria.ligada = false; metro.ligado = true', a.contexto); a.atualizar(); assert.equal(a.audio.paused, true);
});
test('bloqueio de áudio oferece nova tentativa e armazenamento bloqueado mantém controles funcionais', async () => {
  const a = ambiente({ bloquearSom: true }); a.clicar('som'); await resolver();
  assert.equal(a.som.attrs['aria-pressed'], 'false'); assert.equal(a.som.textContent, 'Tentar ouvir o fogo');
  const b = ambiente({ armazenamentoBloqueado: true }); b.volume(25); b.clicar('fogo'); b.clicar('som');
  assert.equal(b.metricas.animado, false); assert.equal(b.audio.volume, .25);
});
test('abrir treino durante carregamento impede início tardio de áudio', async () => {
  const a = ambiente(); a.clicar('som'); a.player(true); await resolver();
  assert.equal(a.audio.paused, true);
});
test('preferência do fogo usa o prefixo do app e traz a chave antiga uma vez', () => {
  const a = ambiente({ antigo: { fogo: false, volume: .3 } });
  assert.equal(a.memoria.has('gf-palco-fx-v1'), false);
  assert.deepEqual(JSON.parse(a.memoria.get('guitarrafacil.palco-fx')), { fogo: false, volume: .3 });
  assert.equal(a.metricas.animado, false);
});

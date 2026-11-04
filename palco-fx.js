/* Ambiente do palco: fogo fluido e crepitação original, independentes da prática musical. */
'use strict';
const PalcoFX = (() => {
  // com o prefixo do app (lei 2), para sair junto no "Restaurar padrões de fábrica"; a chave antiga é trazida uma vez
  const chave = KEY + 'palco-fx', antiga = 'gf-palco-fx-v1';
  let salvo = {};
  try {
    const velho = localStorage.getItem(antiga);
    if (velho != null) { if (localStorage.getItem(chave) == null) localStorage.setItem(chave, velho); localStorage.removeItem(antiga); }
    salvo = JSON.parse(localStorage.getItem(chave) || '{}') || {};
  } catch {}
  const pref = { fogo: salvo.fogo !== false, volume: Number.isFinite(salvo.volume) ? Math.max(0, Math.min(.5, salvo.volume)) : .2 };
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)');
  let ambiente = null, solicitado = false, pendente = false, erroSom = false;
  const fundo = document.createElement('div');
  fundo.className = 'fogo-palco'; fundo.setAttribute('aria-hidden', 'true');
  fundo.innerHTML = '<canvas class="fogo-canvas"></canvas>';
  document.body.prepend(fundo);
  const animacao = typeof criarFogoPalco === 'function' ? criarFogoPalco(fundo.querySelector('canvas')) : { executar() {} };
  function guardar() { try { localStorage.setItem(chave, JSON.stringify(pref)); } catch {} }
  function emPratica() {
    return !!document.querySelector('.gf-player') ||
      (typeof metro !== 'undefined' && metro.ligado) ||
      (typeof bateria !== 'undefined' && bateria.ligada) ||
      (typeof treino !== 'undefined' && treino.tocando) ||
      ['afinador', 'estudio'].includes(document.querySelector('#main')?.dataset.tela);
  }
  function botoes() {
    const pausado = document.hidden || emPratica();
    document.querySelectorAll('[data-palco-som]').forEach(b => {
      const texto = !solicitado ? (erroSom ? 'Tentar ouvir o fogo' : 'Ouvir o fogo') : pausado ? 'Som do fogo: pausado' : 'Silenciar o fogo';
      b.setAttribute('aria-pressed', String(solicitado));
      if (b.textContent !== texto) b.textContent = texto;
    });
    document.querySelectorAll('[data-palco-fogo]').forEach(b => {
      b.setAttribute('aria-pressed', String(pref.fogo && !reduzido.matches));
      const texto = reduzido.matches ? 'Fogo: movimento reduzido' : `Fogo: ${pref.fogo ? 'animado' : 'pausado'}`;
      if (b.textContent !== texto) b.textContent = texto;
      b.disabled = reduzido.matches;
    });
    document.querySelectorAll('[data-palco-volume]').forEach(b => { b.value = Math.round(pref.volume * 100); });
  }
  function sincronizarSom(quieto) {
    if (!ambiente) return;
    if (!solicitado || quieto) { if (!ambiente.paused) ambiente.pause(); return; }
    if (!ambiente.paused || pendente) return;
    pendente = true;
    Promise.resolve(ambiente.play()).then(() => {
      pendente = false;
      // Uma troca de tela pode ocorrer enquanto o navegador carrega o arquivo.
      if (!solicitado || document.hidden || emPratica()) ambiente.pause();
    }).catch(() => { pendente = false; solicitado = false; erroSom = true; botoes(); });
  }
  function atualizar() {
    const quieto = document.hidden || emPratica(), parado = !pref.fogo || reduzido.matches || quieto;
    document.documentElement.dataset.fogoParado = String(parado);
    const inicio = document.querySelector('#main')?.dataset.tela === 'inicio';
    fundo.hidden = !inicio;
    animacao.executar(!parado && inicio);
    sincronizarSom(quieto); botoes();
  }
  document.addEventListener('click', e => {
    const som = e.target.closest('[data-palco-som]'), fogo = e.target.closest('[data-palco-fogo]');
    if (som) {
      solicitado = !solicitado; erroSom = false;
      if (solicitado && !ambiente) {
        try {
          ambiente = new Audio('sons/fogo.mp3'); ambiente.loop = true; ambiente.preload = 'none'; ambiente.volume = pref.volume;
          ambiente.addEventListener('error', () => { solicitado = false; erroSom = true; botoes(); });
        } catch { solicitado = false; erroSom = true; }
      }
      atualizar(); return;
    }
    if (fogo) { pref.fogo = !pref.fogo; guardar(); atualizar(); }
  }, true);
  document.addEventListener('input', e => {
    if (!e.target.matches('[data-palco-volume]')) return;
    pref.volume = Math.max(0, Math.min(.5, Number(e.target.value) / 100));
    if (ambiente) ambiente.volume = pref.volume;
    guardar();
  });
  // Apenas mudanças reais de atividade alteram o estado: não gera um ciclo de mutações dos rótulos.
  let agendado = false, ultimaAtividade = null;
  new MutationObserver(() => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => {
      agendado = false;
      const atual = document.hidden || emPratica();
      if (atual !== ultimaAtividade) { ultimaAtividade = atual; atualizar(); }
    });
  }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('visibilitychange', atualizar);
  reduzido.addEventListener('change', atualizar);
  // Nenhum arquivo de áudio é carregado, nem som reproduzido, antes de "Ouvir o fogo".
  atualizar();
  return { atualizar };
})();

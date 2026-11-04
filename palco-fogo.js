/* HQ em chamas: camadas curvas independentes e brasas, conforme a prévia aprovada. */
'use strict';
function criarFogoPalco(canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return { executar() {}, destruir() {} };
  let w = 0, h = 0, raf = 0, ativo = false, ultimo = 0, tempo = 1;
  function chama(x, y, largura, altura, t, s, cor) {
    const a = Math.sin(t * 2.3 + s), b = Math.sin(t * 3.7 + s * 2), ponta = x + largura * .7 * a;
    ctx.beginPath(); ctx.moveTo(x - largura * .6, y);
    ctx.bezierCurveTo(x - largura * 1.4, y - altura * .28, x + largura * .45, y - altura * .44, ponta - largura * .23, y - altura);
    ctx.bezierCurveTo(ponta + largura * .7, y - altura * .7, x + largura * 1.1, y - altura * .48, x + largura * .3, y - altura * .36);
    ctx.bezierCurveTo(x + largura * (1.1 + b * .2), y - altura * .52, x + largura * 1.1, y - altura * .12, x + largura * .7, y);
    ctx.closePath();
    const tinta = ctx.createLinearGradient(0, y - altura, 0, y);
    tinta.addColorStop(0, cor); tinta.addColorStop(.66, cor); tinta.addColorStop(1, cor + '00');
    ctx.fillStyle = tinta; ctx.fill();
  }
  function pintar() {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w * .5, h * .72, 0, w * .5, h * .72, Math.max(w, h) * .62);
    g.addColorStop(0, `rgba(255,75,23,${.16 + .04 * Math.sin(tempo * 3)})`); g.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // A chama tem coordenadas na página. Apenas a janela visível ocupa memória.
    const deslocamento = window.scrollY, faixa = 760;
    const primeira = Math.max(0, Math.floor(deslocamento / faixa) - 1);
    const ultima = Math.ceil((deslocamento + h) / faixa);
    for (let trecho = primeira; trecho <= ultima; trecho++) {
      const base = (trecho + 1) * faixa - deslocamento;
      for (let camada = 0; camada < 3; camada++) {
        for (let i = 0; i < 11; i++) {
          const x = i / 10 * w, borda = Math.pow(Math.abs(i / 10 - .5) * 2, 1.3);
          const fase = i * 1.7 + trecho * 2.1;
          const onda = .74 + .26 * Math.sin(tempo * 1.8 + fase);
          const altura = (faixa * .06 + faixa * borda * .65) * (.75 + .25 * Math.sin(i * 14.37 + trecho + 1)) * onda * (1 - camada * .22);
          chama(x, base, Math.min(w / 10, 90) * (1.25 - camada * .2), altura, tempo, fase + camada * .3, ['#a91d37', '#f34328', '#ffb337'][camada]);
        }
      }
      for (let i = 0; i < 40; i++) {
        const vida = (tempo * 38 + i * 67) % faixa, x = (i * 137.31 + trecho * 91) % w + Math.sin(tempo + i) * 13;
        ctx.globalAlpha = Math.sin(Math.PI * vida / faixa) * (.25 + i % 3 * .16);
        ctx.fillStyle = i % 3 ? '#ff9e48' : '#ffdc8b';
        ctx.save(); ctx.translate(x, base - vida); ctx.rotate(tempo * .6 + i); ctx.fillRect(0, 0, i % 3 + 1, (i % 4 + 1) * 2); ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = 1;
  }
  function tamanho() {
    const box = canvas.getBoundingClientRect(); w = box.width || innerWidth; h = box.height || innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1200000 / (w * h)));
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); pintar();
  }
  function quadro(t) {
    if (!ativo) return;
    if (t - ultimo >= 32) { tempo += Math.min((t - ultimo) / 1000, .05); ultimo = t; pintar(); }
    raf = requestAnimationFrame(quadro);
  }
  function executar(v) {
    if (ativo === v) return;
    ativo = v; cancelAnimationFrame(raf);
    if (ativo) { tamanho(); ultimo = performance.now(); raf = requestAnimationFrame(quadro); }
    else pintar();
  }
  let rolagem = 0;
  function aoRolar() { if (!ativo && !rolagem) rolagem = requestAnimationFrame(() => { rolagem = 0; pintar(); }); }
  window.addEventListener('scroll', aoRolar, { passive: true });
  const observador = new ResizeObserver(tamanho); observador.observe(canvas);
  tamanho();
  return { executar, destruir() { ativo = false; cancelAnimationFrame(raf); cancelAnimationFrame(rolagem); window.removeEventListener('scroll', aoRolar); observador.disconnect(); } };
}

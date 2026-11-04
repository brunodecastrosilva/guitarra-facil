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
    ctx.closePath(); ctx.fillStyle = cor; ctx.fill();
  }
  function pintar() {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w * .5, h * .72, 0, w * .5, h * .72, Math.max(w, h) * .62);
    g.addColorStop(0, `rgba(255,75,23,${.16 + .04 * Math.sin(tempo * 3)})`); g.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let camada = 0; camada < 3; camada++) {
      for (let i = 0; i < 11; i++) {
        const x = i / 10 * w, borda = Math.pow(Math.abs(i / 10 - .5) * 2, 1.3);
        const onda = .74 + .26 * Math.sin(tempo * 1.8 + i * 1.7);
        const altura = (h * .1 + h * borda * .65) * (.75 + .25 * Math.sin(i * 14.37 + 1)) * onda * (1 - camada * .22);
        chama(x, h + 30, w / 10 * (1.25 - camada * .2), altura, tempo, i * 1.3 + camada * .3, ['#a91d37', '#f34328', '#ffb337'][camada]);
      }
    }
    for (let i = 0; i < 48; i++) {
      const vida = (tempo * 38 + i * 67) % h, x = (i * 137.31) % w + Math.sin(tempo + i) * 13;
      ctx.globalAlpha = Math.sin(Math.PI * vida / h) * (.3 + i % 3 * .2);
      ctx.fillStyle = i % 3 ? '#ff9e48' : '#ffdc8b';
      ctx.save(); ctx.translate(x, h - vida); ctx.rotate(tempo * .6 + i); ctx.fillRect(0, 0, i % 3 + 1, (i % 4 + 1) * 2); ctx.restore();
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
  const observador = new ResizeObserver(tamanho); observador.observe(canvas);
  tamanho();
  return { executar, destruir() { ativo = false; cancelAnimationFrame(raf); observador.disconnect(); } };
}

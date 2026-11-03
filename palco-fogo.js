/* Fogo cartoon original: campo de combustão advectado, turbulência e recortes em três cores.
   As ilhas que se separam do campo formam fragmentos; nenhuma imagem de terceiros é usada. */
'use strict';
function criarFogoPalco(canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return { executar() {}, destruir() {} };
  const camada = document.createElement('canvas'), desenho = camada.getContext('2d');
  if (!desenho) return { executar() {}, destruir() {} };
  const nx = 160, ny = 480;
  camada.width = nx; camada.height = ny;
  const pixels = desenho.createImageData(nx, ny);
  // Ruído periódico pré-calculado: evita funções aleatórias ou alocações durante os quadros.
  const ruido = new Float32Array(4096);
  let seed = 173;
  for (let i = 0; i < ruido.length; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; ruido[i] = seed / 4294967296; }
  function noise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y); let fx = x - ix, fy = y - iy;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const a = ruido[(ix & 63) + (iy & 63) * 64], b = ruido[((ix + 1) & 63) + (iy & 63) * 64];
    const c = ruido[(ix & 63) + ((iy + 1) & 63) * 64], d = ruido[((ix + 1) & 63) + ((iy + 1) & 63) * 64];
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
  }
  let w = 0, h = 0, raf = 0, ativo = false, tempo = 0, ultimo = 0;
  function pintar() {
    ctx.clearRect(0, 0, w, h);
    const faixa = Math.min(w * .24, 260);
    for (let lado = 0; lado < 2; lado++) {
      const t = tempo + lado * 31.7;
      for (let y = 0; y < ny; y++) {
        const altura = 1 - y / (ny - 1);
        for (let x = 0; x < nx; x++) {
          const u = x / (nx - 1);
          // Duas correntes em velocidades distintas enrolam e rompem as pontas.
          const wx = u * 4 + (noise(u * 3 + 17, altura * 5 - t * .7) - .5) * 2.1;
          const wy = altura * 5 - t * 1.15 + (noise(u * 5, altura * 4 - t * .45) - .5) * 1.4;
          const tur = noise(wx, wy) * .70 + noise(wx * 2.2 + 9, wy * 2.1) * .23 + noise(wx * 4.3, wy * 4.2) * .07;
          const chama = (1 - altura) * .82 + tur * .88 - .47 - u * .75;
          const i = (y * nx + x) * 4;
          // Bordas vermelhas, laranja intermediário e núcleo amarelo pálido.
          const quente = chama > .23, medio = chama > .105;
          pixels.data[i] = quente ? 255 : medio ? 255 : 242;
          pixels.data[i + 1] = quente ? 239 : medio ? 99 : 29;
          pixels.data[i + 2] = quente ? 115 : medio ? 20 : 38;
          const borda = Math.max(0, Math.min(1, chama / .025));
          const margem = Math.max(0, Math.min(1, (1 - u) * 12));
          pixels.data[i + 3] = 255 * borda * margem;
        }
      }
      desenho.putImageData(pixels, 0, 0);
      ctx.save();
      if (lado) { ctx.translate(w, 0); ctx.scale(-1, 1); }
      const halo = ctx.createLinearGradient(0, 0, faixa * 1.3, 0);
      halo.addColorStop(0, '#f52b2426'); halo.addColorStop(1, '#f52b2400');
      ctx.fillStyle = halo; ctx.fillRect(0, 0, faixa * 1.3, h);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(camada, 0, h * -.05, faixa, h * 1.12);
      // Brasas ascendentes: vida e deriva independentes, sem saltos visíveis na renovação.
      for (let i = 0; i < 20; i++) {
        const vida = (t * (.055 + ruido[i] * .035) + ruido[i + 20]) % 1;
        const bx = faixa * (.12 + ruido[i + 40] * .65) + Math.sin(t + i) * 8;
        ctx.globalAlpha = Math.sin(vida * Math.PI) * .8;
        ctx.fillStyle = '#ffe788'; ctx.beginPath();
        ctx.ellipse(bx, h * (1.06 - vida * 1.15), 1 + ruido[i + 60], 2 + ruido[i + 80] * 2, .2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }
  function dimensionar() {
    w = innerWidth; h = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1200000 / Math.max(1, w * h)));
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); pintar();
  }
  function quadro(agora) {
    if (!ativo) return;
    if (agora - ultimo >= 1000 / 30) { tempo += Math.min(.1, (agora - ultimo) / 1000); ultimo = agora; pintar(); }
    raf = requestAnimationFrame(quadro);
  }
  function executar(v) {
    if (ativo === v) return;
    ativo = v;
    if (v) { ultimo = performance.now(); raf = requestAnimationFrame(quadro); }
    else { cancelAnimationFrame(raf); raf = 0; }
  }
  window.addEventListener('resize', dimensionar, { passive: true });
  dimensionar();
  return { executar, destruir() { executar(false); window.removeEventListener('resize', dimensionar); } };
}

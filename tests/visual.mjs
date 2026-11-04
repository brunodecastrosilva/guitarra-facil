/* Capturas reproduzíveis para revisar a direção de arte. Sem conta e sem dados reais. */
import { preparar, aparelho } from '../comum/testes/ambiente.mjs';
import { mkdir } from 'node:fs/promises';
const amb = await preparar();
await mkdir('revisao-visual', { recursive: true });
try {
  for (const [nome, viewport] of [['celular', { width: 360, height: 740 }], ['tablet', { width: 820, height: 1180 }], ['desktop', { width: 1440, height: 900 }]]) {
    const a = await aparelho(amb, { viewport }), p = a.page;
    await p.locator('.torre-palco').waitFor();
    await p.evaluate(() => abrirTreino('tecnica:bends:1:curto:2'));
    await p.click('#tr-ver');
    await p.locator('#tr-demonstrar').waitFor();
    await p.waitForTimeout(350);
    await p.screenshot({ path: `revisao-visual/${nome}-treino.png` });
    await p.click('#tr-demonstrar');
    await p.click('[data-etapa="1"]');
    await p.locator('.kf-dlg-corpo').evaluate(e => e.scrollTop = 0);
    await p.screenshot({ path: `revisao-visual/${nome}-bend.png` });
    await p.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
    await p.screenshot({ path: `revisao-visual/${nome}-claro.png` });
    if (a.erros.length) throw new Error(a.erros.join('\n'));
    await a.fechar();
  }
  for (const [id, nome] of [['tecnica:tapping:1:curto:0', 'tapping'], ['tecnica:legato:1:curto:0', 'ligados'], ['tecnica:posicao:1:curto:0', 'slide']]) {
    const a = await aparelho(amb, { viewport: { width: 1440, height: 900 } }), p = a.page;
    await p.locator('.torre-palco').waitFor();
    await p.evaluate(id => abrirTreino(id), id);
    await p.click('#tr-ver');
    await p.click('#tr-demonstrar'); await p.click('[data-etapa="1"]');
    await p.locator('.kf-dlg-corpo').evaluate(e => e.scrollTop = 0);
    await p.screenshot({ path: `revisao-visual/desktop-${nome}.png` });
    if (a.erros.length) throw new Error(a.erros.join('\n'));
    await a.fechar();
  }
  for (const [nome, rota] of ['inicio','treinos','explorar','estudio','afinador','metronomo','bateria','biblioteca','acordes','progresso','ajustes','sessao','plano'].map(x => [x,x])) {
    for (const [tela, viewport] of [['celular', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
      const a = await aparelho(amb, { viewport }), p = a.page;
      await p.locator('.torre-palco').waitFor();
      await p.evaluate(r => ir(r), rota);
      await p.waitForTimeout(250);
      await p.evaluate(async () => { await Promise.all([...document.images].map(im => im.decode().catch(() => {}))); });
      await p.screenshot({ path: `revisao-visual/${tela}-${nome}.png`, fullPage: true });
      if (a.erros.length) throw new Error(a.erros.join('\n'));
      await a.fechar();
    }
  }
} finally { await amb.encerrar(); }

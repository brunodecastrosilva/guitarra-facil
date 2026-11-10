/* Guitarra Fácil · capturas para revisão visual (rodam no GitHub Actions depois dos testes).
   Uso: node tests/visual.mjs   → revisao-visual/<tela>-<largura>-<tema>.png */
import { mkdir } from 'node:fs/promises';
import { preparar, aparelho, RAIZ } from '../comum/testes/ambiente.mjs';

const SAIDA = RAIZ + '/revisao-visual/';
const TELAS = [[360, 740], [390, 844], [820, 1180], [1440, 900]];
const ROTAS = ['inicio', 'treinos', 'explorar', 'estudio', 'afinador', 'metronomo', 'bateria', 'biblioteca', 'acordes', 'progresso', 'ajustes', 'sessao', 'treino/0004', 'treino/0030', 'treino/b-greensleeves'];

await mkdir(SAIDA, { recursive: true });
const amb = await preparar();
try {
  for (const tema of ['escuro', 'claro']) for (const [w, h] of TELAS) {
    const a = await aparelho(amb, { viewport: { width: w, height: h }, antes: new Function(`try { localStorage.setItem('kitfacil.guitarra-facil.visto', JSON.stringify('0.1.0')); localStorage.setItem('kitfacil.guitarra-facil.apresentacao', 'false'); localStorage.setItem('guitarrafacil.pref', JSON.stringify({ tema: '${tema}' })); } catch {}`) });
    for (const r of ROTAS) {
      await a.page.evaluate(x => { location.hash = '#/' + x; }, r);
      await a.page.waitForTimeout(250);
      await a.page.screenshot({ path: `${SAIDA}${r.replace(/\//g, '-')}-${w}-${tema}.png`, fullPage: true });
    }
    if (a.erros.length) console.log(`${w} ${tema}:`, a.erros);
    await a.fechar();
  }
  console.log('Capturas em revisao-visual/.');
} finally { await amb.encerrar(); }

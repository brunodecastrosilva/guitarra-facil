/* Guitarra Fácil · testes do app (npm test). Rodam num Chromium, sem internet:
   o GitHub (sincronização) e o Firestore (avaliações) são simulados por comum/testes/ambiente.mjs. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { preparar, aparelho, githubFalso, semRolagemLateral, conferirTopo, conferirNavAjustes, abrirAjustesPelaNav, irPelaNav, guiasAjustes, GUIAS_COMUNS, TOKEN_TESTE } from '../comum/testes/ambiente.mjs';

let amb;
before(async () => { amb = await preparar(); });
after(async () => { await amb?.encerrar(); });
const esperar = async (cond, ms = 8000) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, 50)); } return false; };
const TELAS = [[{ width: 360, height: 740 }, 'celular pequeno'], [{ width: 390, height: 844 }, 'celular'], [{ width: 820, height: 1180 }, 'tablet'], [{ width: 1440, height: 900 }, 'computador']];
const comNivel = (p, nivel = 'zero') => p.evaluate(n => { DB.cfg.nivel = n; commit(); render(); }, nivel);

test('abre sem erros em celular, tablet e computador, com a moldura da família e sem rolagem lateral', async () => {
  for (const [viewport, nome] of TELAS) {
    const a = await aparelho(amb, { viewport });
    const p = a.page;
    await p.locator('[data-nivel]').first().waitFor();
    assert.equal(await p.getAttribute('html', 'lang'), 'pt-BR');
    const t = await conferirTopo(p, { chopp: true });
    assert.deepEqual(t.erros, [], `${nome}: ${t.erros.join('; ')}`);
    const n = await conferirNavAjustes(p);
    assert.deepEqual(n.erros, [], `${nome}: ${n.erros.join('; ')}`);
    assert.ok(await semRolagemLateral(p), `${nome}: rolagem lateral`);
    assert.deepEqual(a.erros, [], nome);
    await a.fechar();
  }
});

test('barra de baixo: Hoje, Trilha, Ferramentas, Músicas e Mais (Progresso e Ajustes)', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.locator('[data-nivel]').first().waitFor();
  assert.deepEqual(await p.locator('.kf-nav .kf-nav-it:visible .kf-nav-l').allTextContents(), ['Hoje', 'Trilha', 'Ferramentas', 'Músicas', 'Mais']);
  await irPelaNav(p, 'Progresso');
  assert.equal(await p.textContent('.kf-titulo'), 'Progresso');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('teste de nível escolhe onde a trilha começa, e marcar aula atualiza Hoje e Progresso', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await p.click('[data-nivel="acordes"]');
  assert.match(await p.textContent('.passo'), /Primeira música/);
  assert.match(await p.textContent('.passo h2'), /Batida básica/);
  await irPelaNav(p, 'Trilha');
  await p.click('[data-feita="n3-batida"]');
  assert.equal(await p.getAttribute('[data-feita="n3-batida"]', 'aria-pressed'), 'true');
  await irPelaNav(p, 'Hoje');
  assert.match(await p.textContent('.passo h2'), /Sol, Ré, Mi menor, Dó/);
  await irPelaNav(p, 'Progresso');
  assert.match(await p.textContent('.dados'), /1\/11/);
  assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('guitarrafacil.db')).feitas.length), 1);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('músicas: estado vazio, criar com a lista de escolha do Kit, editar e excluir com Desfazer', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await comNivel(p);
  await irPelaNav(p, 'Músicas');
  assert.match(await p.textContent('.kf-vazio'), /Nenhuma música ainda/);
  await p.click('.kf-criar');
  await p.fill('#mu-t', 'Smoke on the Water');
  await p.fill('#mu-a', 'Deep Purple');
  assert.equal(await p.locator('#mu-e').isVisible(), false, 'a lista do sistema não aparece');
  await p.click('#mu-e-esc');
  await p.click('.kf-esc-op:has-text("Aprendendo")');
  await p.click('.kf-dlg-pe .kf-pri');
  assert.match(await p.textContent('main'), /Aprendendo/);
  assert.match(await p.textContent('main'), /Smoke on the Water/);
  await p.click('[data-musica]');
  await p.click('.kf-dlg [data-excluir]');
  assert.equal(await p.locator('[data-musica]').count(), 0);
  await p.click('.kf-toast-acao');
  assert.equal(await p.locator('[data-musica]').count(), 1);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('ferramentas: metrônomo muda o andamento, liga e desliga; notas para afinar e acordes', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await comNivel(p);
  await irPelaNav(p, 'Ferramentas');
  await p.click('[data-bpm="5"]');
  assert.equal(await p.textContent('#bpm'), '85');
  await p.click('#metro');
  assert.match(await p.textContent('#metro'), /Parar/);
  assert.ok(await esperar(() => p.evaluate(() => !!document.querySelector('.batidas span.on')), 3000), 'a batida acende');
  await p.click('#metro');
  assert.match(await p.textContent('#metro'), /Começar/);
  assert.equal(await p.locator('[data-corda]').count(), 6);
  await p.click('[data-corda="0"]');
  assert.equal(await p.locator('.acorde').count(), 6);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Ajustes: guias comuns na ordem do padrão e a guia própria Prática', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await comNivel(p);
  await abrirAjustesPelaNav(p);
  const g = await guiasAjustes(p);
  assert.deepEqual(g.comuns, GUIAS_COMUNS);
  assert.deepEqual(g.produto, ['Prática']);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

const conectar = async p => {
  await p.click('[data-kf-nuvem]');
  await p.click('.kf-dlg [data-kf="sync-ativar"]');
  await p.fill('#kf-token', TOKEN_TESTE);
  await p.click('[data-kf-conectar]');
};
test('sincronização: aulas e músicas passam de um aparelho para o outro, criptografadas', async () => {
  const gh = githubFalso();
  const a = await aparelho(amb, { github: gh });
  await a.page.evaluate(() => { DB.cfg.nivel = 'zero'; DB.musicas.push({ id: 'm1', titulo: 'Wonderwall', artista: '', estado: 'quero', obs: '' }); DB.feitas.push({ id: 'n1-partes', em: Date.now() }); commit(); render(); });
  await conectar(a.page);
  assert.ok(await esperar(async () => (await a.page.getAttribute('[data-kf-nuvem]', 'data-estado')) === 'sincronizado'), 'o primeiro aparelho sincroniza');
  const arq = gh.arquivo('guitarra-facil.json');
  assert.ok(arq && !/Wonderwall/.test(arq.conteudo), 'o gist deveria estar criptografado');
  const b = await aparelho(amb, { github: gh });
  await conectar(b.page);
  assert.ok(await esperar(() => b.page.evaluate(() => DB.musicas.some(m => m.titulo === 'Wonderwall') && DB.feitas.length === 1 && DB.cfg.nivel === 'zero')), 'o segundo aparelho recebe os dados');
  assert.deepEqual(a.erros, []); assert.deepEqual(b.erros, []);
  await a.fechar(); await b.fechar();
});

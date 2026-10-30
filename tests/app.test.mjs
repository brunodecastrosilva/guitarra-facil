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
  assert.match(await p.textContent('.passo'), /Rock: power chords e ritmo/);
  assert.match(await p.textContent('.passo h2'), /Power chords/);
  assert.equal(await p.locator('.blocos li').count(), 4, 'plano de hoje em quatro blocos');
  await irPelaNav(p, 'Trilha');
  await p.click('[data-feita="m3-power"]');
  assert.equal(await p.getAttribute('[data-feita="m3-power"]', 'aria-pressed'), 'true');
  await irPelaNav(p, 'Hoje');
  assert.match(await p.textContent('.passo h2'), /Abafar com a palma/);
  await irPelaNav(p, 'Progresso');
  assert.match(await p.textContent('.dados'), /1\/21/);
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
  assert.equal(await p.locator('details#f-treinos').getAttribute('open'), '', 'os treinos já vêm abertos');
  await p.evaluate(() => ir('ferramentas/metronomo'));
  await p.click('#f-metronomo [data-bpm="5"]');
  assert.equal(await p.textContent('#bpm'), '85');
  await p.click('#metro');
  assert.match(await p.textContent('#metro'), /Parar/);
  assert.ok(await esperar(() => p.evaluate(() => !!document.querySelector('.batidas span.on')), 3000), 'a batida acende');
  await p.click('#metro');
  assert.match(await p.textContent('#metro'), /Começar/);
  await p.evaluate(() => ir('ferramentas/afinador'));
  assert.equal(await p.locator('[data-corda]:visible').count(), 6);
  await p.click('[data-corda="0"]');
  // o afinador acha a nota de um Lá (110 Hz) e de um Mi grave (82,4 Hz) gerados aqui
  const f = await p.evaluate(() => [110, 82.41].map(hz => { const t = 48000, b = new Float32Array(2048); for (let i = 0; i < b.length; i++) b[i] = .5 * Math.sin(2 * Math.PI * hz * i / t) + .2 * Math.sin(4 * Math.PI * hz * i / t); const r = detectarFrequencia(b, t); return [Math.round(r * 10) / 10, notaDe(r).cifra]; }));
  assert.ok(Math.abs(f[0][0] - 110) < 1.5 && f[0][1] === 'A', `Lá: ${f[0]}`);
  assert.ok(Math.abs(f[1][0] - 82.4) < 1.5 && f[1][1] === 'E', `Mi: ${f[1]}`);
  assert.equal(await p.evaluate(() => detectarFrequencia(new Float32Array(2048), 48000)), null, 'silêncio não vira nota');
  assert.equal(await p.locator('.acorde').count(), 10);
  await p.evaluate(() => ir('ferramentas/braco'));
  assert.equal(await p.locator('.braco [data-nota]').count(), 6 * 13 - 6 * 13 + [0,1,2,3,4,5].reduce((s, c) => s + [...Array(13).keys()].filter(k => !['C#','D#','F#','G#','A#'].includes(['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][([4,9,2,7,11,4][c] + k) % 12])).length, 0));
  await p.click('[data-braco="todas"]');
  assert.equal(await p.locator('.braco [data-nota]').count(), 78);
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

test('aula: abre com objetivo, passos e exercício; registrar andamento aparece em Progresso', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await comNivel(p);
  await irPelaNav(p, 'Trilha');
  await p.click('[data-aula="m1-1234"]');
  const d = p.locator('.kf-dlg[data-kf-dialogo="aula"]');
  await d.waitFor();
  assert.match(await d.textContent(), /Objetivo/);
  assert.equal(await d.locator('.aula-passos li').count(), 4);
  await d.locator('[data-ex-mais="5"]').click();
  await d.locator('[data-ex-mais="5"]').click();
  await d.locator('[data-ex-registrar]').click();
  await d.locator('[data-aula-feita]').click();
  assert.equal(await p.getAttribute('[data-feita="m1-1234"]', 'aria-pressed'), 'true');
  await irPelaNav(p, 'Progresso');
  assert.match(await p.textContent('.andas'), /Aquecimento 1-2-3-4[\s\S]*melhor: 70 bpm · meta 120/);
  assert.equal(await p.evaluate(() => TRILHA.flatMap(n => n.aulas).length), 33);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('teoria: escalas, acordes e campo harmônico calculados certo, com o braço desenhado', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await comNivel(p);
  const r = await p.evaluate(() => ({
    penta: notasEscala(9, 'penta-menor').map(n => CIFRA[n]).join(' '),
    maiorG: notasEscala(7, 'maior').map(n => CIFRA[n]).join(' '),
    campoG: campoHarmonico(7).map(c => c.triade).join(' '),
    c7: notasAcorde(0, '7').map(n => CIFRA[n]).join(' '),
    rel: CIFRA[relativaMenor(0)],
    des: desenhosPenta(9)[0].join('-'),
  }));
  assert.equal(r.penta, 'A C D E G');
  assert.equal(r.maiorG, 'G A B C D E F#');
  assert.equal(r.campoG, 'G Am Bm C D Em F#°');
  assert.equal(r.c7, 'C E G A#');
  assert.equal(r.rel, 'A');
  assert.equal(r.des, '5-8', 'primeiro desenho da pentatônica de Lá na casa 5');
  await irPelaNav(p, 'Teoria');
  assert.equal(await p.textContent('.kf-titulo'), 'Teoria');
  assert.ok(await p.locator('#te-braco [data-nota]').count() > 20);
  await p.click('#te-esc-esc');
  await p.click('.kf-esc-op:has-text("Maior (jônio)")');
  assert.match(await p.textContent('#t-escalas'), /Notas: A · B · C# · D · E · F# · G#/);
  await p.evaluate(() => { document.getElementById('t-circulo').open = true; });
  await p.click('#t-circulo [data-tom="7"]');
  assert.match(await p.textContent('#t-circulo .campo-h'), /G[\s\S]*Am[\s\S]*Bm[\s\S]*C[\s\S]*D[\s\S]*Em[\s\S]*F#°/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('treino com o professor: avaliação das notas, exemplo tocando e bateria sem erros', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await comNivel(p);
  // avaliação: duas notas certas (uma levemente alta), uma errada e uma não ouvida
  const r = await p.evaluate(() => avaliar([{ midi: 40, amostras: [40.02, 40.05, 40.1] }, { midi: 45, amostras: [45.1, 45.12] }, { midi: 50, amostras: [47, 47.1, 47] }, { midi: 55, amostras: [null, null] }]));
  assert.equal(r.acerto, 50); assert.equal(r.ouvidas, 3); assert.deepEqual(r.notas.map(n => n.ok), [true, true, false, false]);
  assert.ok(r.cents >= 4 && r.cents <= 12, `cents ${r.cents}`);
  await irPelaNav(p, 'Ferramentas');
  await p.click('[data-treino="ex-soltas"]');
  const d = p.locator('.kf-dlg[data-kf-dialogo="treino"]');
  await d.waitFor();
  assert.equal(await d.locator('.tab-n').count(), 11);
  await d.locator('[data-tr-bpm="5"]').click();
  assert.equal(await d.locator('#tr-bpm').textContent(), '65');
  await d.locator('#tr-r').evaluate(el => { el.value = 200; el.dispatchEvent(new Event('input', { bubbles: true })); });
  assert.equal(await d.locator('#tr-bpm').textContent(), '140', 'o máximo é a meta + 40');
  await d.locator('#tr-mic').uncheck();
  await d.locator('#tr-ir').click();
  assert.ok(await esperar(() => p.evaluate(() => treino.tocando)), 'o treino começa');
  assert.ok(await esperar(() => p.evaluate(() => !treino.tocando), 15000), 'o treino termina');
  assert.equal(await d.locator('#tr-ir').textContent(), 'Começar');
  await p.keyboard.press('Escape');
  await p.evaluate(() => { document.getElementById('f-bateria').open = true; });
  await p.click('[data-estilo="funk"]');
  await p.click('#bat-ligar');
  assert.ok(await esperar(() => p.evaluate(() => bateria.ligada)));
  await p.click('#bat-ligar');
  assert.equal(await p.evaluate(() => bateria.ligada), false);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('professor e playlists: sugestões com ação e música adicionada à lista', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await comNivel(p);
  assert.ok(await p.locator('.prof [data-prof]').count() >= 2, 'o professor sugere ações');
  await p.evaluate(() => { DB.treinos.push({ id: 't1', ex: 'ex-1234', bpm: 80, acerto: 95, cents: 6, em: Date.now() }); commit(); render(); });
  assert.match(await p.textContent('.prof'), /pronto para 85 bpm/);
  await irPelaNav(p, 'Músicas');
  assert.equal(await p.locator('.playlist').count(), 5);
  assert.match(await p.getAttribute('#pl-1 a[href*="youtube"]', 'href'), /youtube\.com\/results\?search_query=/);
  await p.click('#pl-1 [data-pl-add="pl-1|0"]');
  assert.equal(await p.evaluate(() => DB.musicas[0].titulo), "Knockin' on Heaven's Door");
  assert.equal(await p.locator('#pl-1 [data-pl-add="pl-1|0"]').isDisabled(), true);
  await irPelaNav(p, 'Progresso');
  assert.equal(await p.locator('.grafico rect').count(), 1);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

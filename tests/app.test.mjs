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
const pronto = p => p.locator('.passo').waitFor();

test('abre sem erros em celular, tablet e computador, com a moldura da família e sem rolagem lateral', async () => {
  for (const [viewport, nome] of TELAS) {
    const a = await aparelho(amb, { viewport });
    const p = a.page;
    await pronto(p);
    assert.equal(await p.getAttribute('html', 'lang'), 'pt-BR');
    const t = await conferirTopo(p, { chopp: true });
    assert.deepEqual(t.erros, [], `${nome}: ${t.erros.join('; ')}`);
    const n = await conferirNavAjustes(p);
    assert.deepEqual(n.erros, [], `${nome}: ${n.erros.join('; ')}`);
    assert.ok(await semRolagemLateral(p), `${nome}: rolagem lateral`);
    await p.evaluate(() => ir('treinos'));
    assert.ok(await semRolagemLateral(p), `${nome}: rolagem lateral em Treinos`);
    assert.deepEqual(a.erros, [], nome);
    await a.fechar();
  }
});

test('barra de baixo: Hoje, Treinos, Teoria, Ferramentas e Mais (Músicas, Progresso e Ajustes)', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  assert.deepEqual(await p.locator('.kf-nav .kf-nav-it:visible .kf-nav-l').allTextContents(), ['Hoje', 'Treinos', 'Teoria', 'Ferramentas', 'Mais']);
  await irPelaNav(p, 'Progresso');
  assert.equal(await p.textContent('.kf-titulo'), 'Progresso');
  await irPelaNav(p, 'Músicas');
  assert.equal(await p.textContent('.kf-titulo'), 'Músicas');
  assert.equal(await p.locator('[data-nivel], .prof').count(), 0, 'sem teste de nível e sem professor');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('cromático: as 24 combinações, casa, cordas e figura mudam as notas', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  const r = await p.evaluate(() => {
    const t = treinoCromatico({ perm: '1324', casa: 5, percurso: 'desce', fig: .5 });
    const ida = treinoCromatico({ perm: '1234', percurso: 'ida' });
    return { n: PERMS.length, unicas: new Set(PERMS).size, primeiras: t.notas.slice(0, 4).map(x => x[1] + '/' + x[3]).join(' '), dur: t.notas[0][2], cordas: [...new Set(t.notas.map(x => x[0]))].join(''), idaN: ida.notas.length, alvo: t.alvo };
  });
  assert.equal(r.n, 24); assert.equal(r.unicas, 24);
  assert.equal(r.primeiras, '5/1 7/3 6/2 8/4', 'dedo 1 na casa 5, na ordem 1-3-2-4');
  assert.equal(r.dur, .5); assert.equal(r.cordas, '012345'); assert.equal(r.idaN, 40); assert.equal(r.alvo, 100);
  await irPelaNav(p, 'Treinos');
  assert.equal(await p.locator('#c-cromatico .perm').count(), 24);
  await p.click('[data-tr-abrir="crom:2413"]');
  const d = p.locator('.kf-dlg[data-kf-dialogo="treino"]');
  await d.waitFor();
  assert.equal(await d.locator('.tab-n').count(), 24);
  assert.equal(await d.locator('.braco-tr .nt').count(), 24, 'cada nota no braço');
  await d.locator('[data-perm="4321"]').click();
  assert.match(await d.locator('.kf-dlg-cab h2').textContent(), /4-3-2-1/);
  await d.locator('#tr-casa-esc').click();
  await p.click('.kf-esc-op:has-text("Casa 7 ")');
  await d.locator('[data-percurso="sobe"]').click();
  assert.equal(await p.evaluate(() => DB.cfg.trCrom.casa), 7);
  assert.equal(await p.evaluate(() => DB.cfg.trCrom.percurso), 'sobe');
  assert.match(await d.locator('.braco-tr .casa-n').first().textContent(), /6/, 'o braço mostra a partir da casa 6');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('treino toca em voltas, sobe o andamento, segue para a próxima combinação e registra o andamento limpo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await p.evaluate(() => abrirTreino('crom:1234', 240, { percurso: 'desce', fig: .25 }));
  const d = p.locator('.kf-dlg[data-kf-dialogo="treino"]');
  await d.waitFor();
  assert.equal(await d.locator('#tr-bpm').textContent(), '240');
  await d.locator('[data-tr-bpm="-5"]').click();
  await d.locator('[data-tr-bpm="1"]').click();
  assert.equal(await d.locator('#tr-bpm').textContent(), '236');
  await d.locator('#tr-r').evaluate(el => { el.value = 300; el.dispatchEvent(new Event('input', { bubbles: true })); });
  assert.equal(await d.locator('#tr-bpm').textContent(), '240', 'o máximo é 240');
  await d.locator('#tr-fim-esc').click(); await p.click('.kf-esc-op:has-text("Seguir para a próxima combinação")');
  await d.locator('#tr-sobe-esc').click(); await p.click('.kf-esc-op:has-text("+1 bpm")');
  await d.locator('[data-tr-bpm="-5"]').click();
  await d.locator('#tr-ir').click();
  assert.ok(await esperar(() => p.evaluate(() => treino.tocando)), 'o treino começa');
  assert.ok(await esperar(() => p.evaluate(() => !!document.querySelector('.braco-tr .nt.agora'))), 'a nota da vez acende no braço');
  // contagem (1 s) + volta de 6 batidas a 235 bpm (1,5 s): na segunda volta já é a próxima combinação, 1 bpm acima
  assert.ok(await esperar(() => d.locator('#tr-status').textContent().then(t => /Volta 2/.test(t)), 8000), 'segunda volta');
  assert.match(await d.locator('#tr-status').textContent(), /1-2-4-3 · 236 bpm/);
  assert.ok(await esperar(() => d.locator('#tr-status').textContent().then(t => /Volta [4-9]/.test(t)), 12000));
  // passou de 15 s? encurta o relógio para o treino valer
  await p.evaluate(() => { const r = Date.now; Date.now = () => r() + 20000; });
  await d.locator('#tr-ir').click();
  assert.equal(await p.evaluate(() => treino.tocando), false);
  await d.locator('[data-limpo="1"]').click();
  const t = await p.evaluate(() => DB.treinos[DB.treinos.length - 1]);
  assert.equal(t.limpo, true); assert.ok(t.voltas >= 3); assert.match(t.ex, /^crom:/);
  assert.ok(await p.evaluate(() => DB.praticas.length === 1 && DB.conquistas.some(c => c.id === 'primeiro')), 'tempo de prática e conquista');
  await p.keyboard.press('Escape');
  await irPelaNav(p, 'Progresso');
  assert.match(await p.textContent('.perms-prog'), /\d+ bpm/);
  assert.match(await p.textContent('.conquistas'), /Primeiro treino[\s\S]*ganha hoje/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('escalas: cinco desenhos, troca de tom e o botão Treinar na Teoria', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  const r = await p.evaluate(() => { const e = treinoEscala({ escala: 'penta-menor', raiz: 9, desenho: 0, percurso: 'sobe' }); return { n: e.notas.length, casas: e.notas.map(x => x[1]).join(','), notas: [...new Set(e.notas.map(x => CIFRA[pc(SOLTAS[x[0]] + x[1])]))].sort().join(' ') }; });
  assert.equal(r.n, 12); assert.equal(r.casas, '5,8,5,7,5,7,5,7,5,8,5,8'); assert.equal(r.notas, 'A C D E G');
  await irPelaNav(p, 'Treinos');
  assert.equal(await p.locator('.des-it').count(), 5);
  await p.click('.des-it >> nth=1');
  const d = p.locator('.kf-dlg[data-kf-dialogo="treino"]');
  await d.waitFor();
  assert.ok(await d.locator('.braco-tr .nt.raiz').count() >= 2, 'a tônica marcada no braço');
  await d.locator('#tr-raiz-esc').click(); await p.click('.kf-esc-op:has-text("Mi (E)")');
  assert.match(await d.locator('.kf-dlg-cab h2').textContent(), /de Mi/);
  await p.keyboard.press('Escape');
  await irPelaNav(p, 'Teoria');
  await p.click('#t-escalas [data-te-des="2"]');
  await p.click('#t-escalas [data-tr-abrir]');
  await d.waitFor();
  assert.match(await d.locator('.kf-dlg-sub').textContent(), /desenho 3/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('hoje: sequência de dias, semana, plano com treinos e resumo da semana', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  assert.match(await p.textContent('.passo h2'), /Comece hoje/);
  assert.match(await p.textContent('main'), /Como funciona/);
  await p.evaluate(() => { const d = 864e5, n = Date.now(); [0, 1, 2, 5].forEach(k => DB.praticas.push({ id: 'p' + k, em: n - k * d, min: 25 })); DB.treinos.push({ id: 't1', ex: 'ex-1234', bpm: 80, acerto: 95, em: n - 3600e3 }); commit(); conferirConquistas(false); render(); });
  assert.match(await p.textContent('.passo h2'), /3 dias seguidos/);
  assert.equal(await p.locator('.semana li').count(), 7);
  assert.ok(await p.locator('.semana li.hoje.feito').count() === 1);
  assert.match(await p.textContent('.continuar'), /Cromático 1-2-3-4[\s\S]*Continuar a 80 bpm/, 'o treino antigo vira o cromático');
  assert.equal(await p.locator('.blocos li').count(), 4);
  assert.equal(await p.evaluate(() => maiorSequencia()), 3);
  assert.ok(await p.evaluate(() => ['primeiro', 'meta', 'dias3'].every(id => temConquista(id))));
  await p.click('[data-tr-ultimo]');
  await p.locator('.kf-dlg[data-kf-dialogo="treino"]').waitFor();
  assert.equal(await p.textContent('#tr-bpm'), '80');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('músicas: estado vazio, criar com a lista de escolha do Kit, editar e excluir com Desfazer', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
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
  assert.equal(await p.locator('.playlist').count(), 5);
  assert.doesNotMatch(await p.textContent('main'), /nível/);
  assert.match(await p.getAttribute('#pl-1 a[href*="youtube"]', 'href'), /youtube\.com\/results\?search_query=/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('ferramentas: metrônomo muda o andamento, liga e desliga; afinador, mapa do braço, acordes e bateria', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await irPelaNav(p, 'Ferramentas');
  assert.equal(await p.locator('details#f-metronomo').getAttribute('open'), '', 'o metrônomo já vem aberto');
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
  const f = await p.evaluate(() => [110, 82.41].map(hz => { const t = 48000, b = new Float32Array(2048); for (let i = 0; i < b.length; i++) b[i] = .5 * Math.sin(2 * Math.PI * hz * i / t) + .2 * Math.sin(4 * Math.PI * hz * i / t); const r = detectarFrequencia(b, t); return [Math.round(r * 10) / 10, notaDe(r).cifra]; }));
  assert.ok(Math.abs(f[0][0] - 110) < 1.5 && f[0][1] === 'A', `Lá: ${f[0]}`);
  assert.ok(Math.abs(f[1][0] - 82.4) < 1.5 && f[1][1] === 'E', `Mi: ${f[1]}`);
  assert.equal(await p.evaluate(() => detectarFrequencia(new Float32Array(2048), 48000)), null, 'silêncio não vira nota');
  assert.equal(await p.locator('.acorde').count(), 10);
  await p.evaluate(() => ir('ferramentas/braco'));
  await p.click('[data-braco="todas"]');
  assert.equal(await p.locator('.braco [data-nota]').count(), 78);
  await p.evaluate(() => { document.getElementById('f-bateria').open = true; });
  await p.click('[data-estilo="funk"]');
  await p.click('#bat-ligar');
  assert.ok(await esperar(() => p.evaluate(() => bateria.ligada)));
  await p.click('#bat-ligar');
  assert.equal(await p.evaluate(() => bateria.ligada), false);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Ajustes: guias comuns na ordem do padrão e a guia própria Prática', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
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
test('sincronização: treinos, conquistas e músicas passam de um aparelho para o outro, criptografadas', async () => {
  const gh = githubFalso();
  const a = await aparelho(amb, { github: gh });
  await a.page.evaluate(() => { DB.musicas.push({ id: 'm1', titulo: 'Wonderwall', artista: '', estado: 'quero', obs: '' }); DB.treinos.push({ id: 't1', ex: 'crom:3412', bpm: 90, limpo: true, em: Date.now() }); commit(); conferirConquistas(false); render(); });
  await conectar(a.page);
  assert.ok(await esperar(async () => (await a.page.getAttribute('[data-kf-nuvem]', 'data-estado')) === 'sincronizado'), 'o primeiro aparelho sincroniza');
  const arq = gh.arquivo('guitarra-facil.json');
  assert.ok(arq && !/Wonderwall/.test(arq.conteudo), 'o gist deveria estar criptografado');
  const b = await aparelho(amb, { github: gh });
  await conectar(b.page);
  assert.ok(await esperar(() => b.page.evaluate(() => DB.musicas.some(m => m.titulo === 'Wonderwall') && DB.treinos.length === 1 && DB.conquistas.some(c => c.id === 'primeiro'))), 'o segundo aparelho recebe os dados');
  assert.deepEqual(a.erros, []); assert.deepEqual(b.erros, []);
  await a.fechar(); await b.fechar();
});

test('teoria: escalas, acordes e campo harmônico calculados certo, com o braço desenhado', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
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
  assert.equal(await p.locator('#t-escalas [data-tr-abrir]').count(), 0, 'a escala maior não tem treino por desenho');
  await p.evaluate(() => { document.getElementById('t-circulo').open = true; });
  await p.click('#t-circulo [data-tom="7"]');
  assert.match(await p.textContent('#t-circulo .campo-h'), /G[\s\S]*Am[\s\S]*Bm[\s\S]*C[\s\S]*D[\s\S]*Em[\s\S]*F#°/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

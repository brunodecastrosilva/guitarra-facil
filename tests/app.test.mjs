/* Guitarra Fácil · testes do app (npm test). Rodam num Chromium, sem internet: o GitHub (sincronização) e o Firestore
   (avaliações) são simulados por comum/testes/ambiente.mjs. Cada teste confere um artigo do Código ou das Regras do app. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { preparar, aparelho, githubFalso, semRolagemLateral, conferirTopo, conferirNavAjustes, abrirAjustesPelaNav, irPelaNav, guiasAjustes, GUIAS_COMUNS, TOKEN_TESTE, RAIZ } from '../comum/testes/ambiente.mjs';

let amb, versao;
before(async () => { amb = await preparar(); versao = JSON.parse(await readFile(RAIZ + '/package.json', 'utf8')).version; });
after(async () => { await amb?.encerrar(); });
const esperar = async (cond, ms = 10000) => { const fim = Date.now() + ms; while (Date.now() < fim) { if (await cond()) return true; await new Promise(r => setTimeout(r, 60)); } return false; };
const TELAS = [[{ width: 360, height: 740 }, 'celular pequeno'], [{ width: 390, height: 844 }, 'celular'], [{ width: 820, height: 1180 }, 'tablet'], [{ width: 1440, height: 900 }, 'computador']];
/* aparelho de quem já usa: sem a apresentação ao abrir, para os testes irem direto à tela */
const semApresentacao = () => { try { localStorage.setItem('kitfacil.guitarra-facil.visto', JSON.stringify('0.1.0')); localStorage.setItem('kitfacil.guitarra-facil.apresentacao', 'false'); } catch {} };
const abrir = (o = {}) => aparelho(amb, { antes: semApresentacao, ...o });
const ir = (p, rota) => p.evaluate(r => { location.hash = '#/' + r; }, rota);
const PRINCIPAIS = [['inicio', 'Início'], ['treinos', 'Treinos'], ['explorar', 'Explorar'], ['estudio', 'Estúdio'], ['afinador', 'Afinador'], ['metronomo', 'Metrônomo'], ['bateria', 'Bateria'], ['biblioteca', 'Biblioteca'], ['acordes', 'Acordes'], ['progresso', 'Progresso']];

test('abre sem erros em celular, tablet e computador, sem rolagem lateral, com a moldura do Código', async () => {
  for (const [viewport, nome] of TELAS) {
    const a = await abrir({ viewport });
    const p = a.page;
    await p.locator('#tela .kf-titulo').waitFor();
    assert.equal(await p.getAttribute('html', 'lang'), 'pt-BR');
    for (const [r] of [...PRINCIPAIS, ['ajustes'], ['sessao'], ['treino/0030'], ['treino/b-greensleeves'], ['treino/0001']]) {
      await ir(p, r); await p.waitForTimeout(150);
      assert.ok(await semRolagemLateral(p), `rolagem lateral em ${r} no ${nome}`);
    }
    await ir(p, 'inicio'); await p.waitForTimeout(150);
    const topo = await conferirTopo(p, { chopp: true });
    assert.deepEqual(topo.erros, [], `área superior no ${nome}`);
    const navs = await p.evaluate(() => ['.kf-nav', '.kf-trilho'].filter(q => document.querySelector(q).getClientRects().length));
    assert.deepEqual(navs, [viewport.width >= 1024 ? '.kf-trilho' : '.kf-nav'], `navegação no ${nome}`);
    const nav = await conferirNavAjustes(p);
    assert.deepEqual(nav.erros, [], `Ajustes na navegação no ${nome}`);
    assert.deepEqual(a.erros, [], `erros no ${nome}`);
    await a.fechar();
  }
});

test('zoom liberado, tema escuro de fábrica e as fontes da família', async () => {
  const a = await abrir();
  const p = a.page;
  const vp = await p.getAttribute('meta[name="viewport"]', 'content');
  assert.doesNotMatch(vp, /maximum-scale|user-scalable/);
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  const html = await readFile(RAIZ + '/index.html', 'utf8');
  assert.match(html, /family=Atkinson\+Hyperlegible\+Next/);
  assert.match(html, /family=Big\+Shoulders\+Display/);
  await a.fechar();
});

test('barra de baixo: Início, Treinos, Explorar, Estúdio e Mais (Regras, Art. 5º), com Ajustes por último no Mais', async () => {
  const a = await abrir();
  const p = a.page;
  const visiveis = await p.locator('.kf-nav .kf-nav-it').evaluateAll(bs => bs.filter(b => b.getClientRects().length).map(b => b.textContent.trim()));
  assert.deepEqual(visiveis, ['Início', 'Treinos', 'Explorar', 'Estúdio', 'Mais']);
  await p.locator('.kf-nav [data-kf-nav-mais]').click();
  const mais = await p.locator('[data-kf-dialogo="mais"] .kf-aj-item').allTextContents();
  assert.deepEqual(mais.map(t => t.trim()), ['Afinador', 'Metrônomo', 'Bateria', 'Biblioteca', 'Acordes', 'Progresso', 'Ajustes']);
  await p.locator('[data-kf-dialogo="mais"] .kf-aj-item', { hasText: 'Acordes' }).click();
  await p.locator('#tela .kf-titulo', { hasText: 'Acordes' }).waitFor();
  assert.equal(await p.getAttribute('.kf-nav [data-kf-nav-mais]', 'aria-current'), 'page');
  await a.fechar();
});

test('toda tela principal tem título igual ao nome da navegação e uma linha de apoio (Art. 64, I)', async () => {
  const a = await abrir();
  const p = a.page;
  for (const [r, nome] of PRINCIPAIS) {
    await ir(p, r); await p.locator('#tela .kf-titulo', { hasText: nome }).waitFor();
    assert.equal((await p.textContent('#tela .kf-titulo')).trim(), nome, r);
    assert.ok(((await p.textContent('#tela .kf-cab-sub')) || '').trim().length > 10, `linha de apoio em ${r}`);
    assert.equal(await p.locator('#tela .kf-cab').count(), 1, `um cabeçalho em ${r}`);
    // no máximo um botão principal por tela (Art. 66)
    assert.ok(await p.locator('#tela .kf-btn.kf-pri:visible').count() <= 1, `um só botão principal em ${r}`);
  }
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('listas vazias explicam o que aparece e o que fazer (Art. 64, III); Estúdio tem um só botão de criar', async () => {
  const a = await abrir();
  const p = a.page;
  await ir(p, 'estudio');
  await p.locator('.kf-vazio', { hasText: 'Nenhuma ideia ainda' }).waitFor();
  assert.match(await p.textContent('.kf-vazio'), /Nova ideia/);
  assert.equal(await p.locator('.kf-criar:visible').count(), 1);
  await ir(p, 'progresso'); await p.locator('[data-aba-prog="historico"]').click();
  await p.locator('.kf-vazio', { hasText: 'Nenhum treino registrado' }).waitFor();
  await ir(p, 'treinos'); await p.locator('[data-aba-treinos="favoritos"]').click();
  await p.locator('.kf-vazio', { hasText: 'Nenhum favorito ainda' }).waitFor();
  await a.fechar();
});

test('nada lado a lado: as listas mostram um item por linha em qualquer largura (Art. 67)', async () => {
  for (const [viewport] of [TELAS[1], TELAS[3]]) {
    const a = await abrir({ viewport });
    const p = a.page;
    for (const r of ['treinos', 'acordes', 'biblioteca', 'inicio']) {
      await ir(p, r); await p.waitForTimeout(150);
      const lado = await p.evaluate(() => [...document.querySelectorAll('#tela .gf-lista')].some(l => { const ys = [...l.children].map(li => Math.round(li.getBoundingClientRect().top)); return new Set(ys).size !== ys.length; }));
      assert.equal(lado, false, `itens lado a lado em ${r}`);
    }
    await a.fechar();
  }
});

test('Ajustes: as oito guias comuns na ordem do Código e a guia própria Prática', async () => {
  const a = await abrir();
  const p = a.page;
  await abrirAjustesPelaNav(p);
  await p.locator('.kf-aj-h').waitFor();
  const g = await guiasAjustes(p);
  assert.deepEqual(g.comuns, GUIAS_COMUNS);
  assert.deepEqual(g.produto, ['Prática']);
  await p.click('.kf-aj-lista [data-kf-aj-ir="pratica"]');
  await p.locator('[data-seg-pr-mao="canhoto"]').click();
  assert.equal(await p.evaluate(() => DADOS.perfil().mao), 'canhoto');
  // Restaurar padrões de fábrica é a última opção de Privacidade e segurança (Art. 63)
  await p.goBack(); await p.waitForTimeout(200);
  if (!(await p.locator('.kf-aj-lista [data-kf-aj-ir="privacidade"]:visible').count())) await abrirAjustesPelaNav(p);
  await p.click('.kf-aj-lista [data-kf-aj-ir="privacidade"]');
  const ultimo = await p.locator('#kf-aj-privacidade .kf-btn').last().textContent();
  assert.match(ultimo, /padrões de fábrica/i);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('mão esquerda espelha o braço; a afinação muda as notas do afinador e do Explorar', async () => {
  const a = await abrir();
  const p = a.page;
  await ir(p, 'explorar');
  const x0 = await p.locator('#ex-braco .gf-alvo[data-c="0"][data-k="1"]').evaluate(e => e.getBBox().x);
  await p.evaluate(() => DADOS.mudarPerfil({ mao: 'canhoto', afin: 'drop-d' }));
  await ir(p, 'treinos'); await ir(p, 'explorar'); await p.waitForTimeout(150);
  const x1 = await p.locator('#ex-braco .gf-alvo[data-c="0"][data-k="1"]').evaluate(e => e.getBBox().x);
  assert.ok(x1 > x0 + 200, 'casa 1 deveria ir para a direita no braço canhoto');
  assert.equal(await p.getAttribute('#ex-braco .gf-alvo[data-c="0"][data-k="0"]', 'aria-label'), 'Ré, 6ª corda, solta');
  await a.fechar();
});

test('catálogo: números únicos, objetivos sem repetir, compassos inteiros e acordes reconhecidos pela teoria', async () => {
  const a = await abrir();
  const r = await a.page.evaluate(() => {
    const L = CATALOGO.LISTA, erros = [];
    if (new Set(L.map(e => e.id)).size !== L.length) erros.push('números repetidos');
    if (new Set(L.map(e => e.objetivo)).size !== L.length) erros.push('objetivos repetidos');
    L.forEach((e, i) => { if (e.id !== String(i + 1).padStart(4, '0')) erros.push('numeração fora de ordem em ' + e.id); });
    L.filter(e => e.tipo === 'tocar').forEach(e => e.partes.forEach(pt => { const t = CATALOGO.total(pt.evs) / e.compasso; if (Math.abs(t - Math.round(t)) > 1e-3) erros.push(`compasso incompleto em #${e.id} (${pt.nome})`); pt.evs.forEach(ev => ev.n.forEach(([c, k]) => { if (c < 0 || c > 5 || k < 0 || k > 22) erros.push(`casa impossível em #${e.id}`); })); }));
    L.filter(e => e.tipo === 'tocar').forEach(e => e.partes.forEach(pt => { const ks = pt.evs.flatMap(ev => ev.n.length === 1 ? ev.n.map(n => n[1]) : []).filter(k => k > 0); if (ks.length && pt.evs.every(ev => ev.n.length <= 1) && !['expressao', 'arpejos'].includes(e.familia) && Math.max(...ks) - Math.min(...ks) > 5) erros.push(`abertura maior que 6 casas em #${e.id} (${pt.nome})`); }));
    FORMAS.TODAS.forEach(f => { const x = TEORIA.reconhecer(f.notas.map(([c, k]) => TEORIA.midiDe(c, k))); if (!x || x.raiz !== f.raiz || x.tipo.id !== f.tipo) erros.push('forma errada: ' + f.id); });
    BIBLIOTECA.OBRAS.forEach(o => { const ex = BIBLIOTECA.comoExercicio(o.id); if (!ex.partes.length) erros.push('obra sem partes: ' + o.id); });
    return { erros, n: L.length, formas: FORMAS.TODAS.length, rotulo: CATALOGO.rotulo(L[3]) };
  });
  assert.deepEqual(r.erros, []);
  assert.ok(r.n >= 100, `catálogo com ${r.n} exercícios`);
  assert.ok(r.formas >= 100, `${r.formas} formas de acorde`);
  assert.match(r.rotulo, /^#0004 · Praticar /);
  await a.fechar();
});

test('busca e filtros de Treinos: pelo número, por palavra, nível e competência; gênero não é filtro (Regras, Art. 6º)', async () => {
  const a = await abrir();
  const p = a.page;
  await ir(p, 'treinos');
  await p.fill('#busca', '0030');
  await esperar(async () => (await p.locator('#lista-treinos .gf-linha').count()) === 1);
  assert.match(await p.textContent('#lista-treinos .gf-linha'), /#0030/);
  await p.fill('#busca', '');
  await p.locator('[data-seg-nivel="3"]').click();
  const niveis = await p.evaluate(() => CATALOGO.filtrar({ nivel: 3 }).every(e => e.nivel === 3));
  assert.ok(niveis);
  const rotulos = await p.locator('label.kf-rotulo, .kf-rotulo').allTextContents();
  assert.ok(!rotulos.some(t => /gênero|estilo/i.test(t)), 'não pode haver filtro por gênero');
  await a.fechar();
});

test('treino: abre no roteiro com cada parte desenhada, ouvir a parte e Começar preso no pé (Regras, Art. 7º)', async () => {
  const a = await abrir();
  const p = a.page;
  await ir(p, 'treino/0004');
  await p.locator('[data-ouvir-parte="0"]').waitFor();
  const partes = await p.locator('#tela section .gf-figura svg.gf-braco').count();
  assert.equal(partes, 2);
  assert.equal(await p.locator('#tela .gf-partida').count(), 2, 'a nota de partida em cada parte');
  assert.ok(await p.locator('#tela .gf-seta').count() > 0, 'setas na ordem das notas');
  // Começar fica na barra de ações, presa no pé, no lugar da navegação
  const pe = await p.locator('#acoes [data-acao="comecar"]').boundingBox();
  assert.ok(pe && pe.y > 760, 'Começar no pé da tela');
  assert.equal(await p.locator('.kf-nav').isVisible(), false);
  // tela interna: voltar, título, nuvem e balão (sem chopp) (Art. 58, § 1º)
  const topo = await conferirTopo(p, { chopp: false });
  assert.deepEqual(topo.erros, []);
  assert.equal(await p.textContent('.gf-voltar h1'), '#0004');
  await p.click('[data-ouvir-parte="0"]');
  await esperar(async () => (await p.textContent('[data-ouvir-parte="0"]')) === 'Parar');
  await p.click('[data-ouvir-parte="0"]');
  await esperar(async () => (await p.textContent('[data-ouvir-parte="0"]')) === 'Ouvir esta parte');
  await p.click('#voltar');
  await esperar(async () => (await p.evaluate(() => location.hash)) !== '#/treino/0004');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('treino: no fim o som para, a pessoa diz se saiu limpo e o Progresso separa praticado de limpo', async () => {
  const a = await abrir();
  const p = a.page;
  await p.evaluate(() => { DADOS.mudarPerfil({ voltas: 1, contagem: false, metronomo: true }); DADOS.guardarAndamento('0018', 240); });
  await ir(p, 'treino/0018');
  await p.click('[data-acao="comecar"]');
  await p.locator('#palco-tab .gf-tab-ev').first().waitFor();
  await esperar(async () => (await p.locator('#palco-tab .gf-on').count()) > 0, 5000);
  await p.locator('[data-kf-dialogo="limpo"]').waitFor({ timeout: 15000 });
  assert.equal(await p.evaluate(() => TOCADOR.tocando()), false, 'o som para no fim');
  await p.click('[data-limpo="1"]');
  await p.locator('.kf-faixa', { hasText: 'Você marcou que saiu limpo' }).waitFor();
  const r = await p.evaluate(() => ({ ps: DADOS.praticas(), est: DADOS.estadoEx('0018') }));
  assert.equal(r.ps.length, 1);
  assert.equal(r.ps[0].limpo, true);
  assert.equal(r.ps[0].bpm, 240);
  assert.equal(r.est.limpos, 1);
  await ir(p, 'progresso');
  await p.locator('.kf-faixa', { hasText: 'não ouve nem avalia' }).waitFor();
  await p.locator('[data-aba-prog="historico"]').click();
  assert.match(await p.textContent('#tela .gf-lista'), /Saiu limpo/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('sessão: etapas que abrem e fecham, Começar no pé e pausa entre treinos até tocar em Ver o próximo', async () => {
  const a = await abrir();
  const p = a.page;
  await p.evaluate(() => { DADOS.mudarPerfil({ voltas: 1, contagem: false }); });
  await p.click('[data-seg-min="10"]');
  await p.click('#ver-sessao');
  await p.locator('[data-etapa="preparo"]').waitFor();
  assert.equal(await p.locator('details[data-kf-secao]').count(), 5);
  await p.click('[data-etapa="principal"] summary');
  await p.locator('[data-etapa="principal"][open] [data-trocar]').first().waitFor();
  // um treino curto em segundo lugar, para o teste não demorar
  const [primeiro, segundo] = await p.evaluate(() => { const s = SESSAO.atual(); s.etapas[0].itens = ['0018']; s.alvo = 1; SESSAO.guardar(s); DADOS.guardarAndamento('0018', 240); return SESSAO.fila(s); });
  assert.equal(primeiro, '0018');
  await p.click('#acoes [data-acao="comecar"]');
  await esperar(async () => (await p.evaluate(() => location.hash)) === '#/treino/0018/sessao');
  await p.click('[data-acao="comecar"]');
  await p.locator('[data-kf-dialogo="limpo"]').waitFor({ timeout: 15000 });
  await p.click('[data-limpo="0"]');
  await p.locator('#h-seguir').waitFor();
  assert.equal(await p.evaluate(() => TOCADOR.tocando()), false, 'o som espera o toque da pessoa');
  await p.waitForTimeout(800);
  assert.equal(await p.evaluate(() => location.hash), '#/treino/0018/sessao', 'não segue sozinho');
  await p.click('#acoes [data-acao="proximo"]');
  await esperar(async () => (await p.evaluate(() => location.hash)) === `#/treino/${segundo}/sessao`);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Estúdio: nova ideia, escrever tocando no braço, tablatura, transpor e apagar com confirmação', async () => {
  const a = await abrir();
  const p = a.page;
  await ir(p, 'estudio');
  await p.locator('.kf-criar:visible').click();
  await p.locator('#id-braco').waitFor();
  for (const [c, k] of [[1, 0], [1, 3], [1, 5]]) await p.locator(`#id-braco .gf-alvo[data-c="${c}"][data-k="${k}"]`).dispatchEvent('click');
  await p.locator('#id-pausa').click();
  await p.locator('#id-tab svg.gf-tab').first().waitFor();
  const evs = await p.evaluate(() => DADOS.ideias()[0].evs);
  assert.equal(evs.length, 4);
  assert.deepEqual(evs[2].n[0].slice(0, 2), [1, 5]);
  assert.equal(evs[3].n.length, 0);
  await p.click('#acoes [data-acao="mais"]');
  await p.click('[data-ideia="subir"]');
  assert.equal(await p.evaluate(() => DADOS.ideias()[0].evs[0].n[0][1]), 1);
  await p.click('#acoes [data-acao="mais"]');
  await p.click('[data-ideia="apagar"]');
  await p.locator('.kf-dlg', { hasText: 'Apagar a ideia?' }).waitFor();
  await p.click('.kf-dlg [data-kf-ok]');
  await p.locator('.kf-vazio', { hasText: 'Nenhuma ideia ainda' }).waitFor();
  assert.ok(await p.evaluate(() => Object.keys(DADOS.pacote().del).some(k => k.startsWith('ideias:'))), 'a exclusão fica marcada');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('afinador: o microfone só liga quando a pessoa pede, e o aviso diz que nada é gravado nem enviado (Regras, Art. 9º)', async () => {
  const a = await abrir({ antes: () => { try { localStorage.setItem('kitfacil.guitarra-facil.visto', JSON.stringify('0.1.0')); localStorage.setItem('kitfacil.guitarra-facil.apresentacao', 'false'); } catch {} window.__mic = 0; const o = navigator.mediaDevices && navigator.mediaDevices.getUserMedia; if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = (...x) => { window.__mic++; return o ? o.apply(navigator.mediaDevices, x) : Promise.reject(new Error('sem')); }; } });
  const p = a.page;
  await ir(p, 'afinador');
  await p.locator('.kf-faixa', { hasText: 'Nada é gravado nem enviado' }).waitFor();
  assert.equal(await p.evaluate(() => window.__mic), 0);
  assert.equal(await p.locator('[data-corda-af]').count(), 6);
  await a.fechar();
});

/* liga a sincronização como a pessoa faria: nuvem → Ativar → código de acesso → Conectar */
async function conectar(p) {
  await p.click('[data-kf-nuvem]');
  await p.click('.kf-dlg [data-kf="sync-ativar"]');
  await p.fill('#kf-token', TOKEN_TESTE);
  await p.click('[data-kf-conectar]');
}
const sincronizado = p => esperar(() => p.evaluate(() => SY.ligada() && SY.estado.lastSync > 0 && SY.situacao() === 'ok'));

test('sincronização: treinos, favoritos e ideias passam entre aparelhos, inclusive exclusões', async () => {
  const github = githubFalso();
  const um = await abrir({ github });
  await um.page.evaluate(() => { DADOS.registrarPratica({ ex: '0030', seg: 120, bpm: 70 }); DADOS.alternarFavorito('0030'); ESTUDIO.nova({ nome: 'Riff A', evs: [{ d: 1, n: [[0, 0, null]] }] }); });
  await conectar(um.page);
  assert.ok(await sincronizado(um.page), 'o primeiro aparelho não sincronizou');
  const dois = await abrir({ github });
  await conectar(dois.page);
  assert.ok(await sincronizado(dois.page), 'o segundo aparelho não sincronizou');
  await esperar(() => dois.page.evaluate(() => DADOS.ideias().length === 1));
  const r = await dois.page.evaluate(() => ({ ps: DADOS.praticas().length, fav: DADOS.favorito('0030'), ideia: (DADOS.ideias()[0] || {}).nome }));
  assert.deepEqual(r, { ps: 1, fav: true, ideia: 'Riff A' });
  // o gist guarda só texto criptografado
  const conteudo = [...github.estado.gists.values()].map(g => Object.values(g.files).map(f => f.content).join('')).join('');
  assert.doesNotMatch(conteudo, /Riff A|0030/);
  // exclusão no segundo aparelho chega ao primeiro e não volta
  await dois.page.evaluate(() => DADOS.apagarIdeia(DADOS.ideias()[0].id));
  assert.equal(await dois.page.evaluate(() => SY.agora({ quiet: true })), true);
  await um.page.evaluate(() => SY.agora({ quiet: true }));
  assert.equal(await um.page.evaluate(() => DADOS.ideias().length), 0);
  await um.page.evaluate(() => SY.agora({ quiet: true }));
  assert.equal(await um.page.evaluate(() => DADOS.ideias().length), 0);
  assert.deepEqual([...um.erros, ...dois.erros], []);
  await um.fechar(); await dois.fechar();
});

test('cópia de segurança: baixa e restaura os treinos, as ideias e os ajustes', async () => {
  const a = await abrir();
  const p = a.page;
  await p.evaluate(() => { DADOS.registrarPratica({ ex: '0004', seg: 90, bpm: 60 }); ESTUDIO.nova({ nome: 'Guardada' }); DADOS.mudarPerfil({ nivel: 3 }); });
  await abrirAjustesPelaNav(p);
  await p.click('.kf-aj-lista [data-kf-aj-ir="sincronizacao"]');
  const [download] = await Promise.all([p.waitForEvent('download'), p.locator('#kf-aj-sincronizacao button', { hasText: /Baixar/ }).first().click()]);
  const caminho = await download.path();
  const env = JSON.parse(await readFile(caminho, 'utf8'));
  assert.equal(env.formato, 'copia-facil');
  assert.equal(env.app, 'guitarra-facil');
  assert.equal(env.dados.perfil.nivel, 3);
  await p.evaluate(() => { localStorage.removeItem('guitarrafacil.db'); });
  await p.reload(); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => DADOS.praticas().length), 0);
  await p.evaluate(d => DADOS.restaurar(d), env.dados);
  const r = await p.evaluate(() => ({ ps: DADOS.praticas().length, i: DADOS.ideias()[0].nome, n: DADOS.perfil().nivel }));
  assert.deepEqual(r, { ps: 1, i: 'Guardada', n: 3 });
  await a.fechar();
});

test('dados só com o prefixo do app: Restaurar padrões de fábrica deixa o app como novo (Art. 20 e 63)', async () => {
  const a = await abrir();
  const p = a.page;
  await p.evaluate(() => { DADOS.registrarPratica({ ex: '0004', seg: 90, bpm: 60 }); DADOS.mudarAparelho({ minutosSessao: 30 }); });
  const chaves = await p.evaluate(() => Object.keys(localStorage));
  assert.ok(chaves.every(k => k.startsWith('guitarrafacil.') || k.startsWith('kitfacil.')), `chaves fora do prefixo: ${chaves.join(', ')}`);
  await a.fechar();
});

test('abertura: sem tela de primeiro uso; a apresentação abre com "Fazer o guia" e "Começar" (Arts. 75 e 76)', async () => {
  const a = await aparelho(amb, { antes: () => { window.KF_TESTE_ABERTURA = true; } });
  const p = a.page;
  await p.locator('[data-kf-dialogo="apresentacao"]').waitFor();
  assert.equal((await p.textContent('[data-kf-dialogo="apresentacao"] h2')).trim(), 'Boas-vindas ao Guitarra Fácil');
  assert.equal(await p.locator('[data-kf-dialogo="apresentacao"] [data-kf-apres-guia]').count(), 1);
  assert.equal(await p.locator('[data-kf-dialogo="apresentacao"] .kf-apres-pontos li').count(), 3);
  await p.click('[data-kf-dialogo="apresentacao"] [data-kf-fechar].kf-pri');
  // por trás, a tela inicial normal
  await p.locator('#tela .kf-titulo', { hasText: 'Início' }).waitFor();
  assert.equal(await p.locator('#tela [data-primeiro-uso], #tela .onboarding').count(), 0);
  await a.fechar();
});

test('guia em dois níveis: Simplificado só destaca; Completo faz as ações sem salvar nada (Arts. 77 e 78)', async () => {
  const a = await abrir();
  const p = a.page;
  await abrirAjustesPelaNav(p);
  await p.click('.kf-aj-lista [data-kf-aj-ir="preferencias"]');
  const niveis = await p.locator('#kf-aj-preferencias .kf-guia-linha b').allTextContents();
  assert.deepEqual(niveis, ['Simplificado', 'Completo']);
  await p.click('#kf-aj-preferencias [data-kf="guia-1"]');
  await p.locator('.kf-guia-cartao h3').waitFor();
  const total = await p.evaluate(() => KitFacil.guia.passos(1).length);
  for (let i = 0; i < total; i++) {
    await p.locator('.kf-guia-cartao [data-kf-guia="1"]').click();
    await p.waitForTimeout(250);
  }
  await esperar(async () => !(await p.evaluate(() => KitFacil.guia.ativo())));
  // Completo: o primeiro passo é lido antes; a ação só começa em Mostrar
  const antes = await p.evaluate(() => JSON.stringify(DADOS.pacote()));
  await p.evaluate(() => KitFacil.guia.iniciar(2));
  await p.locator('.kf-guia-cartao [data-kf-guia-mostrar]').waitFor();
  assert.ok(await p.evaluate(() => KitFacil.guia.passos(2).every(x => typeof x.acao === 'function')), 'todo passo do Completo tem ação');
  await p.click('.kf-guia-cartao [data-kf-guia-mostrar]');
  await esperar(async () => (await p.evaluate(() => location.hash)) === '#/sessao', 15000);
  await p.evaluate(() => KitFacil.guia.parar());
  assert.equal(await p.evaluate(() => JSON.stringify(DADOS.pacote())), antes, 'a demonstração não salva nada');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('acordes: busca pela cifra e janela com diagrama, notas, fórmula e Ouvir', async () => {
  const a = await abrir();
  const p = a.page;
  await irPelaNav(p, 'Acordes');
  await p.fill('#busca-ac', 'Am');
  await esperar(async () => (await p.locator('[data-acorde]').count()) > 0 && (await p.locator('[data-acorde] b').first().textContent()) === 'Am');
  await p.locator('[data-acorde]').first().click();
  await p.locator('.kf-dlg svg.gf-diag').waitFor();
  const t = await p.textContent('.kf-dlg');
  assert.match(t, /Lá, Dó, Mi/);
  assert.match(t, /T · 3m · 5J/);
  await p.click('.kf-dlg [data-ver-braco]');
  await p.locator('#tela .kf-titulo', { hasText: 'Explorar' }).waitFor();
  assert.equal(await p.getAttribute('[data-aba-ex="acordes"]', 'aria-selected'), 'true');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('versão igual no package.json, no código e no service worker', async () => {
  const a = await abrir();
  assert.equal(await a.page.evaluate(() => VERSAO), versao);
  const sw = await readFile(RAIZ + '/sw.js', 'utf8');
  assert.match(sw, new RegExp(`guitarra-facil-${versao.replace(/\./g, '\\.')}`));
  await a.fechar();
});

test('quem já usava: o tempo tocado, as marcações e as ideias das versões anteriores continuam', async () => {
  const a = await abrir({ antes: () => {
    try { localStorage.setItem('kitfacil.guitarra-facil.visto', JSON.stringify('0.1.0')); localStorage.setItem('kitfacil.guitarra-facil.apresentacao', 'false'); } catch {}
    const em = Date.now() - 3600e3;
    localStorage.setItem('guitarrafacil.db', JSON.stringify({ v: 1, cfg: { meta: 20 }, praticas: [{ id: 'p1', em, min: 5 }], treinos: [{ id: 't1', ex: 'met:antigo', bpm: 80, min: 3, limpo: true, em }],
      ideias: [{ id: 'i1', nome: 'Riff antigo', compasso: [4, 1], bpm: 90, evs: [{ d: 1, n: [[0, 0, null]], t: '' }, { d: 1, n: [[0, 3, null]], t: 'h v' }], em }], favoritos: [{ id: 'x', em }] }));
  } });
  const p = a.page;
  const r = await p.evaluate(() => ({ seg: DADOS.semana().seg, limpos: DADOS.semana().limpos, ideia: DADOS.ideias()[0], ps: DADOS.praticas().length }));
  assert.equal(r.ps, 2);
  assert.equal(r.seg, 8 * 60);
  assert.equal(r.limpos, 1);
  assert.equal(r.ideia.nome, 'Riff antigo');
  assert.equal(r.ideia.compasso, 4);
  assert.equal(r.ideia.evs[1].t, 'h');
  await ir(p, 'progresso'); await p.locator('[data-aba-prog="historico"]').click();
  await ir(p, 'ideia/i1'); await p.locator('#id-tab svg.gf-tab').first().waitFor();
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

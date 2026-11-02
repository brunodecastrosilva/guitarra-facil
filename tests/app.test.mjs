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
const pronto = p => p.locator('.seq').waitFor();

const dlg = p => p.locator('.kf-dlg[data-kf-dialogo="treino"]');

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
    for (const r of ['inicio', 'treinos', 'treinos/escalas', 'treinos/escalas/avancado', 'treinos/escalas/avancado/longo', 'afinador', 'teoria', 'teoria/circulo', 'metronomo', 'bateria', 'braco', 'acordes', 'musicas', 'musicas/playlists', 'progresso', 'progresso/conquistas']) {
      await p.evaluate(r => ir(r), r);
      assert.ok(await semRolagemLateral(p), `${nome}: rolagem lateral em ${r}`);
    }
    assert.deepEqual(a.erros, [], nome);
    await a.fechar();
  }
});

test('barra de baixo: Início, Treinos, Afinador, Teoria e Mais; endereços antigos levam à tela certa', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  assert.deepEqual(await p.locator('.kf-nav .kf-nav-it:visible .kf-nav-l').allTextContents(), ['Início', 'Treinos', 'Afinador', 'Teoria', 'Mais']);
  for (const [secao, titulo] of [['Metrônomo', 'Metrônomo'], ['Bateria', 'Bateria'], ['Mapa do braço', 'Mapa do braço'], ['Acordes', 'Acordes'], ['Músicas', 'Músicas'], ['Progresso', 'Progresso']]) {
    await irPelaNav(p, secao);
    assert.equal(await p.textContent('.kf-titulo'), titulo);
  }
  assert.equal(await p.locator('.ladrilho').count(), 0, 'Progresso não mostra o menu');
  await p.evaluate(() => { location.hash = '#/ferramentas/afinador'; });
  assert.ok(await esperar(() => p.evaluate(() => rota() === 'afinador' && document.querySelector('.kf-titulo')?.textContent === 'Afinador')));
  await p.evaluate(() => { location.hash = '#/hoje'; });
  assert.ok(await esperar(() => p.evaluate(() => rota() === 'inicio' && !!document.querySelector('.ladrilhos'))));
  assert.equal(await p.locator('nav.ladrilhos .ladrilho').count(), 9, 'o menu do Início tem nove botões');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('catálogo: escalas, sequências, arpejos, licks, riffs e técnica em três níveis, 12 tons e todo o braço', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  const r = await p.evaluate(() => {
    const porCat = {}, erros = []; let variacoes = 0;
    MODELOS.forEach(m => { porCat[m.cat] = porCat[m.cat] || new Set(); porCat[m.cat].add(m.nivel);
      (m.usaTom ? [...Array(12).keys()] : [null]).forEach(raiz => { const c = { ...cfgPadrao(m), raiz }; m.regioes(c).forEach((_, pos) => { variacoes++; volta(m, { ...c, pos }).notas.forEach(n => { if (!(n[0] >= 0 && n[0] <= 5 && n[1] >= 0 && n[1] <= 22 && n[2] > 0 && n[3] >= 0 && n[3] <= 4)) erros.push(m.id); }); }); }); });
    return { total: MODELOS.length, cats: Object.fromEntries(Object.entries(porCat).map(([k, v]) => [k, [...v].sort().join('')])), variacoes, erros: [...new Set(erros)],
      penta: posicoesEscala('penta-menor', 9)[0].map(n => n[1]).join(','), maior3: posicoesEscala('maior', 0)[0].map(n => n[1]).join(','),
      grupos3: aplicarPadrao(posicoesEscala('penta-menor', 9)[0], 'grupos3').length,
      plano: ['curto', 'moderado', 'longo', 'muito-longo'].map(d => planoSessao(modelo('esc:dorico'), cfgPadrao(modelo('esc:dorico')), d).length).join(','),
      tons: new Set(planoSessao(modelo('lick:i1'), cfgPadrao(modelo('lick:i1')), 'muito-longo').map(c => c.raiz)).size,
      crom: planoSessao(modelo('tec:crom24'), cfgPadrao(modelo('tec:crom24')), 'muito-longo').map(c => c.perm).length };
  });
  assert.ok(r.total >= 100, `${r.total} treinos`);
  assert.deepEqual(r.cats, { escalas: '123', sequencias: '123', arpejos: '123', licks: '123', riffs: '123', tecnica: '123' });
  assert.ok(r.variacoes > 4000, `${r.variacoes} variações`);
  assert.deepEqual(r.erros, [], 'toda nota cabe no braço');
  assert.equal(r.penta, '5,8,5,7,5,7,5,7,5,8,5,8', 'pentatônica de Lá, desenho 1');
  assert.equal(r.maior3, '8,10,12,8,10,12,9,10,12,9,10,12,10,12,13,10,12,13', 'Dó maior em 3 notas por corda');
  assert.equal(r.grupos3, 60);
  assert.equal(r.plano, '1,7,28,84', 'curto: uma posição; moderado: 7 posições; longo: 4 tons; muito longo: 12 tons');
  assert.equal(r.tons, 12); assert.equal(r.crom, 24);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('treinos um toque por vez: categoria, nível, duração e lista; o caminho volta um passo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await irPelaNav(p, 'Treinos');
  assert.equal(await p.locator('.ladrilho').count(), 6);
  await p.click('.ladrilho:has-text("Arpejos")');
  assert.equal(await p.locator('.ladrilho').count(), 3, 'três níveis');
  await p.click('.ladrilho:has-text("Intermediário")');
  assert.equal(await p.locator('.ladrilho').count(), 4, 'quatro durações');
  await p.click('.ladrilho:has-text("Longo")');
  assert.equal(await p.locator('.tr-item').count(), await p.evaluate(() => MODELOS.filter(m => m.cat === 'arpejos' && m.nivel === 2).length));
  assert.equal(await p.locator('.ladrilho').count(), 0, 'só a lista aparece');
  await p.click('.migalhas button:has-text("Arpejos")');
  assert.equal(await p.locator('.ladrilho').count(), 3);
  await p.goBack();
  assert.ok(await esperar(async () => (await p.locator('.tr-item').count()) > 0), 'o voltar do aparelho volta um passo');
  await p.click('[data-tr-sortear]');
  await dlg(p).waitFor();
  assert.match(await dlg(p).locator('#tr-tempo').textContent(), /10:00/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('janela do treino: palco e ajustes em vistas separadas; a sessão passa pelas posições e termina no tempo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await p.evaluate(() => { DURACOES[1][2] = .15; DURACOES[0][2] = .05; }); // 9 s e 3 s, para o teste
  await p.evaluate(() => abrirTreino('esc:penta-menor', { dur: 'moderado', bpm: 240, cfg: { fig: .25 } }));
  const d = dlg(p);
  await d.waitFor();
  assert.equal(await d.locator('#tr-etapa').textContent(), 'Etapa 1 de 5');
  await d.locator('#tr-aj').click();
  assert.equal(await d.locator('#tr-v-palco').isHidden(), true, 'o palco some enquanto ajusta');
  await d.locator('#tr-raiz-esc').click(); await p.click('.kf-esc-op:has-text("Mi (E)")');
  await d.locator('[data-rot="grau"]').click();
  await d.locator('[data-tr-pronto]').click();
  assert.match(await d.locator('.kf-dlg-sub').textContent(), /^Mi · Posição 1/);
  assert.ok(await d.locator('.braco-tr .nt text:text-is("T")').count() >= 2, 'graus no braço, com a tônica');
  await d.locator('#tr-ir').click();
  assert.ok(await esperar(() => p.evaluate(() => !!document.querySelector('.braco-tr .nt.agora'))), 'a nota da vez acende');
  assert.ok(await esperar(() => d.locator('#tr-etapa').textContent().then(t => /Etapa [3-5] de 5/.test(t)), 12000), 'passa pelas posições');
  assert.ok(await esperar(() => p.evaluate(() => !treino.tocando), 15000), 'termina sozinho no fim do tempo');
  assert.match(await d.locator('.tr-fim').textContent(), /Treino concluído/);
  await d.locator('[data-limpo="1"]').click();
  const t = await p.evaluate(() => DB.treinos[DB.treinos.length - 1]);
  assert.equal(t.ex, 'esc:penta-menor'); assert.equal(t.concluido, true); assert.equal(t.limpo, true); assert.equal(t.cfg.raiz, 4);
  assert.ok(t.posicoes.length >= 3);
  assert.ok(await p.evaluate(() => temConquista('primeiro')));
  await p.keyboard.press('Escape');
  await p.evaluate(() => ir('inicio'));
  assert.match(await p.textContent('.continuar'), /Continuar[\s\S]*Pentatônica menor/);
  await p.click('.continuar');
  await d.waitFor();
  assert.match(await d.locator('.kf-dlg-sub').textContent(), /^Mi/, 'continua no mesmo tom');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('licks e técnica: bend e ligados na tablatura, ordem dos dedos no cromático', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await p.evaluate(() => abrirTreino('lick:m1'));
  const d = dlg(p);
  await d.waitFor();
  assert.ok(await d.locator('.tab-n text', { hasText: /b$/ }).count() >= 1, 'o bend aparece na tablatura');
  assert.match(await d.locator('.tr-legenda').textContent(), /bend de um tom/);
  await p.keyboard.press('Escape');
  await p.evaluate(() => abrirTreino('tec:crom'));
  await d.waitFor();
  await d.locator('#tr-aj').click();
  await d.locator('[data-perm="1324"]').click();
  await d.locator('#tr-pos-esc').click(); await p.click('.kf-esc-op:has-text("Casa 5")');
  await d.locator('[data-tr-pronto]').click();
  assert.match(await d.locator('.kf-dlg-cab h2').textContent(), /1-3-2-4/);
  assert.deepEqual(await d.locator('.tab-n text').evaluateAll(x => x.slice(0, 4).map(t => t.textContent)), ['5', '7', '6', '8']);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('afinador em tela própria: nota pelo microfone, cordas para ouvir e outras afinações', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await irPelaNav(p, 'Afinador');
  assert.equal(await p.locator('.corda-bt').count(), 6);
  await p.click('[data-corda="0"]');
  const f = await p.evaluate(() => [110, 82.41].map(hz => { const t = 48000, b = new Float32Array(2048); for (let i = 0; i < b.length; i++) b[i] = .5 * Math.sin(2 * Math.PI * hz * i / t) + .2 * Math.sin(4 * Math.PI * hz * i / t); const r = detectarFrequencia(b, t); return [Math.round(r * 10) / 10, notaDe(r).cifra]; }));
  assert.ok(Math.abs(f[0][0] - 110) < 1.5 && f[0][1] === 'A', `Lá: ${f[0]}`);
  assert.ok(Math.abs(f[1][0] - 82.4) < 1.5 && f[1][1] === 'E', `Mi: ${f[1]}`);
  assert.equal(await p.evaluate(() => detectarFrequencia(new Float32Array(2048), 48000)), null, 'silêncio não vira nota');
  await p.evaluate(() => mostrarNota(110 * Math.pow(2, -10 / 1200)));
  assert.match(await p.textContent('#af-msg'), /Lá: baixa/);
  assert.equal(await p.locator('.corda-bt.perto').getAttribute('data-corda'), '1', 'a 5ª corda é a mais perto');
  await p.click('#af-afinacao-esc'); await p.click('.kf-esc-op:has-text("Drop D")');
  assert.equal(await p.textContent('[data-corda="0"] b'), 'D');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('metrônomo e bateria em telas próprias: andamento, compasso, toque no ritmo e estilos', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await irPelaNav(p, 'Metrônomo');
  await p.click('[data-bpm="5"]'); await p.click('[data-bpm="1"]');
  assert.equal(await p.textContent('#bpm'), '86');
  await p.click('[data-compasso="3"]');
  assert.equal(await p.locator('.batidas span').count(), 3);
  await p.evaluate(() => { let t = 1000; performance.now = () => (t += 500); tocarRitmo(); tocarRitmo(); tocarRitmo(); });
  assert.equal(await p.textContent('#bpm'), '120', 'três toques a cada meio segundo = 120 bpm');
  await p.click('#metro');
  assert.ok(await esperar(() => p.evaluate(() => !!document.querySelector('.batidas span.on')), 3000), 'a batida acende');
  await p.click('#metro');
  assert.equal(await p.evaluate(() => metro.ligado), false);
  await irPelaNav(p, 'Bateria');
  await p.click('[data-estilo="funk"]');
  assert.equal(await p.getAttribute('[data-estilo="funk"]', 'aria-pressed'), 'true');
  await p.click('#bat-ligar');
  assert.ok(await esperar(() => p.evaluate(() => bateria.ligada)));
  await irPelaNav(p, 'Acordes');
  assert.equal(await p.evaluate(() => bateria.ligada), false, 'sair da tela para a bateria');
  assert.equal(await p.locator('[data-acorde]').count(), 10);
  await p.click('[data-acorde="0"]');
  await irPelaNav(p, 'Mapa do braço');
  await p.click('[data-braco="todas"]');
  assert.equal(await p.locator('.braco [data-nota]').count(), 78);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('teoria: menu de assuntos, cálculos certos e o botão Treinar', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  const r = await p.evaluate(() => ({
    penta: notasEscala(9, 'penta-menor').map(n => CIFRA[n]).join(' '),
    maiorG: notasEscala(7, 'maior').map(n => CIFRA[n]).join(' '),
    campoG: campoHarmonico(7).map(c => c.triade).join(' '),
    c7: notasAcorde(0, '7').map(n => CIFRA[n]).join(' '),
    dim7: notasAcorde(0, '°7').map(n => CIFRA[n]).join(' '),
    rel: CIFRA[relativaMenor(0)],
    des: desenhosPenta(9)[0].join('-'),
  }));
  assert.equal(r.penta, 'A C D E G'); assert.equal(r.maiorG, 'G A B C D E F#'); assert.equal(r.campoG, 'G Am Bm C D Em F#°');
  assert.equal(r.c7, 'C E G A#'); assert.equal(r.dim7, 'C D# F# A'); assert.equal(r.rel, 'A'); assert.equal(r.des, '5-8');
  await irPelaNav(p, 'Teoria');
  assert.equal(await p.locator('.ladrilho').count(), 5);
  await p.click('.ladrilho:has-text("Escalas no braço")');
  assert.equal(await p.locator('.te-sec').count(), 1, 'só o assunto escolhido');
  assert.ok(await p.locator('#te-braco [data-nota]').count() > 20);
  await p.click('[data-te-des="2"]');
  await p.click('[data-te-treinar]');
  await dlg(p).waitFor();
  assert.match(await dlg(p).locator('.kf-dlg-sub').textContent(), /Lá · Posição 3/);
  await p.keyboard.press('Escape');
  await p.click('#te-esc-esc'); await p.click('.kf-esc-op:has-text("Maior (jônio)")');
  assert.match(await p.textContent('#t-escalas'), /Notas: A · B · C# · D · E · F# · G#/);
  await p.click('.migalhas button:has-text("Teoria")');
  await p.click('.ladrilho:has-text("Círculo das quintas")');
  await p.click('#t-circulo [data-tom="7"]');
  assert.match(await p.textContent('#t-circulo .campo-h'), /G[\s\S]*Am[\s\S]*Bm[\s\S]*C[\s\S]*D[\s\S]*Em[\s\S]*F#°/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('músicas: minhas músicas e playlists em abas; criar, excluir com Desfazer e adicionar da playlist', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await irPelaNav(p, 'Músicas');
  assert.match(await p.textContent('.kf-vazio'), /Nenhuma música ainda/);
  assert.equal(await p.locator('.playlist').count(), 0, 'as playlists ficam na outra aba');
  await p.click('.kf-criar');
  await p.fill('#mu-t', 'Smoke on the Water');
  await p.fill('#mu-a', 'Deep Purple');
  await p.click('#mu-e-esc');
  await p.click('.kf-esc-op:has-text("Aprendendo")');
  await p.click('.kf-dlg-pe .kf-pri');
  assert.match(await p.textContent('main'), /Aprendendo[\s\S]*Smoke on the Water/);
  await p.click('[data-musica]');
  await p.click('.kf-dlg [data-excluir]');
  assert.equal(await p.locator('[data-musica]').count(), 0);
  await p.click('.kf-toast-acao');
  assert.equal(await p.locator('[data-musica]').count(), 1);
  await p.click('.abas button:has-text("Playlists")');
  assert.equal(await p.locator('.playlist').count(), 5);
  assert.match(await p.getAttribute('#pl-1 a[href*="youtube"]', 'href'), /youtube\.com\/results\?search_query=/);
  await p.evaluate(() => { document.getElementById('pl-1').open = true; });
  await p.click('#pl-1 [data-pl-add="pl-1|0"]');
  assert.equal(await p.evaluate(() => DB.musicas.some(m => m.titulo === "Knockin' on Heaven's Door")), true);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('início e progresso: sequência de dias, abas de progresso e conquistas', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  assert.match(await p.textContent('.seq'), /Comece sua sequência hoje/);
  await p.evaluate(() => { const d = 864e5, n = Date.now(); [0, 1, 2, 5].forEach(k => DB.praticas.push({ id: 'p' + k, em: n - k * d, min: 25 })); DB.treinos.push({ id: 't1', ex: 'crom:1324', bpm: 100, limpo: true, em: n - 3600e3 }, { id: 't2', ex: 'ex-1234', bpm: 80, acerto: 95, em: n - 2 * d }); commit(); conferirConquistas(false); render(); });
  assert.match(await p.textContent('.seq'), /3 dias seguidos[\s\S]*25 de 20 min hoje · meta batida/);
  assert.match(await p.textContent('.continuar'), /Cromático 1-2-3-4 · 1-3-2-4/, 'treinos da versão anterior continuam valendo');
  assert.ok(await p.evaluate(() => ['primeiro', 'meta', 'dias3', 'bpm100'].every(id => temConquista(id))));
  await irPelaNav(p, 'Progresso');
  assert.equal(await p.locator('.grafico rect').count(), 7);
  await p.click('.abas button:has-text("Andamentos")');
  assert.match(await p.textContent('.andas'), /Cromático 1-2-3-4[\s\S]*melhor limpo 100/);
  await p.click('.abas button:has-text("Conquistas")');
  assert.match(await p.textContent('.conquistas'), /Cromático a 100[\s\S]*ganha hoje/);
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
  await pronto(a.page);
  await a.page.evaluate(() => { DB.musicas.push({ id: 'm1', titulo: 'Wonderwall', artista: '', estado: 'quero', obs: '' }); DB.treinos.push({ id: 't1', ex: 'lick:a3', cfg: { raiz: 2, pos: 1 }, dur: 'curto', bpm: 90, limpo: true, em: Date.now() }); commit(); conferirConquistas(false); render(); });
  await conectar(a.page);
  assert.ok(await esperar(async () => (await a.page.getAttribute('[data-kf-nuvem]', 'data-estado')) === 'sincronizado'), 'o primeiro aparelho sincroniza');
  const arq = gh.arquivo('guitarra-facil.json');
  assert.ok(arq && !/Wonderwall/.test(arq.conteudo), 'o gist deveria estar criptografado');
  const b = await aparelho(amb, { github: gh });
  await pronto(b.page);
  await conectar(b.page);
  assert.ok(await esperar(() => b.page.evaluate(() => DB.musicas.some(m => m.titulo === 'Wonderwall') && DB.treinos.length === 1 && DB.conquistas.some(c => c.id === 'avancado'))), 'o segundo aparelho recebe os dados');
  assert.deepEqual(a.erros, []); assert.deepEqual(b.erros, []);
  await a.fechar(); await b.fechar();
});

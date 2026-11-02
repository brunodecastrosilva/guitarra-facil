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
    for (const r of ['inicio', 'treinos', 'treinos/riffs', 'treinos/riffs/thrash', 'treinos/riffs/thrash/avancado', 'treinos/riffs/thrash/avancado/longo', 'treinos/tecnica/sweep/avancado/muito-longo', 'treinos/escalas/intermediario/longo', 'dia', 'favoritos', 'plano', 'plano/galope', 'plano/galope/intermediario', 'afinador', 'teoria', 'teoria/circulo', 'metronomo', 'bateria', 'braco', 'acordes', 'musicas/playlists', 'progresso/conquistas']) {
      await p.evaluate(r => ir(r), r);
      assert.ok(await semRolagemLateral(p), `${nome}: rolagem lateral em ${r}`);
    }
    assert.deepEqual(a.erros, [], nome);
    await a.fechar();
  }
});

test('barra de baixo: Início, Treinos, Afinador, Teoria e Mais; o Início não repete a barra', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  assert.deepEqual(await p.locator('.kf-nav .kf-nav-it:visible .kf-nav-l').allTextContents(), ['Início', 'Treinos', 'Afinador', 'Teoria', 'Mais']);
  assert.deepEqual(await p.locator('nav.ladrilhos .ladrilho b').allTextContents(), ['Treino do dia', 'Favoritos', 'Plano de 4 semanas']);
  for (const [secao, titulo] of [['Metrônomo', 'Metrônomo'], ['Bateria', 'Bateria'], ['Mapa do braço', 'Mapa do braço'], ['Acordes', 'Acordes'], ['Músicas', 'Músicas'], ['Progresso', 'Progresso']]) {
    await irPelaNav(p, secao);
    assert.equal(await p.textContent('.kf-titulo'), titulo);
  }
  await p.evaluate(() => { location.hash = '#/ferramentas/afinador'; });
  assert.ok(await esperar(() => p.evaluate(() => rota() === 'afinador')));
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('catálogo de rock e metal: estilos, técnicas, níveis exclusivos e tamanhos por compassos', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  const r = await p.evaluate(() => {
    const porCat = {}; MODELOS.forEach(m => porCat[m.cat] = (porCat[m.cat] || 0) + 1);
    const erros = [], comp = {}, tecPorNivel = { 1: 0, 2: 0, 3: 0 }, contaNivel = { 1: 0, 2: 0, 3: 0 };
    MODELOS.forEach(m => { const v = volta(m, cfgPadrao(m)), N = v.afin.length;
      v.evs.forEach(e => { if (!(e.d > 0)) erros.push(m.id + ' dur'); e.n.forEach(([s, k]) => { if (!(s >= 0 && s < N && k >= 0 && k <= 24)) erros.push(m.id); }); });
      if (m.cat !== 'escalas' && m.cat !== 'caminho') { const [cn, cp] = v.compasso, b = v.evs.reduce((s, e) => s + e.d, 0) / (cn * cp); (comp[m.tamanho] = comp[m.tamanho] || new Set()).add(Math.round(b)); if (Math.abs(b - Math.round(b)) > 1e-6) erros.push(m.id + ' compasso');
        tecPorNivel[m.nivel] += new Set(v.evs.flatMap(e => tecs(e)).concat(v.evs.some(e => e.d < .24) ? ['rapido'] : [])).size; contaNivel[m.nivel]++; } });
    const ids = n => new Set(MODELOS.filter(m => m.nivel === n && m.cat !== 'escalas' && m.cat !== 'caminho').map(m => JSON.stringify(volta(m, cfgPadrao(m)).evs.map(e => [e.d, e.n]))));
    const um = ids(1), tres = ids(3); let comuns = 0; tres.forEach(x => { if (um.has(x)) comuns++; });
    return { porCat, estilos: ESTILOS.length, tecnicas: TECNICAS_TREINO.length, erros: [...new Set(erros)].slice(0, 5), comp: Object.fromEntries(Object.entries(comp).map(([k, v]) => [k, [...v].sort((a, b) => a - b).join(',')])), comuns,
      riqueza: [1, 2, 3].map(n => tecPorNivel[n] / contaNivel[n]),
      drop: JSON.stringify(converterAfinacao([{ d: 1, n: [[0, 0], [1, 0], [2, 0]] }], 'drop-d', 'padrao')[0].n.map(n => n[1])),
      sete: volta(modelo('riffs:deathcore:3:curto:0'), {}).afin.length };
  });
  assert.equal(r.estilos, 17); assert.equal(r.tecnicas, 17);
  assert.ok(r.porCat.riffs >= 1600 && r.porCat.solos >= 1600 && r.porCat.tecnica >= 1600, JSON.stringify(r.porCat));
  assert.deepEqual(r.erros, [], 'toda nota cabe no braço e todo compasso fecha');
  assert.deepEqual(r.comp, { curto: '1', moderado: '2,4', longo: '8', 'muito-longo': '16' });
  assert.equal(r.comuns, 0, 'nenhum treino do avançado repete um do iniciante');
  assert.ok(r.riqueza[2] > r.riqueza[1] && r.riqueza[1] > r.riqueza[0], `técnicas por treino: ${r.riqueza.map(x => x.toFixed(1))}`);
  assert.equal(r.drop, '[0,2,2]', 'power chord de um dedo em Drop D vira 0-2-2 na afinação padrão');
  assert.equal(r.sete, 7, 'deathcore avançado em sete cordas');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('treinos um toque por vez: categoria, estilo, nível, tamanho e lista; o caminho volta um passo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await irPelaNav(p, 'Treinos');
  assert.equal(await p.locator('.ladrilho').count(), 4);
  await p.click('.ladrilho:has-text("Riffs")');
  assert.equal(await p.locator('.ladrilho').count(), 17, 'dezessete estilos');
  await p.click('.ladrilho:has-text("Metalcore")');
  assert.equal(await p.locator('.ladrilho').count(), 3, 'três níveis');
  await p.click('.ladrilho:has-text("Avançado")');
  assert.equal(await p.locator('.ladrilho').count(), 4, 'quatro tamanhos');
  await p.click('.ladrilho:has-text("Muito longo")');
  assert.equal(await p.locator('.tr-item').count(), 8);
  await p.click('.migalhas button:has-text("Metalcore")');
  assert.equal(await p.locator('.ladrilho').count(), 3);
  await p.goBack();
  assert.ok(await esperar(async () => (await p.locator('.tr-item').count()) === 8), 'o voltar do aparelho volta um passo');
  await p.click('[data-tr-sortear]');
  await dlg(p).waitFor();
  assert.match(await dlg(p).locator('.kf-dlg-cab h2').textContent(), /· Metalcore$/);
  assert.match(await dlg(p).locator('#tr-volta').textContent(), /compasso 1 de 16/, 'linha longa: o braço vai de compasso em compasso');
  assert.ok(await dlg(p).locator('.tab-pm').count() >= 1, 'palm mute marcado na tablatura');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('janela do treino: afinação, rótulos, etapa por posição com aviso antes da troca e andamento limpo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await p.evaluate(() => abrirTreino('esc:menor:1', { bpm: 260, cfg: { tam: 'curto', fig: .25 } }));
  const d = dlg(p);
  await d.waitFor();
  await d.locator('#tr-aj').click();
  assert.equal(await d.locator('#tr-v-palco').isHidden(), true, 'o palco some enquanto ajusta');
  await d.locator('#tr-afin-esc').click(); await p.click('.kf-esc-op:has(span:text-is("Drop C"))');
  await d.locator('#tr-perc-esc').click(); await p.click('.kf-esc-op:has-text("próxima posição")');
  await d.locator('[data-voltas="2"]').click();
  await d.locator('[data-rot="grau"]').click();
  await d.locator('[data-tr-pronto]').click();
  assert.equal(await d.locator('#tr-v-ajustes').isHidden(), true);
  assert.match(await d.locator('.kf-dlg-sub').textContent(), /Drop C · Posição 1/);
  assert.ok(await d.locator('.braco-tr .nt text:text-is("T")').count() >= 2, 'graus no braço, com a tônica');
  await d.locator('#tr-ir').click();
  assert.ok(await esperar(() => p.evaluate(() => !!document.querySelector('.braco-tr .nt.agora'))), 'a nota da vez acende');
  assert.ok(await esperar(() => d.locator('#tr-aviso').isVisible(), 12000), 'aviso antes da troca');
  assert.match(await d.locator('#tr-aviso').textContent(), /A seguir:.*Posição 2/);
  assert.ok(await esperar(() => d.locator('.kf-dlg-sub').textContent().then(t => /Posição 2/.test(t)), 12000), 'troca de posição');
  await p.evaluate(() => { const r = Date.now; Date.now = () => r() + 20000; });
  await d.locator('#tr-ir').click();
  await d.locator('[data-limpo="1"]').click();
  const t = await p.evaluate(() => DB.treinos[DB.treinos.length - 1]);
  assert.equal(t.ex, 'esc:menor:1'); assert.equal(t.limpo, true); assert.equal(t.cfg.afin, 'drop-c');
  assert.ok(await p.evaluate(() => temConquista('primeiro') && temConquista('drop')));
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('caminho do iniciante: o Início mostra o próximo passo, um passo limpo avança e quem já toca escolhe onde começar', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  assert.match(await p.textContent('.passo-hero'), /Seu próximo passo · 1 de 4 · Primeiro contato[\s\S]*A primeira nota/);
  assert.equal(await p.locator('.cam-lista li').count(), 5);
  assert.match(await p.textContent('.cam-lista li.atual'), /Você está aqui/, 'a etapa atual diz em palavras, não só na cor');
  const r = await p.evaluate(() => CAMINHO.flatMap(e => e.ids).map(id => { const v = volta(modelo(id), {}); const b = v.evs.reduce((s, e) => s + e.d, 0) / 4; return [id, Math.abs(b - Math.round(b)) < 1e-6, v.evs.every(e => e.n.every(([c, k]) => c >= 0 && c < 6 && k >= 0 && k <= 24)), !!modelo(id).dica]; }).filter(x => !x[1] || !x[2] || !x[3]));
  assert.deepEqual(r, [], 'todo passo fecha o compasso, cabe no braço e tem dica');
  await p.evaluate(() => { modelo('cam:contato:1').bpm = 260; });
  await p.click('.passo-hero');
  const d = dlg(p); await d.waitFor();
  assert.match(await d.locator('#tr-dica').textContent(), /palheta/);
  assert.equal(await d.locator('#tr-parte').textContent(), 'Passo 1 de 4');
  await d.locator('#tr-ir').click();
  await p.waitForTimeout(4500);
  await p.evaluate(() => { const r = Date.now; Date.now = () => r() + 20000; }); // conta como treino de verdade (15 s ou mais)
  await d.locator('#tr-ir').click();
  await d.locator('[data-limpo="1"]').click();
  await p.keyboard.press('Escape');
  assert.ok(await esperar(async () => /A primeira nota/.test(await p.textContent('.cam-lista')) || /2 de 4/.test(await p.textContent('.passo-hero'))));
  assert.match(await p.textContent('.passo-hero'), /2 de 4[\s\S]*As seis cordas soltas/, 'o passo limpo avança o caminho');
  await p.click('[data-caminho-pular]');
  await p.click('[data-caminho-de="3"]');
  assert.match(await p.textContent('.passo-hero'), /Primeiros riffs[\s\S]*Motor/);
  assert.match(await p.textContent('.cam-lista li >> nth=0'), /Pulada|Feita/);
  await p.click('[data-caminho-pular]');
  await p.click('[data-caminho-de="5"]');
  assert.equal(await p.locator('.dia-hero').count(), 1, 'quem já toca vê o treino do dia');
  assert.equal(await p.locator('.passo-hero').count(), 0);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('treino: braço sempre do mesmo tamanho, deslizando até as notas; braço e tablatura podem sair um de cada vez; som gravado e limpo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  assert.equal(await p.evaluate(() => getComputedStyle(document.documentElement).touchAction), 'manipulation', 'toque duplo não dá zoom');
  const largura = async id => { await p.evaluate(i => abrirTreino(i), id); await dlg(p).waitFor(); const w = await dlg(p).locator('.braco-tr').evaluate(s => s.getBoundingClientRect().width); await p.evaluate(() => KitFacil.dialogo.fechar()); await dlg(p).waitFor({ state: 'detached' }); return w; };
  const w1 = await largura('riffs:doom:1:curto:0'), w2 = await largura('solos:shred:3:curto:1');
  assert.ok(Math.abs(w1 - w2) < 1, 'o braço tem o mesmo tamanho em qualquer treino');
  await p.evaluate(() => abrirTreino('solos:shred:3:curto:1'));
  const d = dlg(p); await d.waitFor();
  assert.match(await d.locator('#tr-trilho').evaluate(t => t.style.transform), /translateX\(-\d/, 'um solo na casa 12 faz o braço deslizar até lá');
  assert.ok(await d.locator('#tr-tab').isVisible() && await d.locator('#tr-braco').isVisible(), 'braço e tablatura juntos');
  assert.match(await d.locator('#tr-dica').textContent(), /nota acesa/);
  await d.locator('#tr-aj').click();
  assert.equal(await d.locator('[data-som]').count(), 0, 'sem a escolha de som distorcido');
  await d.locator('#tr-verBraco').uncheck();
  await d.locator('#tr-verTab').uncheck();
  assert.equal(await d.locator('#tr-verBraco').isChecked(), true, 'sempre fica um dos dois');
  await d.locator('[data-tr-pronto]').click();
  assert.equal(await d.locator('#tr-tab').isHidden(), true);
  assert.equal(await d.locator('#tr-braco').isVisible(), true);
  await d.locator('#tr-ir').click();
  assert.ok(await esperar(() => p.evaluate(() => SOM.notas.size === 64 && SOM.pecas.size === 10)), 'guitarra e bateria gravadas carregadas');
  assert.ok(await esperar(() => p.evaluate(() => !!document.querySelector('.braco-tr .nt.agora'))), 'a nota da vez acende');
  await d.locator('#tr-ir').click();
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('treino do dia: quatro treinos em fila, troca sozinho depois das voltas, com aviso', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await p.evaluate(() => { DB.cfg.caminhoDe = CAMINHO.length; commit(); render(); }); // quem já toca: o Início mostra o treino do dia
  await p.click('.dia-hero');
  assert.equal(await p.locator('.dia-nivel').count(), 3);
  assert.equal(await p.locator('.dia-nivel >> nth=1 >> .dia-lista li').count(), 4);
  await p.evaluate(() => { DB.cfg.trVoltas = 2; DB.cfg.trCfg = {}; const m = treinoDoDia(2); m.forEach(id => { const x = modelo(id); x.bpm = 260; }); });
  await p.click('[data-dia="2"]');
  const d = dlg(p);
  await d.waitFor();
  assert.match(await d.locator('.kf-dlg-sub').textContent(), /^Treino do dia · 1 de 4/);
  await d.locator('#tr-ir').click();
  assert.ok(await esperar(() => d.locator('#tr-aviso').isVisible(), 20000), 'aviso do próximo treino');
  assert.match(await d.locator('#tr-aviso').textContent(), /A seguir:.*·/);
  assert.ok(await esperar(() => d.locator('.kf-dlg-sub').textContent().then(t => /2 de 4/.test(t)), 20000), 'passa para o segundo treino');
  await d.locator('#tr-ir').click();
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('favoritos: a estrela marca o treino, que aparece no Início e na lista de favoritos', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await p.evaluate(() => abrirTreino('solos:shred:3:longo:0'));
  const d = dlg(p);
  await d.waitFor();
  await d.locator('#tr-fav').click();
  assert.equal(await d.locator('#tr-fav').getAttribute('aria-pressed'), 'true');
  assert.ok(await d.locator('.tab-n').count() > 20);
  await p.keyboard.press('Escape');
  await p.evaluate(() => render());
  assert.match(await p.textContent('.ladrilho[data-ir="favoritos"]'), /1 treino/);
  await p.click('.ladrilho[data-ir="favoritos"]');
  assert.equal(await p.locator('.tr-item').count(), 1);
  assert.match(await p.textContent('.tr-item'), /★/);
  assert.ok(await p.evaluate(() => temConquista('favorito')));
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('treino 0.7: trecho em laço, porcentagem da meta, bateria e segunda guitarra', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await p.evaluate(() => abrirTreino('riffs:metalcore:2:longo:0'));
  const d = dlg(p);
  await d.waitFor();
  assert.equal(await d.locator('[data-comp]').count(), 8, 'linha longa: oito compassos para escolher');
  const notasInteiro = await d.locator('.tab-n').count();
  await d.locator('[data-comp="2"]').click(); await d.locator('[data-comp="4"]').click();
  assert.match(await d.locator('#tr-trecho .kf-rotulo').textContent(), /compassos 2 a 4/);
  assert.equal(await d.locator('[data-comp][aria-pressed="true"]').count(), 3);
  assert.ok(await d.locator('.tab-n').count() < notasInteiro, 'a tablatura mostra só o trecho');
  const r = await p.evaluate(() => { const m = modelo('riffs:metalcore:2:longo:0'), v = volta(m, cfgPadrao(m)), c = recortarCompassos(v, 2, 4), [cn, cp] = v.compasso; return { tot: c.evs.reduce((s, e) => s + e.d, 0) / (cn * cp), trecho: c.trecho, alvo: m.alvo }; });
  assert.ok(Math.abs(r.tot - 3) < 1e-6, `o trecho tem 3 compassos: ${r.tot}`); assert.deepEqual(r.trecho, [2, 4]);
  await d.locator('[data-comp="3"]').click();
  assert.match(await d.locator('#tr-trecho .kf-rotulo').textContent(), /compassos 3 a 3/, 'outro toque recomeça o trecho');
  await d.locator('[data-comp="3"]').click();
  assert.match(await d.locator('#tr-trecho .kf-rotulo').textContent(), /toque nos compassos/, 'tocar no único escolhido volta à linha inteira');
  await d.locator('#tr-aj').click();
  await d.locator('[data-pct="50"]').click();
  await d.locator('[data-acomp="bateria"]').click();
  assert.equal(await d.locator('#tr-bat-campo').isVisible(), true);
  await d.locator('#tr-bat-esc').click(); await p.click('.kf-esc-op:has(span:text-is("Blast beat"))');
  await d.locator('[data-harm="quintas"]').click();
  await d.locator('[data-tr-pronto]').click();
  assert.equal(await d.locator('#tr-bpm').textContent(), String(Math.round(r.alvo / 2)));
  assert.match(await d.locator('#tr-pct').textContent(), /50% da meta/);
  assert.deepEqual(await p.evaluate(() => [DB.cfg.trAcomp, DB.cfg.trBateria, DB.cfg.trHarmonia]), ['bateria', 'blast', 'quintas']);
  const h = await p.evaluate(() => { const ex = { escala: 'menor', raiz: 4 }; return [harmonizar(52, ex, 'tercas'), harmonizar(52, ex, 'quintas'), harmonizar(54, ex, 'tercas'), harmonizar(53, ex, 'tercas'), harmonizar(52, ex, 'oitava')]; });
  assert.deepEqual(h, [55, 59, 57, 57, 64], 'terças e quintas dentro da escala; fora dela, intervalo paralelo');
  await p.evaluate(() => { window.__pecas = { b: 0, c: 0 }; const o = peca; peca = (a, tipo, q, dest) => { window.__pecas[tipo] = (window.__pecas[tipo] || 0) + 1; return o(a, tipo, q, dest); }; });
  await d.locator('#tr-ir').click();
  assert.ok(await esperar(() => p.evaluate(() => window.__pecas.b > 4 && window.__pecas.c > 4), 4000), 'a bateria toca junto com o treino');
  await d.locator('#tr-ir').click();
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('microfone no treino: só gravar e comparar, sem nota automática; sem permissão, o treino segue', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  assert.equal(await p.evaluate(() => typeof avaliarRitmo), 'undefined', 'não existe nota de ritmo pelo áudio (Documento Mestre, seção 7)');
  assert.equal(await p.evaluate(() => CONQUISTAS.some(c => c[0] === 'ritmo90')), false, 'nem conquista que dependa dela');
  // sem permissão: aviso e o treino toca mesmo assim
  await p.evaluate(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('negado', 'NotAllowedError'); }; });
  await p.evaluate(() => abrirTreino('tecnica:galope:1:curto:0', { bpm: 260 }));
  const d = dlg(p);
  await d.waitFor();
  await d.locator('#tr-aj').click();
  assert.equal(await d.locator('#tr-ritmo').count(), 0, 'sem a opção de conferir o ritmo');
  await d.locator('[data-tr-pronto]').click();
  await d.locator('#tr-rec').click();
  await d.locator('#tr-ir').click();
  assert.ok(await esperar(() => p.evaluate(() => /Sem permissão para o microfone/.test(document.querySelector('.kf-toast')?.textContent || ''))), 'aviso sem permissão');
  assert.ok(await esperar(() => p.evaluate(() => treino.tocando)), 'o treino segue sem o microfone');
  await d.locator('#tr-ir').click();
  await p.keyboard.press('Escape');
  // com microfone (um som gerado no lugar da guitarra): grava, mostra para ouvir e apaga
  await p.evaluate(() => { navigator.mediaDevices.getUserMedia = async () => { const ac = audio(), o = ac.createOscillator(), dst = ac.createMediaStreamDestination(); o.frequency.value = 110; o.connect(dst); o.start(); return dst.stream; }; });
  await p.evaluate(() => abrirTreino('tecnica:galope:1:curto:0', { bpm: 260 }));
  await d.waitFor();
  await d.locator('#tr-rec').click();
  assert.equal(await d.locator('#tr-rec').getAttribute('aria-pressed'), 'true');
  assert.equal(await d.locator('#tr-rec span').textContent(), 'Vai gravar');
  await d.locator('#tr-ir').click();
  assert.ok(await esperar(() => d.locator('#tr-rec span').textContent().then(t => t === 'Gravando')), 'mostra que está gravando');
  assert.ok(await esperar(() => d.locator('#tr-status').textContent().then(x => /Volta 3/.test(x)), 8000), 'duas voltas inteiras');
  await p.evaluate(() => { const r = Date.now; Date.now = () => r() + 20000; });
  await d.locator('#tr-ir').click();
  assert.ok(await esperar(() => d.locator('[data-grav="ouvir"]').isVisible()), 'a gravação aparece no fim, com o exemplo para comparar');
  assert.equal(await d.locator('[data-grav="exemplo"]').count(), 1);
  assert.match(await d.locator('.tr-limpo-bloco').textContent(), /Quem decide é você/);
  assert.equal(await p.evaluate(() => 'ritmo' in DB.treinos[DB.treinos.length - 1]), false, 'nenhuma nota no histórico');
  await d.locator('[data-limpo="1"]').click();
  assert.match(await d.locator('#tr-res').textContent(), /Marcado por você/);
  assert.equal(await p.evaluate(() => mic.fluxo), null, 'o microfone desliga no fim');
  await d.locator('[data-grav="apagar"]').click();
  assert.equal(await d.locator('.tr-grav').count(), 0);
  assert.equal(await p.evaluate(() => mic.url), null, 'gravação apagada');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('plano de 4 semanas: técnica, nível e meta; quatro semanas de treinos; termina e pode desfazer o encerrar', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await p.click('nav.ladrilhos .ladrilho:has-text("Plano de 4 semanas")');
  assert.equal(await p.locator('.ladrilho').count(), 17, 'as 17 técnicas');
  await p.click('.ladrilho:has-text("Galope")');
  await p.click('.ladrilho:has-text("Intermediário")');
  assert.equal(await p.locator('[data-plano-criar]').count(), 4);
  await p.click('[data-plano-criar] >> nth=1');
  const pl = await p.evaluate(() => DB.cfg.plano);
  assert.equal(pl.tec, 'galope'); assert.equal(pl.nivel, 2); assert.equal(pl.meta - pl.ini, 40);
  assert.equal(await p.locator('.semana-plano').count(), 4);
  assert.equal(await p.locator('.semana-plano li').count(), 16);
  const bpms = (await p.locator('.sp-bpm').allTextContents()).map(x => parseInt(x));
  assert.deepEqual(bpms, [pl.ini + 10, pl.ini + 20, pl.ini + 30, pl.ini + 40]);
  await p.click('[data-plano-treino] >> nth=0');
  const d = dlg(p);
  await d.waitFor();
  assert.equal(await d.locator('#tr-bpm').textContent(), String(pl.ini + 10), 'abre no andamento da semana');
  await p.keyboard.press('Escape');
  await p.evaluate(() => { const S = semanasDoPlano(DB.cfg.plano); S.slice(0, 3).forEach(s => s.treinos.forEach(id => DB.treinos.push({ id: uid(), ex: id, cfg: {}, voltas: 4, bpm: s.bpm, min: 1, limpo: true, em: Date.now() }))); commit(); render(); });
  assert.match(await p.textContent('.pilha > .apoio'), /12 de 16/);
  assert.equal(await p.locator('.semana-plano li.ok').count(), 12);
  await p.evaluate(() => { const S = semanasDoPlano(DB.cfg.plano); S[3].treinos.forEach(id => DB.treinos.push({ id: uid(), ex: id, cfg: {}, voltas: 4, bpm: S[3].bpm, min: 1, limpo: true, em: Date.now() })); verPlano(); render(); });
  assert.ok(await p.evaluate(() => !!DB.cfg.plano.fim && temConquista('plano')), 'plano concluído e conquista');
  assert.match(await p.textContent('.kf-cab-sub'), /plano concluído/);
  await p.click('[data-plano-fim]');
  assert.equal(await p.locator('.ladrilho').count(), 17, 'concluído: começa outro');
  await p.click('.ladrilho:has-text("Tapping")'); await p.click('.ladrilho:has-text("Avançado")'); await p.click('[data-plano-criar] >> nth=0');
  await p.click('[data-plano-fim]');
  assert.equal(await p.evaluate(() => DB.cfg.plano), null);
  await p.click('.kf-toast-acao:has-text("Desfazer")');
  assert.equal(await p.evaluate(() => DB.cfg.plano.tec), 'tapping', 'desfazer traz o plano de volta');
  assert.equal(await p.locator('.semana-plano').count(), 4);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('afinador em tela própria: nota pelo microfone, cordas para ouvir, drops e sete cordas', async () => {
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
  await p.click('#af-afinacao-esc'); await p.click('.kf-esc-op:has(span:text-is("Drop C"))');
  assert.equal(await p.textContent('[data-corda="0"] b'), 'C');
  await p.click('#af-afinacao-esc'); await p.click('.kf-esc-op:has-text("7 cordas (Si)")');
  assert.equal(await p.locator('.corda-bt').count(), 7);
  assert.equal(await p.textContent('[data-corda="0"] b'), 'B');
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
  assert.equal(await p.textContent('#bpm'), '120');
  await p.click('#metro');
  assert.ok(await esperar(() => p.evaluate(() => !!document.querySelector('.batidas span.on')), 3000), 'a batida acende');
  await p.click('#metro');
  await irPelaNav(p, 'Bateria');
  await p.click('[data-estilo="metal"]');
  await p.click('#bat-ligar');
  assert.ok(await esperar(() => p.evaluate(() => bateria.ligada)));
  await irPelaNav(p, 'Acordes');
  assert.equal(await p.evaluate(() => bateria.ligada), false, 'sair da tela para a bateria');
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
  const r = await p.evaluate(() => ({ penta: notasEscala(9, 'penta-menor').map(n => CIFRA[n]).join(' '), campoG: campoHarmonico(7).map(c => c.triade).join(' '), dim7: notasAcorde(0, '°7').map(n => CIFRA[n]).join(' '), des: desenhosPenta(9)[0].join('-') }));
  assert.equal(r.penta, 'A C D E G'); assert.equal(r.campoG, 'G Am Bm C D Em F#°'); assert.equal(r.dim7, 'C D# F# A'); assert.equal(r.des, '5-8');
  await irPelaNav(p, 'Teoria');
  await p.click('.ladrilho:has-text("Escalas no braço")');
  assert.equal(await p.locator('.te-sec').count(), 1);
  await p.click('[data-te-des="2"]');
  await p.click('[data-te-treinar]');
  await dlg(p).waitFor();
  assert.match(await dlg(p).locator('.kf-dlg-sub').textContent(), /Lá · Padrão \(Mi\) · Posição 3/);
  await p.keyboard.press('Escape');
  await p.click('.migalhas button:has-text("Teoria")');
  await p.click('.ladrilho:has-text("Círculo das quintas")');
  await p.click('#t-circulo [data-tom="7"]');
  assert.match(await p.textContent('#t-circulo .campo-h'), /G[\s\S]*Am[\s\S]*Bm/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('músicas: minhas músicas e playlists de inspiração por estilo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await irPelaNav(p, 'Músicas');
  assert.match(await p.textContent('.kf-vazio'), /Nenhuma música ainda/);
  await p.click('.kf-criar');
  await p.fill('#mu-t', 'Música de teste');
  await p.fill('#mu-a', 'Banda de teste');
  await p.click('#mu-e-esc');
  await p.click('.kf-esc-op:has-text("Aprendendo")');
  await p.click('.kf-dlg-pe .kf-pri');
  await p.click('[data-musica]');
  await p.click('.kf-dlg [data-excluir]');
  assert.equal(await p.locator('[data-musica]').count(), 0);
  await p.click('.kf-toast-acao');
  assert.equal(await p.locator('[data-musica]').count(), 1);
  await p.click('.abas button:has-text("Playlists")');
  assert.equal(await p.locator('.playlist').count(), 17);
  assert.match(await p.getAttribute('#pl-thrash a[href*="youtube"]', 'href'), /youtube\.com\/results\?search_query=/);
  await p.evaluate(() => { document.getElementById('pl-thrash').open = true; });
  await p.click('#pl-thrash [data-pl-add="pl-thrash|0"]');
  assert.equal(await p.evaluate(() => DB.musicas.some(m => m.titulo === 'Master of Puppets')), true);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('início e progresso: sequência de dias, continuar, abas de progresso e conquistas', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  assert.match(await p.textContent('.seq'), /Comece sua sequência hoje/);
  await p.evaluate(() => { DB.cfg.caminhoDe = CAMINHO.length; const d = 864e5, n = Date.now(); [0, 1, 2, 5].forEach(k => DB.praticas.push({ id: 'p' + k, em: n - k * d, min: 25 })); DB.treinos.push({ id: 't0', ex: 'ex-penta', bpm: 80, acerto: 95, em: n - 2 * d }, { id: 't1', ex: 'riffs:thrash:3:longo:2', cfg: {}, voltas: 2, bpm: 140, limpo: true, em: n - 3600e3 }); commit(); conferirConquistas(false); render(); });
  assert.match(await p.textContent('.seq'), /3 dias seguidos[\s\S]*25 de 20 min hoje · meta batida/);
  assert.match(await p.textContent('.continuar'), /Thrash metal/);
  assert.ok(await p.evaluate(() => ['primeiro', 'meta', 'dias3', 'avancado', 'limpo140'].every(id => temConquista(id))));
  await p.click('.continuar');
  await dlg(p).waitFor();
  assert.equal(await dlg(p).locator('#tr-bpm').textContent(), '140');
  await p.keyboard.press('Escape');
  await irPelaNav(p, 'Progresso');
  assert.equal(await p.locator('.grafico rect').count(), 7);
  await p.click('.abas button:has-text("Andamentos")');
  assert.match(await p.textContent('.andas'), /Thrash metal[\s\S]*melhor limpo 140/);
  assert.match(await p.textContent('.andas'), /Pentatônica menor/, 'treino antigo vira a escala de hoje');
  await p.click('.abas button:has-text("Conquistas")');
  assert.match(await p.textContent('.conquistas'), /Nível avançado[\s\S]*ganha/);
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
test('sincronização: treinos, favoritos, conquistas e músicas passam de um aparelho para o outro, criptografadas', async () => {
  const gh = githubFalso();
  const a = await aparelho(amb, { github: gh });
  await pronto(a.page);
  await a.page.evaluate(() => { DB.musicas.push({ id: 'm1', titulo: 'Wonderwall', artista: '', estado: 'quero', obs: '' }); DB.treinos.push({ id: 't1', ex: 'solos:shred:3:curto:1', cfg: {}, bpm: 90, voltas: 1, limpo: true, em: Date.now() }); DB.favoritos.push({ id: 'riffs:doom:1:curto:0', em: Date.now() }); commit(); conferirConquistas(false); render(); });
  await conectar(a.page);
  assert.ok(await esperar(async () => (await a.page.getAttribute('[data-kf-nuvem]', 'data-estado')) === 'sincronizado'), 'o primeiro aparelho sincroniza');
  const arq = gh.arquivo('guitarra-facil.json');
  assert.ok(arq && !/Wonderwall/.test(arq.conteudo), 'o gist deveria estar criptografado');
  const b = await aparelho(amb, { github: gh });
  await pronto(b.page);
  await conectar(b.page);
  assert.ok(await esperar(() => b.page.evaluate(() => DB.musicas.some(m => m.titulo === 'Wonderwall') && DB.treinos.length === 1 && DB.favoritos.length === 1 && DB.conquistas.some(c => c.id === 'avancado'))), 'o segundo aparelho recebe os dados');
  assert.deepEqual(a.erros, []); assert.deepEqual(b.erros, []);
  await a.fechar(); await b.fechar();
});

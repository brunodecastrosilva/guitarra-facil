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
    for (const r of ['inicio', 'treinos', 'treinos/riffs', 'treinos/riffs/avancado', 'treinos/riffs/avancado/longo', 'treinos/tecnica/sweep/avancado/muito-longo', 'treinos/escalas/intermediario/longo', 'dia', 'favoritos', 'plano', 'plano/galope', 'plano/galope/intermediario', 'afinador', 'explorar', 'explorar/harmonia', 'explorar/ritmo', 'metronomo', 'bateria', 'acordes', 'biblioteca/minhas', 'biblioteca/inspiracoes', 'progresso/conquistas', 'progresso/competencias', 'progresso/metas', 'sessao', 'caminho', 'treinos/buscar', 'estudio', 'biblioteca']) {
      await p.evaluate(r => ir(r), r);
      assert.ok(await semRolagemLateral(p), `${nome}: rolagem lateral em ${r}`);
    }
    assert.deepEqual(a.erros, [], nome);
    await a.fechar();
  }
});

test('barra de baixo enxuta: Início, Treinos, Explorar, Estúdio e Mais; destinos redundantes foram unidos', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  assert.deepEqual(await p.locator('.kf-nav .kf-nav-it:visible .kf-nav-l').allTextContents(), ['Início', 'Treinos', 'Explorar', 'Estúdio', 'Mais']);
  assert.deepEqual(await p.locator('nav.ladrilhos .ladrilho b').allTextContents(), ['Sessão de hoje', 'Treino do dia', 'Favoritos', 'Estúdio', 'Plano de 4 semanas']);
  for (const [secao, titulo] of [['Metrônomo', 'Metrônomo'], ['Bateria', 'Bateria'], ['Biblioteca', 'Biblioteca'], ['Acordes', 'Acordes'], ['Progresso', 'Progresso']]) {
    await irPelaNav(p, secao);
    assert.equal(await p.textContent('.kf-titulo'), titulo);
  }
  await p.evaluate(() => { location.hash = '#/ferramentas/afinador'; });
  assert.ok(await esperar(() => p.evaluate(() => rota() === 'afinador')));
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('catálogo musical: geração interna variada, técnicas, níveis exclusivos e tamanhos por compassos', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  const r = await p.evaluate(() => {
    const porCat = {}; MODELOS.forEach(m => porCat[m.cat] = (porCat[m.cat] || 0) + 1);
    const erros = [], comp = {}, tecPorNivel = { 1: 0, 2: 0, 3: 0 }, contaNivel = { 1: 0, 2: 0, 3: 0 };
    MODELOS.forEach(m => { const v = volta(m, cfgPadrao(m)), N = v.afin.length;
      v.evs.forEach(e => { if (!(e.d > 0)) erros.push(m.id + ' dur'); e.n.forEach(([s, k]) => { if (!(s >= 0 && s < N && k >= 0 && k <= 24)) erros.push(m.id); }); });
      if (m.cat !== 'escalas' && m.origem === 'gerado') { const [cn, cp] = v.compasso, b = v.evs.reduce((s, e) => s + e.d, 0) / (cn * cp); (comp[m.tamanho] = comp[m.tamanho] || new Set()).add(Math.round(b)); if (Math.abs(b - Math.round(b)) > 1e-6) erros.push(m.id + ' compasso');
        tecPorNivel[m.nivel] += new Set(v.evs.flatMap(e => tecs(e)).concat(v.evs.some(e => e.d < .24) ? ['rapido'] : [])).size; contaNivel[m.nivel]++; } });
    const ids = n => new Set(MODELOS.filter(m => m.nivel === n && m.cat !== 'escalas' && m.origem === 'gerado').map(m => JSON.stringify(volta(m, cfgPadrao(m)).evs.map(e => [e.d, e.n]))));
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

test('treinos um toque por vez: categoria, nível, tamanho e lista; gênero não aparece e o caminho volta um passo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await irPelaNav(p, 'Treinos');
  assert.equal(await p.locator('.ladrilho').count(), 4);
  await p.click('.ladrilho:has-text("Riffs")');
  assert.equal(await p.locator('.ladrilho').count(), 3, 'três níveis');
  await p.click('.ladrilho:has-text("Avançado")');
  assert.equal(await p.locator('.ladrilho').count(), 4, 'quatro tamanhos');
  await p.click('.ladrilho:has-text("Muito longo")');
  assert.equal(await p.locator('.tr-item').count(), 8);
  await p.click('.migalhas button:has-text("Riffs")');
  assert.equal(await p.locator('.ladrilho').count(), 3);
  await p.goBack();
  assert.ok(await esperar(async () => (await p.locator('.tr-item').count()) === 8), 'o voltar do aparelho volta um passo');
  await p.click('[data-tr-sortear]');
  await dlg(p).waitFor();
  assert.match(await dlg(p).locator('.kf-dlg-cab h2').textContent(), /^#\d{4} · Aplicar ritmo, acordes e articulações em um riff$/);
  assert.doesNotMatch(await dlg(p).textContent(), /Metalcore|Thrash|Hard rock/i);
  assert.match(await dlg(p).locator('#tr-volta').textContent(), /compasso 1 de 16/, 'linha longa: o braço vai de compasso em compasso');
  assert.ok(await dlg(p).locator('.tab-n').count() >= 1, 'a seleção abre uma tablatura completa');
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

test('modelo único de exercício: todo exercício tem origem, objetivo e competências; filtros combinados e busca; índice guardado no aparelho', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await p.evaluate(() => new Promise(r => prepararIndice(r)));
  const r = await p.evaluate(() => {
    const semDim = MODELOS.filter(m => !m.origem || !m.objetivo || !infoExercicio(m).competencias.length).map(m => m.id);
    const galope = filtrarExercicios({ busca: 'galope', categoria: 'tecnica', nivel: 2 });
    const combinados = filtrarExercicios({ categoria: 'riffs', competencia: 'acordes', mao: 'palheta' });
    const ligados = filtrarExercicios({ tecnica: 'h', nivel: 3 });
    return { semDim: semDim.slice(0, 5), galope: galope.length, galopeOk: galope.every(m => m.cat === 'tecnica' && m.nivel === 2), combinados: combinados.length, combOk: combinados.every(m => infoExercicio(m).competencias.includes('acordes')),
      ligados: ligados.length, ligOk: ligados.every(m => infoExercicio(m).tecnicas.includes('h') || m.sub === 'h'), acento: filtrarExercicios({ busca: 'TECNICA palhetada' }).length > 0,
      caminho: modelo('cam:contato:1').origem, guardado: !!localStorage.getItem(KEY + 'indice') };
  });
  assert.deepEqual(r.semDim, [], 'todo exercício tem origem, objetivo e pelo menos uma competência');
  assert.ok(r.galope > 0 && r.galopeOk, 'busca com filtro');
  assert.ok(r.combinados > 0 && r.combOk, 'competência e mão juntas, sem filtro de gênero');
  assert.ok(r.ligados > 0 && r.ligOk, 'filtro por técnica das notas');
  assert.ok(r.acento, 'a busca ignora acentos e maiúsculas');
  assert.equal(r.caminho, 'fundamental');
  assert.ok(r.guardado, 'o índice fica guardado para a próxima vez');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('fase 2: busca com filtros combinados, tablatura com ritmo e tablatura ligada ao braço', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await irPelaNav(p, 'Treinos');
  await p.fill('#busca-ini', 'galope');
  await p.click('[data-busca-form] button[type=submit]');
  assert.ok(await esperar(() => p.evaluate(() => rota() === 'treinos' && parte(1) === 'buscar')));
  assert.match(await p.textContent('#busca-res'), /\d+ treinos? encontrados?/);
  const antes = await p.evaluate(() => filtrarExercicios(BUSCA).length);
  await p.evaluate(() => { const s = document.querySelector('#f-nivel'); s.value = '1'; s.dispatchEvent(new Event('change')); });
  assert.ok(await esperar(async () => (await p.evaluate(() => filtrarExercicios(BUSCA).length)) < antes), 'cada filtro a mais deixa a lista menor');
  await p.evaluate(() => { const s = document.querySelector('#f-competencia'); s.value = 'bends'; s.dispatchEvent(new Event('change')); });
  assert.ok(await esperar(() => p.evaluate(() => indice.pronto), 20000), 'o índice fica pronto');
  assert.ok(await esperar(async () => /encontrado|Nenhum treino/.test(await p.textContent('#busca-res'))));
  await p.click('[data-filtro-limpar] >> nth=0');
  assert.equal(await p.evaluate(() => BUSCA.nivel + BUSCA.competencia + BUSCA.busca), '');
  // tablatura com ritmo e ligada ao braço
  await p.evaluate(() => abrirTreino('riffs:thrash:2:curto:1'));
  const d = dlg(p); await d.waitFor();
  assert.ok(await d.locator('.tab-ritmo .rt-h').count() > 0, 'o ritmo aparece embaixo da tablatura');
  await d.locator('.tab-n >> nth=1').click();
  assert.equal(await d.locator('.tab-n.sel').count(), 1);
  assert.ok(await d.locator('.braco-tr .nt.sel').count() >= 1, 'a nota escolhida na tablatura aparece no braço');
  await d.locator('.braco-tr .nt >> nth=0').click();
  assert.ok(await d.locator('.tab-n.sel').count() >= 1, 'e a do braço aparece na tablatura');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('caminho do iniciante: o Início mostra o próximo passo, um passo limpo avança e quem já toca escolhe onde começar', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  assert.match(await p.textContent('.passo-hero'), /Seu próximo passo · 1 de 4 · Primeiro contato[\s\S]*#\d{4} · A corda mais grossa, solta/);
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
  assert.ok(await esperar(async () => /A corda mais grossa, solta/.test(await p.textContent('.cam-lista')) || /2 de 4/.test(await p.textContent('.passo-hero'))));
  assert.match(await p.textContent('.passo-hero'), /2 de 4[\s\S]*Da mais grossa à mais fina e de volta/, 'o passo limpo avança o caminho');
  await p.click('[data-caminho-pular]');
  await p.click('[data-caminho-de="3"]');
  assert.match(await p.textContent('.passo-hero'), /Primeiros riffs[\s\S]*Corda solta abafada e dois acordes/);
  assert.match(await p.textContent('.cam-lista li >> nth=0'), /Pulada|Feita/);
  await p.click('[data-caminho-pular]');
  await p.click('[data-caminho-de="5"]');
  assert.equal(await p.locator('.sessao-hero').count(), 1, 'quem já toca vê a sessão de hoje');
  assert.equal(await p.locator('nav.ladrilhos [data-ir="dia"]').count(), 1, 'e o treino do dia nos atalhos');
  assert.equal(await p.locator('.passo-hero').count(), 0);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('fase 3: primeira experiência, sessão por duração editável, rotina, preparo, competências e metas', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  // primeira experiência na tela inicial
  assert.equal(await p.locator('.primeira-vez').count(), 1);
  await p.click('[data-pv-seguir]');
  assert.match(await p.textContent('#pv-erro'), /Escolha uma opção/, 'a primeira pergunta é obrigatória e diz o que fazer');
  await p.click('[data-pv-exp="2"]'); await p.click('[data-pv-seguir]');
  await p.click('[data-pv-obj="riffs"]'); await p.click('[data-pv-seguir]');
  await p.click('[data-pv-min="20"]'); await p.click('[data-pv-seguir]');
  assert.match(await p.textContent('.primeira-vez'), /Como o app ensina/);
  await p.click('[data-pv-seguir]');
  const perfil = await p.evaluate(() => ({ ...DB.cfg.perfil, meta: DB.cfg.meta, de: DB.cfg.caminhoDe }));
  assert.equal(perfil.exp, 2); assert.deepEqual(perfil.objetivos, ['riffs']); assert.equal('gostos' in perfil, false); assert.equal(perfil.meta, 20); assert.equal(perfil.de, 5);
  assert.equal(await p.locator('.primeira-vez').count(), 0);
  // sessão de hoje: etapas, tempo, trocar, tirar e desfazer
  await p.click('.sessao-hero');
  assert.ok(await esperar(() => p.evaluate(() => rota() === 'sessao')));
  const S = await p.evaluate(() => ({ tipos: SESSAO.etapas.map(e => e.tipo), min: minutosSessao(SESSAO), aplicacoes: SESSAO.etapas.find(e => e.tipo === 'aplicacao').itens.map(i => tituloDe(modelo(i.id))) }));
  assert.deepEqual(S.tipos, ['preparo', 'aquecimento', 'principal', 'aplicacao', 'encerramento'], 'as cinco etapas da seção 5.2');
  assert.ok(S.min >= 16 && S.min <= 24, `o tempo cabe no escolhido: ${S.min}`);
  assert.ok(S.aplicacoes.every(t => /^#\d{4} · /.test(t)), 'a aplicação é identificada por número e objetivo');
  await p.click('[data-ses-min="45"]');
  assert.ok((await p.evaluate(() => minutosSessao(SESSAO))) > S.min, 'mais tempo, mais treino');
  const antes = await p.evaluate(() => SESSAO.etapas[2].itens[0].id);
  await p.click('[data-ses-trocar="2:0"]');
  assert.notEqual(await p.evaluate(() => SESSAO.etapas[2].itens[0].id), antes, 'trocar põe outro treino');
  const n = await p.evaluate(() => SESSAO.etapas[2].itens.length);
  await p.click('[data-ses-tirar="2:0"]');
  assert.equal(await p.evaluate(() => SESSAO.etapas[2].itens.length), n - 1);
  await p.click('.kf-toast button');
  assert.equal(await p.evaluate(() => SESSAO.etapas[2].itens.length), n, 'desfazer volta o treino');
  // rotina guardada
  await p.click('[data-ses-guardar]');
  await p.fill('#rot-nome', 'Antes do ensaio');
  await p.click('[data-rot-form] button[type=submit]');
  assert.equal(await p.evaluate(() => DB.rotinas.length), 1);
  assert.match(await p.textContent('.rot-lista'), /Antes do ensaio/);
  // começar: preparo com tempo, depois os treinos em fila com as voltas de cada um
  await p.click('[data-ses-comecar]');
  await p.locator('.kf-dlg[data-kf-dialogo="preparo"]').waitFor();
  assert.match(await p.textContent('#prep-n'), /Gire os pulsos/);
  await p.click('[data-prep-pular]');
  const d = dlg(p); await d.waitFor();
  assert.match(await d.locator('.kf-dlg-sub').textContent(), /Antes do ensaio · 1 de \d+/);
  await p.keyboard.press('Escape');
  // competências e metas
  await p.evaluate(() => { DB.treinos.push({ id: 'x1', ex: 'tecnica:bends:2:moderado:0', cfg: {}, voltas: 4, bpm: 80, min: 6, limpo: true, em: Date.now() }); DB.praticas.push({ id: 'p1', em: Date.now(), min: 6 }); commit(); });
  await p.evaluate(() => { location.hash = '#/progresso/competencias'; });
  assert.ok(await esperar(async () => /Bends e vibrato[\s\S]*Concluída no nível intermediário/.test(await p.textContent('.comp-mapa'))));
  assert.match(await p.textContent('.legenda-estados'), /não avalia a execução/);
  await p.evaluate(() => { location.hash = '#/progresso/metas'; });
  await p.click('[data-meta-nova="semana"]');
  await p.fill('#meta-alvo', '30');
  await p.click('[data-meta-form] button[type=submit]');
  assert.match(await p.textContent('.meta'), /30 minutos de prática[\s\S]*6 de 30/, 'a meta conta o que foi praticado no período');
  await p.evaluate(() => { location.hash = '#/inicio'; });
  assert.ok(await esperar(async () => (await p.locator('.meta-mini').count()) === 1), 'a meta aparece no Início');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Explorar une braço e teoria: notas, escala, acorde, intervalos, modo livre, harmonia e ritmo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await irPelaNav(p, 'Explorar');
  assert.ok(await p.locator('.lab-vis [data-lab]').count() > 60, 'as notas naturais pelo braço');
  await p.click('[data-lab-modo="escala"]');
  const notas = await p.evaluate(() => [...new Set([...document.querySelectorAll('.lab-vis [data-lab] text')].map(t => t.textContent))].sort().join(' '));
  assert.equal(notas, 'A C D E G', 'só as notas da pentatônica de Lá menor');
  await p.click('[data-lab-rot="grau"]');
  assert.ok(await p.locator('.lab-vis .nt.raiz text:text-is("T")').count() > 0, 'a tônica em graus');
  await p.click('[data-lab-modo="acorde"]');
  assert.match(await p.textContent('#lab-leitura'), /Lá menor \(Am\): Lá, Dó, Mi/);
  await p.click('[data-lab-modo="intervalos"]');
  await p.click('[data-lab="1,0"]'); await p.click('[data-lab="2,2"]');
  assert.match(await p.textContent('#lab-leitura'), /Quinta justa/);
  await p.click('[data-lab-modo="livre"]');
  for (const n of ['1,0', '2,2', '3,2', '4,1']) await p.click(`[data-lab="${n}"]`);
  assert.match(await p.textContent('#lab-leitura'), /Lá menor \(Am\)/, 'o nome do acorde montado');
  await p.selectOption('#lab-afin', 'sete').catch(async () => { await p.evaluate(() => { const s = document.querySelector('#lab-afin'); s.value = 'sete'; s.dispatchEvent(new Event('change')); }); });
  assert.equal(await p.evaluate(() => document.querySelectorAll('.lab-braco .braco-cordas text').length), 7, 'sete cordas');
  await p.click('.explorar-abas button:has-text("Harmonia")');
  assert.equal(await p.locator('#t-circulo').count(), 1, 'harmonia está no mesmo destino');
  await p.click('.explorar-abas button:has-text("Ritmo")');
  assert.equal(await p.locator('#t-ritmo').count(), 1, 'ritmo está no mesmo destino');
  // do treino para o braço
  await p.evaluate(() => abrirTreino('esc:penta-menor:1'));
  const d = dlg(p); await d.waitFor();
  assert.match(await d.locator('#tr-teoria').textContent(), /pentatônica menor/);
  await d.locator('[data-tr-braco]').click();
  assert.ok(await esperar(() => p.evaluate(() => rota() === 'explorar' && LAB.modo === 'escala' && LAB.escala === 'penta-menor')));
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('fase 5: Estúdio cria, edita, ouve, treina e faz variação de uma ideia; do laboratório para o Estúdio', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await irPelaNav(p, 'Estúdio');
  assert.match(await p.textContent('main'), /Nenhuma ideia ainda/);
  await p.click('[data-ideia-nova] >> nth=0');
  assert.ok(await esperar(() => p.evaluate(() => rota() === 'estudio' && !!ideiaDe(parte(1)))));
  for (const n of ['0,0', '0,0', '0,3']) await p.click(`[data-pos="${n}"]`);
  await p.click('[data-ed-tec="pm"]');
  await p.click('[data-ed-acorde]'); await p.click('[data-pos="1,5"]'); await p.click('[data-ed-acorde]');
  await p.click('[data-ed-dur="2"]');
  await p.click('[data-ed-pausa]');
  await p.selectOption('#ed-corda', '1').catch(async () => p.evaluate(() => { const s = document.querySelector('#ed-corda'); s.value = '1'; s.dispatchEvent(new Event('change')); }));
  await p.fill('#ed-casa', '7'); await p.click('[data-ed-por]');
  const x = await p.evaluate(() => DB.ideias[0]);
  assert.deepEqual(x.evs.map(e => [e.d, e.n.map(n => n.slice(0, 2)), e.t]), [[.5, [[0, 0]], ''], [.5, [[0, 0]], ''], [2, [[0, 3], [1, 5]], 'pm'], [2, [], ''], [2, [[1, 7]], '']]);
  assert.ok(await p.locator('.ed-tab .tab-ritmo .rt-a').count() >= 1, 'a tablatura mostra o ritmo da ideia');
  // escolher na tablatura e apagar, com desfazer
  await p.click('.ed-tab .tab-n >> nth=0');
  await p.click('[data-ed-apagar]');
  assert.equal(await p.evaluate(() => DB.ideias[0].evs.length), 4);
  await p.click('.kf-toast button');
  assert.equal(await p.evaluate(() => DB.ideias[0].evs.length), 5, 'desfazer volta a nota');
  // nome e origem pessoal
  await p.click('.ed-dados summary');
  await p.fill('#ed-nome', 'Riff da garagem'); await p.press('#ed-nome', 'Tab');
  assert.equal(await p.evaluate(() => modelo('ideia:' + DB.ideias[0].id).nome), 'Riff da garagem', 'a ideia vira exercício');
  await p.click('[data-ed-treinar]');
  const d = dlg(p); await d.waitFor();
  assert.match(await d.locator('.kf-dlg-cab h2').textContent(), /^#\d{4} · Praticar uma criação própria$/);
  await p.keyboard.press('Escape');
  await p.click('[data-ed-variacao]');
  assert.ok(await esperar(() => p.evaluate(() => DB.ideias.length === 2 && /variação/.test(DB.ideias[1].nome))));
  // do laboratório
  await irPelaNav(p, 'Explorar');
  await p.click('[data-lab-modo="livre"]'); await p.click('[data-lab="0,0"]'); await p.click('[data-lab="1,2"]');
  await p.click('[data-lab-estudio]');
  assert.ok(await esperar(() => p.evaluate(() => DB.ideias.length === 3 && DB.ideias[2].evs[0].n.length === 2)), 'as notas do braço viram o primeiro acorde');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('fase 6: biblioteca só com domínio público e originais; baixo, cordas de fundo e volumes separados', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  const r = await p.evaluate(() => MODELOS.filter(m => m.cat === 'biblioteca').map(m => { const v = volta(m, cfgPadrao(m)), b = v.evs.reduce((s, e) => s + e.d, 0) / (v.compasso[0] * v.compasso[1]); return { id: m.id, sub: m.sub, ano: m.ano, autor: m.autor, fecha: Math.abs(b - Math.round(b)) < 1e-6, cabe: v.evs.every(e => e.n.every(([c, k]) => c >= 0 && c < 6 && k >= 0 && k <= 24)), comp: infoExercicio(m).competencias.length }; }));
  assert.ok(r.length >= 12);
  assert.deepEqual(r.filter(x => !x.fecha || !x.cabe || !x.comp).map(x => x.id), [], 'todo trecho fecha o compasso, cabe no braço e tem competência');
  assert.deepEqual(r.filter(x => x.sub === 'dominio' && !(x.ano < 1929)).map(x => x.id), [], 'domínio público: só obras anteriores a 1929');
  assert.ok(r.filter(x => x.sub === 'original').every(x => x.autor === 'Original do app'));
  await irPelaNav(p, 'Biblioteca');
  assert.match(await p.textContent('main'), /Obras em domínio público[\s\S]*Riffs originais do app/);
  await p.click('[data-bib-origem="original"]');
  assert.doesNotMatch(await p.textContent('main'), /Obras em domínio público/);
  // volumes e acompanhamento
  await p.evaluate(() => abrirTreino('bib:grieg-montanha', { bpm: 200 }));
  const d = dlg(p); await d.waitFor();
  await d.locator('#tr-aj').click();
  await d.locator('.tr-vol summary').click();
  await d.locator('#vol-baixo').fill('0');
  assert.equal(await p.evaluate(() => DB.cfg.mix.baixo), 0, 'o volume do baixo fica guardado');
  await d.locator('[data-tr-pronto]').click();
  await d.locator('#tr-ir').click();
  assert.ok(await esperar(() => p.evaluate(() => treino.tocando && treino.bus && treino.bus.baixo.gain.value === 0 && treino.bus.fundo.gain.value > 0)), 'cada parte tem o seu volume');
  await d.locator('#tr-ir').click();
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
  await p.click('nav.ladrilhos [data-ir="dia"]');
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
  assert.ok(await p.locator('[data-ac-selecionar]').count() >= 20, 'a coleção de acordes é ampla desde a primeira tela');
  assert.ok(await p.evaluate(() => CATALOGO_ACORDES.length >= 100), 'formas abertas e móveis em todos os tons');
  await p.fill('#ac-q', 'Am7'); await p.click('[data-ac-busca] button[type=submit]');
  assert.ok(await p.locator('[data-ac-selecionar]').count() >= 1, 'busca por cifra');
  await p.click('[data-ac-selecionar] >> nth=0');
  assert.match(await p.textContent('#ac-atual'), /Am7|Lá menor com sétima/);
  await p.click('[data-ac-mao="esquerda"]');
  assert.equal(await p.locator('[data-ac-mao="esquerda"]').getAttribute('aria-pressed'), 'true', 'diagramas para canhoto');
  await irPelaNav(p, 'Explorar');
  await p.click('[data-lab-todas="1"]');
  assert.equal(await p.locator('.lab-vis [data-lab]').count(), 6 * 23, 'todas as notas, da corda solta à casa 22');
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Explorar: cálculos musicais certos, harmonia e treino de escala no mesmo módulo', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  const r = await p.evaluate(() => ({ penta: notasEscala(9, 'penta-menor').map(n => CIFRA[n]).join(' '), campoG: campoHarmonico(7).map(c => c.triade).join(' '), dim7: notasAcorde(0, '°7').map(n => CIFRA[n]).join(' '), des: desenhosPenta(9)[0].join('-') }));
  assert.equal(r.penta, 'A C D E G'); assert.equal(r.campoG, 'G Am Bm C D Em F#°'); assert.equal(r.dim7, 'C D# F# A'); assert.equal(r.des, '5-8');
  await irPelaNav(p, 'Explorar');
  await p.click('[data-lab-modo="escala"]');
  await p.click('[data-lab-treinar]');
  await dlg(p).waitFor();
  assert.match(await dlg(p).locator('.kf-dlg-sub').textContent(), /Lá/);
  await p.keyboard.press('Escape');
  await p.click('.explorar-abas button:has-text("Harmonia")');
  await p.click('#t-circulo [data-tom="7"]');
  assert.match(await p.textContent('#t-circulo .campo-h'), /G[\s\S]*Am[\s\S]*Bm/);
  assert.deepEqual(a.erros, []);
  await a.fechar();
});

test('Biblioteca une prática, minhas músicas e inspirações por intenção de aprendizagem', async () => {
  const a = await aparelho(amb);
  const p = a.page;
  await pronto(p);
  await irPelaNav(p, 'Biblioteca');
  await p.click('.biblioteca-abas button:has-text("Minhas músicas")');
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
  await p.click('.biblioteca-abas button:has-text("Inspirações")');
  assert.ok(await p.locator('.playlist').count() >= 5);
  assert.doesNotMatch(await p.locator('.biblioteca-abas').textContent(), /Playlists|Músicas$/);
  const primeira = p.locator('.playlist').first(); await primeira.locator('summary').click();
  assert.match(await primeira.locator('a[href*="youtube"]').first().getAttribute('href'), /youtube\.com\/results\?search_query=/);
  const bt = primeira.locator('[data-pl-add]').first(), titulo = await primeira.locator('.fx-t b').first().textContent();
  await bt.click();
  assert.equal(await p.evaluate(t => DB.musicas.some(m => m.titulo === t), titulo), true);
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
  assert.match(await p.textContent('.continuar'), /#\d{4} · Aplicar ritmo, acordes e articulações em um riff/);
  assert.ok(await p.evaluate(() => ['primeiro', 'meta', 'dias3', 'avancado', 'limpo140'].every(id => temConquista(id))));
  await p.click('.continuar');
  await dlg(p).waitFor();
  assert.equal(await dlg(p).locator('#tr-bpm').textContent(), '140');
  await p.keyboard.press('Escape');
  await irPelaNav(p, 'Progresso');
  assert.equal(await p.locator('.grafico rect').count(), 7);
  await p.click('.abas button:has-text("Andamentos")');
  assert.match(await p.textContent('.andas'), /#\d{4} · Aplicar ritmo, acordes e articulações em um riff[\s\S]*melhor limpo 140/);
  assert.match(await p.textContent('.andas'), /#\d{4} · Mapear pentatônica menor no braço/, 'treino antigo vira a escala de hoje');
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

test('direção de arte: círculo e campo harmônico mantêm a grafia da tonalidade', async () => {
  const a = await aparelho(amb), p = a.page; await pronto(p);
  await p.evaluate(() => ir('explorar/harmonia'));
  for (const [tom, relativa, campo] of [[9, 'F#m', 'F#m'], [4, 'C#m', 'D#°'], [1, 'Bbm', 'Ebm'], [6, 'D#m', 'E#°'], [10, 'Gm', 'Eb']]) {
    await p.click(`[data-tom="${tom}"]`);
    assert.equal(await p.locator(`[data-tom="${tom}"] .tom-m`).textContent(), relativa);
    assert.ok((await p.locator('.campo-h').textContent()).includes(campo));
  }
  assert.deepEqual(a.erros, []); await a.fechar();
});

test('direção de arte: slide respeita pares reais e não atravessa pausas ou cordas', async () => {
  const a = await aparelho(amb), p = a.page; await pronto(p);
  const r = await p.evaluate(() => {
    const ex = { nome: 'Teste', afin: MIDI_SOLTAS, evs: [{ d: 1, n: [[2, 9]] }, { d: 1, n: [[2, 5]], t: 's' }, { d: 1, n: [] }, { d: 1, n: [[2, 7]], t: 's' }, { d: 1, n: [[3, 8]], t: 'h' }] };
    return { par: ligacaoTecnica(ex, 1, 2), pausa: ligacaoTecnica(ex, 3, 2), corda: ligacaoTecnica(ex, 4, 3), solta: ligacaoTecnica({ evs: [{ n: [[2,0]] }, { n: [[2,7]], t: 's' }] }, 1, 2), demo: demonstracoesDe(ex), arcos: tabSVG(ex) };
  });
  assert.deepEqual(r.par, { de: 9, ate: 5, corda: 2 }); assert.equal(r.pausa, null); assert.equal(r.corda, null); assert.equal(r.solta, null, 'slide não começa na corda solta');
  assert.equal(r.demo.find(x => x.k === 's').exemplo, false);
  assert.equal(r.demo.find(x => x.k === 'h').exemplo, true, 'origem ausente é identificada como exemplo de base');
  assert.match(r.arcos, /class="tab-art"/);
  assert.deepEqual(a.erros, []); await a.fechar();
});

test('direção de arte: transporte sempre visível e demonstração controlável em todos os tamanhos', async () => {
  for (const [viewport, nome] of TELAS) {
    const a = await aparelho(amb, { viewport }), p = a.page; await pronto(p);
    await p.evaluate(() => abrirTreino('tecnica:bends:1:curto:2'));
    const d = dlg(p); await d.waitFor();
    const telaCheia = await d.evaluate(x => { const r = x.getBoundingClientRect(); return Math.abs(r.width - innerWidth) < 1 && Math.abs(r.height - innerHeight) < 1 && r.left === 0 && r.top === 0; });
    assert.ok(telaCheia, nome + ': o treino ocupa o viewport inteiro');
    assert.match(await d.locator('.kf-dlg-cab h2').textContent(), /^#\d{4} · Praticar /);
    await d.locator('#tr-demonstrar').scrollIntoViewIfNeeded();
    const dentro = await d.locator('#tr-ir').evaluate(b => { const r = b.getBoundingClientRect(), pe = b.closest('.kf-dlg-pe').getBoundingClientRect(); return r.top >= pe.top && r.bottom <= pe.bottom && r.bottom <= innerHeight; });
    assert.ok(dentro, nome + ': tocar não fica encoberto');
    await d.locator('#tr-demonstrar').click();
    assert.ok(await d.locator('#tr-v-demo').isVisible());
    await d.locator('[data-etapa="1"]').click();
    assert.equal(await d.locator('.gesto-transporte input').inputValue(), '50');
    assert.match(await d.locator('.gesto-instrucao').textContent(), /corda|pulso/);
    await d.locator('[data-gesto-play]').click();
    await d.locator('[data-gesto-play]').click();
    assert.equal(await d.locator('[data-gesto-play]').textContent(), 'Ver devagar');
    await d.locator('#tr-voltar-demo').click();
    assert.ok(await d.locator('#tr-ir').isVisible());
    assert.ok(await semRolagemLateral(p), nome);
    assert.deepEqual(a.erros, []); await a.fechar();
  }
});

test('direção de arte: movimento reduzido usa etapas estáticas e mantém o controle por teclado', async () => {
  const a = await aparelho(amb), p = a.page; await pronto(p);
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.evaluate(() => abrirTreino('tecnica:tapping:1:curto:0'));
  const d = dlg(p); await d.locator('#tr-demonstrar').click();
  assert.ok(await d.locator('.gesto-reduzido').isVisible());
  await d.locator('[data-gesto-play]').click();
  assert.equal(await d.locator('.gesto-transporte input').inputValue(), '50');
  await p.waitForTimeout(150);
  assert.equal(await d.locator('.gesto-transporte input').inputValue(), '50', 'não inicia animação automática');
  await d.locator('.gesto-transporte input').focus(); await p.keyboard.press('ArrowRight');
  assert.equal(await d.locator('.gesto-transporte input').inputValue(), '51');
  await p.keyboard.press('Escape'); assert.equal(await d.count(), 0);
  assert.deepEqual(a.erros, []); await a.fechar();
});

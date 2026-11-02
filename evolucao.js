/* Guitarra Fácil · evolução: mapa de competências e metas de curto, médio e longo prazo (Documento Mestre, seções
   14 e 15). Três estados, sempre separados: praticado (o app registrou o tempo tocado), concluído (marcado por você,
   "Saiu limpo") e avaliado (não existe: o app não mede a execução). As metas guardam só o que a pessoa escolheu
   (DB.metas, sincronizado); o progresso é contado do histórico, dentro do período da meta. */
'use strict';
const PRAZOS = [['semana', 'Curto prazo', 'Esta semana', 7], ['mes', 'Médio prazo', 'Este mês', 30], ['trimestre', 'Longo prazo', 'Próximos 3 meses', 90]];
const TIPOS_META = [
  ['minutos', 'Minutos de prática', p => ({ semana: DB.cfg.meta * 5, mes: DB.cfg.meta * 20, trimestre: DB.cfg.meta * 60 }[p])],
  ['dias', 'Dias com prática', p => ({ semana: 5, mes: 20, trimestre: 60 }[p])],
  ['limpos', 'Treinos concluídos (marcados por você)', p => ({ semana: 5, mes: 20, trimestre: 60 }[p])],
  ['competencia', 'Treinos concluídos numa competência', p => ({ semana: 3, mes: 10, trimestre: 30 }[p])],
  ['caminho', 'Terminar o caminho do iniciante', () => CAMINHO.reduce((s, e) => s + e.ids.length, 0)],
];
const metaDe = prazo => DB.metas.filter(x => x.prazo === prazo).sort((a, b) => b.de - a.de)[0] || null;
const fimDaMeta = x => x.de + PRAZOS.find(p => p[0] === x.prazo)[3] * DIA;
function progressoMeta(x) {
  const de = x.de, ate = fimDaMeta(x), dentro = t => t >= de && t < ate, limposAqui = T().filter(t => limpo(t) && dentro(t.em));
  let feito = 0;
  if (x.tipo === 'minutos') feito = Math.round(DB.praticas.filter(p => dentro(p.em)).reduce((s, p) => s + p.min, 0));
  else if (x.tipo === 'dias') feito = [...diasPraticados()].filter(n => dentro(n * DIA + 12 * 36e5)).length;
  else if (x.tipo === 'limpos') feito = limposAqui.length;
  else if (x.tipo === 'competencia') feito = limposAqui.filter(t => { const i = infoExercicio(t.id); return i && i.competencias.includes(x.comp); }).length;
  else if (x.tipo === 'caminho') feito = caminhoEstado().reduce((s, e) => s + e.feitos, 0);
  return [Math.min(feito, x.alvo), x.alvo, Date.now() >= ate];
}
const nomeMeta = x => x.tipo === 'competencia' ? `Concluir ${x.alvo} treinos de ${(COMPETENCIAS.find(c => c[0] === x.comp) || [, ''])[1].toLowerCase()}` : x.tipo === 'caminho' ? 'Terminar o caminho do iniciante' : `${x.alvo} ${{ minutos: 'minutos de prática', dias: 'dias com prática', limpos: 'treinos concluídos' }[x.tipo]}`;
const dataCurta = t => new Date(t).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
function cartaoMeta(prazo, compacto) {
  const [, nome, quando] = PRAZOS.find(p => p[0] === prazo), x = metaDe(prazo);
  if (!x) return compacto ? '' : `<section class="cartao meta"><span class="meta-prazo">${nome} · ${quando}</span><p class="apoio">Sem meta. Uma meta pequena e clara ajuda a voltar a tocar no dia seguinte.</p><button type="button" class="kf-btn kf-pri" data-meta-nova="${prazo}">${I.mais}Definir a meta</button></section>`;
  const [f, a, acabou] = progressoMeta(x), pct = Math.round(f / a * 100), ok = f >= a;
  if (compacto) return `<button type="button" class="meta-mini" data-ir="progresso/metas"><span class="meta-prazo">${nome}</span><b>${esc(nomeMeta(x))}</b><span class="barra-prog" role="progressbar" aria-label="${esc(nomeMeta(x))}" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></span><small>${f} de ${a}${acabou ? ` · terminou${ok ? ', meta cumprida' : ''}` : ` · até ${dataCurta(fimDaMeta(x))}`}</small></button>`;
  return `<section class="cartao meta${ok ? ' cumprida' : ''}"><span class="meta-prazo">${nome} · ${quando}</span><h3>${esc(nomeMeta(x))}</h3>
    <span class="barra-prog" role="progressbar" aria-label="${esc(nomeMeta(x))}" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></span>
    <p class="apoio">${f} de ${a}${ok ? ' · <b>meta cumprida</b>' : ''} · ${acabou ? `terminou em ${dataCurta(fimDaMeta(x))}` : `até ${dataCurta(fimDaMeta(x))}`}</p>
    <div class="meta-bts">${acabou ? `<button type="button" class="kf-btn kf-pri" data-meta-nova="${prazo}">${I.mais}Nova meta</button>` : `<button type="button" class="kf-btn kf-sec" data-meta-nova="${prazo}">Trocar a meta</button>`}<button type="button" class="kf-btn kf-sec" data-meta-tirar="${x.id}">Tirar</button></div></section>`;
}
function definirMeta(prazo) {
  const [, nome, quando] = PRAZOS.find(p => p[0] === prazo), atual = metaDe(prazo), tipo0 = atual && !progressoMeta(atual)[2] ? atual.tipo : (proximoPasso() && prazo === 'trimestre' ? 'caminho' : 'minutos');
  KitFacil.dialogo.abrir({ titulo: `Meta: ${nome.toLowerCase()}`, sub: `${quando}. O app conta o progresso sozinho pelo que você pratica.`, nome: 'meta',
    corpo: `<form class="pilha" data-meta-form><div class="campo"><label class="kf-rotulo" for="meta-tipo">O que medir</label><select id="meta-tipo">${TIPOS_META.map(([k, n]) => `<option value="${k}"${k === tipo0 ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
      <div class="campo" id="meta-comp-c"><label class="kf-rotulo" for="meta-comp">Competência</label><select id="meta-comp">${COMPETENCIAS.map(([k, n]) => `<option value="${k}"${k === competenciaDaVez() ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
      <div class="campo" id="meta-alvo-c"><label class="kf-rotulo" for="meta-alvo">Quanto</label><input id="meta-alvo" class="kf-entrada" type="number" inputmode="numeric" min="1" max="10000" required><p class="kf-ajuda" id="meta-dica"></p></div>
      <button type="submit" class="kf-btn kf-pri">${I.check}Guardar a meta</button></form>`,
    aoMontar: d => {
      const tipo = $('#meta-tipo', d), alvo = $('#meta-alvo', d), comp = $('#meta-comp-c', d), alvoC = $('#meta-alvo-c', d), dica = $('#meta-dica', d);
      const sugerir = () => { const t = TIPOS_META.find(x => x[0] === tipo.value); comp.hidden = tipo.value !== 'competencia'; alvoC.hidden = tipo.value === 'caminho'; alvo.value = t[2](prazo); dica.textContent = `Sugestão para ${quando.toLowerCase()}: ${t[2](prazo)}. Mude se quiser.`; };
      tipo.addEventListener('change', sugerir); sugerir();
      $('[data-meta-form]', d).addEventListener('submit', e => {
        e.preventDefault(); const n = Math.round(+alvo.value); if (tipo.value !== 'caminho' && !(n >= 1)) { alvo.focus(); return; }
        const t = TIPOS_META.find(x => x[0] === tipo.value);
        DB.metas.push({ id: uid(), prazo, tipo: tipo.value, alvo: tipo.value === 'caminho' ? t[2](prazo) : n, comp: tipo.value === 'competencia' ? $('#meta-comp', d).value : null, de: meiaNoite(Date.now()), em: Date.now() });
        DB.metas = DB.metas.filter(x => x.prazo !== prazo || x === DB.metas[DB.metas.length - 1]);
        commit(); KitFacil.dialogo.fechar(); redesenhar(); KitFacil.avisar('Meta guardada.');
      });
    } });
}
function ligarMetas(m) {
  $$('[data-meta-nova]', m).forEach(b => b.onclick = () => definirMeta(b.dataset.metaNova));
  $$('[data-meta-tirar]', m).forEach(b => b.onclick = () => { const i = DB.metas.findIndex(x => x.id === b.dataset.metaTirar); if (i < 0) return; const x = DB.metas.splice(i, 1)[0]; commit(); redesenhar(); KitFacil.avisar('Meta tirada.', { label: 'Desfazer', run: () => { DB.metas.push(x); commit(); redesenhar(); } }); });
}
// o mapa de competências: cada uma com o que foi praticado e concluído
function mapaCompetencias() {
  const R = porCompetencia(), max = Math.max(1, ...Object.values(R).map(r => r.min));
  return `<p class="apoio legenda-estados"><b>Praticado</b>: o tempo que o app registrou você tocando. <b>Concluído</b>: o que você marcou como "Saiu limpo". O app não avalia a execução: ninguém mede a sua nota.</p>
    <ul class="comp-mapa">${COMPETENCIAS.map(([c, nome, d]) => { const r = R[c], pct = Math.round(r.min / max * 100), est = r.concluidos ? `Concluída no nível ${NIVEIS.find(n => n[0] === r.nivel)[2].toLowerCase()}` : r.min ? 'Praticada' : 'Ainda não praticada';
      return `<li class="cartao comp${r.concluidos ? ' feita' : r.min ? ' praticada' : ''}"><div class="comp-cab"><b>${esc(nome)}</b><span class="comp-est">${est}</span></div><small class="apoio">${esc(d)}</small>
        <span class="barra-prog" role="progressbar" aria-label="${esc(nome)}: minutos praticados" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></span>
        <small>${Math.round(r.min)} min praticados · ${r.concluidos} ${r.concluidos === 1 ? 'concluído' : 'concluídos'}${r.ultimo ? ` · último ${quando(r.ultimo)}` : ''}</small>
        <button type="button" class="kf-btn kf-sec comp-ir" data-comp-treinar="${c}">${I.play}Treinar ${esc(nome.toLowerCase())}</button></li>`; }).join('')}</ul>`;
}
function ligarCompetencias(m) {
  $$('[data-comp-treinar]', m).forEach(b => b.onclick = () => { Object.keys(BUSCA).forEach(k => { BUSCA[k] = k === 'n' ? 30 : ''; }); BUSCA.competencia = b.dataset.compTreinar; BUSCA.nivel = String(nivelDaPessoa()); ir('treinos/buscar'); });
}

/* Guitarra Fácil · plano de 4 semanas */
'use strict';
/* ================= plano de 4 semanas =================
   uma técnica, um nível e uma meta de andamento; o caminho do andamento de hoje até a meta dividido em quatro semanas,
   cada uma com quatro treinos daquela técnica (curto, moderado, longo e muito longo). Um treino da semana está feito
   quando sai limpo no andamento da semana ou acima, depois do começo do plano. */
const planoAtual = () => DB.cfg.plano || null;
function semanasDoPlano(p) {
  const t = TAMANHOS.map(x => x[0]);
  return [1, 2, 3, 4].map(w => ({ n: w, bpm: Math.round(p.ini + (p.meta - p.ini) * w / 4), treinos: t.map(tam => `tecnica:${p.tec}:${p.nivel}:${tam}:${(w - 1) % N_POR_LISTA}`) }));
}
const feitoNoPlano = (id, bpm, desde) => DB.treinos.some(t => t.ex === id && limpo(t) && t.bpm >= bpm && t.em >= desde);
const semanaDoPlano = p => Math.min(4, Math.floor((diaNum() - diaNum(p.em)) / 7) + 1);
const progressoPlano = p => { const S = semanasDoPlano(p); let f = 0; S.forEach(s => s.treinos.forEach(id => { if (feitoNoPlano(id, s.bpm, p.em)) f++; })); return [f, 16]; };
const andamentoInicial = (tec, nivel) => { const L = MODELOS.filter(m => m.cat === 'tecnica' && m.sub === tec && m.nivel === nivel); return Math.max(L[0].bpm, ...L.map(m => melhorLimpo(m.id))); };
function verPlano() { const p = planoAtual(); if (!p || p.fim) return; const [f, t] = progressoPlano(p); if (f >= t) { DB.cfg.plano = { ...p, fim: Date.now() }; DB.cfg.planosFeitos = (DB.cfg.planosFeitos || 0) + 1; commit(); conferirConquistas(); KitFacil.avisar('Plano de 4 semanas concluído.'); } }
VIEWS.plano = () => {
  const p = planoAtual(), [, tec, nv] = caminho();
  const cam = [['inicio', 'Início'], ['plano', 'Plano de 4 semanas']];
  if (p && !tec) {
    const T2 = TECNICAS_TREINO.find(x => x.id === p.tec), N = NIVEIS.find(n => n[0] === p.nivel), S = semanasDoPlano(p), atual = semanaDoPlano(p), [f, tot] = progressoPlano(p), pct = Math.round(f / tot * 100);
    return migalhas([cam[0], [null, cam[1][1]]]) + KitFacil.ui.cabecalho({ titulo: `${T2.nome} a ${p.meta} bpm`, sub: `${N[2]} · ${p.fim ? 'plano concluído' : `semana ${atual} de 4`} · de ${p.ini} até ${p.meta} bpm` })
      + `<div class="pilha"><div class="barra-prog" role="progressbar" aria-label="Plano" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div><p class="apoio">${f} de ${tot} treinos feitos. Um treino conta quando sai limpo no andamento da semana.</p>
        ${S.map(s => `<section class="cartao semana-plano${s.n === atual && !p.fim ? ' atual' : ''}" aria-label="Semana ${s.n}"><div class="sp-cab"><h2>Semana ${s.n}</h2>${s.n === atual && !p.fim ? '<span class="sp-agora">Esta semana</span>' : ''}<span class="ld-selo sp-bpm">${s.bpm} bpm</span></div>
          <ul class="sp-lista">${s.treinos.map(id => { const m = modelo(id), ok = feitoNoPlano(id, s.bpm, p.em); return m ? `<li class="${ok ? 'ok' : ''}"><span class="sp-marca" aria-label="${ok ? 'feito' : 'a fazer'}">${ok ? I.check : ''}</span><span class="ld-tx"><b>${esc(m.nome)}</b><small>${esc(TAMANHOS.find(t => t[0] === m.tamanho)[1])} · ${esc(m.resumo())}</small></span><button type="button" class="kf-btn kf-sec" data-plano-treino="${id}" data-plano-bpm="${s.bpm}">${I.play}${s.bpm}</button></li>` : ''; }).join('')}</ul></section>`).join('')}
        <button type="button" class="kf-btn kf-sec" data-plano-fim>${p.fim ? 'Começar outro plano' : 'Encerrar o plano'}</button></div>`;
  }
  const T2 = TECNICAS_TREINO.find(x => x.id === tec);
  if (!T2) return migalhas([cam[0], [null, cam[1][1]]]) + KitFacil.ui.cabecalho({ titulo: 'Plano de 4 semanas', sub: 'Escolha a técnica. Depois, o nível e a meta de andamento: o app divide o caminho em quatro semanas.' })
    + `<div class="ladrilhos">${TECNICAS_TREINO.map(t => ladrilho({ ir: `plano/${t.id}`, ilu: desenhoDe(`tecnica:${t.id}:2:curto:0`), nome: t.nome, sub: t.d, classe: 'sub' })).join('')}</div>`;
  const N = NIVEIS.find(n => n[1] === nv);
  if (!N) return migalhas([...cam, [null, T2.nome]]) + KitFacil.ui.cabecalho({ titulo: T2.nome, sub: 'Escolha o nível do plano.' })
    + `<div class="ladrilhos l1">${NIVEIS.map(([n, id, nome, d]) => ladrilho({ ir: `plano/${tec}/${id}`, ilu: iluNivel(n), nome, sub: d, classe: 'largo' })).join('')}</div>`;
  const ini = andamentoInicial(tec, N[0]);
  return migalhas([...cam, [`plano/${tec}`, T2.nome], [null, N[2]]]) + KitFacil.ui.cabecalho({ titulo: T2.nome, sub: `${N[2]}. Você está em ${ini} bpm. Escolha a meta para daqui a quatro semanas.` })
    + `<div class="ladrilhos">${[20, 40, 60, 80].map(x => Math.min(BPM_MAX, ini + x)).map(meta => ladrilho({ attrs: `data-plano-criar="${tec}|${N[0]}|${ini}|${meta}"`, ilu: iluPlano(ini, meta), nome: `${meta} bpm`, sub: `+${meta - ini} bpm em 4 semanas`, selo: `+${Math.round((meta - ini) / 4)}/semana` })).join('')}</div>`;
};
const iluPlano = (a, b) => { const k = 3 + (b - a) / 80 * 5; return ilu([0, 1, 2, 3].map(i => `<rect x="${6 + i * 14}" y="${40 - 6 - (i + 1) * k}" width="10" height="${6 + (i + 1) * k}" rx="2" class="${i === 3 ? 'il-a' : 'il-n'}"/>`).join('') + '<path d="M4 41h56" class="il-l"/>'); }; // a subida da escada cresce com a meta


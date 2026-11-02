/* Guitarra Fácil · Início e caminho do iniciante */
'use strict';
/* o caminho de quem nunca tocou: um passo conta quando sai limpo; quem já toca pula etapas (DB.cfg.caminhoDe) */
const passoFeito = id => DB.treinos.some(t => t.ex === id && limpo(t));
const caminhoEstado = () => { const de = DB.cfg.caminhoDe || 0; return CAMINHO.map((e, i) => { const feitos = i < de ? e.ids.length : e.ids.filter(passoFeito).length; return { e, i, feitos, total: e.ids.length, feita: feitos === e.ids.length, pulada: i < de }; }); };
const proximoPasso = () => { const de = DB.cfg.caminhoDe || 0; for (let i = de; i < CAMINHO.length; i++) { const e = CAMINHO[i], id = e.ids.find(x => !passoFeito(x)); if (id) return { e, i, id, n: e.ids.indexOf(id) + 1 }; } return null; };
function escolherNivelCaminho() {
  const ops = [[0, 1, 'Nunca toquei', 'Começar do primeiro passo'], [3, 2, 'Sei alguns acordes', 'Começar nos primeiros riffs'], [CAMINHO.length, 3, 'Já toco músicas', 'Ir direto ao treino do dia']];
  KitFacil.dialogo.abrir({ titulo: 'Onde você quer começar?', sub: 'Dá para mudar depois: o caminho continua no Início.', nome: 'caminho-nivel',
    corpo: `<div class="ladrilhos l1">${ops.map(([de, n, nome, sub]) => ladrilho({ attrs: `data-caminho-de="${de}"`, ilu: iluNivel(n), nome, sub, classe: 'largo' })).join('')}</div>`,
    aoMontar: d => $$('[data-caminho-de]', d).forEach(b => b.onclick = () => { DB.cfg.caminhoDe = +b.dataset.caminhoDe; LS.set('visto', true); commit(); KitFacil.dialogo.fechar(); render(); KitFacil.avisar(+b.dataset.caminhoDe >= CAMINHO.length ? 'Pronto: o Início mostra o treino do dia.' : `Pronto: você começa em ${CAMINHO[+b.dataset.caminhoDe].nome}.`); }) });
}
const listaCaminho = (est, atual) => `<ol class="cam-lista">${est.map(({ e, i, feitos, total, feita, pulada }) => `<li class="${feita ? 'feita' : ''}${i === atual ? ' atual' : ''}"><button type="button" data-ir="caminho/${i + 1}"><span class="cam-n" aria-hidden="true">${feita ? I.check : i + 1}</span><span class="ld-tx"><b>${esc(e.nome)}</b><small>${pulada ? 'Pulada' : feita ? 'Feita' : i === atual ? `Você está aqui · ${feitos} de ${total} passos` : `${feitos} de ${total} passos`}</small></span>${I.seta}</button></li>`).join('')}</ol>`;
// Início: a sequência numa linha e, em destaque, o que fazer agora: o próximo passo do caminho ou o treino do dia
const ATALHOS = [['favoritos', 'Favoritos', 'favoritos', () => DB.favoritos.length ? `${DB.favoritos.length} ${DB.favoritos.length === 1 ? 'treino' : 'treinos'}` : 'Marque com a estrela'],
  ['plano', 'Plano de 4 semanas', 'plano', () => { const p = planoAtual(); return p && !p.fim ? `Semana ${semanaDoPlano(p)} de 4 · ${progressoPlano(p)[0]}/16` : 'Uma meta, quatro semanas'; }]];
VIEWS.inicio = () => {
  const meta = DB.cfg.meta, min = minutosHoje(), seg = diasSeguidos(), ul = ultimoTreino(), p = Math.min(100, Math.round(min / meta * 100));
  const m = ul && modelo(ul.id), v = m && volta(m, { ...cfgPadrao(m), ...ul.cfg }), px = proximoPasso();
  const seqHTML = `<section class="seq" aria-label="Sua sequência"><span class="seq-ic">${I.chama}</span>
      <span class="seq-tx"><b>${seg ? `${seg} ${seg === 1 ? 'dia seguido' : 'dias seguidos'}` : 'Comece sua sequência hoje'}</b><span class="apoio">${min} de ${meta} min hoje${min >= meta ? ' · meta batida' : ''}</span></span>
      <span class="seq-sem" aria-hidden="true">${semanaAtual().map(d => `<i class="${d.feito ? 'feito' : ''}${d.hoje ? ' hoje' : ''}" title="${d.nome}"></i>`).join('')}</span>
      <span class="barra-prog seq-barra" role="progressbar" aria-label="Meta de hoje" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p}%"></span></span></section>`;
  const diaHTML = `<button type="button" class="dia-hero" data-ir="dia"><span class="ld-ilu">${ILU.dia}</span><span class="ld-tx"><small>Treino do dia</small><b>Técnica, riff, solo e uma linha longa</b><small>Quatro treinos seguidos, no seu nível</small></span><span class="ct-play">${I.play}</span></button>`;
  const atalhos = extra => `<nav class="ladrilhos" aria-label="Atalhos">${[...extra, ...ATALHOS].map(([ir, nome, il, sub]) => ladrilho({ ir, ilu: ILU[il], nome, sub: sub() })).join('')}</nav>`;
  if (px) {
    const mp = modelo(px.id), vp = volta(mp, cfgPadrao(mp));
    return `<div class="pilha">${seqHTML}
    <button type="button" class="continuar passo-hero" data-tr-modelo="${px.id}"><span class="ct-ilu">${miniDesenho(vp)}</span><span class="ld-tx"><small>Seu próximo passo · ${px.n} de ${px.e.ids.length} · ${esc(px.e.nome)}</small><b>${esc(mp.nome)}</b><small>${esc(mp.resumo)}</small></span><span class="ct-play">${I.play}</span></button>
    <section class="cartao caminho" aria-labelledby="cam-t"><h2 id="cam-t">Seu caminho</h2>${listaCaminho(caminhoEstado(), px.i)}
      <button type="button" class="kf-btn kf-sec cam-pular" data-caminho-pular>Já toco: escolher onde começar</button></section>
    ${atalhos([['dia', 'Treino do dia', 'dia', () => 'Para quem já toca']])}
  </div>`;
  }
  return `<div class="pilha">${seqHTML}${diaHTML}
    ${v ? `<button type="button" class="continuar" data-tr-ultimo><span class="ct-ilu">${miniDesenho(v)}</span><span class="ld-tx"><small>Continuar · ${quando(ul.em)}</small><b>${esc(tituloDe(m))}</b><small>${esc(v.sub)} · ${ul.bpm} bpm</small></span>${I.seta}</button>` : ''}
    ${atalhos([['caminho', 'Caminho do iniciante', 'treinar', () => 'Rever os primeiros passos']])}
  </div>`;
};
// o caminho inteiro: cada etapa com os seus passos
VIEWS.caminho = () => {
  const est = caminhoEstado(), px = proximoPasso();
  return migalhas([['inicio', 'Início'], [null, 'Caminho do iniciante']]) + KitFacil.ui.cabecalho({ titulo: 'Caminho do iniciante', sub: 'Cinco etapas, do primeiro toque ao primeiro solo. Um passo conta quando você marca "Saiu limpo".' })
    + `<div class="pilha">${est.map(({ e, i, feitos, total, pulada }) => `<section class="cartao cam-etapa" id="etapa-${i + 1}" aria-labelledby="etapa-${i + 1}-t"><h2 id="etapa-${i + 1}-t"><span class="cam-n" aria-hidden="true">${i + 1}</span>${esc(e.nome)}</h2><p class="apoio">${esc(e.resumo)} · ${pulada ? 'pulada' : `${feitos} de ${total} passos`}</p>
      <ul class="tr-lista">${e.ids.map(id => itemTreino(modelo(id)).replace('<b>', `<b>${passoFeito(id) ? '<span class="cam-ok" aria-label="feito">✓</span> ' : px && px.id === id ? '<span class="cam-agora">Agora</span> ' : ''}`)).join('')}</ul></section>`).join('')}
      <button type="button" class="kf-btn kf-sec cam-pular" data-caminho-pular>Escolher onde começar</button></div>`;
};


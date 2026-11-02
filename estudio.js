/* Guitarra Fácil · Estúdio de criação (Documento Mestre, seção 12; decisão 1C): riffs e ideias da própria pessoa,
   escritos tocando no braço ou escolhendo corda e casa, e vistos na tablatura com o ritmo. Cada ideia tem nome,
   afinação, compasso e andamento; as notas ganham duração, pausas, acordes e técnicas (palm mute, ligados, bend, slide,
   vibrato, nota morta). Ouve-se na hora, e "Treinar" abre a ideia na janela do treino, com acompanhamento, trecho em
   laço, andamento e segunda guitarra. Uma ideia pode guardar de onde veio (o trecho de uma música que a pessoa tirou de
   ouvido): fica só com ela, para uso pessoal; o app nunca traz trechos de músicas protegidas. Ideias ficam em
   DB.ideias (sincronizadas) e viram exercícios do modelo único (categoria estudio). */
'use strict';
const DURACOES_ED = [[4, 'Semibreve', '4'], [2, 'Mínima', '2'], [1, 'Semínima', '1'], [.5, 'Colcheia', '½'], [.25, 'Semicolcheia', '¼'], [1 / 3, 'Tercina', '⅓']];
const COMPASSOS_ED = [['4,1', '4/4'], ['3,1', '3/4'], ['2,1', '2/4'], ['6,.5', '6/8'], ['5,1', '5/4'], ['7,.5', '7/8']];
const TECNICAS_ED = [['pm', 'PM', 'Palm mute'], ['h', 'h', 'Ligado para cima'], ['p', 'p', 'Ligado para baixo'], ['b', 'b', 'Bend de um tom'], ['s', 's', 'Slide'], ['v', '~', 'Vibrato'], ['x', 'x', 'Nota morta']];
const ED = { i: -1, d: .5, acorde: false };
I.estudio = svg('<path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/>');
ILU.estudio = ilu('<rect x="4" y="16" width="44" height="22" rx="3" class="il-f"/><path d="M4 21h44M4 27h44M4 33h44M16 16v22M28 16v22" class="il-l"/><circle cx="22" cy="27" r="4" class="il-a"/><path d="M42 30l14-18 4 3-14 18-5 1z" class="il-r"/>');
const ideiaDe = id => DB.ideias.find(x => x.id === id);
// cada ideia vira um exercício (abre na janela do treino como qualquer outro)
function registrarIdeia(x) {
  return registrarExercicio({ id: 'ideia:' + x.id, cat: 'estudio', sub: 'estudio', nivel: 1, tamanho: 'curto', ehRiff: true, afinPadrao: x.afin, usaTom: false, manterAltura: false, raizPadrao: null,
    rotulo: 'nota', bpm: x.bpm, alvo: x.bpm + 20, nome: x.nome || 'Ideia sem nome', resumo: x.musica ? `Sua ideia · de ${x.musica}` : 'Sua ideia', autor: x.musica || '', regioes: () => ['Ideia'],
    gerar: () => ({ evs: x.evs.length ? x.evs.map(e => ({ ...e, n: e.n.map(n => [...n]) })) : [{ d: 4, n: [], t: '' }], compasso: x.compasso, afin: x.afin }) });
}
function registrarIdeias() { for (let i = MODELOS.length - 1; i >= 0; i--) if (MODELOS[i].cat === 'estudio' && !ideiaDe(MODELOS[i].id.slice(6))) MODELOS.splice(i, 1); DB.ideias.forEach(registrarIdeia); }
registrarIdeias();
function novaIdeia(base = {}) {
  const n = DB.ideias.length + 1, x = { id: uid(), nome: `Ideia ${n}`, afin: 'padrao', compasso: [4, 1], bpm: 90, evs: [], musica: '', em: Date.now(), ...base };
  DB.ideias.push(x); registrarIdeia(x); commit(); ED.i = x.evs.length - 1; ir('estudio/' + x.id); return x;
}
// do laboratório: as notas escolhidas viram o primeiro acorde da ideia
function novaIdeiaCom(sel, afin) { novaIdeia({ afin, evs: sel.length ? [{ d: 2, n: [...sel].sort((a, b) => a[0] - b[0]).map(([c, k]) => [c, k, null]), t: '' }] : [] }); KitFacil.avisar('Ideia criada no Estúdio com as notas do braço.'); }
const salvarIdeia = x => { x.mod = Date.now(); registrarIdeia(x); commit(); };

VIEWS.estudio = () => {
  registrarIdeias();
  const id = parte(1), x = id && ideiaDe(id);
  if (x) return telaIdeia(x);
  return KitFacil.ui.cabecalho({ titulo: 'Estúdio', sub: 'Crie riffs e ideias pelo braço e pela tablatura. Fica só com você.', criar: { rotulo: 'Nova ideia', attrs: 'data-ideia-nova' } })
    + (DB.ideias.length ? `<ul class="tr-lista">${[...DB.ideias].sort((a, b) => (b.mod || b.em) - (a.mod || a.em)).map(x => { const m = modelo('ideia:' + x.id), v = volta(m, cfgPadrao(m)), nt = x.evs.filter(e => e.n.length).length; return `<li><button type="button" class="tr-item" data-ir="estudio/${x.id}">${miniDesenho(v)}<span class="ld-tx"><b>${esc(x.nome)}</b><small>${nt} ${nt === 1 ? 'nota' : 'notas'} · ${COMPASSOS_ED.find(c => c[0] === x.compasso.join(','))[1]} · ${x.bpm} bpm${x.musica ? ` · de ${esc(x.musica)}` : ''}</small></span>${I.seta}</button></li>`; }).join('')}</ul>`
      : KitFacil.ui.vazio({ titulo: 'Nenhuma ideia ainda', texto: 'Toque em "Nova ideia" e escreva um riff tocando no braço. Você ouve na hora e treina com bateria.', acao: '<button type="button" class="kf-btn kf-pri" data-ideia-nova>Nova ideia</button>' }));
};
function telaIdeia(x) {
  const A = afinacaoDe(x.afin)[2], N = A.length, ex = { afin: A, evs: [], nome: x.nome };
  if (ED.i >= x.evs.length) ED.i = x.evs.length - 1;
  const atual = x.evs[ED.i], usadas = new Set(x.evs.flatMap(e => e.n.map(([c, k]) => c + ',' + k)));
  let alvos = '';
  for (let c = 0; c < N; c++) for (let k = 0; k <= LAB_CASAS; k++) {
    const no = atual && atual.n.some(([a, b]) => a === c && b === k), cx = brMeio(k), cy = brY(N, c), ch = c + ',' + k;
    alvos += `<g class="nt ed${no ? ' sel' : usadas.has(ch) ? ' usada' : ' vazia'}" data-pos="${ch}" role="button" tabindex="${no || usadas.has(ch) || k === 0 ? 0 : -1}" aria-label="${nomeNota(A[c] + k, c, k, N)}"><circle cx="${cx}" cy="${cy}" r="11.5"/><text x="${cx}" y="${cy + 4.5}" text-anchor="middle">${no || usadas.has(ch) ? CIFRA[pc(A[c] + k)] : ''}</text></g>`;
  }
  const exT = { afin: A, evs: x.evs.length ? x.evs : [{ d: x.compasso[0] * x.compasso[1], n: [], t: '' }], nome: x.nome, compasso: x.compasso };
  const T0 = atual ? tecs(atual) : [];
  return migalhas([['estudio', 'Estúdio'], [null, x.nome]]) + `<div class="pilha estudio">
    <p class="apoio ed-dica">${ED.acorde ? 'Modo acorde: toque nas cordas para juntar notas à nota escolhida.' : 'Toque no braço para escrever a próxima nota. Toque numa nota da tablatura para escolhê-la e mudar a duração ou a técnica.'}</p>
    <div class="tr-braco lab-braco"><div class="lab-vis">${bracoTreino(ex).replace('<g class="bt-notas"></g>', `<g class="bt-notas">${alvos}</g>`)}</div><div class="tr-braco-cordas">${cordasBraco(ex)}</div></div>
    <div class="tab-wrap ed-tab">${tabSVG(exT).replace(`<g class="tab-n" data-i="${ED.i}">`, `<g class="tab-n sel" data-i="${ED.i}">`)}</div>
    <section class="cartao ed-ferr" aria-label="Ferramentas">
      <span class="kf-rotulo" id="ed-dur-l">Duração da nota</span><div class="kf-seg ed-dur" role="group" aria-labelledby="ed-dur-l">${DURACOES_ED.map(([d, n, s]) => `<button type="button" data-ed-dur="${d}" aria-pressed="${Math.abs((atual ? atual.d : ED.d) - d) < 1e-6}" aria-label="${n}">${s}</button>`).join('')}</div>
      <span class="kf-rotulo" id="ed-tec-l">Técnica da nota escolhida</span><div class="ed-tecs" role="group" aria-labelledby="ed-tec-l">${TECNICAS_ED.map(([t, s, n]) => `<button type="button" class="chip-1a" data-ed-tec="${t}" aria-pressed="${T0.includes(t)}" aria-label="${n}"${atual && atual.n.length ? '' : ' disabled'}>${s}</button>`).join('')}</div>
      <div class="ed-bts"><button type="button" class="kf-btn kf-sec" data-ed-acorde aria-pressed="${ED.acorde}">${ED.acorde ? I.check : ''}Acorde: juntar notas</button><button type="button" class="kf-btn kf-sec" data-ed-pausa>Pausa</button><button type="button" class="kf-btn kf-sec" data-ed-apagar${atual ? '' : ' disabled'}>Apagar a nota</button></div></section>
    <div class="ed-fim"><button type="button" class="kf-btn kf-pri" data-ed-ouvir${x.evs.some(e => e.n.length) ? '' : ' disabled'}>${I.ouvir}Ouvir</button><button type="button" class="kf-btn kf-sec" data-ed-treinar${x.evs.some(e => e.n.length) ? '' : ' disabled'}>${I.play}Treinar com bateria</button><button type="button" class="kf-btn kf-sec" data-ed-variacao>Fazer uma variação</button><button type="button" class="kf-btn kf-sec" data-ed-excluir>Apagar a ideia</button></div>
    <div class="cartao ed-campo-mao"><span class="kf-rotulo">Ou escolha a corda e a casa</span><div class="ed-linha"><div class="campo"><label class="kf-rotulo" for="ed-corda">Corda</label><select id="ed-corda">${A.map((m, c) => `<option value="${c}">${N - c}ª (${nomeCorda(m)})</option>`).reverse().join('')}</select></div><div class="campo"><label class="kf-rotulo" for="ed-casa">Casa</label><input id="ed-casa" class="kf-entrada" type="number" inputmode="numeric" min="0" max="24" value="0"></div><button type="button" class="kf-btn kf-sec ed-por" data-ed-por>${I.mais}Pôr a nota</button></div></div>
    <details class="cartao ed-dados" data-kf-secao${x.evs.length ? '' : ' open'}><summary>Nome, afinação, compasso e andamento</summary><div class="campo"><label class="kf-rotulo" for="ed-nome">Nome</label><input id="ed-nome" class="kf-entrada" maxlength="40" value="${esc(x.nome)}"></div>
      <div class="ed-linha">${[['ed-afin', 'Afinação', AFINACOES.map(a => [a[0], a[1]]), x.afin], ['ed-comp', 'Compasso', COMPASSOS_ED, x.compasso.join(',')]].map(([id, r, ops, v]) => `<div class="campo"><label class="kf-rotulo" for="${id}">${r}</label><select id="${id}">${ops.map(([k, n]) => `<option value="${k}"${String(k) === String(v) ? ' selected' : ''}>${n}</option>`).join('')}</select></div>`).join('')}
        <div class="campo"><label class="kf-rotulo" for="ed-bpm">Andamento (bpm)</label><input id="ed-bpm" class="kf-entrada" type="number" inputmode="numeric" min="30" max="260" value="${x.bpm}"></div></div>
      <div class="campo"><label class="kf-rotulo" for="ed-musica">De onde veio <span class="kf-opcional">(opcional)</span></label><input id="ed-musica" class="kf-entrada" maxlength="60" placeholder="Música e artista, se você tirou de ouvido" value="${esc(x.musica || '')}"><p class="kf-ajuda">Fica só neste aparelho e na sua sincronização, para uso pessoal.</p></div></details>
    </div>`;
}
function ligarEstudio(m) {
  $$('[data-ideia-nova]', m).forEach(b => b.onclick = () => { ED.i = -1; novaIdeia(); });
  const x = ideiaDe(parte(1)); if (!x) return;
  const A = afinacaoDe(x.afin)[2], mexeu = () => { const v = $('.lab-vis', m), sx = v ? v.scrollLeft : 0, t = $('.ed-tab', m), tx = t ? t.scrollLeft : 0; salvarIdeia(x); redesenhar(); const v2 = $('.lab-vis'), t2 = $('.ed-tab'); if (v2) v2.scrollLeft = sx; if (t2) t2.scrollLeft = tx; };
  const soar = (c, k) => { const a = audio(); if (a) tocarCorda(A[c] + k, a.currentTime + .02, .9, .45); };
  const por = (c, k) => {
    const atual = x.evs[ED.i];
    if (ED.acorde && atual && atual.n.length) { const j = atual.n.findIndex(n => n[0] === c); if (j >= 0 && atual.n[j][1] === k) atual.n.splice(j, 1); else if (j >= 0) atual.n[j] = [c, k, null]; else atual.n.push([c, k, null]); atual.n.sort((a, b) => a[0] - b[0]); if (!atual.n.length) { x.evs.splice(ED.i, 1); ED.i--; } }
    else { x.evs.splice(ED.i + 1, 0, { d: ED.d, n: [[c, k, null]], t: '' }); ED.i++; }
    soar(c, k); mexeu();
  };
  $('#ed-nome', m).addEventListener('change', e => { x.nome = e.target.value.trim() || 'Ideia sem nome'; mexeu(); });
  $('#ed-musica', m).addEventListener('change', e => { x.musica = e.target.value.trim(); salvarIdeia(x); });
  $('#ed-bpm', m).addEventListener('change', e => { x.bpm = Math.max(30, Math.min(260, Math.round(+e.target.value) || 90)); mexeu(); });
  $('#ed-afin', m).addEventListener('change', e => { const novo = e.target.value, n0 = afinacaoDe(x.afin)[2].length, n1 = afinacaoDe(novo)[2].length; x.evs = n0 === n1 ? x.evs : converterAfinacao(x.evs, x.afin, novo); x.afin = novo; mexeu(); });
  $('#ed-comp', m).addEventListener('change', e => { x.compasso = e.target.value.split(',').map(Number); mexeu(); });
  const w = $('.lab-vis', m);
  w.addEventListener('click', e => { const g = e.target.closest('[data-pos]'); if (g) { const [c, k] = g.dataset.pos.split(',').map(Number); por(c, k); } });
  w.addEventListener('keydown', e => { const g = e.target.closest('[data-pos]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); const [c, k] = g.dataset.pos.split(',').map(Number); por(c, k); } });
  $('[data-ed-por]', m).onclick = () => { const c = +$('#ed-corda', m).value, k = Math.max(0, Math.min(24, Math.round(+$('#ed-casa', m).value) || 0)); por(c, k); };
  $('.ed-tab', m).addEventListener('click', e => { const g = e.target.closest('.tab-n'); if (!g) return; ED.i = +g.dataset.i; const ev = x.evs[ED.i]; if (ev) { ED.d = ev.d; const a = audio(); if (a) tocarEvento(ev, A, a.currentTime + .02, .6, 1); } mexeu(); });
  $$('[data-ed-dur]', m).forEach(b => b.onclick = () => { ED.d = +b.dataset.edDur; const ev = x.evs[ED.i]; if (ev) ev.d = ED.d; mexeu(); });
  $$('[data-ed-tec]', m).forEach(b => b.onclick = () => { const ev = x.evs[ED.i]; if (!ev) return; const T = tecs(ev), t = b.dataset.edTec; ev.t = (T.includes(t) ? T.filter(y => y !== t) : [...T.filter(y => !(t === 'h' && y === 'p') && !(t === 'p' && y === 'h')), t]).join(' '); mexeu(); });
  $('[data-ed-acorde]', m).onclick = () => { ED.acorde = !ED.acorde; mexeu(); };
  $('[data-ed-pausa]', m).onclick = () => { x.evs.splice(ED.i + 1, 0, { d: ED.d, n: [], t: '' }); ED.i++; mexeu(); };
  $('[data-ed-apagar]', m).onclick = () => { if (ED.i < 0) return; const i = ED.i, ev = x.evs.splice(i, 1)[0]; ED.i = Math.min(i, x.evs.length) - 1; mexeu(); KitFacil.avisar('Nota apagada.', { label: 'Desfazer', run: () => { x.evs.splice(i, 0, ev); ED.i = i; mexeu(); } }); };
  $('[data-ed-ouvir]', m).onclick = () => { const a = audio(); if (!a) return; const seg = 60 / x.bpm; let t = a.currentTime + .08; x.evs.forEach(e => { if (e.n.length) tocarEvento(e, A, t, seg, 1); t += e.d * seg; }); };
  $('[data-ed-treinar]', m).onclick = () => abrirTreino('ideia:' + x.id, { bpm: x.bpm });
  $('[data-ed-variacao]', m).onclick = () => { ED.i = x.evs.length - 1; novaIdeia({ nome: `${x.nome} (variação)`, afin: x.afin, compasso: [...x.compasso], bpm: x.bpm, musica: x.musica, evs: JSON.parse(JSON.stringify(x.evs)) }); KitFacil.avisar('Variação criada: mude o que quiser, a original continua guardada.'); };
  $('[data-ed-excluir]', m).onclick = () => { const i = DB.ideias.indexOf(x); DB.ideias.splice(i, 1); registrarIdeias(); commit(); ir('estudio'); KitFacil.avisar(`"${x.nome}" apagada.`, { label: 'Desfazer', run: () => { DB.ideias.splice(i, 0, x); registrarIdeias(); commit(); redesenhar(); } }); };
}

/* Guitarra Fácil · braço laboratório (Documento Mestre, seção 8): o braço inteiro, no mesmo tamanho fixo do treino,
   para explorar e experimentar. Modos: notas (todas ou só as naturais), escala (tom, escala, nota ou grau), acorde
   (todas as notas do acorde pelo braço), intervalos (toque numa nota e veja a distância das outras) e livre (escolha
   notas, ouça juntas ou em sequência, veja o nome do acorde e leve a ideia para o Estúdio). Muda a afinação, inclusive
   drops e sete cordas. A teoria entra nos exercícios pelo botão "Ver no braço" da janela do treino. */
'use strict';
const LAB = { modo: 'notas', todas: false, raiz: 9, escala: 'penta-menor', acorde: 'm', rotulo: 'nota', afin: 'padrao', base: null, sel: [], ultima: null };
const MODOS_LAB = [['notas', 'Notas'], ['escala', 'Escala'], ['acorde', 'Acorde'], ['intervalos', 'Intervalos'], ['livre', 'Livre']];
const LAB_CASAS = 22;
const nomeNota = (m, c, k, N) => `${NOTAS[pc(m)]}, ${N - c}ª corda, ${k ? 'casa ' + k : 'solta'}`;
// o nome do que está escolhido: duas notas dão o intervalo; três ou mais, o acorde (se houver um com essas notas)
function nomeDoSom(midis) {
  const pcs = [...new Set(midis.map(pc))];
  if (midis.length === 2) { const d = Math.abs(midis[1] - midis[0]), iv = INTERVALOS.find(x => x[0] === (d > 12 ? d % 12 || 12 : d)); return iv ? `${iv[1]}${d > 12 ? ' (mais uma oitava)' : ''}: ${iv[2]}` : ''; }
  if (pcs.length < 2) return '';
  const grave = pc(Math.min(...midis));
  for (const r of [grave, ...pcs.filter(x => x !== grave)]) for (const [t, nome] of TIPOS_ACORDE) {
    const A = new Set(notasAcorde(r, t)); if (A.size === pcs.length && pcs.every(x => A.has(x))) return `${NOTAS[r]} ${nome.toLowerCase()} (${CIFRA[r]}${t})${r !== grave ? `, com ${NOTAS[grave]} no baixo` : ''}`;
  }
  return 'Sem nome de acorde: experimente trocar uma nota.';
}
function labNotas(A) {
  const N = A.length, alvo = LAB.modo === 'escala' ? new Set(notasEscala(LAB.raiz, LAB.escala)) : LAB.modo === 'acorde' ? new Set(notasAcorde(LAB.raiz, LAB.acorde)) : null;
  let s = '';
  for (let c = 0; c < N; c++) for (let k = 0; k <= LAB_CASAS; k++) {
    const m = A[c] + k, n = pc(m), nat = !CIFRA[n].includes('#'), cx = brMeio(k), cy = brY(N, c);
    if (LAB.modo === 'notas' && !LAB.todas && !nat) continue;
    if (alvo && !alvo.has(n)) continue;
    const sel = LAB.modo === 'livre' && LAB.sel.some(([a, b]) => a === c && b === k), base = LAB.base && LAB.base[0] === c && LAB.base[1] === k;
    let rot = CIFRA[n], cls = 'nt lab';
    if (alvo) { if (n === LAB.raiz) cls += ' raiz'; if (LAB.rotulo === 'grau') rot = GRAUS[pc(n - LAB.raiz)]; }
    if (LAB.modo === 'intervalos' && LAB.base) { const d = m - (A[LAB.base[0]] + LAB.base[1]); rot = base ? 'T' : GRAUS[pc(d)]; if (base) cls += ' base'; }
    if (LAB.modo === 'livre' && !sel) cls += ' apagada';
    if (sel) cls += ' sel';
    if (!nat && LAB.modo === 'notas') cls += ' sust';
    s += `<g class="${cls}" data-lab="${c},${k}" role="button" tabindex="0" aria-pressed="${sel || base}" aria-label="${nomeNota(m, c, k, N)}${rot !== CIFRA[n] ? `, ${rot}` : ''}"><circle cx="${cx}" cy="${cy}" r="11.5"/><text x="${cx}" y="${cy + 4.5}" text-anchor="middle">${esc(rot)}</text></g>`;
  }
  return s;
}
function labLeitura(A) {
  const N = A.length, midi = ([c, k]) => A[c] + k;
  if (LAB.modo === 'escala') { const E = ESCALAS.find(e => e[0] === LAB.escala); return `<b>${NOTAS[LAB.raiz]} ${E[1].toLowerCase()}</b>: ${notasEscala(LAB.raiz, LAB.escala).map(n => NOTAS[n]).join(', ')}. ${E[3] || ''}`; }
  if (LAB.modo === 'acorde') { const t = TIPOS_ACORDE.find(x => x[0] === LAB.acorde); return `<b>${NOTAS[LAB.raiz]} ${t[1].toLowerCase()} (${CIFRA[LAB.raiz]}${t[0]})</b>: ${notasAcorde(LAB.raiz, LAB.acorde).map(n => NOTAS[n]).join(', ')}. A tônica fica em vermelho.`; }
  if (LAB.modo === 'intervalos') return LAB.base ? (LAB.ultima && (LAB.ultima[0] !== LAB.base[0] || LAB.ultima[1] !== LAB.base[1]) ? `De <b>${NOTAS[pc(midi(LAB.base))]}</b> até <b>${NOTAS[pc(midi(LAB.ultima))]}</b>: ${esc(nomeDoSom([midi(LAB.base), midi(LAB.ultima)]))}` : `Base: <b>${nomeNota(midi(LAB.base), LAB.base[0], LAB.base[1], N)}</b>. Cada nota mostra a distância até ela. Toque em outra para ouvir as duas.`) : 'Toque numa nota para ela virar a base.';
  if (LAB.modo === 'livre') return LAB.sel.length ? `<b>${LAB.sel.map(x => NOTAS[pc(midi(x))]).join(' · ')}</b>${LAB.sel.length > 1 ? ` — ${esc(nomeDoSom(LAB.sel.map(midi)))}` : ''}` : 'Toque nas notas para escolher (até seis). Depois ouça juntas ou em sequência.';
  return LAB.ultima ? `<b>${nomeNota(midi(LAB.ultima), LAB.ultima[0], LAB.ultima[1], N)}</b>` : 'Toque numa nota para ouvir.';
}
VIEWS.braco = () => {
  const A = afinacaoDe(LAB.afin)[2], ex = { afin: A, evs: [], nome: 'laboratório do braço' };
  const sel = (id, rot, ops, v) => `<div class="campo"><label class="kf-rotulo" for="${id}">${rot}</label><select id="${id}">${ops.map(([k, n]) => `<option value="${esc(String(k))}"${String(v) === String(k) ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></div>`;
  return KitFacil.ui.cabecalho({ titulo: 'Braço', sub: 'O laboratório: explore notas, escalas, acordes e intervalos, e monte suas combinações.' })
    + `<div class="pilha"><div class="kf-seg lab-modos" role="group" aria-label="Modo">${MODOS_LAB.map(([k, n]) => `<button type="button" data-lab-modo="${k}" aria-pressed="${LAB.modo === k}">${n}</button>`).join('')}</div>
    <div class="lab-campos">
      ${LAB.modo === 'escala' || LAB.modo === 'acorde' ? sel('lab-raiz', 'Tom', NOTAS.map((n, i) => [i, `${n} (${CIFRA[i]})`]), LAB.raiz) : ''}
      ${LAB.modo === 'escala' ? sel('lab-escala', 'Escala', ESCALAS.filter(e => e[0] !== 'cromatica').map(e => [e[0], e[1]]), LAB.escala) : ''}
      ${LAB.modo === 'acorde' ? sel('lab-acorde', 'Acorde', TIPOS_ACORDE.map(t => [t[0], `${t[1]} (${t[0] || 'maior'})`]), LAB.acorde) : ''}
      ${sel('lab-afin', 'Afinação', AFINACOES.map(a => [a[0], a[1]]), LAB.afin)}
    </div>
    ${LAB.modo === 'notas' ? `<div class="kf-seg" role="group" aria-label="Notas mostradas"><button type="button" data-lab-todas="0" aria-pressed="${!LAB.todas}">Naturais</button><button type="button" data-lab-todas="1" aria-pressed="${LAB.todas}">Todas</button></div>` : ''}
    ${LAB.modo === 'escala' || LAB.modo === 'acorde' ? `<div class="kf-seg" role="group" aria-label="No braço, mostrar"><button type="button" data-lab-rot="nota" aria-pressed="${LAB.rotulo === 'nota'}">Notas</button><button type="button" data-lab-rot="grau" aria-pressed="${LAB.rotulo === 'grau'}">Graus</button></div>` : ''}
    <div class="tr-braco lab-braco"><div class="lab-vis">${bracoTreino(ex).replace('<g class="bt-notas"></g>', `<g class="bt-notas">${labNotas(A)}</g>`)}</div><div class="tr-braco-cordas">${cordasBraco(ex)}</div></div>
    <p class="cartao lab-leitura" id="lab-leitura" aria-live="polite">${labLeitura(A)}</p>
    <div class="lab-bts">
      ${LAB.modo === 'escala' ? `<button type="button" class="kf-btn kf-pri" data-lab-ouvir>${I.ouvir}Ouvir a escala</button><button type="button" class="kf-btn kf-sec" data-lab-treinar>${I.play}Treinar esta escala</button>` : ''}
      ${LAB.modo === 'acorde' ? `<button type="button" class="kf-btn kf-pri" data-lab-ouvir>${I.ouvir}Ouvir o acorde</button>` : ''}
      ${LAB.modo === 'intervalos' && LAB.base ? `<button type="button" class="kf-btn kf-sec" data-lab-limpar>Trocar a base</button>` : ''}
      ${LAB.modo === 'livre' ? `<button type="button" class="kf-btn kf-pri" data-lab-junto${LAB.sel.length ? '' : ' disabled'}>${I.ouvir}Tocar junto</button><button type="button" class="kf-btn kf-sec" data-lab-seq${LAB.sel.length ? '' : ' disabled'}>Tocar em sequência</button><button type="button" class="kf-btn kf-sec" data-lab-limpar${LAB.sel.length ? '' : ' disabled'}>Limpar</button><button type="button" class="kf-btn kf-sec" data-lab-estudio${LAB.sel.length ? '' : ' disabled'}>${I.mais}Levar ao Estúdio</button>` : ''}
    </div></div>`;
};
function ligarLab(m) {
  const A = afinacaoDe(LAB.afin)[2], mexeu = () => { const x = $('.lab-vis', m).scrollLeft; redesenhar(); const v = $('.lab-vis'); if (v) v.scrollLeft = x; };
  $$('[data-lab-modo]', m).forEach(b => b.onclick = () => { LAB.modo = b.dataset.labModo; LAB.base = null; LAB.ultima = null; mexeu(); });
  $$('[data-lab-todas]', m).forEach(b => b.onclick = () => { LAB.todas = b.dataset.labTodas === '1'; mexeu(); });
  $$('[data-lab-rot]', m).forEach(b => b.onclick = () => { LAB.rotulo = b.dataset.labRot; mexeu(); });
  [['lab-raiz', 'raiz', Number], ['lab-escala', 'escala', String], ['lab-acorde', 'acorde', String], ['lab-afin', 'afin', String]].forEach(([id, k, f]) => $('#' + id, m)?.addEventListener('change', e => { LAB[k] = f(e.target.value); if (k === 'afin') { LAB.sel = []; LAB.base = null; } mexeu(); }));
  const tocarNa = ([c, k], q = 0, dur = 1.2) => { const a = audio(); if (a) tocarCorda(A[c] + k, a.currentTime + .02 + q, dur, .45); };
  const toque = g => {
    const [c, k] = g.dataset.lab.split(',').map(Number), p = [c, k]; LAB.ultima = p;
    if (LAB.modo === 'intervalos') { if (!LAB.base) LAB.base = p; else { tocarNa(LAB.base); tocarNa(p, .45); tocarNa(LAB.base, 1.1, 1.4); tocarNa(p, 1.1, 1.4); mexeu(); return; } }
    if (LAB.modo === 'livre') { const i = LAB.sel.findIndex(([a, b]) => a === c && b === k); if (i >= 0) LAB.sel.splice(i, 1); else { if (LAB.sel.length >= 6) { KitFacil.avisar('No modo livre, até seis notas.'); return; } LAB.sel.push(p); } }
    tocarNa(p); mexeu();
  };
  const w = $('.lab-vis', m);
  w.addEventListener('click', e => { const g = e.target.closest('[data-lab]'); if (g) toque(g); });
  w.addEventListener('keydown', e => { const g = e.target.closest('[data-lab]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toque(g); } });
  $$('[data-lab-ouvir]', m).forEach(b => b.onclick = () => {
    const a = audio(); if (!a) return; const t = a.currentTime + .05, base = A[0] + pc(LAB.raiz - A[0]) + (pc(LAB.raiz - A[0]) < 3 ? 12 : 0);
    if (LAB.modo === 'escala') { const iv = ESCALAS.find(e => e[0] === LAB.escala)[2]; [...iv, 12].forEach((i, j) => tocarCorda(base + i, t + j * .32, .5, .45)); }
    else { const iv = TIPOS_ACORDE.find(x => x[0] === LAB.acorde)[2]; iv.forEach((i, j) => tocarCorda(base + i, t + j * .3, .6, .4)); iv.forEach((i, j) => tocarCorda(base + i, t + iv.length * .3 + .2 + j * .02, 1.8, .32)); }
  });
  $$('[data-lab-treinar]', m).forEach(b => b.onclick = () => { const mm = MODELOS.find(x => x.cat === 'escalas' && x.grupo === 'Escala' && x.escala === LAB.escala) || MODELOS.find(x => x.cat === 'escalas' && x.trocaEscala); if (!mm) { KitFacil.avisar('Ainda não há treino desta escala.'); return; } abrirTreino(mm.id, { cfg: { raiz: LAB.raiz, escala: LAB.escala, afin: LAB.afin } }); });
  $$('[data-lab-junto]', m).forEach(b => b.onclick = () => { const L = [...LAB.sel].sort((x, y) => (A[x[0]] + x[1]) - (A[y[0]] + y[1])); L.forEach((p, j) => tocarNa(p, j * .025, 1.8)); });
  $$('[data-lab-seq]', m).forEach(b => b.onclick = () => LAB.sel.forEach((p, j) => tocarNa(p, j * .35, .6)));
  $$('[data-lab-limpar]', m).forEach(b => b.onclick = () => { LAB.sel = []; LAB.base = null; LAB.ultima = null; mexeu(); });
  $$('[data-lab-estudio]', m).forEach(b => b.onclick = () => { if (typeof novaIdeiaCom === 'function') novaIdeiaCom(LAB.sel, LAB.afin); });
}
// a teoria dentro do exercício: abre o laboratório com a escala e o tom do treino
function verNoBraco(ex) { Object.assign(LAB, { modo: 'escala', raiz: ex.raiz, escala: ex.escala, afin: ex.afinId || 'padrao', rotulo: 'grau', base: null, sel: [] }); KitFacil.dialogo.fechar(); setTimeout(() => ir('braco'), 300); }

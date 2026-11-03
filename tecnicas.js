/* Guitarra Fácil · demonstrações esquemáticas: observe, pause e percorra o gesto.
   Não avaliam a execução. Pausas, cordas diferentes e origem ausente não inventam ligações. */
'use strict';
const GESTOS = {
  b: { nome: 'Bend de um tom', passos: ['Prepare o apoio', 'Suba até o alvo', 'Sustente e retorne'], dica: ['Apoie o anelar com o médio e o indicador. Toque a nota de partida.', 'Gire o pulso para deslocar a corda. A casa permanece a mesma; a altura sobe um tom.', 'Ouça o alvo e mantenha a altura. Retorne com controle, sem soltar a corda.'], criterio: 'O bend alcançou a nota alvo e voltou sem ruídos?' },
  b2: { nome: 'Bend de meio tom', passos: ['Prepare o apoio', 'Suba até o alvo', 'Sustente e retorne'], dica: ['Apoie o anelar com os outros dedos e toque a nota de partida.', 'Desloque a corda com o pulso até a altura de meio tom acima.', 'Mantenha o alvo antes de voltar. O deslocamento desenhado é esquemático: guie-se pelo som.'], criterio: 'O bend alcançou meio tom acima, sem passar do alvo?' },
  s: { nome: 'Slide', passos: ['Toque a origem', 'Deslize sem soltar', 'Chegue no tempo'], dica: ['Pressione a casa inicial e toque uma vez com a palheta.', 'Mantenha o contato e deslize o mesmo dedo pela mesma corda.', 'Pare junto ao traste da casa de chegada. Preserve a continuidade do som.'], criterio: 'O slide chegou no tempo, sem interromper o som?' },
  h: { nome: 'Hammer-on · ligado para cima', passos: ['Prepare dois dedos', 'Martele a chegada', 'Mantenha a base'], dica: ['Pressione a nota grave com o indicador e toque com a palheta.', 'O outro dedo bate na casa mais aguda. Não dê uma segunda palhetada.', 'Mantenha o indicador apoiado e compare o volume das duas notas.'], criterio: 'A segunda nota soou clara, sem uma nova palhetada?' },
  p: { nome: 'Pull-off · ligado para baixo', passos: ['Prepare a nota grave', 'Puxe e retire', 'Deixe a base soar'], dica: ['Deixe o indicador na casa grave e outro dedo na casa aguda. Toque a nota aguda.', 'Retire o dedo da nota aguda com uma leve ação sobre a corda. Apenas levantar pode apagar o som.', 'O indicador permanece. A nota grave soa sem uma nova palhetada.'], criterio: 'A nota grave soou com clareza e volume equilibrado?' },
  t: { nome: 'Tapping', passos: ['Prepare a mão da escala', 'Toque com a outra mão', 'Retire com controle'], dica: ['A mão da escala mantém a nota de base. Abafe as cordas que não devem soar.', 'Um dedo da mão da palheta bate na casa aguda, junto ao traste.', 'Retire esse dedo com uma leve ação de pull-off para fazer a nota de base soar.'], criterio: 'O ataque e a retirada ficaram claros, sem cordas extras soando?' },
  v: { nome: 'Vibrato', passos: ['Estabeleça a nota', 'Oscile com regularidade', 'Retorne à base'], dica: ['Toque e sustente a nota antes de começar a variar sua altura.', 'Use o pulso para alternar pequenos deslocamentos da corda e retornos à posição inicial.', 'Mantenha a pulsação regular. O vibrato desenhado sobe e retorna à altura de base.'], criterio: 'A variação ficou regular, voltando à altura de base?' }
};
// Ligados e slides marcam a nota de chegada no modelo atual.
function ligacaoTecnica(ex, i, c) {
  const atual = ex.evs[i]?.n.find(n => n[0] === c), anterior = ex.evs[i - 1]?.n.find(n => n[0] === c);
  if (!atual || !anterior || anterior[1] === atual[1]) return null;
  const T = tecs(ex.evs[i]);
  if (T.includes('s') && (!anterior[1] || !atual[1]) || T.includes('h') && atual[1] <= anterior[1] || T.includes('p') && atual[1] >= anterior[1]) return null;
  return { de: anterior[1], ate: atual[1], corda: c };
}
function demonstracoesDe(ex) {
  const vistas = new Map();
  ex.evs.forEach((e, i) => tecs(e).forEach(k => {
    if (!GESTOS[k] || vistas.has(k) || !e.n.length) return;
    const [c, casa] = e.n[0]; let par = ligacaoTecnica(ex, i, c);
    const baseTap = ex.evs[i+1]?.n.find(n => n[0] === c && n[1] > 0 && n[1] < casa);
    if (k === 't' && !par && baseTap) par = { de: baseTap[1], ate: casa, corda: c };
    const valido = par && (k === 'h' ? par.ate > par.de && par.de > 0 : k === 'p' ? par.ate < par.de && par.ate > 0 : k === 's' ? par.de > 0 && par.ate > 0 : k === 't' ? par.ate > par.de && par.de > 0 : true);
    const exemplo = ['h', 'p', 's', 't'].includes(k) && !valido || casa === 0 || ['b', 'b2'].includes(k) && casa < 3;
    let de = par?.de ?? casa, ate = casa;
    if (exemplo) { de = k === 'p' ? 7 : 5; ate = k === 'p' ? 5 : k === 't' ? 12 : 7; }
    if (k === 'b' || k === 'b2' || k === 'v') de = ate = exemplo ? 7 : casa;
    vistas.set(k, { k, c, de, ate, exemplo, base: ex.afin[c] + de, afin: ex.afin[c], cordas: ex.afin.length });
  }));
  return [...vistas.values()];
}
function cenaTecnica(q, progresso) {
  const { k, de, ate } = q, p = progresso, suave = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const a = Math.max(1, Math.min(de, ate) - (['b', 'b2'].includes(k) ? 2 : 1)), b = Math.max(de, ate) + 1, passo = 390 / (b - a + 1);
  const x = casa => 65 + (casa - a + .76) * passo;
  const orig = x(de), dest = x(ate), y = 138;
  const subir = suave((p - .2) / .28), voltar = suave((p - .78) / .22);
  const bend = ['b', 'b2'].includes(k), vib = k === 'v', slide = k === 's', h = k === 'h', pull = k === 'p', tap = k === 't';
  const desloc = bend ? (k === 'b2' ? 18 : 30) * subir * (1 - voltar) : vib && p > .2 ? 13 * Math.pow(Math.sin((p - .2) / .8 * Math.PI * 4), 2) : 0;
  const fx = slide ? orig + (dest - orig) * suave((p - .2) / .5) : bend || vib ? orig : h || tap ? dest : orig;
  const levantar = pull || tap && p > .65 ? 42 * suave((p - (tap ? .65 : .25)) / .3) : h || tap ? 42 * (1 - subir) : 0;
  let s = `<svg viewBox="0 0 520 270" role="img" aria-label="${esc(GESTOS[k].nome)}: ${esc(GESTOS[k].passos[Math.min(2, Math.floor(p * 3))])}. Vista esquemática dos dedos e de uma corda."><rect x="40" y="80" width="440" height="116" rx="12" class="gesto-madeira"/>`;
  for (let casa = a; casa <= b + 1; casa++) s += `<path d="M${65 + (casa - a) * passo} 80v116" class="gesto-traste"/>${casa <= b ? `<text x="${x(casa)}" y="218" text-anchor="middle" class="gesto-casa">${casa}</text>` : ''}`;
  [105, 171].forEach(yy => s += `<path d="M40 ${yy}H480" class="gesto-outra"/>`);
  s += `<path d="M40 ${y}L${bend ? x(de-2) : fx} ${y - desloc}L${fx} ${y - desloc}L480 ${y}" class="gesto-corda"/>`;
  // Sombra de contato e punho articulado: deslocamento vem do mesmo modelo musical.
  s += `<ellipse cx="${fx}" cy="${y - desloc + 5}" rx="22" ry="6" fill="#000" opacity=".35"/><path d="M${fx - 24} 267 Q${fx - 35} 245 ${fx - 16} 220 L${fx + 15} 220 Q${fx + 40} 246 ${fx + 28} 267" fill="url(#pele-gesto)" stroke="#582d26" stroke-width="2"/>`;
  // Cada dedo é desenhado como silhueta com articulação e unha; o apoio não desaparece no ligado.
  const dedo = (cx, cy, numero, outra = false, apoio = false) => `<g class="gesto-dedo${outra ? ' outra-mao' : ''}${apoio ? ' apoio' : ''}" transform="translate(${cx} ${cy})${outra ? ' rotate(180)' : ''}"><path d="M-20 85Q-22 64-17 47L-14 17C-13-6 12-6 14 16L17 45Q22 64 24 85Z"/><path d="M-12 43q12 5 25 0M-11 47q11 4 22 0M-9 15q9-8 18 0v12q-9 4-18 0Z" class="gesto-unha"/><text y="65" text-anchor="middle"${outra ? ' transform="rotate(180 0 61)"' : ''}>${numero}</text></g>`;
  if (bend) { s += dedo(x(de - 2), y - desloc - 4, '1', false, true) + dedo(x(de - 1), y - desloc - 4, '2', false, true); }
  if (h || pull || tap) s += dedo(x(Math.min(de, ate)), y - 4, '1', false, true);
  s += dedo(fx, y - desloc - 4 + (tap ? -levantar : levantar), tap ? 'T' : h || pull || bend ? '3' : '1', tap);
  if (slide) s += `<path d="M${orig} 57H${dest}" class="gesto-trajeto"/><text x="${(orig + dest) / 2}" y="43" text-anchor="middle" class="gesto-anotacao">${ate > de ? 'Deslize →' : '← Deslize'}</text>`;
  if (bend || vib) s += `<path d="M${orig + 30} ${y}v-${bend ? 30 : 13}" class="gesto-trajeto"/><text x="260" y="43" text-anchor="middle" class="gesto-anotacao">${bend ? `${CIFRA[pc(q.base)]} → ${CIFRA[pc(q.base + (k === 'b2' ? 1 : 2))]} · ${k === 'b2' ? '½ tom' : '1 tom'}` : 'Altura de base → variação → base'}</text>`;
  if (tap) s += '<text x="380" y="43" text-anchor="middle" class="gesto-anotacao">T · mão da palheta</text>';
  return s + '<defs><linearGradient id="pele-gesto" x1="0" x2="1"><stop stop-color="#a75c40"/><stop offset=".4" stop-color="#efb18a"/><stop offset=".7" stop-color="#d18b65"/><stop offset="1" stop-color="#8d4335"/></linearGradient></defs></svg>';
}
function montarDemonstracao(el, ex) {
  const lista = demonstracoesDe(ex); if (!lista.length) { el.innerHTML = ''; return () => {}; }
  let q = lista[0], valor = 0, raf = 0, inicio = 0, tocando = false, etapa = -1;
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)');
  el.innerHTML = `<div class="gesto-cab"><span class="gesto-sobretitulo">Observe o movimento</span><h3 tabindex="-1">Entenda antes de tocar</h3><p>Vista esquemática para destros. Em posição canhota, inverta as mãos.</p></div>
    <div class="gesto-escolhas" role="group" aria-label="Técnica para demonstrar">${lista.map((d, i) => `<button type="button" class="kf-btn kf-sec" data-gesto="${d.k}" aria-pressed="${i === 0}">${esc(GESTOS[d.k].nome)}</button>`).join('')}</div>
    <p class="gesto-contexto"></p><div class="gesto-layout"><div class="gesto-cena"></div><div class="gesto-explicacao">
    <ol class="gesto-etapas">${[0, 1, 2].map(i => `<li><button type="button" data-etapa="${i}"><span>${i + 1}</span><b></b></button></li>`).join('')}</ol>
    <p class="gesto-instrucao" aria-live="polite"></p></div></div>
    <div class="gesto-transporte"><button type="button" class="kf-btn kf-pri" data-gesto-play>Ver devagar</button><label>Movimento<input type="range" min="0" max="100" value="0" step="1" aria-label="Posição da demonstração"></label></div>
    <p class="apoio gesto-reduzido"${reduzido.matches ? '' : ' hidden'}>Movimento reduzido: use as três etapas ou a barra para observar cada posição.</p><p class="gesto-criterio"></p>`;
  const range = $('input', el), play = $('[data-gesto-play]', el);
  const parar = () => { tocando = false; cancelAnimationFrame(raf); play.textContent = valor >= 1 ? 'Repetir movimento' : 'Ver devagar'; };
  const pintar = () => {
    const pos = { b: '0% 0%', b2: '0% 0%', s: '50% 0%', h: '100% 0%', p: '0% 100%', t: '50% 100%', v: '100% 100%' };
    const palco = $('.gesto-cena', el);
    if (palco.dataset.tecnica !== q.k) {
      palco.dataset.tecnica = q.k;
      palco.innerHTML = `<div class="gesto-referencia" role="img" aria-label="Ilustração de referência anatômica para ${esc(GESTOS[q.k].nome)}; o movimento e as casas do treino aparecem no diagrama abaixo" style="--pos:${pos[q.k]}"><span>ANATOMIA · ${esc(GESTOS[q.k].nome)}</span></div><div class="gesto-movimento"></div>`;
    }
    $('.gesto-movimento', palco).innerHTML = cenaTecnica(q, valor); range.value = Math.round(valor * 100);
    const n = Math.min(2, Math.floor(valor * 3));
    if (n !== etapa) { etapa = n; $('.gesto-instrucao', el).textContent = GESTOS[q.k].dica[n]; $$('[data-etapa]', el).forEach((b, i) => { b.setAttribute('aria-current', i === n ? 'step' : 'false'); }); }
  };
  const escolher = d => {
    parar(); q = d; valor = 0; etapa = -1;
    $$('[data-gesto]', el).forEach(b => b.setAttribute('aria-pressed', b.dataset.gesto === q.k));
    $$('[data-etapa] b', el).forEach((b, i) => b.textContent = GESTOS[q.k].passos[i]);
    $('.gesto-contexto', el).textContent = `${q.exemplo ? 'Exemplo de base' : 'Neste treino'} · ${q.cordas - q.c}ª corda · ${q.de === q.ate ? `casa ${q.de}` : `casas ${q.de} → ${q.ate}`} · dedos: 1 indicador, 2 médio, 3 anelar`;
    $('.gesto-criterio', el).textContent = 'Ao praticar: ' + GESTOS[q.k].criterio;
    pintar();
  };
  $$('[data-gesto]', el).forEach(b => b.onclick = () => escolher(lista.find(d => d.k === b.dataset.gesto)));
  $$('[data-etapa]', el).forEach(b => b.onclick = () => { parar(); valor = [0, .5, 1][+b.dataset.etapa]; pintar(); });
  range.oninput = () => { parar(); valor = +range.value / 100; pintar(); };
  play.onclick = () => {
    if (tocando) { parar(); return; }
    if (reduzido.matches) { valor = valor < .5 ? .5 : valor < 1 ? 1 : 0; pintar(); return; }
    if (valor >= 1) valor = 0;
    inicio = performance.now() - valor * 6500; tocando = true; play.textContent = 'Pausar movimento';
    const passo = agora => { if (!el.isConnected || el.hidden) { parar(); return; } valor = Math.min(1, (agora - inicio) / 6500); pintar(); if (valor < 1) raf = requestAnimationFrame(passo); else parar(); };
    raf = requestAnimationFrame(passo);
  };
  escolher(q);
  return parar;
}

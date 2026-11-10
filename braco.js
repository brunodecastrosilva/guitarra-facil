/* Guitarra Fácil · desenhos: braço da guitarra, desenho de cada parte (com a ordem das notas), tablatura com ritmo e
   diagrama de acorde. Tudo em SVG, com as cores do tema (variáveis --gf-*). Corda 0 é a 6ª (mais grossa), desenhada
   embaixo, como na tablatura; a 1ª corda fica em cima. No modo canhoto, o braço é espelhado. */
'use strict';

const DESENHO = (() => {
  const MARCAS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
  const ORD = ['6ª', '5ª', '4ª', '3ª', '2ª', '1ª'];

  /* braço. o = { de, ate, notas: [{ c, k, rot, tipo, dedo }], setas: [[[c,k],[c,k]]], canhoto, interativo, afin, rotulo, larg } */
  function braco(o = {}) {
    const de = o.de ?? 0, ate = o.ate ?? 12, larg = o.larg || 46, esp = o.esp || 24, topo = 14, base = 22, ml = 8;
    const vazio = de === 0;
    const casas = ate - de + 1, lat = o.lateral ? 26 : 0;
    const W = ml * 2 + casas * larg + lat, H = topo + esp * 5 + base;
    const xr = x => o.canhoto ? W - x : x;
    const fimCordas = W - ml - lat;
    const cx = k => ml + (k - de + .5) * larg;
    const cy = c => topo + (5 - c) * esp;
    let s = `<svg class="gf-braco${o.interativo ? ' gf-toque' : ''}${casas <= 8 ? ' gf-curto' : ''}" viewBox="0 0 ${W} ${H}" role="${o.interativo ? 'group' : 'img'}" aria-label="${esc(o.rotulo || 'Braço da guitarra')}" preserveAspectRatio="xMidYMid meet">`;
    s += `<rect class="gf-madeira" x="${o.canhoto ? ml + lat : ml}" y="${topo - 6}" width="${casas * larg}" height="${esp * 5 + 12}" rx="4"/>`;
    // marcas do braço
    for (let k = Math.max(1, de); k <= ate; k++) if (MARCAS.includes(k)) {
      const x = xr(cx(k));
      if (k % 12 === 0) s += `<circle class="gf-marca" cx="${x}" cy="${cy(4) - esp / 2 + esp}" r="4"/><circle class="gf-marca" cx="${x}" cy="${cy(1) - esp / 2}" r="4"/>`;
      else s += `<circle class="gf-marca" cx="${x}" cy="${topo + esp * 2.5}" r="4.5"/>`;
    }
    // trastes (o primeiro, se o braço começa na casa 0, é a pestana)
    for (let k = de; k <= ate + 1; k++) {
      const x = xr(ml + (k - de) * larg);
      const pestana = vazio && k === 1;
      if (vazio && k === 0) continue;
      s += `<line class="${pestana ? 'gf-pestana' : 'gf-traste'}" x1="${x}" y1="${topo - 6}" x2="${x}" y2="${topo + esp * 5 + 6}"/>`;
    }
    // cordas (mais grossas embaixo)
    for (let c = 0; c < 6; c++) s += `<line class="gf-corda" x1="${xr(ml)}" y1="${cy(c)}" x2="${xr(fimCordas)}" y2="${cy(c)}" stroke-width="${(2.2 - c * .3).toFixed(1)}"/>`;
    // seta do lado: o caminho pelas cordas (subir e, se for o caso, voltar)
    if (o.lateral) {
      const x = xr(W - lat / 2), y1 = cy(o.lateral.de), y2 = cy(o.lateral.ate), d = y2 > y1 ? 1 : -1;
      s += `<line class="gf-seta" x1="${x}" y1="${y1 + d * 4}" x2="${x}" y2="${y2 - d * 6}" marker-end="url(#gf-ponta)"${o.lateral.volta ? ' marker-start="url(#gf-ponta)"' : ''}/>`;
    }
    // números das casas
    for (let k = de; k <= ate; k++) if (k === 0 || MARCAS.includes(k) || k === de) s += `<text class="gf-ncasa" x="${xr(cx(k))}" y="${H - 5}">${k === 0 ? 'solta' : k}</text>`;
    // setas da ordem das notas
    (o.setas || []).forEach(([[c1, k1], [c2, k2]]) => {
      const x1 = xr(cx(k1)), y1 = cy(c1), x2 = xr(cx(k2)), y2 = cy(c2);
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, enc = 10.5;
      const ax = x1 + dx / len * enc, ay = y1 + dy / len * enc, bx = x2 - dx / len * (enc + 3), by = y2 - dy / len * (enc + 3);
      const curva = c1 === c2 ? -12 : 0, mx = (ax + bx) / 2, my = (ay + by) / 2 + curva;
      s += `<path class="gf-seta" d="M${ax.toFixed(1)} ${ay.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}" marker-end="url(#gf-ponta)"/>`;
    });
    // notas
    (o.notas || []).forEach(n => {
      const x = xr(cx(n.k)), y = cy(n.c), r = n.tipo === 'fantasma' ? 7 : 10;
      const rot = n.dedo != null && o.dedos ? String(n.dedo) : (n.rot ?? '');
      s += `<g class="gf-nota gf-${n.tipo || 'nota'}" data-c="${n.c}" data-k="${n.k}"><circle cx="${x}" cy="${y}" r="${r}"/>${rot !== '' ? `<text x="${x}" y="${y + 4}">${esc(rot)}</text>` : ''}</g>`;
    });
    // áreas de toque: cada casa de cada corda vira um botão
    if (o.interativo) for (let c = 0; c < 6; c++) for (let k = de; k <= ate; k++) {
      const x = xr(ml + (k - de) * larg) - (o.canhoto ? larg : 0);
      const n = TEORIA.nome(TEORIA.pcDe(c, k, o.afin || 'padrao'), o.notacao || {});
      s += `<rect class="gf-alvo" x="${x}" y="${cy(c) - esp / 2}" width="${larg}" height="${esp}" data-c="${c}" data-k="${k}" tabindex="0" role="button" aria-label="${n}, ${ORD[c]} corda, ${k === 0 ? 'solta' : 'casa ' + k}"/>`;
    }
    s += `<defs><marker id="gf-ponta" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1 9 5 1 9z" class="gf-ponta"/></marker></defs></svg>`;
    return s;
  }

  /* janela de casas que mostra todas as notas de um trecho (no mínimo 5 casas) */
  function janela(evs, minimo = 5) {
    const ks = evs.flatMap(e => (e.n || []).map(n => n[1]));
    if (!ks.length) return { de: 0, ate: minimo };
    let de = Math.min(...ks.filter(k => k > 0), 99), ate = Math.max(...ks);
    if (de === 99) de = 1;
    if (ks.includes(0)) de = 0; else de = Math.max(0, de - 1);
    if (ate - de < minimo) ate = de + minimo;
    return { de, ate };
  }

  /* desenho de uma parte: casas usadas, a nota de partida em vermelho, setas na ordem e o número do dedo */
  function parte(evs, o = {}) {
    const notas = [], vistos = new Map(), setas = [], cordas = [];
    let ant = null;
    evs.forEach(e => (e.n || []).forEach(([c, k, d]) => {
      const ch = c + ':' + k;
      if (!vistos.has(ch)) { vistos.set(ch, notas.length); notas.push({ c, k, dedo: d, tipo: notas.length ? 'nota' : 'partida', rot: d ?? '' }); }
      if ((e.n || []).length === 1) {
        // setas só entre notas seguidas na mesma corda; a troca de corda aparece na seta do lado
        if (ant && ant !== ch && +ant.split(':')[0] === c && !setas.some(s => s.k === ant + '>' + ch)) setas.push({ k: ant + '>' + ch, v: [ant.split(':').map(Number), [c, k]] });
        if (cordas[cordas.length - 1] !== c) cordas.push(c);
        ant = ch;
      }
    }));
    let lateral = null;
    if (new Set(cordas).size > 2) {
      const ini = cordas[0], longe = cordas.reduce((m, c) => Math.abs(c - ini) > Math.abs(m - ini) ? c : m, ini);
      lateral = { de: ini, ate: longe, volta: cordas[cordas.length - 1] === ini || Math.abs(cordas[cordas.length - 1] - ini) < Math.abs(longe - ini) / 2 };
    }
    const j = janela(evs, 4);
    return braco({ ...j, notas, setas: o.setas === false ? [] : setas.map(s => s.v), lateral, canhoto: o.canhoto, dedos: true, rotulo: o.rotulo, larg: 44, esp: 22 });
  }

  /* tablatura com ritmo. o = { compasso (tempos), largura (px disponíveis) }. Devolve HTML com uma linha por sistema;
     cada nota tem data-i (o índice do evento), para a tela acender a nota que está tocando. */
  function tablatura(evs, o = {}) {
    if (!evs.length) return '';
    const comp = o.compasso || 4, largura = Math.max(240, o.largura || 340);
    const menor = Math.min(...evs.map(e => e.d || 1));
    let bw = Math.max(30, 18 / menor);
    const margem = 22, util = largura - margem - 8;
    if (comp * bw > util) bw = util / comp;
    const porLinha = Math.max(1, Math.floor(util / (comp * bw)));
    const tempos = comp * porLinha, esp = 13, topo = 22, H = topo + esp * 5 + 40;
    // posições no tempo
    let pos = 0; const P = evs.map(e => { const p = pos; pos += e.d || 0; return p; });
    const total = Math.max(pos, comp), linhas = Math.ceil(total / tempos - 1e-9);
    const TEC = { h: 'h', p: 'p', s: '/', b: 'b', v: '~', pm: 'PM', x: '' };
    let html = '';
    for (let l = 0; l < linhas; l++) {
      const ini = l * tempos, fim = Math.min(total, ini + tempos), W = margem + (fim - ini) * bw + 8;
      const x = p => margem + (p - ini) * bw + Math.min(bw * menor, bw) / 2;
      let s = `<svg class="gf-tab" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Tablatura, linha ${l + 1} de ${linhas}">`;
      for (let c = 0; c < 6; c++) s += `<line class="gf-tab-l" x1="${margem - 6}" x2="${W - 2}" y1="${topo + c * esp}" y2="${topo + c * esp}"/>`;
      ['e', 'B', 'G', 'D', 'A', 'E'].forEach((n, c) => { s += `<text class="gf-tab-c" x="6" y="${topo + c * esp + 4}">${n}</text>`; });
      for (let b = ini; b <= fim + 1e-9; b += comp) { const bx = Math.min(W - 2, margem - 6 + (b - ini) * bw); s += `<line class="gf-tab-b" x1="${bx}" x2="${bx}" y1="${topo}" y2="${topo + esp * 5}"/>`; }
      evs.forEach((e, i) => {
        if (P[i] < ini - 1e-9 || P[i] >= fim - 1e-9) return;
        const xx = x(P[i]), cw = Math.max(14, Math.min(bw * (e.d || 1), 26));
        s += `<g class="gf-tab-ev" data-i="${i}"><rect class="gf-tab-col" x="${xx - cw / 2}" y="${topo - 9}" width="${cw}" height="${esp * 5 + 18}" rx="4"/>`;
        (e.n || []).forEach(([c, k]) => { const y = topo + (5 - c) * esp; s += `<rect class="gf-tab-fundo" x="${xx - 8}" y="${y - 6}" width="16" height="12"/><text class="gf-tab-n" x="${xx}" y="${y + 4}">${e.t === 'x' ? 'x' : k}</text>`; });
        if (e.t && TEC[e.t]) s += `<text class="gf-tab-t" x="${xx}" y="${topo - 11}">${TEC[e.t]}</text>`;
        // ritmo: haste e bandeirolas embaixo (pausa é um traço baixo)
        const ry = topo + esp * 5 + 10;
        if (!(e.n || []).length) s += `<rect class="gf-ritmo" x="${xx - 4}" y="${ry + 8}" width="8" height="3"/>`;
        else {
          s += `<line class="gf-ritmo-h" x1="${xx}" x2="${xx}" y1="${ry}" y2="${ry + 16}"/>`;
          const flags = e.d <= .25 ? 2 : e.d <= .5 ? 1 : 0;
          for (let f = 0; f < flags; f++) s += `<line class="gf-ritmo-h" x1="${xx}" x2="${xx + 7}" y1="${ry + 16 - f * 4}" y2="${ry + 12 - f * 4}"/>`;
          if (e.d >= 2) s += `<circle class="gf-ritmo-o" cx="${xx}" cy="${ry + 18}" r="3"/>`;
        }
        s += '</g>';
      });
      s += '</svg>';
      html += s;
    }
    return `<div class="gf-tab-pilha">${html}</div>`;
  }

  /* diagrama de acorde (vertical, como nos cadernos). f = { notas: [[c,k,dedo]], abafadas: [c], pestana: { k, de, ate } } */
  function diagrama(f, o = {}) {
    const p = o.pequeno, ew = p ? 11 : 22, eh = p ? 13 : 26, ml = p ? 8 : 20, mt = p ? 12 : 26, casas = 4;
    const ks = f.notas.map(n => n[1]).filter(k => k > 0);
    const ini = !ks.length || Math.max(...ks) <= 4 ? 1 : Math.min(...ks);
    const W = ml * 2 + ew * 5, H = mt + eh * casas + (p ? 4 : 10);
    const cxp = c => { const x = ml + c * ew; return o.canhoto ? W - x : x; };
    let s = `<svg class="gf-diag${p ? ' gf-diag-p' : ''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.rotulo || 'Diagrama do acorde')}">`;
    if (ini === 1) s += `<rect class="gf-diag-pest" x="${ml - 1}" y="${mt - (p ? 3 : 5)}" width="${ew * 5 + 2}" height="${p ? 3 : 5}"/>`;
    else if (!p) s += `<text class="gf-diag-ini" x="${o.canhoto ? W - 4 : 4}" y="${mt + eh / 2 + 4}" text-anchor="${o.canhoto ? 'end' : 'start'}">${ini}</text>`;
    for (let i = 0; i <= casas; i++) s += `<line class="gf-diag-l" x1="${ml}" x2="${ml + ew * 5}" y1="${mt + i * eh}" y2="${mt + i * eh}"/>`;
    for (let c = 0; c < 6; c++) s += `<line class="gf-diag-l" x1="${cxp(c)}" x2="${cxp(c)}" y1="${mt}" y2="${mt + eh * casas}"/>`;
    const r = p ? 4 : 8;
    if (f.pestana) {
      const y = mt + (f.pestana.k - ini + .5) * eh, a = cxp(f.pestana.de), b = cxp(f.pestana.ate);
      s += `<rect class="gf-diag-n" x="${Math.min(a, b) - r}" y="${y - r}" width="${Math.abs(b - a) + 2 * r}" height="${2 * r}" rx="${r}"/>`;
    }
    for (let c = 0; c < 6; c++) {
      const n = f.notas.find(x => x[0] === c);
      if (!n) { if (!p || true) s += `<text class="gf-diag-x" x="${cxp(c)}" y="${mt - (p ? 4 : 9)}">×</text>`; continue; }
      if (n[1] === 0) { s += `<circle class="gf-diag-o" cx="${cxp(c)}" cy="${mt - (p ? 6 : 12)}" r="${p ? 2.5 : 5}"/>`; continue; }
      const y = mt + (n[1] - ini + .5) * eh;
      s += `<circle class="gf-diag-n" cx="${cxp(c)}" cy="${y}" r="${r}"/>`;
      if (!p && n[2]) s += `<text class="gf-diag-d" x="${cxp(c)}" y="${y + 4}">${n[2]}</text>`;
    }
    return s + '</svg>';
  }

  return { braco, parte, janela, tablatura, diagrama, ORD };
})();

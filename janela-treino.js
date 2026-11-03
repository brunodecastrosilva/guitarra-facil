/* Guitarra Fácil · janela do treino: palco (braço, tablatura, andamento, tocar) e ajustes do treino */
'use strict';
/* ================= janela do treino =================
   Primeiro o preview (o roteiro do treino: cada parte desenhada no braço, com a ordem das notas e um botão para ouvir
   só aquela parte); depois o palco (braço, tablatura, andamento e o botão de tocar) e os ajustes.
   Na sessão e no treino do dia, os treinos vêm em fila: cada um por N voltas e, no fim de cada um, o som para. A pessoa
   diz se saiu limpo, vê o que vem e só segue quando tocar em "Ver o próximo", que abre o preview do próximo. */
const VOLUMES = [['guitarra', 'Exemplo (guitarra)'], ['segunda', 'Segunda guitarra'], ['baixo', 'Baixo'], ['fundo', 'Cordas de fundo'], ['bateria', 'Bateria e metrônomo']];
const SUBIDAS = [[0, 'Manter o andamento'], [1, '+1 bpm a cada volta'], [2, '+2 bpm a cada volta'], [5, '+5 bpm a cada volta']];
const BPM_MIN = 30, BPM_MAX = 260;
function abrirTreino(id, op = {}) {
  // fila: treino do dia ou sessão (op.rotulo dá o nome, op.voltas as voltas de cada treino, op.marca o registro)
  const fila = op.fila || null, rotuloFila = op.rotulo || 'Treino do dia', marca = op.marca || 'dia'; let filaI = 0, obsBraco = null, pararDemo = () => {};
  let m = modelo(fila ? fila[0] : id); if (!m) return;
  let pararParte = () => {};
  const cfgDe = (mm, extra) => ({ ...cfgPadrao(mm), ...((DB.cfg.trCfg || {})[mm.id] || {}), ...(extra || {}) });
  let cfg = cfgDe(m, op.cfg), inteiro = volta(m, cfg), trecho = null, ex = inteiro;
  const bpmDe = mm => Math.max(BPM_MIN, Math.min(BPM_MAX, melhorLimpo(mm.id) || mm.bpm));
  let bpm = op.bpm || bpmDe(m);
  const voltasEtapa = () => fila && op.voltas ? (op.voltas[filaI] || 4) : (DB.cfg.trVoltas || 4), percurso = () => fila ? 'fila' : (DB.cfg.trPercurso || 'repetir');
  const sel = (id, ops, v, rot) => `<div class="campo"><label class="kf-rotulo" for="${id}">${rot}</label><select id="${id}">${ops.map(([k, l]) => `<option value="${esc(String(k))}"${String(v) === String(k) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
  const seg = (attr, ops, v, rot) => `<div class="campo"><span class="kf-rotulo" id="tr-${attr}-l">${rot}</span><div class="kf-seg" role="group" aria-labelledby="tr-${attr}-l">${ops.map(([k, l]) => `<button type="button" data-${attr}="${k}" aria-pressed="${String(v) === String(k)}">${l}</button>`).join('')}</div></div>`;
  const ajustesHTML = () => { const R = m.regioes(cfg), base = ex.modelo.ehRiff ? m.afinPadrao : 'padrao'; return `
    ${sel('tr-afin', afinacoesPara(m.ehRiff ? m.afinPadrao : 'padrao').map(a => [a[0], a[1]]), ex.afinId, 'Afinação')}
    ${m.usaTom ? sel('tr-raiz', NOTAS.map((n, i) => [i, `${n} (${CIFRA[i]})`]), cfg.raiz, 'Tom') : ''}
    ${m.trocaEscala ? sel('tr-esc', ESCALAS_SEQ.map(e => [e, nomeEscala(e)]), cfg.escala, 'Escala') : ''}
    ${R.length > 1 ? sel('tr-pos', R.map((r, i) => [i, r]), cfg.pos, 'Posição no braço') : ''}
    ${m.cat === 'escalas' ? sel('tr-fig', FIGURAS_TREINO.map(([f, n, t]) => [f, `${n} · ${t}`]), cfg.fig, 'Figura') : ''}
    ${m.cat === 'escalas' ? seg('tam', TAMANHOS.map(([k, n]) => [k, n]), cfg.tam, 'Tamanho') : ''}
    ${fila ? '' : sel('tr-perc', [['repetir', 'Repetir o mesmo treino'], ...(m.usaTom ? [['tom', 'Ir para o próximo tom (ciclo das quartas)']] : []), ...(R.length > 1 ? [['posicao', 'Ir para a próxima posição']] : [])], percurso(), 'A cada etapa')}
    ${fila && op.voltas ? '' : seg('voltas', [[2, '2 voltas'], [4, '4 voltas'], [8, '8 voltas']], voltasEtapa(), fila ? 'Voltas de cada treino' : 'Tamanho da etapa')}
    ${sel('tr-sobe', SUBIDAS, DB.cfg.trSobe || 0, 'Subir o andamento')}
    ${seg('acomp', [['metronomo', 'Metrônomo'], ['bateria', 'Bateria'], ['nenhum', 'Nada']], acomp(), 'Acompanhamento')}
    <div id="tr-bat-campo"${acomp() === 'bateria' ? '' : ' hidden'}>${sel('tr-bat', ESTILOS_TREINO.map(k => [k, ESTILOS_BATERIA.find(e => e[0] === k)[1]]), DB.cfg.trBateria || 'metal', 'Batida da bateria')}</div>
    ${ex.evs.some(e => e.n.length === 1) ? seg('harm', [['', 'Nenhuma'], ['tercas', 'Terças'], ['quintas', 'Quintas'], ['oitava', 'Oitava']], DB.cfg.trHarmonia || '', 'Segunda guitarra (harmonia)') : ''}
    ${seg('pct', [[50, '50%'], [70, '70%'], [85, '85%'], [100, '100%']], '', 'Ir para uma parte da meta de andamento')}
    ${seg('rot', [['dedo', 'Dedos'], ['nota', 'Notas'], ...(ex.raiz != null ? [['grau', 'Graus']] : [])], cfg.rotulo || m.rotulo || 'nota', 'No braço, mostrar')}
    <details class="cartao tr-vol" data-kf-secao><summary>Volumes</summary>${VOLUMES.map(([k, n]) => { const v = { ...MIX_PADRAO, ...(DB.cfg.mix || {}) }[k]; return `<div class="campo"><label class="kf-rotulo" for="vol-${k}">${n}: <output id="vol-${k}-v">${v}%</output></label><input type="range" id="vol-${k}" data-vol="${k}" min="0" max="100" step="5" value="${v}"></div>`; }).join('')}<p class="apoio">O baixo dobra os riffs e marca a tônica das escalas e dos solos; as cordas de fundo seguram o acorde da tônica. Zero desliga.</p></details>
    <div class="tr-op"><label class="kf-check"><input type="checkbox" id="tr-verBraco" ${DB.cfg.trVerBraco !== false ? 'checked' : ''}><span>Mostrar o braço</span></label>
      <label class="kf-check"><input type="checkbox" id="tr-verTab" ${DB.cfg.trVerTab !== false ? 'checked' : ''}><span>Mostrar a tablatura</span></label>
      <label class="kf-check"><input type="checkbox" id="tr-guia" ${DB.cfg.trGuia !== false ? 'checked' : ''}><span>Tocar o exemplo junto comigo</span></label>
</div>
    <button type="button" class="kf-btn kf-pri" data-tr-pronto>${I.check}Pronto</button>`; };
  function acomp() { return DB.cfg.trAcomp || (DB.cfg.trMetro === false ? 'nenhum' : 'metronomo'); }
  const subDe = () => (fila ? `${rotuloFila} · ${filaI + 1} de ${fila.length} · ` : '') + ex.sub;
  const legenda = e => { const T2 = new Set(e.evs.flatMap(x => tecs(x))); const l = [...T2].filter(t => TEC_NOMES[t]).map(t => `<b>${t === 'pm' ? 'PM' : TEC_TAB[t] || (t === 'harm' ? '<12>' : t)}</b> ${TEC_NOMES[t]}`); return l.length ? l.join(' · ') : ''; };
  KitFacil.dialogo.abrir({ titulo: tituloDe(m), sub: subDe(), classe: 'kf-alto kf-largo gf-player', nome: 'treino',
    corpo: `<section class="tr-vista tr-prev" id="tr-v-prev" aria-labelledby="tr-prev-t"></section><div class="tr-vista" id="tr-v-palco" hidden>
        <div class="tr-palco"><div class="tr-topo"><button type="button" class="tr-fav" id="tr-fav" aria-pressed="${favorito(m.id)}" aria-label="Favorito">${favorito(m.id) ? '★' : '☆'}</button><span class="tr-chip" id="tr-parte">${esc(ex.partes ? ex.partes[0].nome : m.grupo || 'Treino')}</span><span class="tr-chip" id="tr-volta">${(ex.compasso || [4, 1])[0]}/${(ex.compasso || [4, 1])[1] === 1 ? 4 : 8}</span></div>
          <div class="tr-aviso" id="tr-aviso" hidden></div>
          <div class="tr-braco" id="tr-braco"${DB.cfg.trVerBraco === false ? ' hidden' : ''}><div class="tr-braco-vis"><div class="tr-braco-trilho" id="tr-trilho">${bracoTreino(ex)}</div></div><div class="tr-braco-cordas" id="tr-cordas">${cordasBraco(ex)}</div></div><div class="tab-wrap" id="tr-tab"${DB.cfg.trVerTab === false ? ' hidden' : ''}>${tabSVG(ex)}</div><div class="tr-conta" id="tr-conta" aria-live="assertive"></div></div>
        <div class="tr-estados" aria-label="Legenda do braço"><span><i class="atual"></i>Agora</span><span><i class="proxima"></i>A seguir</span><span><i class="tonica"></i>Tônica</span></div><p class="tr-dica" id="tr-dica"></p>
        <p class="tr-legenda" id="tr-legenda">${legenda(ex)}</p>
        <p class="tr-teoria" id="tr-teoria"></p><div class="tr-aprender"><button type="button" class="kf-btn kf-sec" id="tr-demonstrar">Entender a técnica</button><span>Observe o gesto, passo a passo.</span></div>

        <div class="tr-trecho" id="tr-trecho" role="group" aria-label="Repetir só alguns compassos"></div>
        <p class="tr-status" id="tr-status" aria-live="polite"></p>
        <div class="tr-res" id="tr-res" hidden></div></div>
      <div class="tr-vista pilha" id="tr-v-ajustes" hidden></div><section class="gesto-aula" id="tr-v-demo" hidden aria-label="Demonstração da técnica"></section>`,
    pe: `<div class="tr-pe-prev" id="tr-pe-prev"><button type="button" class="kf-btn kf-sec" id="tr-ver">Ver o braço e a tablatura</button><button type="button" class="kf-btn kf-pri tr-comecar" id="tr-comecar">${I.play}Começar</button></div><div id="tr-transporte" hidden><div class="tr-ctrl"><div class="tr-bpm" role="group" aria-label="Andamento"><button type="button" class="kf-btn kf-sec" data-tr-bpm="-5" aria-label="5 batidas a menos">−5</button><button type="button" class="kf-btn kf-sec" data-tr-bpm="-1" aria-label="1 batida a menos">−1</button><span class="tr-bpm-v"><output id="tr-bpm">${bpm}</output><small id="tr-pct">bpm · ${Math.round(bpm / m.alvo * 100)}% da meta</small></span><button type="button" class="kf-btn kf-sec" data-tr-bpm="1" aria-label="1 batida a mais">+1</button><button type="button" class="kf-btn kf-sec" data-tr-bpm="5" aria-label="5 batidas a mais">+5</button></div>
          <div class="tr-botoes"><button type="button" class="tr-rec" id="tr-rec" aria-pressed="false" aria-label="Gravar o treino">${I.mic}<span>Gravar</span></button><button type="button" class="play-grande" id="tr-ir" aria-label="Começar">${I.play}</button><span class="tr-rec-lado" aria-hidden="true"></span></div></div></div><div class="tr-acoes" hidden><button type="button" class="kf-btn kf-sec" id="tr-aj">${I.ajustes}Ajustes</button><button type="button" class="kf-btn kf-sec" id="tr-exemplo">${I.ouvir}Ouvir uma volta</button><button type="button" class="kf-btn kf-sec" id="tr-roteiro">Roteiro</button></div><button type="button" class="kf-btn kf-pri" id="tr-voltar-demo" hidden>Voltar ao treino</button>`,
    aoFechar: () => { pararDemo(); pararParte(); if (treino.tocando) treino.parar(); micDesligar().then(micApagarGravacao); if (obsBraco) obsBraco.disconnect(); if (['inicio', 'caminho'].includes(rota())) render(); },
    aoMontar: d => {
      // a teoria do exercício: a escala e o tom, com o atalho para o laboratório do braço
      const pintarTeoria = e => { const t = $('#tr-teoria', d); if (!t) return; if (e.escala && e.raiz != null && ESCALAS.some(x => x[0] === e.escala)) { t.innerHTML = `Escala: <b>${esc(NOTAS[e.raiz])} ${esc(nomeEscala(e.escala).toLowerCase())}</b> · <button type="button" class="kf-link" data-tr-braco>Ver no braço</button>`; $('[data-tr-braco]', t).onclick = () => { if (treino.tocando) treino.parar(); verNoBraco(e); }; } else t.innerHTML = ''; };
      const demo = $('#tr-v-demo', d), demoBt = $('#tr-demonstrar', d), transporte = $('#tr-transporte', d), acoes = $('.tr-acoes', d), voltaDemo = $('#tr-voltar-demo', d);
      const fecharDemo = () => { pararDemo(); demo.hidden = true; vP.hidden = false; transporte.hidden = false; acoes.hidden = false; voltaDemo.hidden = true; demoBt.focus(); };
      const vPrev = $('#tr-v-prev', d), pePrev = $('#tr-pe-prev', d);
      demoBt.onclick = () => {
        if (treino.tocando) return;
        pararDemo(); pararDemo = montarDemonstracao(demo, ex); vP.hidden = true; demo.hidden = false; transporte.hidden = true; acoes.hidden = true; voltaDemo.hidden = false;
        $('.kf-dlg-corpo', d).scrollTop = 0; $('h3', demo).focus();
      };
      voltaDemo.onclick = fecharDemo;
      const vP = $('#tr-v-palco', d), vA = $('#tr-v-ajustes', d), tabW = $('#tr-tab', d), brW = $('#tr-braco', d), conta = $('#tr-conta', d), res = $('#tr-res', d), status = $('#tr-status', d), parteC = $('#tr-parte', d), voltaC = $('#tr-volta', d), aviso = $('#tr-aviso', d);
      let desenhado = null, tabN = [], brN = [], cur = null, ultI = -2, px = pxDe(ex), voltasNa = 0;
      const meta = () => { status.textContent = `Meta: ${m.alvo} bpm${melhorLimpo(m.id) ? ` · seu melhor limpo: ${melhorLimpo(m.id)} bpm` : ''}`; };
      const titulo = e => { const h = $('.kf-dlg-cab h2', d), s = $('.kf-dlg-sub', d); if (h) h.textContent = tituloDe(e.modelo); if (s) s.textContent = subDe(); $('#tr-legenda', d).innerHTML = legenda(e); pintarTeoria(e); $('.tr-aprender', d).hidden = !demonstracoesDe(e).length; const f = $('#tr-fav', d); f.setAttribute('aria-pressed', favorito(e.modelo.id)); f.textContent = favorito(e.modelo.id) ? '★' : '☆'; };
      // o braço mostra um compasso de cada vez nas linhas longas (senão fica pequeno demais) e troca junto com a música
      let janelas = [[0, 0]], jan = -1, compTxt = '', desenhado0 = false;
      const calcJanelas = e => { const [cn, cp] = e.compasso || [4, 1], bl = cn * cp, tot = e.evs.reduce((s, x) => s + x.d, 0); if (tot <= 2 * bl + 1e-6) return [[0, e.evs.length]]; const r = []; let t = 0, ini = 0, b = 1; e.evs.forEach((x, i) => { if (t >= b * bl - 1e-6) { r.push([ini, i]); ini = i; b++; } t += x.d; }); r.push([ini, e.evs.length]); return r; };
      // o braço fica sempre no mesmo tamanho e desliza até as notas da vez; só as notas mudam de um compasso para o outro
      const trilho = $('#tr-trilho', d), vis = $('.tr-braco-vis', d); let chaveBr = null, desloc = null, ultMira = null;
      const escala = () => { const sv = $('.braco-tr', trilho); return sv ? sv.getBoundingClientRect().width / bracoLargura() || 1 : 1; };
      const mirar = (evs, mover = true) => {
        if (brW.hidden) return; const r = casasDe(evs.filter(x => x.n.length)); if (!r) return; ultMira = evs;
        const k = escala(), novo = deslocarPara(r, vis.clientWidth / k, desloc); if (novo === desloc) return; desloc = novo;
        if (!mover) { trilho.style.transition = 'none'; trilho.style.transform = `translateX(${-novo * k}px)`; void trilho.offsetWidth; trilho.style.transition = ''; }
        else trilho.style.transform = `translateX(${-novo * k}px)`;
      };
      if (window.ResizeObserver) { obsBraco = new ResizeObserver(() => { if (ultMira) { desloc = null; mirar(ultMira, false); } }); obsBraco.observe(vis); }
      const desenharBraco = (e, j, mover = true) => {
        jan = j; const ch = e.afin.join(',') + '|' + e.nome;
        if (chaveBr !== ch) { trilho.innerHTML = bracoTreino(e, ...janelas[j]); $('#tr-cordas', d).innerHTML = cordasBraco(e); chaveBr = ch; }
        else $('.bt-notas', trilho).innerHTML = notasBraco(e, ...janelas[j]);
        brN = []; $$('.nt', trilho).forEach(g => g.dataset.i.split(' ').forEach(i => (brN[+i] = brN[+i] || []).push(g)));
        voltaC.textContent = janelas.length > 1 ? `compasso ${j + 1} de ${janelas.length} · ${compTxt}` : compTxt;
        mirar(e.evs.slice(...janelas[j]), mover);
      };
      // bend, volta do bend, slide, ligados, tapping, vibrato e trinado se movem no braço junto com a nota
      const ANIMA = ['b', 'b2', 'r', 's', 'h', 'p', 't', 'v', 'tr'];
      const animar = (g, T, dur, e, i) => { ANIMA.forEach(t => g.classList.remove('an-' + t)); const t = T.filter(x => ANIMA.includes(x)); if (!t.length) return; const c = +g.dataset.nota.split(',')[0], par = ligacaoTecnica(e, i, c); g.style.setProperty('--slide-de', `${par ? (par.de - par.ate) * BR_L : 0}px`); g.style.setProperty('--retorno', tecs(e.evs[i-1] || {}).includes('b2') ? '9px' : '18px'); g.classList.toggle('tem-ligacao', !!par); g.style.setProperty('--d', Math.max(.12, dur).toFixed(3) + 's'); void g.getBoundingClientRect(); t.forEach(x => g.classList.add('an-' + x)); };
      const apagarNotas = () => brN.forEach(gs => gs && gs.forEach(g => { g.classList.remove('agora', 'prox'); ANIMA.forEach(t => g.classList.remove('an-' + t)); }));
      const dica = $('#tr-dica', d);
      const pintarDica = tocando => { dica.hidden = tocando; dica.textContent = m.dica ? m.dica : brW.hidden ? 'Aperte ▶ e toque junto, seguindo a tablatura.' : 'Aperte ▶ e toque a nota acesa no braço. A próxima fica tracejada.'; };
      pintarDica(false);
      const desenhar = e => {
        const ch = JSON.stringify([e.id, e.cfg, e.rotulo, e.afinId]); if (desenhado === ch) return; desenhado = ch;
        const [cn, cp] = e.compasso || [4, 1]; compTxt = `${cn}/${cp === 1 ? 4 : cp === .5 ? 8 : 16}`;
        janelas = calcJanelas(e); desenharBraco(e, 0, desenhado0); desenhado0 = true;
        tabW.innerHTML = tabSVG(e); tabW.scrollLeft = 0; px = pxDe(e);
        cur = $('.tab-cursor', tabW); tabN = []; $$('.tab-n', tabW).forEach(g => tabN[+g.dataset.i] = g); ultI = -2; titulo(e);
        parteC.textContent = e.partes ? e.partes[0].nome : e.modelo.grupo || 'Treino'; pintarDica(treino.tocando);
      };
      const aplicarVista = () => { brW.hidden = DB.cfg.trVerBraco === false; tabW.hidden = DB.cfg.trVerTab === false; pintarDica(false); if (!brW.hidden) { desloc = null; mirar(ex.evs.slice(...(janelas[jan] || [0, ex.evs.length])), false); } };
      desenhar(ex); meta();
      /* ---------- preview: o roteiro do treino ---------- */
      const partesDe = e => {
        const P = e.partes && e.partes.length ? e.partes : null, L = [];
        if (P) P.forEach((q, j) => L.push({ ...q, a: q.i, b: j + 1 < P.length ? P[j + 1].i : e.evs.length }));
        else { const J = calcJanelas(e), passo = Math.max(1, Math.ceil(J.length / 8)); for (let j = 0; j < J.length; j += passo) { const a = J[j][0], b = J[Math.min(J.length, j + passo) - 1][1]; L.push({ a, b, nome: J.length === 1 ? 'O treino inteiro' : passo === 1 ? `Compasso ${j + 1}` : `Compassos ${j + 1} a ${Math.min(J.length, j + passo)}` }); } }
        return L;
      };
      const textoParte = (e, q) => { if (q.desc) return q.desc; const ns = e.evs.slice(q.a, q.b).flatMap(x => x.n), ks = ns.map(n => n[1]).filter(k => k > 0), cs = new Set(ns.map(n => n[0])); if (!ns.length) return 'Pausa.'; const N = e.afin.length; return `${cs.size === 1 ? `Só na ${N - [...cs][0]}ª corda` : `${cs.size} cordas`}${ks.length ? `, casas ${Math.min(...ks)} a ${Math.max(...ks)}` : ', cordas soltas'}.`; };
      const tempoDe = e => { const bt = e.evs.reduce((s, x) => s + x.d, 0); return bt * 60 / bpm; };
      // o desenho da parte: as casas dela no braço, a nota de partida em vermelho e a ordem como um caminho com seta
      const miniParte = (e, q) => {
        const evs = e.evs.slice(q.a, q.b).filter(x => x.n.length), N = e.afin.length; if (!evs.length) return '';
        const ks = evs.flatMap(x => x.n.map(n => n[1])), a = Math.max(0, Math.min(...ks) - (Math.min(...ks) > 0 ? 1 : 0)), bk = Math.max(a + 4, Math.max(...ks));
        const W = 300, H = 116, L = (W - 30) / (bk - a + 1), x = k => k === 0 ? 14 : 22 + (k - a + .5) * L - (a === 0 ? L : 0), y = c => 34 + (N - 1 - c) * ((H - 44) / (N - 1)); // espaço em cima para os arcos
        let s = `<svg class="mini-parte" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(q.nome)}: ${esc(textoParte(e, q))}"><defs><marker id="seta-${q.a}" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" class="mp-seta"/></marker></defs>`;
        for (let c = 0; c < N; c++) s += `<line x1="8" y1="${y(c)}" x2="${W - 4}" y2="${y(c)}" class="mp-corda"/>`;
        for (let k = a; k <= bk + 1; k++) if (k > 0) { const xx = 22 + (k - a) * L - (a === 0 ? L : 0); if (xx > 10 && xx < W) s += `<line x1="${xx}" y1="4" x2="${xx}" y2="${H - 4}" class="mp-traste"/>`; }
        // a ordem: nas partes de dedos, as quatro notas do primeiro passo e uma seta lateral (sobe as cordas e volta);
        // nas outras, o caminho das primeiras oito notas
        const seq = evs.map(x => x.n[0]).slice(0, q.ordem ? 4 : 8), pts = seq.map(([c, k]) => `${x(k).toFixed(1)},${y(c).toFixed(1)}`);
        // cada passo é um arco por cima das notas, com seta: dá para ver quando a mão volta (4 → 3)
        for (let j = 1; j < seq.length; j++) { const [c0, k0] = seq[j - 1], [c1, k1] = seq[j], x0 = x(k0), x1 = x(k1), y0 = y(c0) - 9, y1 = y(c1) - 9, alt = 10 + Math.min(18, Math.abs(x1 - x0) / 6) + (c0 === c1 ? 0 : 4); if (x0 === x1 && y0 === y1) continue; s += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}Q${((x0 + x1) / 2).toFixed(1)} ${(Math.min(y0, y1) - alt).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}" class="mp-caminho" marker-end="url(#seta-${q.a})"/>`; }
        if (q.ordem && q.cordas > 1) { const xa = W - 10, y0 = y(0), y1 = y(Math.min(N - 1, q.cordas - 1)); s += `<path d="M${xa} ${y0 - 4}V${y1 + 6}" class="mp-caminho mp-lado" marker-end="url(#seta-${q.a})"/><path d="M${xa - 7} ${y1 + 2}V${y0 - 8}" class="mp-caminho mp-lado mp-volta" marker-end="url(#seta-${q.a})"/>`; }
        const vistos = new Set(), porDedo = (e.rotulo || m.rotulo) === 'dedo';
        evs.forEach(x0 => x0.n.forEach(([c, k, dd]) => { const ch = c + ',' + k; if (vistos.has(ch)) return; vistos.add(ch); s += `<g class="mp-nota${ch === seq[0][0] + ',' + seq[0][1] ? ' ini' : ''}"><circle cx="${x(k)}" cy="${y(c)}" r="9"/><text x="${x(k)}" y="${y(c) + 4}" text-anchor="middle">${porDedo && dd != null && dd > 0 ? dd : k}</text></g>`; }));
        return s + '</svg>';
      };
      const ouvirParte = (e, q, bt) => {
        pararParte(); const a = audio(); if (!a) return; const g = a.createGain(); g.connect(somMestre(a));
        const seg = 60 / bpm; let t = a.currentTime + .1; e.evs.slice(q.a, q.b).forEach(x => { if (x.n.length) tocarEvento(x, e.afin, t, seg, 1, g); t += x.d * seg; });
        const fim = setTimeout(() => pararParte(), (t - a.currentTime) * 1000 + 300);
        bt.classList.add('on'); bt.innerHTML = `${I.stop}Parar`;
        pararParte = () => { clearTimeout(fim); try { g.disconnect(); } catch {} bt.classList.remove('on'); bt.innerHTML = `${I.ouvir}Ouvir esta parte`; pararParte = () => {}; };
      };
      const mostrarPreview = () => {
        pararParte(); const P = partesDe(ex), seg = Math.round(tempoDe(ex)), v = voltasEtapa(), total = Math.round(seg * v / 60 * 10) / 10;
        vPrev.innerHTML = `<p class="tr-prev-sup">${fila ? `${esc(rotuloFila)} · ${filaI + 1} de ${fila.length}` : 'Antes de começar'}</p>
          <h3 id="tr-prev-t" class="tr-prev-t">O que você vai tocar</h3>
          <p class="tr-prev-res">${P.length} ${P.length === 1 ? 'parte' : 'partes'} · ${fila || percurso() !== 'repetir' ? `${v} voltas` : 'repete até você parar'} · ${bpm} bpm${fila ? ` · cerca de ${total.toLocaleString('pt-BR')} min` : ` · uma volta dura ${seg} s`}</p>
          ${m.dica ? `<p class="tr-prev-dica">${esc(m.dica)}</p>` : ''}
          <ol class="tr-prev-partes">${P.map((q, j) => `<li class="tr-prev-parte"><div class="tr-prev-cab"><span class="cam-n" aria-hidden="true">${j + 1}</span><span class="ld-tx"><b>${esc(q.nome)}</b><small>${esc(textoParte(ex, q))}</small></span><button type="button" class="kf-btn kf-sec tr-prev-ouvir" data-prev-ouvir="${j}">${I.ouvir}Ouvir esta parte</button></div>${miniParte(ex, q)}</li>`).join('')}</ol>
          <p class="apoio tr-prev-leg"><span class="mp-ini-leg" aria-hidden="true"></span> onde começa · a seta mostra a ordem${P.some(q => q.ordem) ? ' (a seta do lado: sobe as cordas e volta)' : ''} · o número é ${(ex.rotulo || m.rotulo) === 'dedo' ? 'o dedo' : 'a casa'}${P.length > 1 ? '. As partes tocam nesta ordem, uma depois da outra.' : '.'}</p>`;
        $$('[data-prev-ouvir]', vPrev).forEach(b => b.onclick = () => { if (b.classList.contains('on')) pararParte(); else ouvirParte(ex, P[+b.dataset.prevOuvir], b); });
        vPrev.hidden = false; pePrev.hidden = false; vP.hidden = true; vA.hidden = true; demo.hidden = true; transporte.hidden = true; acoes.hidden = true; voltaDemo.hidden = true; res.hidden = true;
        $('.kf-dlg-corpo', d).scrollTop = 0; KitFacil.movimento.entrar(vPrev, { de: 'tela' });
      };
      const sairPreview = () => { pararParte(); vPrev.hidden = true; pePrev.hidden = true; vP.hidden = false; transporte.hidden = false; acoes.hidden = false; desloc = null; mirar(ex.evs.slice(...(janelas[jan] || [0, ex.evs.length])), false); };
      $('#tr-ver', d).onclick = () => { sairPreview(); $('#tr-ir', d).focus(); };
      $('#tr-comecar', d).onclick = () => { sairPreview(); rodar(false); };
      // tablatura e braço ligados (Documento Mestre, seção 9): tocar numa nota de um marca a mesma nota no outro e faz
      // soar; durante a reprodução, só a nota da vez acende
      const marcar = idx => { $$('.sel', d).forEach(g => g.classList.remove('sel')); idx.forEach(i => { if (tabN[i]) tabN[i].classList.add('sel'); (brN[i] || []).forEach(g => g.classList.add('sel')); }); };
      tabW.addEventListener('click', e => {
        const g = e.target.closest('.tab-n'); if (!g || treino.tocando) return;
        const i = +g.dataset.i, j = janelas.findIndex(([a, b]) => i >= a && i < b); if (j >= 0 && j !== jan) desenharBraco(ex, j);
        marcar([i]); mirar([ex.evs[i]]); const a = audio(); if (a) tocarEvento(ex.evs[i], ex.afin, a.currentTime + .02, .6, 1);
      });
      trilho.addEventListener('click', e => {
        const g = e.target.closest('.nt'); if (!g || treino.tocando) return;
        const idx = g.dataset.i.split(' ').map(Number), [c, k] = g.dataset.nota.split(',').map(Number); marcar(idx);
        const a = audio(); if (a) tocarCorda(ex.afin[c] + k, a.currentTime + .02, 1.2, .45);
        const t0 = tabN[idx[0]]; if (t0 && !tabW.hidden) { const r = t0.getBBox(); tabW.scrollLeft = Math.max(0, r.x - tabW.clientWidth * .35); }
      });
      const setBpm = v => { bpm = Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(v))); $('#tr-bpm', d).textContent = bpm; $('#tr-pct', d).textContent = `bpm · ${Math.round(bpm / m.alvo * 100)}% da meta`; };
      $$('[data-tr-bpm]', d).forEach(b => b.onclick = () => setBpm(bpm + +b.dataset.trBpm));
      $('#tr-fav', d).onclick = () => { const on = alternarFavorito(m.id); titulo(ex); KitFacil.avisar(on ? 'Treino nos favoritos.' : 'Treino fora dos favoritos.'); };
      const guardar = () => { DB.cfg.trCfg = { ...(DB.cfg.trCfg || {}), [m.id]: { raiz: cfg.raiz, pos: cfg.pos, fig: cfg.fig, escala: cfg.escala, rotulo: cfg.rotulo, afin: cfg.afin, tam: cfg.tam } }; commit(); };
      const aplicarTrecho = () => { const n = compassosDe(inteiro); if (trecho && trecho[1] > n) trecho = null; ex = trecho ? recortarCompassos(inteiro, ...trecho) : inteiro; };
      const refazer = () => { inteiro = volta(m, cfg); aplicarTrecho(); desenhar(ex); pintarTrecho(); };
      // faixa de compassos: um toque escolhe um compasso; outro toque, o fim do trecho; tocar no único escolhido limpa
      const faixa = $('#tr-trecho', d);
      const pintarTrecho = () => {
        const n = compassosDe(inteiro); faixa.hidden = n < 2; if (n < 2) { faixa.innerHTML = ''; return; }
        faixa.innerHTML = `<span class="kf-rotulo">${trecho ? `Repetindo os compassos ${trecho[0]} a ${trecho[1]}` : 'Repetir só um trecho: toque nos compassos'}</span><div class="tr-comps">${Array.from({ length: n }, (_, i) => { const k = i + 1, on = trecho && k >= trecho[0] && k <= trecho[1]; return `<button type="button" data-comp="${k}" aria-pressed="${!!on}" aria-label="Compasso ${k}">${k}</button>`; }).join('')}</div>`;
        $$('[data-comp]', faixa).forEach(b => b.onclick = () => {
          if (treino.tocando) return; const k = +b.dataset.comp;
          if (!trecho) trecho = [k, k]; else if (trecho[0] === trecho[1] && k === trecho[0]) trecho = null; else if (trecho[0] === trecho[1]) trecho = [Math.min(k, trecho[0]), Math.max(k, trecho[0])]; else trecho = [k, k];
          aplicarTrecho(); desenhado = null; desenhar(ex); pintarTrecho();
        });
      };
      pintarTrecho();
      // ajustes: uma vista no lugar do palco; os campos mudam o treino na hora
      const abrirAjustes = () => {
        if (treino.tocando) return;
        transporte.hidden = true; vA.innerHTML = ajustesHTML(); vP.hidden = true; vA.hidden = false; $('#tr-aj', d).setAttribute('aria-pressed', 'true'); KitFacil.movimento.entrar(vA, { de: 'tela' });
        const muda = () => { guardar(); refazer(); };
        $('#tr-afin', vA).addEventListener('change', e => { cfg.afin = e.target.value; muda(); });
        $('#tr-raiz', vA)?.addEventListener('change', e => { cfg.raiz = +e.target.value; muda(); });
        $('#tr-esc', vA)?.addEventListener('change', e => { cfg.escala = e.target.value; cfg.pos = 0; muda(); const p = $('#tr-pos', vA); if (p) { p.innerHTML = m.regioes(cfg).map((r, i) => `<option value="${i}">${esc(r)}</option>`).join(''); p.value = '0'; } });
        $('#tr-pos', vA)?.addEventListener('change', e => { cfg.pos = +e.target.value; muda(); });
        $('#tr-fig', vA)?.addEventListener('change', e => { cfg.fig = +e.target.value; muda(); });
        $('#tr-perc', vA)?.addEventListener('change', e => { DB.cfg.trPercurso = e.target.value; commit(); });
        $('#tr-sobe', vA).addEventListener('change', e => { DB.cfg.trSobe = +e.target.value; commit(); });
        const segL = (attr, f) => $$(`[data-${attr}]`, vA).forEach(b => b.onclick = () => { $$(`[data-${attr}]`, vA).forEach(x => x.setAttribute('aria-pressed', x === b)); f(b.dataset[attr]); });
        segL('tam', v => { cfg.tam = v; muda(); });
        segL('voltas', v => { DB.cfg.trVoltas = +v; commit(); });
        segL('acomp', v => { DB.cfg.trAcomp = v; commit(); $('#tr-bat-campo', vA).hidden = v !== 'bateria'; });
        $('#tr-bat', vA).addEventListener('change', e => { DB.cfg.trBateria = e.target.value; commit(); });
        segL('harm', v => { DB.cfg.trHarmonia = v; commit(); });
        segL('pct', v => { setBpm(m.alvo * +v / 100); KitFacil.avisar(`Andamento: ${bpm} bpm, ${v}% da meta.`); });
        segL('rot', v => { cfg.rotulo = v; muda(); });
        ['guia'].forEach(k => $('#tr-' + k, vA).addEventListener('change', e => { DB.cfg['tr' + k[0].toUpperCase() + k.slice(1)] = e.target.checked; commit(); }));
        const vista = (k, outro, nome) => $('#tr-' + k, vA).addEventListener('change', e => {
          DB.cfg['tr' + k[0].toUpperCase() + k.slice(1)] = e.target.checked;
          if (!e.target.checked && DB.cfg['tr' + outro[0].toUpperCase() + outro.slice(1)] === false) { DB.cfg['tr' + outro[0].toUpperCase() + outro.slice(1)] = true; $('#tr-' + outro, vA).checked = true; KitFacil.avisar(`O treino precisa de um dos dois: ${nome} voltou.`); }
          commit(); aplicarVista();
        });
        vista('verBraco', 'verTab', 'a tablatura'); vista('verTab', 'verBraco', 'o braço');
        $$('[data-vol]', vA).forEach(r => r.addEventListener('input', () => { DB.cfg.mix = { ...MIX_PADRAO, ...(DB.cfg.mix || {}), [r.dataset.vol]: +r.value }; $(`#vol-${r.dataset.vol}-v`, vA).textContent = r.value + '%'; clearTimeout(r.t); r.t = setTimeout(commit, 400); }));
        $('[data-tr-pronto]', vA).onclick = fecharAjustes;
      };
      const fecharAjustes = () => { transporte.hidden = false; vA.hidden = true; vP.hidden = false; $('#tr-aj', d).setAttribute('aria-pressed', 'false'); KitFacil.movimento.entrar(vP, { de: 'tela' }); $('#tr-ir', d).focus(); };
      $('#tr-aj', d).onclick = () => vA.hidden ? abrirAjustes() : fecharAjustes();
      // a próxima etapa: na fila do treino do dia, o próximo treino; senão, o próximo tom ou a próxima posição
      const proximaEtapa = () => {
        if (fila) { if (filaI + 1 >= fila.length) return null; const mm = modelo(fila[filaI + 1]); const cc = cfgDe(mm); return { m: mm, cfg: cc, ex: volta(mm, cc) }; }
        const p = percurso(); if (p === 'repetir') return null;
        const cc = { ...cfg, ...(p === 'tom' ? { raiz: pc((cfg.raiz || 0) + 5) } : { pos: ((cfg.pos || 0) + 1) % m.regioes(cfg).length }) };
        return { m, cfg: cc, ex: volta(m, cc) };
      };
      let soUma = false, acabou = false, fimItem = false;
      const proxima = prev => {
        if (!prev) return { ex, bpm };
        if (soUma) return null;
        voltasNa++;
        if (voltasNa >= voltasEtapa()) {
          if (fila) { fimItem = true; acabou = filaI + 1 >= fila.length; return null; } // na fila, o som para no fim de cada treino
          const pe = proximaEtapa();
          if (pe) { m = pe.m; cfg = pe.cfg; inteiro = pe.ex; aplicarTrecho(); voltasNa = 0; }
        }
        const sobe = DB.cfg.trSobe || 0; if (sobe) setBpm(Math.min(m.alvo + 40, bpm + sobe));
        return { ex, bpm };
      };
      const aoRodada = r => {
        desenhar(r.ex); status.textContent = `Volta ${voltasNa + 1}${percurso() !== 'repetir' ? ` de ${voltasEtapa()}` : ''} · ${r.bpm} bpm`;
        const ultima = voltasNa === voltasEtapa() - 1, pe = ultima && !fila ? proximaEtapa() : null;
        aviso.hidden = !(pe || (fila && ultima)); if (pe) aviso.innerHTML = `<b>A seguir:</b> ${esc(pe.ex.sub)}`; else if (fila && ultima) aviso.innerHTML = '<b>Última volta.</b> Depois, uma pausa.';
      };
      const aoQuadro = (r, beat, falta, i) => {
        conta.textContent = falta ? String(falta) : ''; conta.classList.toggle('on', !!falta);
        const x = 40 + Math.max(0, beat) * px; cur.setAttribute('x1', x); cur.setAttribute('x2', x);
        tabW.scrollLeft = Math.max(0, x - tabW.clientWidth * .35);
        if (i === ultI) return; ultI = i;
        const evs = r.ex.evs, k = i < -1 ? -1 - i : i;
        if (k >= 0) { const j = janelas.findIndex(([a, b]) => k >= a && k < b); if (j >= 0 && j !== jan) desenharBraco(r.ex, j); }
        tabN.forEach((g, j) => g && g.classList.toggle('agora', j === i));
        apagarNotas();
        let prox = k < 0 ? 0 : k + 1; while (prox < evs.length && !evs[prox].n.length) prox++;
        if (brN[prox]) brN[prox].forEach(g => g.classList.add('prox'));
        if (i >= 0 && brN[i]) { const T = tecs(evs[i]); brN[i].forEach(g => { g.classList.remove('prox'); animar(g, T, evs[i].d * r.seg, r.ex, i); g.classList.add('agora'); }); }
        if (k >= 0 && janelas[jan]) mirar(evs.slice(Math.max(k, janelas[jan][0]), Math.min(janelas[jan][1], k + 4)));
        if (r.ex.partes && k >= 0) { const p = r.ex.partes.filter(q => q.i <= k).pop(); if (p && parteC.textContent !== p.nome) parteC.textContent = p.nome; }
      };
      const botoes = tocando => { const b = $('#tr-ir', d); b.innerHTML = tocando ? I.stop : I.play; b.setAttribute('aria-label', tocando ? 'Parar' : 'Começar'); b.classList.toggle('on', tocando); $('#tr-exemplo', d).disabled = tocando; $('#tr-aj', d).disabled = tocando; $('#tr-roteiro', d).disabled = tocando; recBt.disabled = tocando; recBt.classList.toggle('gravando', tocando && !!mic.gravador); recTexto(); pintarDica(tocando); demoBt.disabled = tocando; };
      const limpar = () => { if (jan > 0) desenharBraco(ex, 0); else mirar(ex.evs.slice(...janelas[0])); conta.textContent = ''; conta.classList.remove('on'); tabN.forEach(g => g && g.classList.remove('agora')); apagarNotas(); ultI = -2; aviso.hidden = true; };
      const registrar = (mm, cc, voltas, bpmR, min, extra = {}) => { const rec = { id: uid(), ex: mm.id, cfg: { ...cc }, voltas, bpm: bpmR, min, limpo: null, em: Date.now(), ...extra }; DB.treinos.push(rec); return rec; };
      // a gravação (que fica só neste aparelho): ouvir e comparar com o exemplo; o app não dá nota
      const extrasMic = () => `${mic.url ? `<div class="tr-grav"><div class="tr-grav-bts"><button type="button" class="kf-btn kf-sec" data-grav="ouvir">${I.play}Ouvir a gravação</button><button type="button" class="kf-btn kf-sec" data-grav="exemplo">${I.ouvir}Ouvir o exemplo</button><button type="button" class="kf-btn kf-sec" data-grav="apagar">Apagar</button></div><p class="apoio">A gravação fica só neste aparelho e some ao fechar a janela.</p></div>` : ''}`;
      let tocador = null;
      const ligarMic = () => $$('[data-grav]', res).forEach(b => b.onclick = () => {
        const q = b.dataset.grav;
        if (q === 'ouvir' && mic.url) { if (tocador) tocador.pause(); tocador = new Audio(mic.url); tocador.play().catch(() => KitFacil.avisar('Não deu para tocar a gravação neste navegador.')); }
        if (q === 'exemplo') { if (tocador) tocador.pause(); rodar(true); }
        if (q === 'apagar') { if (tocador) tocador.pause(); micApagarGravacao(); $('#tr-ir', d).focus(); $('.tr-grav', res)?.remove(); KitFacil.avisar('Gravação apagada.'); }
      });
      const soMic = () => { res.innerHTML = `<p class="tr-fim"><b>Treino curto:</b> não entra no histórico.</p>${extrasMic()}${proximoHTML()}`; res.hidden = false; ligarMic(); ligarProximo(); };
      // na fila: o que vem depois, com o desenho, e o botão que leva ao preview dele (nada começa sozinho)
      const proximoHTML = () => {
        if (!fila || filaI + 1 >= fila.length) return '';
        const mm = modelo(fila[filaI + 1]), vv = volta(mm, cfgDe(mm)), nv = op.voltas ? (op.voltas[filaI + 1] || 4) : (DB.cfg.trVoltas || 4);
        return `<div class="tr-seguir"><span class="kf-rotulo">A seguir · ${filaI + 2} de ${fila.length}</span><div class="tr-seguir-it">${miniDesenho(vv)}<span class="ld-tx"><b>${esc(tituloDe(mm))}</b><small>${nv} ${nv === 1 ? 'volta' : 'voltas'} · ${bpmDe(mm)} bpm</small></span></div>
          <button type="button" class="kf-btn kf-pri" data-fila-prox>${I.seta}Ver o próximo</button></div>`;
      };
      const ligarProximo = () => { const b = $('[data-fila-prox]', res); if (b) b.onclick = () => irParaItem(filaI + 1); };
      const irParaItem = i => { filaI = i; m = modelo(fila[i]); cfg = cfgDe(m); inteiro = volta(m, cfg); trecho = null; aplicarTrecho(); voltasNa = 0; fimItem = false; acabou = false; desenhado = null; desenhar(ex); pintarTrecho(); setBpm(bpmDe(m)); meta(); res.hidden = true; mostrarPreview(); };
      const resultado = info => {
        const min = Math.round(info.segs / 6) / 10; registrarPratica(min);
        const rec = registrar(m, { ...cfg, ...(trecho ? { trecho } : {}) }, info.voltas, info.bpm, min, fila ? { [marca]: true, [marca + 'Fim']: acabou } : {});
        commit(); conferirConquistas(); verPlano();
        res.innerHTML = `<p class="tr-fim"><b>${acabou ? `${rotuloFila} concluído.` : fimItem ? 'Treino terminado.' : 'Treino parado.'}</b> ${info.voltas} ${info.voltas === 1 ? 'volta' : 'voltas'} · até ${info.bpm} bpm · ${fmtTempo(info.tocado)}</p>
          ${extrasMic()}
          <div class="tr-limpo-bloco">${demonstracoesDe(ex).length ? `<ul class="tr-criterios">${demonstracoesDe(ex).map(q => `<li>${esc(GESTOS[q.k].criterio)}</li>`).join('')}</ul>` : ''}<p class="apoio">Saiu limpo, sem errar nem atrasar? Quem decide é você: o app não mede a execução.</p>
          <div class="tr-limpo"><button type="button" class="kf-btn kf-pri" data-limpo="1">${I.check}Saiu limpo</button><button type="button" class="kf-btn kf-sec" data-limpo="0">Ainda não</button></div></div>
          ${proximoHTML()}`;
        res.hidden = false; ligarMic(); ligarProximo();
        if (fila) setTimeout(() => res.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }), 60); // a pausa fica à vista
        $$('[data-limpo]', res).forEach(b => b.onclick = () => {
          const ok = b.dataset.limpo === '1'; rec.limpo = ok; commit(); conferirConquistas(); verPlano();
          const novo = ok ? Math.min(BPM_MAX, info.bpm + 5) : Math.max(BPM_MIN, info.bpm - 5); setBpm(novo);
          $('#tr-ir', d).focus(); // o foco não se perde quando os botões saem
          $('.tr-limpo-bloco', res).outerHTML = `<p class="tr-fim">${ok ? `Marcado por você: ${info.bpm} bpm limpo. Na próxima, ${novo} bpm.` : `Sem problema: repita a ${novo} bpm até sair limpo.`}</p>`;
          meta();
        });
      };
      const recBt = $('#tr-rec', d);
      const recTexto = () => { const on = recBt.getAttribute('aria-pressed') === 'true'; $('span', recBt).textContent = recBt.classList.contains('gravando') ? 'Gravando' : on ? 'Vai gravar' : 'Gravar'; };
      recBt.onclick = () => { if (treino.tocando) return; if (!window.MediaRecorder) { KitFacil.avisar('Este navegador não grava áudio. O treino segue sem gravar.'); return; } const on = recBt.getAttribute('aria-pressed') !== 'true'; recBt.setAttribute('aria-pressed', on); recTexto(); KitFacil.avisar(on ? 'O próximo treino será gravado. A gravação fica só neste aparelho.' : 'Gravação desligada.'); };
      const rodar = async exemplo => {
        if (treino.tocando) { treino.parar(); return; }
        if (rodar.ocupado) return; rodar.ocupado = true;
        $$('.sel', d).forEach(g => g.classList.remove('sel'));
        if (!exemplo) res.hidden = true; soUma = exemplo; acabou = false; fimItem = false; voltasNa = 0; limpar(); botoes(true);
        const gravar = !exemplo && recBt.getAttribute('aria-pressed') === 'true';
        if (gravar) { micApagarGravacao(); const r = await micLigar(true); if (r !== 'ok') KitFacil.avisar(r === 'negado' ? 'Sem permissão para o microfone: o treino segue sem gravar.' : 'Este navegador não usa o microfone: o treino segue sem gravar.'); }
        botoes(true); // agora o botão de gravar mostra se está gravando
        { let el = vP.parentElement; while (el && el.scrollHeight <= el.clientHeight + 1) el = el.parentElement; if (el && el.scrollTop > 0) el.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } // o braço volta para a vista
        const ac = acomp();
        const ok = treinoTocar({ guia: exemplo || DB.cfg.trGuia !== false, metronomo: ac === 'metronomo', bateria: ac === 'bateria' ? (DB.cfg.trBateria || 'metal') : null, harmonia: DB.cfg.trHarmonia || null,
          mix: DB.cfg.mix, proxima, aoRodada, aoQuadro,
          aoFim: async info => {
            botoes(false); limpar(); meta();
            await micDesligar();
            if (exemplo) return;
            if (info.segs < 15 && !fimItem) { if (mic.url || fila) soMic(); return; } // menos de 15 s não conta
            if (info.voltas) resultado(info); else { registrarPratica(Math.round(info.segs / 6) / 10); conferirConquistas(); if (mic.url || fila) soMic(); }
          } });
        rodar.ocupado = false;
        if (!ok) { botoes(false); micDesligar(); KitFacil.avisar('Este navegador não consegue tocar som. Tente outro navegador.'); }
      };
      $('#tr-ir', d).onclick = () => rodar(false);
      $('#tr-roteiro', d).onclick = () => { if (!treino.tocando) mostrarPreview(); };
      mostrarPreview();
      $('#tr-exemplo', d).onclick = () => rodar(true);
    } });
}


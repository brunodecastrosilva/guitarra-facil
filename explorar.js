/* Guitarra Fácil · Explorar: o braço como laboratório. Notas, escalas (com o campo harmônico), acordes, intervalos e
   modo livre, em qualquer afinação, sempre com som. Tocar numa casa toca a nota. */
'use strict';

const EXPLORAR = (() => {
  const E = { aba: 'escalas', raiz: 9, escala: 'penta-menor', tipo: 'menor', nota: '', regiao: 0, rotulo: 'nomes', livre: {}, tonica: null };
  const REGIOES = [[0, 12, 'Casas 0 a 12'], [12, 22, 'Casas 12 a 22']];
  const tons = () => TEORIA.NOMES.map((n, i) => [i, TEORIA.nome(i, notacao())]);

  function notasDoBraco() {
    const [de, ate] = REGIOES[E.regiao], af = afin(), cif = notacao();
    const nomeDe = (c, k, raiz, bemol) => TEORIA.nome(TEORIA.pcDe(c, k, af), { ...cif, bemol });
    if (E.aba === 'notas') {
      const alvo = E.nota === '' ? null : +E.nota;
      return TEORIA.posicoes(alvo == null ? [...Array(12).keys()] : [alvo], { de, ate, afin: af })
        .map(([c, k]) => ({ c, k, rot: nomeDe(c, k), tipo: alvo != null ? 'raiz' : (TEORIA.pcDe(c, k, af) === 0 ? 'raiz' : 'nota') }));
    }
    if (E.aba === 'escalas' || E.aba === 'acordes') {
      const s = E.aba === 'escalas' ? TEORIA.escala(E.escala).s : TEORIA.tipoAcorde(E.tipo).s;
      const bem = TEORIA.usaBemol(E.raiz, s.includes(3));
      return TEORIA.posicoes(s.map(x => E.raiz + x), { de, ate, afin: af }).map(([c, k]) => {
        const iv = TEORIA.mod(TEORIA.pcDe(c, k, af) - E.raiz);
        return { c, k, rot: E.rotulo === 'graus' ? TEORIA.intervalo(iv).sigla : nomeDe(c, k, E.raiz, bem), tipo: iv === 0 ? 'raiz' : 'nota' };
      });
    }
    if (E.aba === 'intervalos') {
      if (!E.tonica) return [];
      const [tc, tk] = E.tonica, r = TEORIA.midiDe(tc, tk, af), out = [];
      for (let c = 0; c < 6; c++) for (let k = de; k <= ate; k++) {
        const d = TEORIA.midiDe(c, k, af) - r;
        if (Math.abs(d) <= 12) out.push({ c, k, rot: d === 12 || d === -12 ? '8ª' : TEORIA.intervalo(d).sigla, tipo: d === 0 && c === tc ? 'raiz' : 'nota' });
      }
      return out;
    }
    // livre: as notas marcadas, uma por corda
    return Object.entries(E.livre).map(([c, k]) => ({ c: +c, k, rot: nomeDe(+c, k), tipo: 'escolhida' }));
  }

  function controles() {
    const cif = notacao();
    if (E.aba === 'notas') return escolhaHTML('ex-nota', 'Mostrar a nota', [['', 'Todas as notas'], ...tons()], E.nota);
    if (E.aba === 'escalas') {
      const es = TEORIA.escala(E.escala), bem = TEORIA.usaBemol(E.raiz, es.s.includes(3));
      const notas = es.s.map(x => TEORIA.nome(E.raiz + x, { ...cif, bemol: bem }));
      const campo = ['maior', 'menor'].includes(E.escala) ? TEORIA.campo(E.raiz, E.escala === 'menor') : null;
      return `${escolhaHTML('ex-tom', 'Tom', tons(), E.raiz)}${escolhaHTML('ex-escala', 'Escala', TEORIA.ESCALAS.map(e => [e.id, e.nome]), E.escala)}
        ${segmento('rot', 'Mostrar nas notas', [['nomes', 'Nomes'], ['graus', 'Graus']], E.rotulo)}
        ${dados([['Notas', esc(notas.join(', '))], ['Graus', esc(es.s.map(x => TEORIA.intervalo(x).sigla).join(' · '))], ['Som', esc(es.sobre)]])}
        <button type="button" class="kf-btn kf-sec" id="ouvir-escala">Ouvir a escala</button>
        ${campo ? `<h2 class="gf-h">Acordes da escala</h2><ul class="gf-lista">${campo.map(g => {
          const f = FORMAS.melhor(g.raiz, g.tipo), cifra = TEORIA.cifraAcorde(g.raiz, g.tipo === 'dim' ? 'dim' : g.tipo);
          return `<li><button type="button" class="gf-linha" ${f ? `data-acorde="${f.id}"` : 'disabled'}><span class="gf-num">${esc(g.grau)}</span><span class="gf-linha-tx"><b>${esc(cifra)}</b><small>${esc(TEORIA.tipoAcorde(g.tipo).nome)}</small></span>${f ? ICONE.seta : ''}</button></li>`;
        }).join('')}</ul>` : ''}`;
    }
    if (E.aba === 'acordes') {
      const t = TEORIA.tipoAcorde(E.tipo), bem = TEORIA.usaBemol(E.raiz, t.s.includes(3));
      const formas = FORMAS.TODAS.filter(f => f.raiz === E.raiz && f.tipo === E.tipo);
      return `${escolhaHTML('ex-tom', 'Tônica', tons(), E.raiz)}${escolhaHTML('ex-tipo', 'Tipo', TEORIA.ACORDES.map(a => [a.id, `${a.nome} (${TEORIA.nome(E.raiz, { cifra: true, bemol: bem })}${a.suf})`]), E.tipo)}
        ${segmento('rot', 'Mostrar nas notas', [['nomes', 'Nomes'], ['graus', 'Graus']], E.rotulo)}
        ${dados([['Cifra', esc(TEORIA.cifraAcorde(E.raiz, E.tipo))], ['Notas', esc(t.s.map(x => TEORIA.nome(E.raiz + x, { ...cif, bemol: bem })).join(', '))], ['Fórmula', esc(t.s.map(x => TEORIA.intervalo(x).sigla).join(' · '))]])}
        ${formas.length ? `<h2 class="gf-h">Formas para tocar</h2><ul class="gf-lista">${formas.map(f => `<li><button type="button" class="gf-linha" data-acorde="${f.id}"><span class="gf-linha-fig">${DESENHO.diagrama(f, { pequeno: true, canhoto: canhoto(), rotulo: f.cifra })}</span><span class="gf-linha-tx"><b>${esc(f.cifra)}</b><small>${esc(f.forma)}</small></span>${ICONE.seta}</button></li>`).join('')}</ul>` : '<p class="gf-apoio">Ainda sem forma pronta para este acorde: monte pelas notas destacadas no braço.</p>'}`;
    }
    if (E.aba === 'intervalos') {
      return `<p class="gf-apoio">${E.tonica ? 'Cada nota mostra a distância até a tônica, em vermelho. Toque em outra casa para mudar a tônica.' : 'Toque numa casa do braço para escolher a tônica.'}</p>
        <ul class="gf-lista">${TEORIA.INTERVALOS.concat([{ s: 12, sigla: '8ª', nome: 'Oitava', cor: 'a mesma nota, mais aguda' }]).map(iv => `<li><button type="button" class="gf-linha" data-intervalo="${iv.s}" ${E.tonica ? '' : 'disabled'}><span class="gf-num">${esc(iv.sigla)}</span><span class="gf-linha-tx"><b>${esc(iv.nome)}</b><small>${esc(iv.cor)}</small></span>${ICONE.ouvir}</button></li>`).join('')}</ul>`;
    }
    const midis = Object.entries(E.livre).map(([c, k]) => TEORIA.midiDe(+c, k, afin()));
    const ac = TEORIA.reconhecer(midis);
    return `<p class="gf-apoio">Toque nas casas para marcar até uma nota por corda. Toque de novo para desmarcar.</p>
      ${dados([['Notas marcadas', esc(midis.length ? midis.sort((a, b) => a - b).map(m => TEORIA.nome(m, notacao())).join(', ') : 'Nenhuma')], ['Acorde', esc(ac ? `${TEORIA.cifraAcorde(ac.raiz, ac.tipo.id, ac.inversao ? ac.baixo : null)} (${TEORIA.tipoAcorde(ac.tipo.id).nome})` : midis.length > 1 ? 'Sem nome conhecido' : '—')]])}
      <button type="button" class="kf-btn kf-sec" id="livre-ouvir" ${midis.length ? '' : 'disabled'}>Ouvir juntas</button>
      <button type="button" class="kf-btn kf-sec" id="livre-estudio" ${midis.length ? '' : 'disabled'}>Levar ao Estúdio</button>
      <button type="button" class="kf-btn kf-sec" id="livre-limpar" ${midis.length ? '' : 'disabled'}>Limpar</button>`;
  }

  const tela = {
    titulo: 'Explorar', principal: true,
    sub: 'O braço da guitarra: notas, escalas, acordes e intervalos, com som.',
    html() {
      const [de, ate, nomeR] = REGIOES[E.regiao];
      return `${KitFacil.ui.abas({ itens: [['notas', 'Notas'], ['escalas', 'Escalas'], ['acordes', 'Acordes'], ['intervalos', 'Intervalos'], ['livre', 'Livre']], atual: E.aba, rotulo: 'Partes do Explorar', dado: 'aba-ex' })}
        <figure class="gf-figura" id="ex-braco">${DESENHO.braco({ de, ate, notas: notasDoBraco(), canhoto: canhoto(), interativo: true, afin: afin(), notacao: notacao(), larg: 52, esp: 28, rotulo: `Braço da guitarra, ${nomeR.toLowerCase()}` })}
          <figcaption>${esc(TEORIA.afinacao(afin()).nome)}. Toque numa casa para ouvir a nota.</figcaption></figure>
        ${segmento('regiao', 'Parte do braço', REGIOES.map((r, i) => [i, r[2]]), E.regiao)}
        <div class="gf-pilha">${controles()}</div>`;
    },
    ligar(r) {
      r.querySelectorAll('[data-aba-ex]').forEach(b => b.onclick = () => { E.aba = b.dataset.abaEx; APP.redesenhar(); });
      r.querySelectorAll('[data-seg-regiao]').forEach(b => b.onclick = () => { E.regiao = +b.dataset.segRegiao; APP.redesenhar(); });
      r.querySelectorAll('[data-seg-rot]').forEach(b => b.onclick = () => { E.rotulo = b.dataset.segRot; APP.redesenhar(); });
      const sel = (id, f) => { const x = $(id, r); if (x) x.onchange = () => { f(x.value); APP.redesenhar(); }; };
      sel('#ex-nota', v => { E.nota = v; }); sel('#ex-tom', v => { E.raiz = +v; }); sel('#ex-escala', v => { E.escala = v; }); sel('#ex-tipo', v => { E.tipo = v; });
      r.querySelectorAll('[data-acorde]').forEach(b => b.onclick = () => abrirAcorde(b.dataset.acorde));
      // toque no braço
      const tocar = alvo => {
        const c = +alvo.dataset.c, k = +alvo.dataset.k;
        TOCADOR.soar(c, k, afin());
        if (E.aba === 'intervalos') { E.tonica = [c, k]; APP.redesenhar({ foco: `.gf-alvo[data-c="${c}"][data-k="${k}"]` }); }
        else if (E.aba === 'livre') { if (E.livre[c] === k) delete E.livre[c]; else E.livre[c] = k; APP.redesenhar({ foco: `.gf-alvo[data-c="${c}"][data-k="${k}"]` }); }
      };
      const fig = $('#ex-braco', r);
      fig.addEventListener('click', e => { const a = e.target.closest('.gf-alvo'); if (a) tocar(a); });
      fig.addEventListener('keydown', e => { const a = e.target.closest('.gf-alvo'); if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tocar(a); } });
      const oe = $('#ouvir-escala', r);
      if (oe) oe.onclick = () => {
        const s = TEORIA.escala(E.escala).s, base = TEORIA.afinacao(afin()).midi[0] + TEORIA.mod(E.raiz - TEORIA.afinacao(afin()).midi[0]);
        const evs = [...s, 12].map(x => base + x).map(m => { const c = [0, 1, 2, 3, 4, 5].reverse().find(cc => m - TEORIA.afinacao(afin()).midi[cc] >= 0 && m - TEORIA.afinacao(afin()).midi[cc] <= 12) ?? 0; return { d: .5, n: [[c, m - TEORIA.afinacao(afin()).midi[c], null]] }; });
        TOCADOR.tocar({ evs, bpm: 100, compasso: 4, afin: afin(), voltas: 1 });
      };
      r.querySelectorAll('[data-intervalo]').forEach(b => b.onclick = () => {
        if (!E.tonica) return;
        const [c, k] = E.tonica, s = +b.dataset.intervalo, m = TEORIA.midiDe(c, k, afin());
        SOM.preparar([m, m + s]).then(() => { const t = SOM.tempo() + .03; SOM.nota(m, t, .9); SOM.nota(m + s, t + .6, .9); SOM.nota(m, t + 1.3, 1.2, .7); SOM.nota(m + s, t + 1.3, 1.2, .7); });
      });
      const lo = $('#livre-ouvir', r); if (lo) lo.onclick = () => TOCADOR.rasgar(Object.entries(E.livre).map(([c, k]) => [+c, k]), afin());
      const ll = $('#livre-limpar', r); if (ll) ll.onclick = () => { E.livre = {}; APP.redesenhar(); };
      const le = $('#livre-estudio', r); if (le) le.onclick = () => { const i = ESTUDIO.nova({ evs: [{ d: 4, n: Object.entries(E.livre).map(([c, k]) => [+c, k, null]) }] }); APP.ir('ideia/' + i.id); };
    },
    mostrarAcorde(raiz, tipo) { E.aba = 'acordes'; E.raiz = raiz; E.tipo = tipo; APP.ir('explorar'); },
  };
  TELAS.explorar = tela;
  return tela;
})();

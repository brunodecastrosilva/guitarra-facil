/* Guitarra Fácil · Estúdio: ideias e riffs escritos pelo braço, com duração, pausas, acordes e técnicas, para ouvir,
   treinar e variar. As ideias são de uso pessoal (inclusive trechos tirados de ouvido) e ficam no aparelho e na nuvem
   da própria pessoa, se a sincronização estiver ligada. */
'use strict';

const ESTUDIO = (() => {
  const ED = { dur: .5, tec: '', acorde: false, regiao: 0, tocando: false };
  const TECNICAS = [['', 'Nenhuma'], ['h', 'Hammer-on'], ['p', 'Pull-off'], ['s', 'Slide'], ['b', 'Bend'], ['v', 'Vibrato'], ['pm', 'Palm mute'], ['x', 'Nota morta']];
  const DURACOES = [[2, '2 tempos', 'Mínima, 2 tempos'], [1, '1 tempo', 'Semínima, 1 tempo'], [.5, '½ tempo', 'Colcheia, meio tempo'], [.25, '¼ tempo', 'Semicolcheia, um quarto de tempo']];

  function partes(evs, comp) {
    const out = []; let atual = [], soma = 0, ini = 1;
    const fecha = () => { const q = Math.max(1, Math.ceil(soma / comp - 1e-6)); out.push({ nome: q > 1 ? `Compassos ${ini} a ${ini + q - 1}` : `Compasso ${ini}`, evs: atual }); ini += q; atual = []; soma = 0; };
    evs.forEach(e => { atual.push(e); soma += e.d; if (soma >= comp * 2 - 1e-6) fecha(); });
    if (atual.length) fecha();
    return out;
  }
  function comoExercicio(i) {
    const evs = (i.evs || []).length ? i.evs : [{ d: 4, n: [] }];
    return { id: 'i-' + i.id, num: null, objetivo: `Tocar a ideia "${i.nome}"`, nome: i.nome, familia: 'estudio', tecnica: 'Estúdio', competencia: null, nivel: 0, mao: 'ambas',
      bpm: { ini: i.bpm || 80, meta: i.bpm || 80 }, compasso: i.compasso || 4, partes: partes(evs, i.compasso || 4), evs, dica: 'Ideia sua, do Estúdio. Ajuste o andamento e repita até sair limpo.', tipo: 'tocar' };
  }
  function nova({ evs = [], nome } = {}) {
    const n = DADOS.ideias().length + 1;
    return DADOS.salvarIdeia({ id: novoId(), nome: nome || `Ideia ${n}`, bpm: 80, compasso: 4, evs, criada: agora() });
  }
  const resumo = i => { const t = CATALOGO.total(i.evs || []); return `${plural((i.evs || []).length, 'nota ou pausa', 'notas e pausas')} · ${plural(Math.ceil(t / (i.compasso || 4)) || 0, 'compasso', 'compassos')} · ${i.bpm} bpm`; };

  TELAS.estudio = {
    titulo: 'Estúdio', principal: true,
    sub: 'Suas ideias e riffs, escritos no braço, para ouvir e treinar.',
    criar: { rotulo: 'Nova ideia', attrs: 'data-nova-ideia' },
    html() {
      const L = DADOS.ideias();
      return L.length ? `<ul class="gf-lista">${L.map(i => `<li><button type="button" class="gf-linha" data-ir="ideia/${esc(i.id)}"><span class="gf-linha-tx"><b>${esc(i.nome)}</b><small>${esc(resumo(i))} · editada em ${esc(dataCurta(i.t))}</small></span>${ICONE.seta}</button></li>`).join('')}</ul>`
        : KitFacil.ui.vazio({ titulo: 'Nenhuma ideia ainda', texto: 'Toque em <b>Nova ideia</b> e escreva notas tocando no braço. Trechos tirados de ouvido também ficam aqui, só para você.' });
    },
    ligar() {},
  };
  document.addEventListener('click', e => { if (e.target.closest('[data-nova-ideia]')) { const i = nova(); APP.ir('ideia/' + i.id); } });

  TELAS.ideia = {
    principal: false,
    titulo: ([id]) => (DADOS.ideia(id) || {}).nome || 'Ideia',
    html([id]) {
      const i = DADOS.ideia(id);
      if (!i) return KitFacil.ui.vazio({ titulo: 'Ideia não encontrada', texto: 'Ela pode ter sido apagada em outro aparelho.', acao: '<button type="button" class="kf-btn kf-sec" data-ir="estudio">Voltar ao Estúdio</button>' });
      const [de, ate] = ED.regiao ? [12, 22] : [0, 12];
      const ultimo = i.evs[i.evs.length - 1], marcadas = ultimo ? (ultimo.n || []).map(([c, k]) => ({ c, k, tipo: 'escolhida', rot: TEORIA.nome(TEORIA.pcDe(c, k, afin()), notacao()) })) : [];
      return `<div class="gf-campo"><label class="kf-rotulo" for="id-nome">Nome</label><input id="id-nome" class="kf-entrada" maxlength="60" value="${esc(i.nome)}"></div>
        <figure class="gf-figura" id="id-braco">${DESENHO.braco({ de, ate, notas: marcadas, canhoto: canhoto(), interativo: true, afin: afin(), notacao: notacao(), larg: 52, esp: 28, rotulo: 'Braço para escrever: toque numa casa para acrescentar a nota' })}
          <figcaption>Toque numa casa para acrescentar a nota. Em vermelho, a última nota escrita.</figcaption></figure>
        ${segmento('reg-id', 'Parte do braço', [[0, 'Casas 0 a 12'], [1, 'Casas 12 a 22']], ED.regiao)}
        ${segmento('dur', 'Duração da próxima nota', DURACOES, ED.dur)}
        ${escolhaHTML('id-tec', 'Técnica da próxima nota', TECNICAS, ED.tec)}
        <label class="kf-check"><input type="checkbox" id="id-acorde" ${ED.acorde ? 'checked' : ''}><span>Juntar à nota anterior (acorde)</span></label>
        <div class="kf-acoes"><button type="button" class="kf-btn kf-sec" id="id-pausa">${ICONE.pausa}Pausa</button><button type="button" class="kf-btn kf-sec" id="id-desfazer" ${i.evs.length ? '' : 'disabled'}>${ICONE.desfazer}Desfazer</button></div>
        <div class="gf-campo"><span class="kf-rotulo" id="r-bpm">Andamento</span><div class="gf-andamento" role="group" aria-labelledby="r-bpm"><button type="button" class="kf-btn kf-sec gf-icone" id="id-menos" aria-label="Mais devagar">${ICONE.menos}</button><output id="id-bpm">${i.bpm}<small>bpm</small></output><button type="button" class="kf-btn kf-sec gf-icone" id="id-mais" aria-label="Mais depressa">${ICONE.mais}</button></div></div>
        <h2 class="gf-h">Tablatura</h2>
        <div id="id-tab">${i.evs.length ? '' : '<p class="gf-apoio">A tablatura aparece aqui conforme você escreve.</p>'}</div>`;
    },
    ligar(r, [id]) {
      const i = DADOS.ideia(id); if (!i) return;
      const salvar = () => DADOS.salvarIdeia(i);
      const tab = $('#id-tab', r); if (i.evs.length) tab.innerHTML = DESENHO.tablatura(i.evs, { compasso: i.compasso, largura: tab.clientWidth || 340 });
      $('#id-nome', r).onchange = e => { i.nome = e.target.value.trim() || i.nome; salvar(); APP.redesenharBarra(); };
      r.querySelectorAll('[data-seg-reg-id]').forEach(b => b.onclick = () => { ED.regiao = +b.dataset.segRegId; APP.redesenhar(); });
      r.querySelectorAll('[data-seg-dur]').forEach(b => b.onclick = () => { ED.dur = +b.dataset.segDur; r.querySelectorAll('[data-seg-dur]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
      $('#id-tec', r).onchange = e => { ED.tec = e.target.value; };
      $('#id-acorde', r).onchange = e => { ED.acorde = e.target.checked; };
      const escrever = (c, k) => {
        TOCADOR.soar(c, k, afin(), ED.tec);
        const ult = i.evs[i.evs.length - 1];
        if (ED.acorde && ult && (ult.n || []).length) { ult.n = ult.n.filter(n => n[0] !== c).concat([[c, k, null]]); }
        else i.evs.push(ED.tec ? { d: ED.dur, n: [[c, k, null]], t: ED.tec } : { d: ED.dur, n: [[c, k, null]] });
        salvar(); APP.redesenhar({ foco: `.gf-alvo[data-c="${c}"][data-k="${k}"]` });
      };
      const fig = $('#id-braco', r);
      fig.addEventListener('click', e => { const a = e.target.closest('.gf-alvo'); if (a) escrever(+a.dataset.c, +a.dataset.k); });
      fig.addEventListener('keydown', e => { const a = e.target.closest('.gf-alvo'); if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); escrever(+a.dataset.c, +a.dataset.k); } });
      $('#id-pausa', r).onclick = () => { i.evs.push({ d: ED.dur, n: [] }); salvar(); APP.redesenhar(); };
      $('#id-desfazer', r).onclick = () => { i.evs.pop(); salvar(); APP.redesenhar(); };
      const bpm = v => { i.bpm = limitar(v, 30, 240); salvar(); $('#id-bpm', r).innerHTML = `${i.bpm}<small>bpm</small>`; };
      $('#id-menos', r).onclick = () => bpm(i.bpm - 5); $('#id-mais', r).onclick = () => bpm(i.bpm + 5);
    },
    acoes([id]) {
      if (!DADOS.ideia(id)) return '';
      return `<button type="button" class="kf-btn kf-sec gf-icone" data-acao="mais" aria-label="Mais ações da ideia" title="Mais ações">${ICONE.reticencias}</button>
        <button type="button" class="kf-btn kf-sec" data-acao="treinar">Treinar</button>
        <button type="button" class="kf-btn kf-pri" data-acao="ouvir">${ED.tocando ? ICONE.parar + 'Parar' : ICONE.play + 'Ouvir'}</button>`;
    },
    acao(nome, [id]) {
      const i = DADOS.ideia(id); if (!i) return;
      if (nome === 'ouvir') {
        if (ED.tocando) { TOCADOR.parar(); return; }
        if (!i.evs.length) { KitFacil.avisar('Escreva pelo menos uma nota para ouvir.'); return; }
        ED.tocando = true; APP.redesenharAcoes();
        const fim = () => { ED.tocando = false; $$('#id-tab .gf-on').forEach(x => x.classList.remove('gf-on')); if (TELAS.ideia === APP.tela()) APP.redesenharAcoes(); };
        TOCADOR.tocar({ evs: i.evs, bpm: i.bpm, compasso: i.compasso, afin: afin(), voltas: 1, aoNota: n => { $$('#id-tab .gf-on').forEach(x => x.classList.remove('gf-on')); const t = $(`#id-tab [data-i="${n}"]`); if (t) t.classList.add('gf-on'); }, aoFim: fim, aoParar: fim });
        return;
      }
      if (nome === 'treinar') { if (!i.evs.length) { KitFacil.avisar('Escreva pelo menos uma nota para treinar.'); return; } APP.ir('treino/i-' + i.id); return; }
      if (nome === 'mais') {
        KitFacil.dialogo.abrir({ titulo: i.nome, sub: 'Ideia', classe: 'kf-curto', nome: 'ideia-mais',
          corpo: `<ul class="kf-mais-lista">${[['duplicar', 'Duplicar'], ['subir', 'Transpor meio tom acima'], ['descer', 'Transpor meio tom abaixo'], ['inverter', 'Tocar ao contrário (variação)'], ['apagar', 'Apagar a ideia']].map(([a, t]) => `<li><button type="button" class="kf-aj-item" data-ideia="${a}"><span class="kf-aj-tx"><b>${t}</b></span></button></li>`).join('')}</ul>`,
          pe: '<button type="button" class="kf-btn kf-sec" data-kf-fechar>Fechar</button>',
          aoMontar: d => d.querySelectorAll('[data-ideia]').forEach(b => b.onclick = () => {
            const a = b.dataset.ideia;
            if (a === 'apagar') { KitFacil.dialogo.confirmar({ titulo: 'Apagar a ideia?', texto: `"${i.nome}" sai deste aparelho e da nuvem. Não dá para desfazer.`, ok: 'Apagar', perigo: true, aoConfirmar: () => { DADOS.apagarIdeia(i.id); KitFacil.avisar('Ideia apagada.'); APP.ir('estudio'); } }); return; }
            KitFacil.dialogo.fechar(true);
            const copia = JSON.parse(JSON.stringify(i.evs));
            if (a === 'duplicar') { const n = nova({ evs: copia, nome: `${i.nome} (cópia)` }); n.bpm = i.bpm; DADOS.salvarIdeia(n); APP.ir('ideia/' + n.id); return; }
            if (a === 'inverter') { const n = nova({ evs: copia.reverse(), nome: `${i.nome} (ao contrário)` }); n.bpm = i.bpm; DADOS.salvarIdeia(n); APP.ir('ideia/' + n.id); return; }
            const d = a === 'subir' ? 1 : -1;
            if (copia.some(e => (e.n || []).some(([, k]) => k + d < 0 || k + d > 24))) { KitFacil.avisar(d < 0 ? 'Há notas soltas: não dá para descer meio tom.' : 'Há notas na última casa: não dá para subir.'); return; }
            i.evs = copia.map(e => ({ ...e, n: (e.n || []).map(([c, k, x]) => [c, k + d, x]) })); DADOS.salvarIdeia(i); APP.redesenhar(); KitFacil.avisar(d > 0 ? 'Transposta meio tom acima.' : 'Transposta meio tom abaixo.');
          }) });
      }
    },
    sair() { TOCADOR.parar(); ED.tocando = false; },
  };
  return { comoExercicio, nova };
})();

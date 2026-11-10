/* Guitarra Fácil · dados: o que fica guardado neste aparelho (prefixo guitarrafacil.) e a junção com a nuvem.
   Registros sincronizados, cada um com a hora da última mudança (t): prática, favoritos, ideias do Estúdio, andamento de
   cada treino e o perfil (nível, mão, afinação, metas). As exclusões ficam marcadas em del, para não voltarem.
   Não sincronizam (Art. 34): os volumes deste aparelho e a sessão em andamento.
   Três estados, sempre separados: praticado (o app registrou o tempo tocado), concluído (a própria pessoa marcou "saiu
   limpo") e avaliado (não existe: o app não mede a execução). */
'use strict';

const DADOS = (() => {
  const PREFIXO = 'guitarrafacil.', CHAVE = PREFIXO + 'db', CHAVE_APARELHO = PREFIXO + 'aparelho';
  const COLECOES = ['pratica', 'fav', 'ideias', 'andamento'];
  const PERFIL_PADRAO = { nivel: 1, mao: 'destro', afin: 'padrao', notacao: 'nomes', metronomo: true, contagem: true, voltas: 2, metaSemana: 60, metaMes: '', metaTri: '', t: 0 };
  const vazio = () => ({ v: 1, pratica: {}, fav: {}, ideias: {}, andamento: {}, perfil: { ...PERFIL_PADRAO }, del: {} });
  const lerLS = (k, padrao) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? padrao; } catch { return padrao; } };
  const gravarLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };

  /* dados das versões anteriores à reescrita (coleções em listas): o tempo tocado, as marcações de "saiu limpo" e as
     ideias do Estúdio continuam; os números dos exercícios antigos não existem mais, então esses treinos contam no
     tempo e nos dias, mas não aparecem no histórico. Ids fixos ("a-…"): dois aparelhos migram sem duplicar. */
  function migrar(d) {
    const o = vazio(), lista = x => (Array.isArray(x) ? x : []);
    lista(d.treinos).forEach(r => { if (!r || !r.id || !r.em) return; const id = 'a-' + r.id; o.pratica[id] = { id, ex: 'antigo', em: r.em, seg: Math.round((r.min || 0) * 60), bpm: r.bpm || 0, limpo: r.limpo ?? null, t: r.em }; });
    lista(d.praticas).forEach(r => { if (!r || !r.id || !r.em) return; const id = 'a-' + r.id; if (!o.pratica[id]) o.pratica[id] = { id, ex: 'antigo', em: r.em, seg: Math.round((r.min || 0) * 60), bpm: 0, limpo: null, t: r.em }; });
    lista(d.ideias).forEach(x => {
      if (!x || !x.id) return;
      const comp = Array.isArray(x.compasso) ? x.compasso[0] * (x.compasso[1] || 1) : x.compasso || 4;
      const evs = lista(x.evs).map(e => { const n = lista(e.n).map(([c, k, dd]) => [c, k, dd ?? null]); return e.t ? { d: e.d, n, t: String(e.t).split(' ')[0] } : { d: e.d, n }; });
      o.ideias[x.id] = { id: x.id, nome: String(x.nome || 'Ideia').slice(0, 60), bpm: x.bpm || 80, compasso: comp, evs, criada: x.em || agora(), t: x.em || 1 };
    });
    return o;
  }
  const antigo = d => d && (Array.isArray(d.praticas) || Array.isArray(d.treinos) || Array.isArray(d.ideias));
  function normalizar(d) {
    if (antigo(d)) return migrar(d);
    const o = vazio();
    if (!d || typeof d !== 'object') return o;
    COLECOES.forEach(c => { if (d[c] && typeof d[c] === 'object') o[c] = d[c]; });
    o.perfil = { ...PERFIL_PADRAO, ...(d.perfil || {}) };
    o.del = d.del && typeof d.del === 'object' ? d.del : {};
    return o;
  }
  let db = normalizar(lerLS(CHAVE, null));
  let real = null; // durante a demonstração do guia, os dados verdadeiros ficam guardados aqui
  let aoMudar = () => {};

  function salvar() {
    if (real) return; // demonstração: nada é salvo
    gravarLS(CHAVE, db);
    aoMudar();
  }
  const demo = {
    ligar() { if (!real) { real = db; db = JSON.parse(JSON.stringify(db)); } },
    desligar() { if (real) { db = real; real = null; } },
    ativa: () => !!real,
  };

  /* ---------- perfil ---------- */
  const perfil = () => db.perfil;
  function mudarPerfil(campos) { Object.assign(db.perfil, campos, { t: agora() }); salvar(); }

  /* ---------- aparelho (não sincroniza) ---------- */
  const APARELHO_PADRAO = { vol: { guitarra: .9, metronomo: .7, bateria: .8 }, sessao: null };
  const aparelho = () => { const a = lerLS(CHAVE_APARELHO, {}); return { ...APARELHO_PADRAO, ...a, vol: { ...APARELHO_PADRAO.vol, ...(a.vol || {}) } }; };
  function mudarAparelho(campos) { if (real) return; gravarLS(CHAVE_APARELHO, { ...aparelho(), ...campos }); }

  /* ---------- prática ---------- */
  function registrarPratica({ ex, seg, bpm }) {
    const id = novoId(), t = agora();
    db.pratica[id] = { id, ex, em: t, seg: Math.round(seg), bpm: bpm || 0, limpo: null, t };
    if (bpm) db.andamento[ex] = { bpm, t };
    salvar(); return id;
  }
  function marcarLimpo(id, limpo) { const p = db.pratica[id]; if (!p) return; p.limpo = !!limpo; p.t = agora(); salvar(); }
  const praticas = () => Object.values(db.pratica).sort((a, b) => b.em - a.em);
  function andamento(exId) { return (db.andamento[exId] || {}).bpm || 0; }
  function guardarAndamento(exId, bpm) { db.andamento[exId] = { bpm, t: agora() }; salvar(); }
  /* resumo de um exercício: vezes praticado, vezes concluído limpo e último andamento */
  function estadoEx(exId) {
    const ps = praticas().filter(p => p.ex === exId);
    return { vezes: ps.length, limpos: ps.filter(p => p.limpo).length, ultimo: ps[0] || null, bpm: andamento(exId) };
  }
  function semana(t = agora()) {
    const ini = inicioSemana(t), ps = praticas().filter(p => p.em >= ini);
    return { seg: ps.reduce((s, p) => s + p.seg, 0), dias: new Set(ps.map(p => hojeISO(p.em))).size, treinos: ps.length, limpos: ps.filter(p => p.limpo).length };
  }
  /* dias seguidos com prática, até hoje (ou ontem) */
  function sequencia() {
    const dias = new Set(praticas().map(p => hojeISO(p.em)));
    let n = 0; const d = new Date(); d.setHours(12);
    if (!dias.has(hojeISO(d.getTime()))) d.setDate(d.getDate() - 1);
    while (dias.has(hojeISO(d.getTime()))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  /* prática por competência: tempo e concluídos (praticado ≠ concluído ≠ avaliado) */
  function competencias() {
    const r = Object.fromEntries(CATALOGO.COMPETENCIAS.map(([id]) => [id, { seg: 0, treinos: 0, limpos: 0 }]));
    praticas().forEach(p => { const e = buscar(p.ex); if (!e || !r[e.competencia]) return; r[e.competencia].seg += p.seg; r[e.competencia].treinos++; if (p.limpo) r[e.competencia].limpos++; });
    return r;
  }

  /* qualquer coisa que se treina: exercício do catálogo (0001), obra da biblioteca (b-…) ou ideia do Estúdio (i-…) */
  function buscar(id) {
    if (!id) return null;
    if (id.startsWith('b-')) return BIBLIOTECA.comoExercicio(id.slice(2));
    if (id.startsWith('i-')) { const i = db.ideias[id.slice(2)]; return i ? ESTUDIO.comoExercicio(i) : null; }
    return CATALOGO.porId(id);
  }

  /* ---------- favoritos ---------- */
  const favorito = exId => !!db.fav[exId];
  function alternarFavorito(exId) {
    if (db.fav[exId]) { delete db.fav[exId]; db.del['fav:' + exId] = agora(); }
    else { db.fav[exId] = { t: agora() }; delete db.del['fav:' + exId]; }
    salvar(); return favorito(exId);
  }
  const favoritos = () => Object.entries(db.fav).sort((a, b) => b[1].t - a[1].t).map(([id]) => id);

  /* ---------- ideias do Estúdio ---------- */
  const ideias = () => Object.values(db.ideias).sort((a, b) => b.t - a.t);
  const ideia = id => db.ideias[id] || null;
  function salvarIdeia(i) { i.t = agora(); db.ideias[i.id] = i; delete db.del['ideias:' + i.id]; salvar(); return i; }
  function apagarIdeia(id) { delete db.ideias[id]; db.del['ideias:' + id] = agora(); salvar(); }

  /* ---------- sincronização: junção registro a registro, a mudança mais recente vence ---------- */
  const pacote = () => ({ v: 1, pratica: db.pratica, fav: db.fav, ideias: db.ideias, andamento: db.andamento, perfil: db.perfil, del: db.del });
  function aplicar(remoto) {
    if (!remoto || typeof remoto !== 'object') return false;
    const antes = KitFacil.canon(pacote());
    const r = normalizar(remoto);
    Object.entries(r.del).forEach(([k, t]) => { if (!(db.del[k] >= t)) db.del[k] = t; });
    // exclusões com mais de 400 dias saem da lista
    const limite = agora() - 400 * 864e5;
    Object.keys(db.del).forEach(k => { if (db.del[k] < limite) delete db.del[k]; });
    COLECOES.forEach(c => {
      Object.entries(r[c]).forEach(([id, reg]) => { if (!db[c][id] || (reg.t || 0) > (db[c][id].t || 0)) db[c][id] = reg; });
      Object.keys(db[c]).forEach(id => { const tDel = db.del[c + ':' + id]; if (tDel && tDel >= (db[c][id].t || 0)) delete db[c][id]; });
    });
    if ((r.perfil.t || 0) > (db.perfil.t || 0)) db.perfil = r.perfil;
    const mudou = antes !== KitFacil.canon(pacote());
    if (mudou) gravarLS(CHAVE, db);
    return mudou;
  }
  const igual = (a, r) => KitFacil.canon(a) === KitFacil.canon({ v: 1, pratica: r.pratica || {}, fav: r.fav || {}, ideias: r.ideias || {}, andamento: r.andamento || {}, perfil: r.perfil || {}, del: r.del || {} });

  /* ---------- cópia de segurança ---------- */
  const copia = () => JSON.parse(JSON.stringify(pacote()));
  function restaurar(dados) { if (!dados || typeof dados !== 'object') return false; db = normalizar(dados); salvar(); return true; }
  const temDados = () => Object.keys(db.pratica).length > 0 || Object.keys(db.ideias).length > 0 || Object.keys(db.fav).length > 0;

  return { PREFIXO, perfil, mudarPerfil, aparelho, mudarAparelho, registrarPratica, marcarLimpo, praticas, andamento, guardarAndamento,
    estadoEx, semana, sequencia, competencias, buscar, favorito, alternarFavorito, favoritos, ideias, ideia, salvarIdeia, apagarIdeia,
    pacote, aplicar, igual, copia, restaurar, temDados, demo, lerLS, gravarLS, set aoMudar(f) { aoMudar = f; } };
})();

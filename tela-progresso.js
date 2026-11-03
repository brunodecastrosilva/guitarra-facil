/* Guitarra Fácil · Progresso: semana, competências, metas, andamentos e conquistas */
'use strict';
function graficoSemana() {
  const W = 336, H = 110, bw = W / 7, hoje = diaNum(), D = Array.from({ length: 7 }, (_, i) => hoje - 6 + i).map(n => ({ n, m: Math.round(minutosNoDia(n)) }));
  const max = Math.max(DB.cfg.meta * 1.25, ...D.map(d => d.m), 1), y = v => H - v / max * H, dia = n => new Date(n * DIA + 12 * 36e5).getDay();
  return `<svg viewBox="0 0 ${W} ${H + 34}" role="img" aria-label="Minutos praticados nos últimos 7 dias: ${D.map(d => `${SEMANA_NOME[dia(d.n)]} ${d.m}`).join(', ')}. Meta: ${DB.cfg.meta} por dia.">`
    + D.map((d, i) => { const h = Math.max(d.m ? 3 : 0, H - y(d.m)); return `<rect x="${i * bw + 7}" y="${H - h}" width="${bw - 14}" height="${h}" rx="4" class="${d.m >= DB.cfg.meta ? 'g-ok' : 'g-med'}"/><text x="${i * bw + bw / 2}" y="${H + 14}" text-anchor="middle" class="g-t">${d.m}</text><text x="${i * bw + bw / 2}" y="${H + 29}" text-anchor="middle" class="g-t${d.n === hoje ? ' g-hoje' : ''}">${d.n === hoje ? 'hoje' : SEMANA[dia(d.n)]}</text>`; }).join('')
    + `<line x1="0" y1="${y(DB.cfg.meta)}" x2="${W}" y2="${y(DB.cfg.meta)}" class="g-meta"/></svg>`;
}
VIEWS.progresso = () => {
  const aba = ['competencias', 'metas', 'andamentos', 'conquistas'].includes(subRota()) ? subRota() : 'semana', total = DB.praticas.reduce((s, p) => s + p.min, 0);
  const abas = `<div class="kf-seg abas" role="group" aria-label="Mostrar">${[['semana', 'Semana'], ['competencias', 'Competências'], ['metas', 'Metas'], ['andamentos', 'Andamentos'], ['conquistas', 'Conquistas']].map(([k, n]) => `<button type="button" data-ir="progresso${k === 'semana' ? '' : '/' + k}" aria-pressed="${aba === k}">${n}</button>`).join('')}</div>`;
  let corpo;
  if (aba === 'semana') corpo = `<div class="dados"><div class="dado"><b>${diasSeguidos()}</b><span class="apoio">dias seguidos</span></div><div class="dado"><b>${minutosSemana()}</b><span class="apoio">min em 7 dias</span></div><div class="dado"><b>${(total / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</b><span class="apoio">horas no total</span></div></div>
      <section class="cartao"><div class="grafico">${graficoSemana()}</div><p class="apoio">Minutos por dia. A linha tracejada é a meta de ${DB.cfg.meta} min; as barras escuras bateram a meta. Maior sequência: ${maiorSequencia()} dias.</p></section>`;
  else if (aba === 'competencias') corpo = mapaCompetencias();
  else if (aba === 'metas') corpo = `<p class="apoio">Uma meta para cada prazo. O app conta o progresso pelo que você pratica e avisa quando o período termina, para você rever.</p>${PRAZOS.map(([p]) => cartaoMeta(p)).join('')}`;
  else if (aba === 'andamentos') {
    const ids = [...new Set(T().map(t => t.id))].filter(id => modelo(id)).slice(-40).reverse();
    corpo = ids.length ? `<ul class="andas cartao">${ids.map(id => { const m = modelo(id), b = melhorLimpo(id), X = T().filter(t => t.id === id), ul = X[X.length - 1], pr = Math.min(100, Math.round(b / m.alvo * 100)); return `<li><span><b>${esc(tituloDe(m))}</b><span class="apoio">${esc(nomeCategoria(m.cat))} · último ${ul.bpm} bpm · melhor limpo ${b || '–'} · meta ${m.alvo}</span></span><span class="barra-prog" style="width:80px" role="progressbar" aria-label="${esc(tituloDe(m))}: melhor andamento em relação à meta" aria-valuenow="${pr}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pr}%"></span></span></li>`; }).join('')}</ul>` + '<p class="apoio">Melhor limpo é o andamento que você marcou como "Saiu limpo". O app registra o que você praticou, mas não mede a execução.</p>'
      : KitFacil.ui.vazio({ titulo: 'Nenhum andamento ainda', texto: 'Termine um treino e diga se saiu limpo: o seu melhor andamento aparece aqui, com a meta.', acao: '<button type="button" class="kf-btn kf-pri" data-ir="treinos">Ir para os treinos</button>' });
  } else corpo = `<p class="apoio">${ganhas()} de ${CONQUISTAS.length} conquistas.</p><ul class="conquistas">${CONQUISTAS.map(([id, nome, como]) => { const c = temConquista(id); return `<li class="${c ? 'ganha' : ''}"><span class="cq-ic">${I.medalha}</span><span><b>${esc(nome)}</b><span class="apoio">${c ? `ganha ${quando(c.em)}` : esc(como)}</span></span></li>`; }).join('')}</ul>`;
  return KitFacil.ui.cabecalho({ titulo: 'Progresso', sub: 'Sua constância, as competências, as metas, os andamentos e as conquistas.' }) + abas + `<div class="pilha">${corpo}</div>`;
};

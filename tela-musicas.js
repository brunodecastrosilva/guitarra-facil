/* Músicas vivem dentro da Biblioteca. As antigas playlists por gênero foram substituídas por coleções de intenção
   pedagógica; os dados originais permanecem apenas como fonte e para manter links salvos compatíveis. */
'use strict';
function musicasMinhasHTML() {
  return DB.musicas.length
    ? `<div class="pilha">${ESTADOS_MUSICA.map(([k, l]) => { const M = DB.musicas.filter(m => m.estado === k); return M.length ? `<section class="pilha" style="gap:8px"><h3 class="sub-h">${l}</h3><ul class="musicas">${M.map(m => `<li><button type="button" class="musica" data-musica="${m.id}"><span><b>${esc(m.titulo)}</b>${m.artista ? `<span class="apoio"> · ${esc(m.artista)}</span>` : ''}</span>${I.seta}</button></li>`).join('')}</ul></section>` : ''; }).join('')}</div>`
    : KitFacil.ui.vazio({ titulo: 'Nenhuma música ainda', texto: 'Anote as músicas que você quer aprender ou adicione das playlists. Quando conseguir tocar, marque como <b>Já toco</b>.' });
}
function colecoesDeInspiracao() {
  const vistos = new Set(), faixas = PLAYLISTS.flatMap(pl => pl.musicas.map((m, i) => ({ pid: pl.id, i, t: m[0], a: m[1], por: m[2] }))).filter(x => { const k = x.t + '|' + x.a; if (vistos.has(k)) return false; vistos.add(k); return true; });
  const regras = [
    ['Primeiros repertórios', 'Formas e movimentos claros para começar.', /simples|primeira|duas notas|cordas soltas|lento|espaço|power chord/i],
    ['Ritmo e base', 'Acordes, abafamentos, pausas, acentos e riffs.', /riff|acorde|palm|chug|galope|síncope|pausa|drop|afinação baixa/i],
    ['Expressão e melodia', 'Bends, vibrato, slides e construção de frases.', /bend|vibrato|slide|melodia|solo|frase|harmoniz/i],
    ['Precisão e velocidade', 'Palhetada, ligados, arpejos, tapping e varredura.', /rápid|palhet|tremolo|arpejo|tapping|varredura|sweep|ligado|salto/i],
    ['Ritmo avançado e criação', 'Compassos, grupos rítmicos e ideias para compor.', /compasso|polirrit|grupo ímpar|mudança|disson|contratempo/i],
  ];
  const usados = new Set();
  const C = regras.map(([nome, resumo, re]) => ({ nome, resumo, faixas: faixas.filter((x, i) => !usados.has(i) && re.test(x.por) && (usados.add(i), true)) }));
  const resto = faixas.filter((_, i) => !usados.has(i)); if (resto.length) C.push({ nome: 'Exploração musical', resumo: 'Referências variadas para ouvir, escolher e estudar.', faixas: resto });
  return C.filter(c => c.faixas.length);
}
function musicasInspiracoesHTML() {
  const tem = (t, a) => DB.musicas.some(m => m.titulo === t && m.artista === a);
  return `<div class="pilha">${colecoesDeInspiracao().map((c, ci) => `<details class="cartao playlist" data-kf-secao id="colecao-${ci}"><summary><span class="pl-capa n${ci % 5 + 1}" aria-hidden="true">${I.musicas}</span><span class="nivel-tt"><h2 style="font-size:18px">${esc(c.nome)}</h2><span class="apoio" data-kf-secao-resumo>${c.faixas.length} músicas · ${esc(c.resumo)}</span></span></summary>
      <ol class="faixas">${c.faixas.map(({ pid, i, t, a, por }, j) => `<li><span class="fx-n">${j + 1}</span><span class="fx-t"><b>${esc(t)}</b><span class="apoio">${esc(a)} · ${esc(por)}</span></span><span class="fx-a"><a class="kf-btn kf-sec fx-l" href="${linkYoutube(t, a)}" target="_blank" rel="noopener" aria-label="Ver ${esc(t)} no YouTube">YouTube</a><a class="kf-btn kf-sec fx-l" href="${linkSpotify(t, a)}" target="_blank" rel="noopener" aria-label="Ouvir ${esc(t)} no Spotify">Spotify</a><button type="button" class="kf-btn ${tem(t, a) ? 'kf-sec' : 'kf-pri'} fx-l" data-pl-add="${esc(pid)}|${i}" ${tem(t, a) ? 'disabled' : ''}>${tem(t, a) ? 'Na lista' : 'Quero aprender'}</button></span></li>`).join('')}</ol></details>`).join('')}
    <p class="apoio">As músicas tocam no YouTube ou no Spotify: letras, cifras e gravações têm direitos autorais e não ficam dentro do app.</p></div>`;
}
VIEWS.musicas = () => VIEWS.biblioteca ? VIEWS.biblioteca() : musicasMinhasHTML();
function ligarMusicas() {}
// minutos de cada um dos últimos 7 dias, com a linha da meta

/* ================= janela de música ================= */
/* ================= janela de música ================= */
function janelaMusica(id) {
  const m = id ? DB.musicas.find(x => x.id === id) : null;
  KitFacil.dialogo.abrir({ titulo: m ? 'Editar música' : 'Nova música',
    corpo: `<form id="mu-form" class="pilha" autocomplete="off">
      <div class="campo"><label class="kf-rotulo" for="mu-t">Música</label><input class="kf-entrada" id="mu-t" required value="${esc(m ? m.titulo : '')}" placeholder="Ex.: Smoke on the Water"></div>
      <div class="campo"><label class="kf-rotulo" for="mu-a">Artista <span class="kf-opcional">(opcional)</span></label><input class="kf-entrada" id="mu-a" value="${esc(m ? m.artista : '')}" placeholder="Ex.: Deep Purple"></div>
      <div class="campo"><label class="kf-rotulo" for="mu-e">Situação</label><select id="mu-e">${ESTADOS_MUSICA.map(([k, l]) => `<option value="${k}"${(m ? m.estado : 'quero') === k ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="campo"><label class="kf-rotulo" for="mu-o">Anotações <span class="kf-opcional">(opcional)</span></label><textarea class="kf-entrada" id="mu-o" rows="3" placeholder="Acordes, afinação, link da cifra">${esc(m ? m.obs || '' : '')}</textarea></div>
    </form>`,
    pe: `${m ? '<button type="button" class="kf-btn kf-perigo-sec" data-excluir>Excluir</button>' : ''}<button type="submit" form="mu-form" class="kf-btn kf-pri">Salvar</button>`,
    aoMontar: d => {
      $('#mu-form', d).addEventListener('submit', e => {
        e.preventDefault();
        const titulo = $('#mu-t', d).value.trim(); if (!titulo) { KitFacil.avisar('Escreva o nome da música.'); return; }
        const dados = { titulo, artista: $('#mu-a', d).value.trim(), estado: $('#mu-e', d).value, obs: $('#mu-o', d).value.trim() };
        if (m) Object.assign(m, dados); else DB.musicas.push({ id: uid(), criada: Date.now(), ...dados });
        commit(); KitFacil.dialogo.fechar(true); render(); KitFacil.avisar(m ? 'Música salva.' : 'Música anotada.'); conferirConquistas();
      });
      $('[data-excluir]', d)?.addEventListener('click', () => {
        const k = DB.musicas.indexOf(m); DB.musicas.splice(k, 1); commit(); KitFacil.dialogo.fechar(true); render();
        KitFacil.avisar('Música excluída.', { label: 'Desfazer', run: () => { DB.musicas.splice(k, 0, m); commit(); render(); } });
      });
    } });
}



/* Guitarra Fácil · Músicas: playlists de inspiração e a sua lista */
'use strict';
VIEWS.musicas = () => {
  const sub = subRota(), aba = sub === 'playlists' || PLAYLISTS.some(p => p.id === sub) ? 'playlists' : 'minhas';
  const minhas = DB.musicas.length
    ? `<div class="pilha">${ESTADOS_MUSICA.map(([k, l]) => { const M = DB.musicas.filter(m => m.estado === k); return M.length ? `<section class="pilha" style="gap:8px"><h3 class="sub-h">${l}</h3><ul class="musicas">${M.map(m => `<li><button type="button" class="musica" data-musica="${m.id}"><span><b>${esc(m.titulo)}</b>${m.artista ? `<span class="apoio"> · ${esc(m.artista)}</span>` : ''}</span>${I.seta}</button></li>`).join('')}</ul></section>` : ''; }).join('')}</div>`
    : KitFacil.ui.vazio({ titulo: 'Nenhuma música ainda', texto: 'Anote as músicas que você quer aprender ou adicione das playlists. Quando conseguir tocar, marque como <b>Já toco</b>.' });
  const tem = (t, a) => DB.musicas.some(m => m.titulo === t && m.artista === a);
  const abas = `<div class="kf-seg abas" role="group" aria-label="Mostrar"><button type="button" data-ir="musicas" aria-pressed="${aba === 'minhas'}">Minhas músicas</button><button type="button" data-ir="musicas/playlists" aria-pressed="${aba === 'playlists'}">Playlists</button></div>`;
  if (aba === 'minhas') return KitFacil.ui.cabecalho({ titulo: 'Músicas', sub: 'As músicas que você quer aprender e as que já toca.', criar: { rotulo: 'Nova música', attrs: 'data-musica-nova' } }) + abas + minhas;
  return KitFacil.ui.cabecalho({ titulo: 'Músicas', sub: 'Playlists recomendadas, da mais fácil à mais difícil.' }) + abas
    + `<div class="pilha">
    ${PLAYLISTS.map(pl => `<details class="cartao playlist" data-kf-secao id="${pl.id}"${sub === pl.id ? ' open' : ''}><summary><span class="pl-capa n${pl.nivel}" aria-hidden="true">${I.musicas}</span><span class="nivel-tt"><h2 style="font-size:18px">${esc(pl.nome)}</h2><span class="apoio" data-kf-secao-resumo>${pl.musicas.length} músicas · ${esc(pl.resumo)}</span></span></summary>
      <ol class="faixas">${pl.musicas.map(([t, a, por], i) => `<li><span class="fx-n">${i + 1}</span><span class="fx-t"><b>${esc(t)}</b><span class="apoio">${esc(a)} · ${esc(por)}</span></span><span class="fx-a"><a class="kf-btn kf-sec fx-l" href="${linkYoutube(t, a)}" target="_blank" rel="noopener" aria-label="Ver ${esc(t)} no YouTube">YouTube</a><a class="kf-btn kf-sec fx-l" href="${linkSpotify(t, a)}" target="_blank" rel="noopener" aria-label="Ouvir ${esc(t)} no Spotify">Spotify</a><button type="button" class="kf-btn ${tem(t, a) ? 'kf-sec' : 'kf-pri'} fx-l" data-pl-add="${esc(pl.id)}|${i}" ${tem(t, a) ? 'disabled' : ''}>${tem(t, a) ? 'Na lista' : 'Quero aprender'}</button></span></li>`).join('')}</ol></details>`).join('')}
    <p class="apoio">As músicas tocam no YouTube ou no Spotify: letras, cifras e gravações têm direitos autorais e não ficam dentro do app.</p></div>`;
};
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



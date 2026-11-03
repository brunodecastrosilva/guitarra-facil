// Guitarra Fácil · uso sem internet (modelo do Projeto Integrador).
// Arquivos do app: busca a versão nova primeiro e usa a guardada se estiver sem internet.
// Fontes têm versão fixa: usa a guardada.
// O cache leva a versão do app (package.json); cada app só apaga as próprias cópias antigas.
const CACHE = 'guitarra-facil-0.21.0';
const APP = ['./palco-fogo.js', './sons/fogo.mp3', './palco-fx.js', './assets/menu-treinos.png', './assets/menu-explorar.png', './assets/menu-estudio.png', './assets/menu-biblioteca.png', './assets/fogo-esquerda.png', './assets/fogo-direita.png', './assets/amplificador.png', './assets/palco.png', './assets/backstage.png', './assets/tecnicas.png', './tecnicas.js', './direcao-arte.css', './', './index.html', './comum/kit-facil.js', './comum/kit-facil.css', './base.js', './teoria.js', './catalogo.js', './metal.js', './caminho.js', './exercicios.js', './som.js', './pratica.js', './musicas.js', './dados.js', './plano.js', './sessao.js', './evolucao.js', './tela-inicio.js', './tela-treinos.js', './ferramentas.js', './tela-musicas.js', './tela-progresso.js', './tela-teoria.js', './laboratorio.js', './estudio.js', './biblioteca.js', './janela-treino.js', './app.js', './manifest.webmanifest', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/favicon-32.png'];
// sons: guitarra limpa (uma nota por arquivo) e bateria; não mudam entre versões, então vêm primeiro da cópia guardada
const SONS = [...Array.from({ length: 64 }, (_, i) => `./sons/guitarra/${28 + i}.mp3`), ...Array.from({ length: 32 }, (_, i) => `./sons/baixo/${21 + i}.mp3`), ...Array.from({ length: 27 }, (_, i) => `./sons/fundo/${45 + i}.mp3`), ...['bumbo', 'caixa', 'chimbal', 'chimbal-aberto', 'prato', 'conducao', 'tom-agudo', 'tom-grave', 'metronomo', 'metronomo-forte'].map(p => `./sons/bateria/${p}.mp3`)];
const LIBS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP).then(() => c.addAll(SONS).catch(() => {}))).then(() => self.skipWaiting()));
});
// os apps dividem o mesmo endereço (github.io): cada um só apaga as próprias cópias antigas
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('guitarra-facil-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (!url.pathname.startsWith(new URL('./', self.registration.scope).pathname)) return;
    if (url.pathname.includes('/sons/')) {
      e.respondWith(caches.match(req, { cacheName: CACHE }).then(hit => hit || fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })));
      return;
    }
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true, cacheName: CACHE }).then(r => r || caches.match('./index.html', { cacheName: CACHE }))));
  } else if (LIBS.includes(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
  }
  // o resto (API do GitHub da sincronização, envio de avaliações) passa direto pela rede
});

// Guitarra Fácil · uso sem internet (modelo do Projeto Integrador).
// Arquivos do app: busca a versão nova primeiro e usa a guardada se estiver sem internet.
// Sons (sons/): ficam guardados depois da primeira vez que tocam.
// Bibliotecas e fontes têm versão fixa: usa a guardada.
// O cache leva a versão do app (package.json); cada app só apaga as próprias cópias antigas,
// porque os apps do projeto dividem o mesmo endereço (github.io).
const CACHE = 'guitarra-facil-0.3.0';
const APP = ['./', './index.html', './estilo.css', './base.js', './teoria.js', './formas.js', './som.js', './tocador.js', './braco.js', './exercicios.js', './biblioteca.js', './dados.js', './telas.js', './treino.js', './explorar.js', './estudio.js', './ferramentas.js', './guia.js', './app.js', './comum/kit-facil.js', './comum/kit-facil.css', './manifest.webmanifest', './icons/apple-touch-icon.png', './icons/icon-192.png', './sons/bateria/metronomo.mp3', './sons/bateria/metronomo-forte.mp3'];
const LIBS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('guitarra-facil-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isLib = LIBS.includes(url.hostname) || (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/'));
  if (url.origin === location.origin) {
    // só responde pelo que é deste app (os outros apps do mesmo endereço têm o próprio service worker)
    const base = new URL('./', self.registration.scope).pathname;
    if (!url.pathname.startsWith(base)) return;
    if (url.pathname.startsWith(base + 'sons/')) {
      // gravações não mudam: a guardada vale; sem ela, busca e guarda
      e.respondWith(caches.match(req, { cacheName: CACHE }).then(hit => hit || fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })));
      return;
    }
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => { // confere com o servidor: nunca junta arquivo novo com antigo
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true, cacheName: CACHE }).then(r => r || caches.match('./index.html', { cacheName: CACHE }))));
  } else if (isLib) {
    e.respondWith(caches.match(req, { cacheName: CACHE }).then(hit => (hit && hit.type !== 'opaque') ? hit : fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
  }
  // o resto (API do GitHub da sincronização, envio de avaliações) passa direto pela rede
});

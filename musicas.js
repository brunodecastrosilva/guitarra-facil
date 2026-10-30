/* Guitarra Fácil · playlists recomendadas por nível. Só título, artista e o motivo da escolha: as músicas tocam no
   YouTube ou no Spotify (links de busca), fora do app, porque letras, cifras e gravações têm direitos autorais. */
'use strict';
const PLAYLISTS = [
  { id: 'pl-1', nivel: 1, nome: 'Primeiros acordes', resumo: 'Poucos acordes abertos e ritmo tranquilo.', musicas: [
    ['Knockin\' on Heaven\'s Door', 'Bob Dylan', 'Sol, Ré, Lá menor e Dó: quatro acordes do começo ao fim.'],
    ['A Horse with No Name', 'America', 'Dois acordes e uma levada simples.'],
    ['Stand by Me', 'Ben E. King', 'A sequência clássica dos anos 50.'],
    ['Wonderwall', 'Oasis', 'Treina a levada e a troca rápida de acordes.'],
    ['Tempo Perdido', 'Legião Urbana', 'Acordes abertos e levada constante.'],
    ['Pais e Filhos', 'Legião Urbana', 'Boa para treinar troca de acorde no tempo.'],
    ['Epitáfio', 'Titãs', 'Andamento calmo e acordes conhecidos.'],
  ] },
  { id: 'pl-2', nivel: 2, nome: 'Primeiros riffs', resumo: 'Riffs de uma corda e power chords.', musicas: [
    ['Smoke on the Water', 'Deep Purple', 'O riff mais famoso para começar: power chords de duas cordas.'],
    ['Seven Nation Army', 'The White Stripes', 'Riff numa corda só.'],
    ['Smells Like Teen Spirit', 'Nirvana', 'Power chords com abafado.'],
    ['Come As You Are', 'Nirvana', 'Riff com cordas soltas.'],
    ['Iron Man', 'Black Sabbath', 'Power chords lentos e pesados.'],
    ['Sunshine of Your Love', 'Cream', 'Riff de blues-rock com pentatônica.'],
    ['Que País É Este', 'Legião Urbana', 'Power chords diretos, punk.'],
    ['Polícia', 'Titãs', 'Power chords com ritmo forte.'],
  ] },
  { id: 'pl-3', nivel: 3, nome: 'Rock clássico', resumo: 'Ritmo, abafado e as primeiras frases.', musicas: [
    ['Back in Black', 'AC/DC', 'Riff com acordes e pausas: precisão rítmica.'],
    ['Highway to Hell', 'AC/DC', 'Acordes abertos com pegada de rock.'],
    ['Sweet Home Alabama', 'Lynyrd Skynyrd', 'Acordes dedilhados e pequenos licks.'],
    ['Paranoid', 'Black Sabbath', 'Power chords rápidos com palhetada para baixo.'],
    ['Should I Stay or Should I Go', 'The Clash', 'Riff simples e enérgico.'],
    ['Lanterna dos Afogados', 'Os Paralamas do Sucesso', 'Levada e acordes com pestana.'],
    ['Toda Forma de Poder', 'Engenheiros do Hawaii', 'Rock nacional com riff marcante.'],
  ] },
  { id: 'pl-4', nivel: 4, nome: 'Blues e primeiros solos', resumo: 'Pentatônica, bends e vibrato.', musicas: [
    ['The Thrill Is Gone', 'B.B. King', 'Aula de bend e vibrato.'],
    ['Pride and Joy', 'Stevie Ray Vaughan', 'Shuffle de blues em Mi.'],
    ['Sweet Home Chicago', 'Robert Johnson', 'O blues de 12 compassos.'],
    ['Black Magic Woman', 'Santana', 'Solo melódico na pentatônica menor.'],
    ['Sultans of Swing', 'Dire Straits', 'Frases limpas e dinâmicas.'],
    ['Comfortably Numb', 'Pink Floyd', 'Solo lento, perfeito para bend afinado.'],
    ['Hotel California', 'Eagles', 'Arpejos e solo em duas guitarras.'],
  ] },
  { id: 'pl-5', nivel: 5, nome: 'Desafios', resumo: 'Técnica avançada para metas de longo prazo.', musicas: [
    ['Sweet Child O\' Mine', 'Guns N\' Roses', 'Riff de arpejo com palhetada alternada.'],
    ['Stairway to Heaven', 'Led Zeppelin', 'Dedilhado, acordes e um dos solos mais famosos.'],
    ['Little Wing', 'Jimi Hendrix', 'Acordes ornamentados no estilo Hendrix.'],
    ['Crazy Train', 'Ozzy Osbourne', 'Riff e solo de alta precisão.'],
    ['Master of Puppets', 'Metallica', 'Palhetada para baixo em alta velocidade.'],
    ['Cliffs of Dover', 'Eric Johnson', 'Legato, saltos de corda e muita técnica.'],
  ] },
];
const linkYoutube = (t, a) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${t} ${a} aula de guitarra`);
const linkSpotify = (t, a) => 'https://open.spotify.com/search/' + encodeURIComponent(`${t} ${a}`);

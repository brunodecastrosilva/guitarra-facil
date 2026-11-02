/* Guitarra Fácil · playlists de inspiração, uma por estilo de rock e metal. Só título, artista e o que ouvir em cada
   música: elas tocam no YouTube ou no Spotify (links de busca), fora do app, porque letras, cifras, tablaturas e
   gravações têm direitos autorais. Os treinos do app são originais e só seguem o estilo. */
'use strict';
const PLAYLISTS = [
  ['hard-rock', 'Hard rock', 'Power chords, riffs de pentatônica e bends.', [
    ['Back in Black', 'AC/DC', 'Riff de power chords com respiro entre os acordes.'], ['Whole Lotta Love', 'Led Zeppelin', 'Riff de uma corda com bend e corda solta.'],
    ['Sweet Child O\' Mine', 'Guns N\' Roses', 'Arpejo com pulo de corda na introdução.'], ['Ain\'t Talkin\' \'bout Love', 'Van Halen', 'Acordes arpejados e palhetada firme.'],
    ['Highway Star', 'Deep Purple', 'Solo neoclássico em colcheias e semicolcheias.']]],
  ['punk', 'Punk e hardcore', 'Palhetada para baixo e trocas rápidas de acorde.', [
    ['Blitzkrieg Bop', 'Ramones', 'Power chords em colcheias, só para baixo.'], ['Last Caress', 'Misfits', 'Trocas rápidas de power chord.'],
    ['American Jesus', 'Bad Religion', 'Palhetada alternada nos acordes.'], ['Holiday', 'Green Day', 'Palm mute e acordes abertos nos refrões.'],
    ['Should I Stay or Should I Go', 'The Clash', 'Acordes com pausas bem marcadas.']]],
  ['heavy', 'Heavy metal clássico', 'Galopes, terças harmonizadas e riffs de pedal.', [
    ['The Trooper', 'Iron Maiden', 'O galope e as duas guitarras em terças.'], ['Breaking the Law', 'Judas Priest', 'Riff simples, curto e certeiro.'],
    ['Paranoid', 'Black Sabbath', 'Palhetada para baixo em power chords.'], ['Holy Diver', 'Dio', 'Riff com corda solta de pedal.'],
    ['Ace of Spades', 'Motörhead', 'Acordes abertos e velocidade.']]],
  ['thrash', 'Thrash metal', 'Palhetada para baixo, palm mute e frígio.', [
    ['Master of Puppets', 'Metallica', 'Resistência de palhetada para baixo.'], ['Raining Blood', 'Slayer', 'Cromatismo e tremolo picking.'],
    ['Holy Wars... The Punishment Due', 'Megadeth', 'Riffs em compassos que mudam.'], ['Caught in a Mosh', 'Anthrax', 'Palm mute em semicolcheias.'],
    ['Arise', 'Sepultura', 'Galope rápido e acentos.']]],
  ['power', 'Speed e power metal', 'Galopes, menor harmônica e solos melódicos.', [
    ['I Want Out', 'Helloween', 'Galope com acordes e melodia junto.'], ['Through the Fire and Flames', 'DragonForce', 'Palhetada alternada e tapping extremos.'],
    ['Carry On', 'Angra', 'Escalas neoclássicas e harmonias.'], ['Valhalla', 'Blind Guardian', 'Riffs melódicos em colcheias.'],
    ['Painkiller', 'Judas Priest', 'Velocidade e solo com alavanca.']]],
  ['groove', 'Groove metal', 'Síncope, pinch harmonic e bends no grave.', [
    ['Walk', 'Pantera', 'Síncope com espaço entre as notas.'], ['Cowboys from Hell', 'Pantera', 'Riff em corda solta e pinch.'],
    ['Laid to Rest', 'Lamb of God', 'Drop D, palm mute e acentos.'], ['Davidian', 'Machine Head', 'Chugs graves e pinch harmonics.'],
    ['Roots Bloody Roots', 'Sepultura', 'Afinação baixa e riff de duas notas.']]],
  ['death', 'Death metal', 'Tremolo picking, cromatismo e varredura.', [
    ['Crystal Mountain', 'Death', 'Riffs técnicos com mudanças de tempo.'], ['Hammer Smashed Face', 'Cannibal Corpse', 'Tremolo picking e palm mute.'],
    ['Chapel of Ghouls', 'Morbid Angel', 'Cromatismo e solos com alavanca.'], ['Slowly We Rot', 'Obituary', 'Riffs lentos e pesados.'],
    ['Symbolic', 'Death', 'Melodia em tremolo e solos.']]],
  ['melodeath', 'Death melódico', 'Melodias em tremolo e menor harmônica.', [
    ['Only for the Weak', 'In Flames', 'Melodia de guitarra sobre os acordes.'], ['Blinded by Fear', 'At the Gates', 'Tremolo melódico e galope.'],
    ['Nemesis', 'Arch Enemy', 'Riffs harmonizados e solo melódico.'], ['ThereIn', 'Dark Tranquillity', 'Arpejos e melodia.'],
    ['Twilight of the Thunder God', 'Amon Amarth', 'Melodia em terças sobre palm mute.']]],
  ['black', 'Black metal', 'Tremolo em acordes e dissonância.', [
    ['Freezing Moon', 'Mayhem', 'Acordes em tremolo e clima sombrio.'], ['I Am the Black Wizards', 'Emperor', 'Tremolo picking em acordes.'],
    ['Where Dead Angels Lie', 'Dissection', 'Arpejos e melodia.'], ['All Shall Fall', 'Immortal', 'Riffs épicos em tremolo.'],
    ['Transilvanian Hunger', 'Darkthrone', 'Tremolo contínuo e acordes abertos.']]],
  ['doom', 'Doom e stoner', 'Notas longas, bends largos e afinação baixa.', [
    ['Black Sabbath', 'Black Sabbath', 'O trítono, lento e pesado.'], ['Solitude', 'Candlemass', 'Acordes longos e vibrato.'],
    ['Funeralopolis', 'Electric Wizard', 'Riff lento e grave.'], ['Dragonaut', 'Sleep', 'Riff com bends e repetição.'],
    ['Green Machine', 'Kyuss', 'Afinação baixa e riff de pentatônica.']]],
  ['metalcore', 'Metalcore', 'Chugs, breakdowns e melodias em oitavas.', [
    ['My Curse', 'Killswitch Engage', 'Melodia de oitavas sobre chugs.'], ['Nothing Left', 'As I Lay Dying', 'Galope e breakdown.'],
    ['Pull Harder on the Strings of Your Martyr', 'Trivium', 'Riffs rápidos e solos harmonizados.'], ['Tears Don\'t Fall', 'Bullet for My Valentine', 'Palhetada alternada e solo.'],
    ['Carrion', 'Parkway Drive', 'Breakdown com pausas.'], ['Doomsday', 'Architects', 'Drop tuning e síncope.']]],
  ['deathcore', 'Deathcore', 'Breakdowns muito graves e dissonância.', [
    ['This Is Exile', 'Whitechapel', 'Três guitarras graves e breakdown.'], ['You Only Live Once', 'Suicide Silence', 'Chugs e síncope.'],
    ['To the Hellfire', 'Lorna Shore', 'Tremolo e breakdowns lentos.'], ['Reign of Darkness', 'Thy Art Is Murder', 'Riffs graves e rápidos.']]],
  ['nu', 'Nu metal', 'Drop D, notas mortas, harmônicos e síncope.', [
    ['Freak on a Leash', 'Korn', 'Sete cordas, harmônicos e notas mortas.'], ['Duality', 'Slipknot', 'Riff grave com acentos.'],
    ['My Own Summer (Shove It)', 'Deftones', 'Riff de duas notas em afinação baixa.'], ['Chop Suey!', 'System of a Down', 'Palhetada rápida e mudanças bruscas.'],
    ['One Step Closer', 'Linkin Park', 'Drop D e power chords.'], ['Break Stuff', 'Limp Bizkit', 'Riff simples e pesado.']]],
  ['djent', 'Djent e prog moderno', 'Polirritmia, chugs e sete cordas.', [
    ['Bleed', 'Meshuggah', 'Grupo ímpar sobre o 4/4, pé no chão.'], ['Icarus Lives!', 'Periphery', 'Chugs sincopados e limpos.'],
    ['Concealing Fate', 'Tesseract', 'Polirritmia e acordes abertos.'], ['CAFO', 'Animals as Leaders', 'Tapping, palhetada híbrida e oito cordas.']]],
  ['prog', 'Progressivo', 'Compassos ímpares, arpejos e pulos de corda.', [
    ['Pull Me Under', 'Dream Theater', 'Riffs em compassos que mudam.'], ['Ghost of Perdition', 'Opeth', 'Do pesado ao acústico.'],
    ['Schism', 'Tool', 'Compassos ímpares encadeados.'], ['Sea of Lies', 'Symphony X', 'Neoclássico e varredura.'],
    ['YYZ', 'Rush', 'Compasso ímpar e uníssonos.']]],
  ['grunge', 'Grunge e alternativo', 'Drop D, slides e bends.', [
    ['Smells Like Teen Spirit', 'Nirvana', 'Power chords com notas mortas.'], ['Would?', 'Alice in Chains', 'Riff com bends e clima.'],
    ['Outshined', 'Soundgarden', 'Drop D e riff pesado.'], ['Alive', 'Pearl Jam', 'Solo melódico com bends.'],
    ['Plush', 'Stone Temple Pilots', 'Acordes com notas soltas.']]],
  ['shred', 'Shred e neoclássico', 'Varredura, pedal e menor harmônica.', [
    ['Far Beyond the Sun', 'Yngwie Malmsteen', 'Pedal e menor harmônica.'], ['Altitudes', 'Jason Becker', 'Varredura e arpejos.'],
    ['Technical Difficulties', 'Racer X', 'Pulos de corda e palhetada.'], ['Tornado of Souls', 'Megadeth', 'Solo de Marty Friedman.'],
    ['Surfing with the Alien', 'Joe Satriani', 'Legato, tapping e alavanca.']]],
].map(([id, nome, resumo, musicas], i) => ({ id: 'pl-' + id, estilo: id, nivel: i % 5 + 1, nome, resumo, musicas }));
const linkYoutube = (t, a) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${t} ${a} guitar`);
const linkSpotify = (t, a) => 'https://open.spotify.com/search/' + encodeURIComponent(`${t} ${a}`);

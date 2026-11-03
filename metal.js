/* Guitarra Fácil · riffs, solos e treinos de técnica de rock e metal, gerados aqui no app.
   Cada treino nasce de uma semente (estilo, nível, tamanho, número): sai sempre igual, e cada nível tem os seus.
   Os riffs juntam células de ritmo (galope, síncope, quiálteras, pausas) com texturas (palm mute, power chord, oitava,
   nota morta, pinch, harmônico, tremolo); os solos juntam células de frase (bend, ligado, tapping, varredura, pulo de
   corda, pedal, trinado, alavanca) numa posição da escala. Tudo é original do app: as bandas citadas são só a
   referência de estilo, nenhum riff ou solo delas é reproduzido. */
'use strict';
const semente = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
function sorteio(seed) {
  let a = seed >>> 0;
  const f = () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  return { f, i: n => Math.floor(f() * n), um: v => v[Math.floor(f() * v.length)], p: x => f() < x,
    peso: o => { const ks = Object.keys(o).filter(k => o[k] > 0), tot = ks.reduce((s, k) => s + o[k], 0); let r = f() * tot; for (const k of ks) { r -= o[k]; if (r < 0) return k; } return ks[ks.length - 1]; } };
}

/* ================= estilos =================
   afin: afinação de cada nível; esc: escalas dos riffs; solo: escalas dos solos; metros: compassos por nível
   ([pulsos, duração do pulso em batidas]); tex: pesos das texturas do riff; sus: o que as notas entre os acentos fazem
   (chug = corda solta abafada, repetir = tremolo, segurar = nota longa, arpejo = acorde quebrado); dens: quantos
   acentos com nota ou acorde; cel: células de ritmo preferidas; frase: pesos das células de solo; bpm: andamento. */
const M44 = [4, 1], M34 = [3, 1], M68 = [6, .5], M78 = [7, .5], M54 = [5, 1], M98 = [9, .5], M74 = [7, 1], M58 = [5, .5];
const ESTILOS = [
  { id: 'hard-rock', nome: 'Hard rock', inspira: 'AC/DC, Led Zeppelin, Guns N\' Roses, Van Halen, Deep Purple', afin: ['padrao', 'padrao', 'meio'],
    esc: ['penta-menor', 'blues', 'mixolidio'], solo: ['penta-menor', 'blues', 'mixolidio'], metros: [[M44], [M44, M68], [M44, M68, M78]], sus: 'segurar', dens: .55, bpm: 120,
    tex: { pc: 5, nota: 2, ds: 3, chug: 1, slide: 1 }, cel: { 'x-': 3, 'x---': 2, 'q': 2, '.x-x': 1 }, frase: { bend: 4, ds: 3, vib: 2, run: 2, hp: 2, slide: 2, trill: 1, tap: 1 } },
  { id: 'punk', nome: 'Punk e hardcore', inspira: 'Ramones, Misfits, Bad Religion, Black Flag, Dead Kennedys', afin: ['padrao', 'padrao', 'meio'],
    esc: ['menor', 'mixolidio', 'penta-menor'], solo: ['penta-menor', 'blues', 'menor'], metros: [[M44], [M44], [M44, M34]], sus: 'repetir', dens: .4, bpm: 170,
    tex: { pc: 8, nota: 1, oit: 1 }, cel: { 'x-': 3, 'xx': 2, 'x-xx': 1, 'xxxx': 1 }, frase: { run: 3, ds: 2, bend: 2, trem: 2, vib: 1 } },
  { id: 'heavy', nome: 'Heavy metal clássico', inspira: 'Iron Maiden, Judas Priest, Black Sabbath, Dio, Motörhead', afin: ['padrao', 'padrao', 'meio'],
    esc: ['menor', 'penta-menor', 'frigio'], solo: ['menor', 'penta-menor', 'menor-harmonica'], metros: [[M44], [M44, M68], [M44, M68, M78]], sus: 'chug', dens: .45, bpm: 130,
    tex: { pc: 4, nota: 4, chug: 3, oit: 1 }, cel: { 'x-xx': 4, 'x-': 2, 'xx-x': 1 }, frase: { run: 3, bend: 3, grupo: 2, trill: 2, vib: 2, tap: 1, skip: 1 } },
  { id: 'thrash', nome: 'Thrash metal', inspira: 'Metallica, Slayer, Megadeth, Anthrax, Testament, Sepultura', afin: ['padrao', 'padrao', 'meio'],
    esc: ['frigio', 'menor', 'locrio'], solo: ['menor', 'frigio', 'menor-harmonica', 'penta-menor'], metros: [[M44], [M44, M34], [M44, M78, M54]], sus: 'chug', dens: .35, bpm: 150,
    tex: { chug: 6, nota: 4, pc: 4, diss: 1 }, cel: { 'xxxx': 3, 'x-xx': 2, 'xx-x': 1, 'x-': 1 }, frase: { trem: 3, run: 3, dive: 2, bend: 2, grupo: 2, pinch: 1, sweep: 1 } },
  { id: 'power', nome: 'Speed e power metal', inspira: 'Helloween, Blind Guardian, DragonForce, Angra, Stratovarius', afin: ['padrao', 'padrao', 'padrao'],
    esc: ['menor', 'menor-harmonica', 'maior'], solo: ['menor-harmonica', 'menor', 'maior'], metros: [[M44], [M44, M34], [M44, M78]], sus: 'chug', dens: .5, bpm: 160,
    tex: { pc: 5, chug: 4, nota: 2, oit: 2 }, cel: { 'x-xx': 4, 'xxxx': 2, 'x-': 1 }, frase: { run: 3, grupo: 3, sweep: 2, tap: 1, pedal: 1, trill: 1, bend: 1 } },
  { id: 'groove', nome: 'Groove metal', inspira: 'Pantera, Lamb of God, Machine Head, Sepultura (Chaos A.D.)', afin: ['drop-d', 'drop-d', 'drop-c'],
    esc: ['blues', 'frigio', 'penta-menor'], solo: ['blues', 'penta-menor', 'frigio'], metros: [[M44], [M44, M34], [M44, M78, M54]], sus: 'chug', dens: .45, bpm: 110,
    tex: { chug: 5, pc: 3, nota: 3, pinch: 3, bend: 2, x: 1, slide: 1 }, cel: { 'x.xx': 2, '.xx-': 2, 'x--': 2, 'xx.': 1, 'x-x': 1 }, frase: { pinch: 3, bend: 3, dive: 2, trem: 1, run: 2, grupo: 1, vib: 2 } },
  { id: 'death', nome: 'Death metal', inspira: 'Death, Morbid Angel, Cannibal Corpse, Obituary, Nile', afin: ['padrao', 'meio', 'drop-b'],
    esc: ['frigio', 'cromatica', 'diminuta', 'locrio'], solo: ['frigio', 'diminuta', 'menor-harmonica'], metros: [[M44], [M44, M34], [M44, M78, M54]], sus: 'repetir', dens: .5, bpm: 140,
    tex: { nota: 5, pc: 3, diss: 2, chug: 1 }, cel: { 'xxxx': 4, 'x-xx': 1, 'S': 1 }, frase: { trem: 3, sweep: 3, run: 2, dive: 2, pedal: 1, tap: 1 } },
  { id: 'melodeath', nome: 'Death melódico', inspira: 'In Flames, At the Gates, Arch Enemy, Dark Tranquillity, Amon Amarth', afin: ['padrao', 'drop-c', 'drop-c'],
    esc: ['menor', 'menor-harmonica', 'frigio'], solo: ['menor-harmonica', 'menor'], metros: [[M44], [M44, M34], [M44, M78]], sus: 'repetir', dens: .55, bpm: 150,
    tex: { nota: 4, oit: 3, pc: 3, chug: 2 }, cel: { 'xxxx': 3, 'x-xx': 2, 'x-': 1 }, frase: { trem: 3, run: 3, grupo: 2, sweep: 2, bend: 1, vib: 1 } },
  { id: 'black', nome: 'Black metal', inspira: 'Mayhem, Emperor, Dissection, Immortal, Darkthrone', afin: ['padrao', 'padrao', 'meio'],
    esc: ['menor', 'frigio', 'menor-harmonica'], solo: ['menor', 'menor-harmonica', 'frigio'], metros: [[M44], [M44, M68], [M44, M68, M78]], sus: 'repetir', dens: .45, bpm: 160,
    tex: { pc: 4, diss: 3, nota: 3, oit: 2 }, cel: { 'xxxx': 5, 'S': 1, 'xx': 1 }, frase: { trem: 5, run: 2, sweep: 1, vib: 1 } },
  { id: 'doom', nome: 'Doom e stoner', inspira: 'Black Sabbath, Candlemass, Electric Wizard, Sleep, Kyuss', afin: ['drop-d', 'drop-c', 'drop-c'],
    esc: ['blues', 'penta-menor', 'frigio'], solo: ['blues', 'penta-menor'], metros: [[M44], [M44, M68], [M44, M68, M98]], sus: 'segurar', dens: .65, bpm: 70,
    tex: { pc: 6, nota: 3, bend: 2, slide: 2, chug: 1 }, cel: { 'x---': 3, 'x-------': 2, 'x-': 2, 'q': 1 }, frase: { bend: 4, vib: 3, ds: 2, run: 1, slide: 2 } },
  { id: 'metalcore', nome: 'Metalcore', inspira: 'Killswitch Engage, As I Lay Dying, Trivium, Bullet for My Valentine, Parkway Drive, Architects', afin: ['drop-d', 'drop-c', 'drop-b'],
    esc: ['menor', 'menor-harmonica', 'frigio'], solo: ['menor-harmonica', 'menor', 'penta-menor'], metros: [[M44], [M44, M34], [M44, M78, M34]], sus: 'chug', dens: .4, bpm: 140, breakdown: true,
    tex: { chug: 6, pc: 4, oit: 3, pinch: 2, nota: 2, harm: 1 }, cel: { 'xx-x': 2, 'x-xx': 2, 'x.xx': 2, 'xxxx': 2, '.xx-': 1 }, frase: { trem: 2, run: 2, tap: 2, sweep: 2, grupo: 2, pinch: 1, bend: 1 } },
  { id: 'deathcore', nome: 'Deathcore', inspira: 'Whitechapel, Suicide Silence, Lorna Shore, Thy Art Is Murder', afin: ['drop-c', 'drop-b', 'sete-drop-a'],
    esc: ['frigio', 'menor-harmonica', 'cromatica'], solo: ['menor-harmonica', 'frigio', 'diminuta'], metros: [[M44], [M44, M34], [M44, M78, M54]], sus: 'chug', dens: .35, bpm: 130, breakdown: true,
    tex: { chug: 7, pc: 3, diss: 3, pinch: 2, nota: 2, x: 1 }, cel: { 'x..x': 2, 'xx.': 2, 'x.xx': 2, 'S': 1, 'xxxx': 1 }, frase: { trem: 3, sweep: 3, tap: 2, dive: 1, run: 1 } },
  { id: 'nu', nome: 'Nu metal', inspira: 'Korn, Slipknot, Deftones, System of a Down, Linkin Park, Limp Bizkit', afin: ['drop-d', 'drop-c', 'sete'],
    esc: ['frigio', 'cromatica', 'penta-menor'], solo: ['penta-menor', 'blues', 'frigio'], metros: [[M44], [M44, M34], [M44, M78]], sus: 'chug', dens: .4, bpm: 105,
    tex: { chug: 5, pc: 3, nota: 3, x: 3, harm: 2, bend: 2, pinch: 1, slide: 1 }, cel: { 'x.xx': 3, '.xx-': 2, 'x..x': 2, 'xx.x': 1 }, frase: { pinch: 2, bend: 3, harm: 2, dive: 2, trill: 1, vib: 2 } },
  { id: 'djent', nome: 'Djent e prog moderno', inspira: 'Meshuggah, Periphery, Tesseract, Animals as Leaders', afin: ['drop-c', 'sete', 'sete-drop-a'],
    esc: ['frigio', 'lidio', 'menor'], solo: ['lidio', 'menor', 'frigio', 'dorico'], metros: [[M44], [M44, M78], [M44, M78, M54, M58]], sus: 'chug', dens: .3, bpm: 120, poli: true,
    tex: { chug: 7, pc: 2, nota: 3, x: 2, harm: 2, diss: 1 }, cel: { 'x..xx': 2, 'xxx': 2, 'x.x': 2, 'x..': 2, 'xxxxx': 1 }, frase: { tap: 3, leg: 3, hy: 2, skip: 2, quint: 1, harm: 1 } },
  { id: 'prog', nome: 'Progressivo', inspira: 'Dream Theater, Opeth, Symphony X, Tool, Rush', afin: ['padrao', 'padrao', 'drop-d'],
    esc: ['dorico', 'frigio', 'menor-melodica', 'lidio'], solo: ['dorico', 'menor-melodica', 'lidio', 'menor-harmonica'], metros: [[M44, M34], [M44, M78, M54], [M78, M54, M74, M98]], sus: 'arpejo', dens: .5, bpm: 110,
    tex: { pc: 3, arp: 4, nota: 3, chug: 2, oit: 1 }, cel: { 'x-x': 2, 'x--': 2, 'xx': 2, 'xxx': 1 }, frase: { skip: 3, hy: 2, sweep: 2, tap: 2, quint: 2, sept: 1, grupo: 2, leg: 2 } },
  { id: 'grunge', nome: 'Grunge e alternativo', inspira: 'Nirvana, Alice in Chains, Soundgarden, Pearl Jam, Stone Temple Pilots', afin: ['drop-d', 'drop-d', 'meio'],
    esc: ['penta-menor', 'blues', 'frigio'], solo: ['penta-menor', 'blues'], metros: [[M44], [M44, M34], [M44, M78, M74]], sus: 'segurar', dens: .55, bpm: 115,
    tex: { pc: 6, slide: 3, nota: 2, chug: 2, diss: 1, bend: 1 }, cel: { 'x-': 3, 'x--': 2, '.x-x': 2, 'x---': 1 }, frase: { bend: 4, vib: 3, ds: 2, slide: 2, run: 1 } },
  { id: 'shred', nome: 'Shred e neoclássico', inspira: 'Yngwie Malmsteen, Jason Becker, Paul Gilbert, Marty Friedman, Joe Satriani', afin: ['padrao', 'padrao', 'padrao'],
    esc: ['menor-harmonica', 'frigio-dominante', 'menor'], solo: ['menor-harmonica', 'frigio-dominante', 'diminuta', 'menor'], metros: [[M44], [M44, M34], [M44, M34, M78]], sus: 'arpejo', dens: .5, bpm: 120,
    tex: { nota: 4, arp: 3, pc: 2, chug: 2 }, cel: { 'xxxx': 3, 'x-xx': 1, 'T': 1 }, frase: { pedal: 3, sweep: 3, grupo: 3, run: 2, tap: 2, sept: 1, skip: 1, trill: 1 } },
];
const estiloDe = id => ESTILOS.find(e => e.id === id);

/* ================= ritmo =================
   célula = passos de semicolcheia: x toca, - segura, . pausa; T = tercina de semicolcheias (2 passos),
   S = duas fusas (1 passo), F = sextina (4 passos), q = shuffle (longa e curta, 4 passos), Q = tercina de colcheias (4) */
const CEL = {
  1: ['x-', 'x-', 'x---', 'x-x-', 'x.', 'x...', 'x-x.', '.x-x', 'x-------'],
  2: ['x-xx', 'xx-x', 'xxxx', 'x-x', 'x--', 'xx', 'x.xx', '.xx-', 'xx..', 'x..x', 'q', 'Q', 'xx.', 'x.x-'],
  3: ['xxx', 'x.x', 'xxxxx', 'x..xx', 'xx.x.', 'S', 'xS', 'T', 'xT', 'x-T', 'F', 'SxSx', 'x..', 'x....', '.x.x', 'x.xx.'],
};
const PASSOS = c => [...c].reduce((s, ch) => s + ({ T: 2, S: 1, F: 4, q: 4, Q: 4 }[ch] || 1), 0);
function lerCelula(c) {
  const out = [];
  for (const ch of c) {
    if (ch === 'x') out.push([.25, true]);
    else if (ch === '-') { if (out.length) out[out.length - 1][0] += .25; else out.push([.25, false]); }
    else if (ch === '.') { const u = out[out.length - 1]; if (u && !u[1]) u[0] += .25; else out.push([.25, false]); }
    else if (ch === 'T') for (let i = 0; i < 3; i++) out.push([1 / 6, true]);
    else if (ch === 'S') out.push([.125, true], [.125, true]);
    else if (ch === 'F') for (let i = 0; i < 6; i++) out.push([1 / 6, true]);
    else if (ch === 'q') out.push([2 / 3, true], [1 / 3, true]);
    else if (ch === 'Q') for (let i = 0; i < 3; i++) out.push([1 / 3, true]);
  }
  return out;
}
// um compasso de ritmo: células do nível (e as preferidas do estilo) até fechar os passos do compasso
function compassoRitmo(r, nivel, [cn, cp], pref = {}, so = null) {
  const total = Math.round(cn * cp * 4), pool = {};
  (so || [1, 2, 3].filter(n => n <= nivel).flatMap(n => CEL[n])).forEach(c => pool[c] = (pool[c] || 0) + 1);
  Object.entries(pref).forEach(([c, w]) => { if (!so || so.includes(c)) pool[c] = (pool[c] || 0) + w * 2; });
  let resto = total, cels = [], tenta = 0;
  while (resto > 0 && tenta++ < 200) {
    const ok = Object.fromEntries(Object.entries(pool).filter(([c]) => PASSOS(c) <= resto && (cels.length || c[0] !== '.')));
    if (!Object.keys(ok).length) { cels.push(resto % 2 || nivel < 2 ? 'x' + '-'.repeat(resto - 1) : 'x-'.repeat(resto / 2)); break; }
    const c = r.peso(ok); cels.push(c); resto -= PASSOS(c);
  }
  return cels.flatMap(lerCelula);
}
// breakdown: meio tempo, pausas, golpes graves; no avançado, um grupo ímpar que atravessa o compasso
function compassoBreakdown(r, nivel, [cn, cp]) {
  const total = Math.round(cn * cp * 4);
  if (nivel >= 3 && r.p(.6)) { const g = r.um(['x..', 'x.x..', 'x..x.', 'xx.']); let s = ''; while (s.length < total) s += g; return lerCelula(s.slice(0, total)); }
  return compassoRitmo(r, Math.min(nivel, 2), [cn, cp], {}, ['x...', 'x..x', '..x.', 'x.x.', 'x---', 'xx..', '.x..', 'x-..', ...(nivel >= 2 ? ['x.xx', 'xx.x', '.xx.'] : [])]);
}

/* ================= vozes do riff (por altura: funciona em qualquer afinação) ================= */
const casaEm = (A, s, m) => m - A[s];
function lugar(A, m, cordas = [0, 1, 2], max = 12) { for (const s of cordas) { const k = m - A[s]; if (k >= 0 && k <= max) return [s, k]; } const s = cordas[cordas.length - 1]; return [s, Math.max(0, m - A[s])]; }
function voz(tipo, A, P) { const v = vozBruta(tipo, A, P); return v.every(([s, k]) => s < A.length && k >= 0 && k <= 22) ? v : [lugar(A, P, [0, 1], 12)]; }
function vozBruta(tipo, A, P) { // P = altura (MIDI) da fundamental
  const raiz = lugar(A, P, [0, 1], 12), [s, k] = raiz;
  if (tipo === 'pc' || tipo === 'slide') return [raiz, [s + 1, casaEm(A, s + 1, P + 7)]];
  if (tipo === 'pc3') return [raiz, [s + 1, casaEm(A, s + 1, P + 7)], [s + 2, casaEm(A, s + 2, P + 12)]];
  if (tipo === 'diss') return [raiz, [s + 1, casaEm(A, s + 1, P + 6)]];
  if (tipo === 'oit') { const q = lugar(A, P + 12, [2, 3, 1], 12); return [q, [q[0] + 2, casaEm(A, q[0] + 2, P + 24)]]; }
  if (tipo === 'ds') { const q = lugar(A, P + 12, [3, 2], 12); return [q, [q[0] + 1, casaEm(A, q[0] + 1, P + 17)]]; }
  if (tipo === 'pinch') return [lugar(A, P + 12, [1, 2], 12)];
  return [raiz];
}

/* ================= riff =================
   motivo: 2 a 6 notas da escala; os acentos do ritmo recebem o motivo, o resto faz a textura do estilo (chug, tremolo,
   nota longa ou acorde quebrado). As partes repetem com variação: A, A', B, B', breakdown, solo. */
function gerarRiff(o) {
  const { r, nivel, est, compassos } = o, A = afinacaoDe(o.afin)[2], tonica = A[0];
  const escala = o.escala || r.um(est.esc), iv = ESCALAS.find(e => e[0] === escala)[2];
  const metro = o.metro || r.um(est.metros[nivel - 1]);
  const texPeso = { ...est.tex, ...(o.tex || {}) }; if (nivel < 2) ['pinch', 'harm', 'x', 'bend', 'diss', 'arp'].forEach(k => delete texPeso[k]); if (nivel < 3) delete texPeso.diss;
  const cel = o.cel || est.cel, sus = o.sus || est.sus, dens = o.dens || est.dens;
  const graus = iv.filter(i => i > 0).concat(nivel >= 2 ? [12] : []);
  const novoMotivo = n => Array.from({ length: n }, () => ({ g: r.um(graus), tipo: r.peso(texPeso) }));
  const tamMot = [0, 2 + r.i(2), 3 + r.i(2), 4 + r.i(3)][nivel];
  const fazCompasso = (ritmo, motivo, varia, ultimo) => {
    const evs = []; let m = 0, atual = null, arpI = 0;
    ritmo.forEach(([d, toca], i) => {
      if (!toca) { evs.push(ev(d, [])); atual = sus === 'repetir' ? atual : null; return; }
      const acento = i === 0 || !ritmo[i - 1][1] || r.p(dens) || (sus !== 'chug' && atual == null);
      if (acento) {
        let mv = motivo[m % motivo.length]; m++;
        if (varia && m > motivo.length - 1 && r.p(.7)) mv = { g: r.um(graus), tipo: mv.tipo };
        let tipo = mv.tipo === 'chug' ? 'pc' : mv.tipo, P = tonica + mv.g;
        let n = voz(tipo === 'bend' || tipo === 'x' ? 'nota' : tipo === 'pc' && nivel >= 2 && r.p(.3) ? 'pc3' : tipo, A, P), t = '';
        if (tipo === 'harm') { n = [[r.i(2), r.um([12, 7, 5])]]; t = 'harm'; }
        if (tipo === 'pinch') t = 'pinch v';
        if (tipo === 'bend') t = 'b2';
        if (tipo === 'x') { n = [[r.i(3), Math.min(12, mv.g)]]; t = 'x'; }
        if (tipo === 'slide') t = 's';
        atual = { n, t: t.replace(/pinch v|b2|harm|x/, '') }; arpI = 0;
        evs.push(ev(d, n, t));
      } else if (sus === 'chug' || !atual) {
        const pcChug = nivel >= 2 && o.afinFam === 'drop' && r.p(.25);
        evs.push(ev(d, pcChug ? [[0, 0], [1, 0]] : [[0, 0]], 'pm'));
      } else if (sus === 'segurar') { const u = evs[evs.length - 1]; if (u && u.n.length) u.d += d; else evs.push(ev(d, atual.n, atual.t)); }
      else if (sus === 'arpejo') { arpI++; const no = atual.n.length > 1 ? [atual.n[arpI % atual.n.length]] : [lugar(A, A[atual.n[0][0]] + atual.n[0][1] + [0, 7, 12, 15][arpI % 4], [1, 2, 3])]; evs.push(ev(d, no)); }
      else evs.push(ev(d, atual.n, atual.t)); // repetir: tremolo picking
    });
    if (ultimo && nivel >= 2) { // fim de parte: pinch, slide ou alavanca no último som
      const u = [...evs].reverse().find(e => e.n.length);
      if (u && !u.t) u.t = r.um(nivel >= 3 ? ['pinch v', 'v', 'dive'] : ['v', 'pinch v']);
    }
    return evs;
  };
  const ritmoDe = brk => brk ? compassoBreakdown(r, nivel, metro) : compassoRitmo(r, nivel, metro, cel, o.so);
  const parte = (n, brk, mot) => { const rit = ritmoDe(brk), motivo = mot || novoMotivo(tamMot); const out = []; for (let i = 0; i < n; i++) out.push(...fazCompasso(i % 2 ? rit : (i && nivel >= 3 && r.p(.4) ? ritmoDe(brk) : rit), motivo, i % 2 === 1, i === n - 1)); return out; };
  const partes = [], evs = [];
  const poe = (nome, lista) => { partes.push({ i: evs.length, nome }); evs.push(...lista); };
  if (compassos <= 1) poe('Riff', parte(1));
  else if (compassos <= 4) poe('Riff', parte(nivel === 1 ? 2 : 4));
  else if (compassos <= 8) { const brk = !!est.breakdown && nivel >= 2 && r.p(.5); poe('Riff A', parte(4)); poe(brk ? 'Breakdown' : 'Riff B', parte(4, brk)); }
  else {
    poe('Riff A', parte(4)); poe('Riff B', parte(4));
    poe(est.breakdown ? 'Breakdown' : 'Ponte', parte(4, !!est.breakdown));
    const solo = gerarFrase({ r, nivel, est, escala: r.um(est.solo), raiz: pc(tonica), pos: r.i(3), compassos: 4, metro, afin: 'padrao' });
    poe('Solo', converterAltura(solo.evs, 'padrao', o.afin));
  }
  return { evs, partes, compasso: metro, escala };
}

/* ================= frases de solo =================
   numa posição da escala (2 ou 3 notas por corda), com um ponteiro que anda pela posição. Cada célula devolve eventos;
   a cada duas barras a frase descansa numa nota longa (tônica ou quinta), com vibrato. */
const PADRAO = afinacaoDe('padrao')[2];
// perto da pestana, o solo sobe uma oitava (casa 12), como se faz no metal
const naMaoPos = q => casaMin(q) < 3 && Math.max(...q.map(n => n[1])) + 12 <= 22 ? q.map(([s, k]) => [s, k + 12]) : q;
const CEL_FRASE = { // célula: nível mínimo (cada célula muda de figura e de desenho conforme o nível)
  run: [1], hp: [1], bend: [1], vib: [1], slide: [1], ds: [1], grupo: [1], skip: [1], trem: [1], tap: [1], arp3: [1],
  leg: [2], trill: [2], pinch: [2], harm: [2], dive: [2], hy: [2],
  sweep: [3], pedal: [3], quint: [3], sept: [3], econ: [3],
};
function gerarFrase(o) {
  const { r, nivel, est, compassos } = o, metro = o.metro || M44, barra = metro[0] * metro[1];
  const escala = o.escala, raiz = o.raiz, iv = ESCALAS.find(e => e[0] === escala)[2];
  const sis = iv.length === 5 || iv.length === 7 ? 'nps' : 'caixa', P = posicoesEscala(escala, raiz, sis);
  const naMao = naMaoPos;
  let posI = o.pos % P.length, pos = naMao(P[posI]), c = 2 + r.i(Math.max(1, pos.length - 4));
  const altura = n => PADRAO[n[0]] + n[1];
  const pesos = {}; Object.entries({ ...est.frase, ...(o.frase || {}) }).forEach(([k, w]) => { if (CEL_FRASE[k] && CEL_FRASE[k][0] <= nivel) pesos[k] = w; });
  if (o.so) Object.keys(pesos).forEach(k => { if (!o.so.includes(k)) delete pesos[k]; });
  if (!Object.keys(pesos).length) pesos.run = 1;
  const fig = { 1: [.5, 1], 2: [.25, 1 / 3, .5], 3: [1 / 6, .25, .125] }[nivel];
  const f = () => r.um(fig), evs = [], usadas = new Set();
  const nota = (i, d, t = '') => { const n = pos[Math.max(0, Math.min(pos.length - 1, i))]; return ev(d, [[n[0], n[1]]], t); };
  const mesmaCorda = s => pos.map((n, i) => [n, i]).filter(([n]) => n[0] === s);
  // a nota da escala (pelo grau) mais perto do ponteiro, de preferência da 3ª corda para cima
  const perto = teste => { let melhor = c, nota = 1e9; pos.forEach((n, i) => { if (!teste(pc(altura(n) - raiz))) return; const v = Math.abs(i - c) + (n[0] < 2 ? 4 : 0); if (v < nota) { nota = v; melhor = i; } }); return melhor; };
  const celula = {
    run: () => { const n = 3 + r.i(nivel * 2 + 2), dir = r.p(.5) ? 1 : -1, d = f(); const out = []; for (let i = 0; i < n; i++) { out.push(nota(c, d)); c = Math.max(0, Math.min(pos.length - 1, c + dir)); } return out; },
    hp: () => { const s = r.um([2, 3, 4, 5]), cs = mesmaCorda(s); if (cs.length < 2) return celula.run(); const a = cs[0][0][1], b = cs[cs.length - 1][0][1], d = nivel === 1 ? .5 : .25; return r.p(.5) ? [ev(d, [[s, a]]), ev(d, [[s, b]], 'h'), ev(d, [[s, a]], 'p'), ev(d * 2, [[s, a]])] : [ev(d, [[s, b]]), ev(d, [[s, a]], 'p'), ev(d, [[s, b]], 'h'), ev(d * 2, [[s, a]], 'p')]; },
    bend: () => { const cand = pos.map((n, i) => i).filter(i => pos[i][0] >= 2 && pos[i][0] <= 4 && i + 1 < pos.length); const i = cand.length ? r.um(cand) : c, n = pos[i], prox = pos[i + 1], semi = prox ? altura(prox) - altura(n) : 2; c = i;
      return [ev(nivel >= 2 ? 1 : 1.5, [[n[0], n[1]]], semi === 1 ? 'b2' : 'b'), ev(.5, [[n[0], n[1]]], 'r'), nota(i - 1, f())]; },
    vib: () => { c = perto(x => x === 0 || x === 7); return [nota(c, nivel >= 3 ? 1.5 : 2, 'v')]; },
    slide: () => { const s = pos[c][0], k = pos[c][1]; return [ev(f(), [[s, Math.max(1, k - 2)]]), ev(1, [[s, k]], 's')]; },
    ds: () => { const i = pos.findIndex(n => n[0] === 3), j = pos.findIndex(n => n[0] === 4); if (i < 0 || j < 0) return celula.run(); const a = pos[i + 1] || pos[i], b = pos[j + 1] || pos[j];
      return [ev(.5, [[a[0], a[1]], [b[0], b[1]]], nivel >= 2 ? 'b2' : ''), ev(.5, [[a[0], a[1]], [b[0], b[1]]]), ev(1, [[a[0], a[1]], [b[0], b[1]]], 'v')]; },
    grupo: () => { const g = r.um([3, 4, nivel >= 3 ? 6 : 4]), n = 2 + r.i(3), dir = r.p(.5) ? 1 : -1, d = g === 3 ? (nivel >= 3 ? 1 / 6 : 1 / 3) : g === 6 ? 1 / 6 : .25, out = [];
      for (let j = 0; j < n; j++) { for (let q = 0; q < g; q++) out.push(nota(c + dir * q, d)); c = Math.max(0, Math.min(pos.length - g, c + dir)); } return out; },
    leg: () => { const s = pos[c][0], cs = mesmaCorda(s).map(x => x[0]); if (cs.length < 2) return celula.run(); const d = nivel >= 3 ? 1 / 6 : .25, out = [];
      for (let v = 0; v < 2; v++) cs.forEach((n, i) => out.push(ev(d, [[s, n[1]]], i ? 'h' : ''))), [...cs].reverse().slice(1).forEach(n => out.push(ev(d, [[s, n[1]]], 'p')));
      if (nivel >= 3) { const s2 = Math.min(5, s + 1), c2 = mesmaCorda(s2).map(x => x[0]); c2.forEach((n, i) => out.push(ev(d, [[s2, n[1]]], i ? 'h' : ''))); } return out; },
    skip: () => { const out = [], d = [0, .5, .25, 1 / 6][nivel], ini = r.i(3); for (let s = ini; s + 2 < 6 && out.length < 12; s++) { const a = mesmaCorda(s)[0], b = mesmaCorda(s + 2).slice(-1)[0]; if (a && b) out.push(ev(d, [[s, a[0][1]]]), ev(d, [[s + 2, b[0][1]]], nivel >= 3 && r.p(.4) ? 'h' : '')); } return out.length ? out : celula.run(); },
    trem: () => { const n = 2 + r.i(3), d = nivel >= 3 ? .125 : .25, rep = nivel >= 3 ? 8 : nivel === 2 ? 4 + 4 * r.i(2) : 4, out = [], dir = r.p(.5) ? 1 : -1; for (let j = 0; j < n; j++) { for (let q = 0; q < rep; q++) out.push(nota(c, d)); c = Math.max(0, Math.min(pos.length - 1, c + dir)); } return out; },
    trill: () => { const s = pos[c][0], cs = mesmaCorda(s).map(x => x[0]); if (cs.length < 2) return celula.run(); const d = nivel >= 3 ? .125 : 1 / 6, out = []; for (let q = 0; q < 8; q++) out.push(ev(d, [[s, cs[q % 2][1]]], q ? (q % 2 ? 'h' : 'p') : '')); return out; },
    pinch: () => { const i = pos.findIndex(n => n[0] >= 2 && n[0] <= 3); c = i < 0 ? c : i; return [nota(c, f()), nota(c, 1.5, 'pinch v')]; },
    harm: () => [ev(1, [[r.um([2, 3, 4]), r.um([12, 7, 5])]], 'harm'), ev(1, [[r.um([2, 3]), 12]], 'harm')],
    dive: () => { const n = pos[Math.min(pos.length - 1, c)]; return [ev(1, [[n[0], n[1]]], 'v'), ev(1, [[n[0], n[1]]], 'dive')]; },
    arp3: () => { const out = [], d = nivel === 1 ? .5 : 1 / 3, s0 = r.um([1, 2, 3]); for (let s = s0; s <= s0 + 2; s++) { const a = mesmaCorda(s)[0]; if (a) out.push(ev(d, [[s, a[0][1]]])); } return out.concat([...out].reverse().slice(1)); },
    sweep: () => { // tríade da escala perto da posição, uma nota por corda (3 cordas no avançado curto, 5 no longo)
      const g = r.um([0, 2, 4].filter(x => x < iv.length)), fund = pc(raiz + iv[g]), terca = pc(raiz + iv[(g + 2) % iv.length]) - fund, tipo = pc(terca) === 3 ? 'm' : pc(terca) === 4 ? '' : '°';
      const formas = posicoesAcorde(tipo, fund), media = pos.reduce((s, n) => s + n[1], 0) / pos.length;
      const forma = formas.slice().sort((a, b) => Math.abs(a.reduce((s, n) => s + n[1], 0) / a.length - media) - Math.abs(b.reduce((s, n) => s + n[1], 0) / b.length - media))[0];
      const ini = r.p(.5) ? 1 : 2, um = []; let ult = -1; for (let s = ini; s < 6; s++) { const n = forma.find(x => x[0] === s && PADRAO[s] + x[1] > ult); if (n) { um.push(n); ult = PADRAO[s] + n[1]; } }
      const ida = [...um, ...um.slice(0, -1).reverse()]; return ida.map(n => ev(1 / 6, [[n[0], n[1]]], r.p(.15) ? '' : ''));
    },
    tap: () => { const s = r.um([3, 4, 5]), cs = mesmaCorda(s).map(x => x[0]); if (!cs.length) return celula.run(); const lo = cs[0][1], mid = (cs[1] || cs[0])[1], top = Math.min(20, lo + r.um([5, 7, 12])), out = [];
      if (nivel === 1) { for (let v = 0; v < 4; v++) out.push(ev(.5, [[s, top]], 't'), ev(.5, [[s, lo]], 'p')); return out; }
      const d = nivel === 2 ? 1 / 3 : 1 / 6; let tp = top;
      for (let v = 0; v < 2 + r.i(3); v++) { out.push(ev(d, [[s, tp]], 't'), ev(d, [[s, lo]], 'p'), ev(d, [[s, mid]], 'h')); if (nivel >= 3 && r.p(.5)) tp = Math.min(22, Math.max(mid + 2, tp + r.um([-2, -1, 1, 2]))); }
      if (nivel >= 3 && s > 3) { const s2 = s - 1, c2 = mesmaCorda(s2).map(x => x[0]); if (c2.length) { const l2 = c2[0][1]; out.push(ev(d, [[s2, Math.min(22, l2 + 12)]], 't'), ev(d, [[s2, l2]], 'p'), ev(d, [[s2, (c2[1] || c2[0])[1]]], 'h')); } }
      return out; },
    pedal: () => { const top = pos.length - 1 - r.i(3), out = []; c = top - 1; for (let j = 0; j < 4; j++) { out.push(nota(top, 1 / 6), nota(c, 1 / 6)); c = Math.max(0, c - 1); } return out; },
    quint: () => { const out = [], dir = r.p(.5) ? 1 : -1; for (let q = 0; q < 10; q++) { out.push(nota(c, .2)); c = Math.max(0, Math.min(pos.length - 1, c + dir)); } return out; },
    sept: () => { const out = [], dir = r.p(.5) ? 1 : -1; for (let q = 0; q < 14; q++) { out.push(nota(c, 1 / 7)); c = Math.max(0, Math.min(pos.length - 1, c + dir)); } return out; },
    hy: () => { const out = []; for (let s = 1; s + 3 < 6 && out.length < 9; s += 1) { const a = mesmaCorda(s)[0], b = mesmaCorda(s + 2)[0], cc = mesmaCorda(Math.min(5, s + 3))[0]; if (a && b && cc) out.push(ev(1 / 6, [[s, a[0][1]]]), ev(1 / 6, [[s + 2, b[0][1]]], 'hy'), ev(1 / 6, [[s + 3, cc[0][1]]], 'hy')); } return out.length ? out : celula.run(); },
    econ: () => { const out = []; for (let i = 0; i + 4 < pos.length && out.length < 15; i += 2) for (let q = 0; q < 5; q++) out.push(nota(i + q, 1 / 6)); return out; },
  };
  const fraseCompassos = compassos <= 1 ? 1 : 2, alvo = compassos * barra;
  let t = 0, fimFrase = fraseCompassos * barra;
  while (t < alvo - 1e-6) {
    const k = r.peso(pesos); usadas.add(k);
    const cel = celula[k]().filter(e => e.n.every(([s, kk]) => kk >= 0 && kk <= 24));
    const descanso = nivel >= 3 ? .5 : 1; let pos0 = 0;
    for (const e of cel) { if (t + e.d > fimFrase - descanso + 1e-6) break; evs.push(e); t += e.d; pos0++; }
    if (t >= fimFrase - descanso - 1e-6 || !pos0) {
      const fecha = fimFrase - t;
      if (fecha > 1e-6) { const i = perto(x => x === 0 || (nivel >= 2 && x === 7)); c = i; evs.push(nota(i, fecha, nivel >= 2 && fecha >= 1 && r.p(.3) ? 'pinch v' : 'v')); t = fimFrase; }
      fimFrase = Math.min(alvo, fimFrase + fraseCompassos * barra);
      if (compassos >= 8 && Math.round(t / barra) % 4 === 0) { posI = (posI + 1) % P.length; pos = naMao(P[posI]); c = Math.min(c, pos.length - 1); } // muda de posição a cada 4 compassos
    }
  }
  return { evs, compasso: metro, escala, usadas: [...usadas] };
}

/* ================= técnica =================
   cada técnica leva o gerador para uma só coisa (ou poucas), do básico ao extremo */
const TECNICAS_TREINO = [
  { id: 'alternada', nome: 'Palhetada alternada', d: 'Baixo e cima sem parar, da corda única às seis cordas.', tipo: 'frase', so: [['run'], ['run', 'grupo', 'trem'], ['grupo', 'run', 'quint', 'sept', 'trem']] },
  { id: 'downpicking', nome: 'Palhetada para baixo', d: 'Resistência e precisão: só palhetada para baixo, trocando de corda.', tipo: 'riff', est: 'thrash', cel: [['x-', 'x---', 'x-x-'], ['x-', 'xx', 'x-x', 'xxxx'], ['xxxx', 'xx', 'xxx', 'x.xx']], tex: { chug: 6, pc: 3, nota: 3 } },
  { id: 'palm-mute', nome: 'Palm mute e chugs', d: 'O chug: abafar com a palma e soltar nos acentos.', tipo: 'riff', est: 'metalcore', cel: [['x-', 'x.', 'x-x-', 'x...'], ['x.xx', 'xx-x', '.xx-', 'xxxx', 'x..x'], ['x..xx', 'xxx', 'x.x', 'xxxxx', 'S', 'x....']], tex: { chug: 9, pc: 2, pinch: 1 } },
  { id: 'galope', nome: 'Galope', d: 'Colcheia e duas semicolcheias, e o galope ao contrário.', tipo: 'riff', est: 'heavy', cel: [['x-xx', 'x---'], ['x-xx', 'xx-x', 'x-'], ['x-xx', 'xx-x', 'T', 'Q', 'xS']], tex: { chug: 5, pc: 4, nota: 2 } },
  { id: 'tremolo', nome: 'Tremolo picking', d: 'Palhetada rapidíssima numa nota só, de melodia a acordes.', tipo: 'frase', so: [['trem', 'run'], ['trem'], ['trem', 'run']] },
  { id: 'legato', nome: 'Legato', d: 'Ligados: martelar e puxar, de pares a seis cordas.', tipo: 'frase', so: [['hp'], ['leg', 'trill', 'hp'], ['leg', 'trill']] },
  { id: 'tapping', nome: 'Tapping', d: 'A mão direita no braço: de um toque a arpejos inteiros.', tipo: 'frase', min: 1, so: [['tap', 'hp'], ['tap', 'leg'], ['tap', 'leg', 'sweep']] },
  { id: 'sweep', nome: 'Varredura (sweep)', d: 'Arpejos de três a seis cordas num movimento só.', tipo: 'frase', min: 1, so: [['arp3'], ['arp3', 'sweep'], ['sweep']] },
  { id: 'skip', nome: 'Pulando cordas', d: 'Saltos de corda nas escalas e nos arpejos.', tipo: 'frase', so: [['skip', 'run'], ['skip'], ['skip', 'hy']] },
  { id: 'economia', nome: 'Palhetada econômica', d: 'A palheta segue o caminho mais curto na troca de corda.', tipo: 'frase', so: [['run', 'grupo'], ['grupo', 'econ'], ['econ', 'sweep']] },
  { id: 'hibrida', nome: 'Palhetada híbrida', d: 'Palheta e dedos juntos, pulando cordas.', tipo: 'frase', so: [['skip', 'ds'], ['skip', 'hy'], ['hy']] },
  { id: 'bends', nome: 'Bends e vibrato', d: 'Bend de meio e de um tom, volta do bend, vibrato largo.', tipo: 'frase', so: [['bend', 'vib'], ['bend', 'vib', 'ds', 'pinch'], ['bend', 'pinch', 'dive', 'ds']] },
  { id: 'harmonicos', nome: 'Harmônicos e efeitos', d: 'Harmônico natural, pinch, nota morta e alavanca.', tipo: 'riff', est: 'nu', cel: [['x-', 'x---', 'x-x-'], ['x.xx', '.xx-', 'x..x', 'xx-x'], ['x..xx', 'xxx', 'x.x', 'S']], tex: { chug: 4, harm: 3, pinch: 3, x: 3, bend: 1 } },
  { id: 'power-chords', nome: 'Power chords', d: 'Trocas de acorde, oitavas, slides e acordes dissonantes.', tipo: 'riff', est: 'punk', sus: 'segurar', cel: [['x-', 'x---', 'x-x-'], ['x-', 'x--', 'xx', '.x-x'], ['x-', 'xx', 'x.x', 'xxx']], tex: { pc: 6, oit: 3, slide: 2, diss: 2 } },
  { id: 'dedos', nome: 'Independência dos dedos', d: 'Um dedo por casa, as 24 ordens e a aranha.', tipo: 'dedos' },
  { id: 'ritmo', nome: 'Ritmo e polirritmia', d: 'Síncope, tercinas, compassos ímpares e grupos que atravessam a barra.', tipo: 'riff', est: 'djent', cel: [['x-', 'x---', 'Q', '.x-x'], ['x-x', 'x--', 'q', 'Q', 'x.xx', '.xx-'], ['xxx', 'xxxxx', 'x..xx', 'T', 'F', 'x..', 'x....']], tex: { chug: 6, pc: 2, nota: 2 }, metros: [[M44, M34], [M44, M68, M34], [M78, M54, M58, M74, M98]] },
  { id: 'posicao', nome: 'Troca de posição', d: 'Escalas que atravessam o braço, com slides.', tipo: 'frase', so: [['run', 'slide'], ['run', 'slide', 'grupo'], ['grupo', 'slide', 'sept']], longo: true },
];
const PERMS = (() => { const r = [], p = (resto, s) => { if (!resto.length) r.push(s); resto.forEach((x, i) => p(resto.filter((_, j) => j !== i), s + x)); }; p(['1', '2', '3', '4'], ''); return r; })();
const permTexto = p => p.split('').join('-');
// dedos: cromático, aranha e cruzado, mudando a ordem e a casa a cada compasso
function gerarDedos(o) {
  const { r, nivel, compassos } = o, evs = [], partes = [];
  const fig = { 1: .5, 2: .25, 3: 1 / 6 }[nivel], porCompasso = Math.round(4 / fig);
  for (let b = 0; b < compassos; b++) {
    const perm = nivel === 1 ? r.um(PERMS.filter(p => p[0] === '1')) : r.um(PERMS), casa = 1 + r.i(nivel === 1 ? 5 : 9), modo = nivel === 1 ? 'crom' : r.um(nivel === 2 ? ['crom', 'aranha'] : ['aranha', 'cruzada', 'pulo', 'crom']);
    partes.push({ i: evs.length, nome: `${modo === 'crom' ? 'Cromático' : modo === 'aranha' ? 'Aranha' : modo === 'cruzada' ? 'Aranha cruzada' : 'Pulando cordas'} ${permTexto(perm)}` });
    const seq = [];
    if (modo === 'crom') for (let s = 0; s < 6; s++) perm.split('').forEach(d => seq.push([[s, casa + +d - 1, +d]]));
    if (modo === 'aranha') for (let s = 0; s < 5; s++) [[s, 1], [s + 1, 2], [s, 3], [s + 1, 4]].forEach(([x, d]) => seq.push([[x, casa + d - 1, d]]));
    if (modo === 'cruzada') for (let s = 0; s < 5; s++) [[s, 1], [s + 1, 3], [s, 2], [s + 1, 4]].forEach(([x, d]) => seq.push([[x, casa + d - 1, d]]));
    if (modo === 'pulo') for (let s = 0; s < 4; s++) { perm.split('').forEach(d => seq.push([[s, casa + +d - 1, +d]])); perm.split('').reverse().forEach(d => seq.push([[s + 2, casa + +d - 1, +d]])); }
    for (let i = 0; i < porCompasso; i++) evs.push(ev(fig, seq[i % seq.length]));
  }
  return { evs, partes, compasso: M44 };
}

/* ================= os modelos (treinos) ================= */
const PALAVRAS = ['Fornalha', 'Lâmina', 'Trovão', 'Corrente', 'Ferrugem', 'Martelo', 'Abismo', 'Cinzas', 'Granito', 'Vértebra', 'Tormenta', 'Estilhaço', 'Bigorna', 'Navalha', 'Relâmpago', 'Escória',
  'Brasa', 'Ruína', 'Eclipse', 'Serpente', 'Cratera', 'Avalanche', 'Vulcão', 'Labirinto', 'Presságio', 'Catacumba', 'Furacão', 'Obsidiana', 'Marreta', 'Trincheira', 'Colapso', 'Fúria',
  'Sentença', 'Basalto', 'Mercúrio', 'Tufão', 'Gárgula', 'Pólvora', 'Arame', 'Aço', 'Corvo', 'Lobo', 'Chacal', 'Escorpião', 'Vespa', 'Tornado', 'Engrenagem', 'Pistão',
  'Fenda', 'Magma', 'Rachadura', 'Cicatriz', 'Espinho', 'Garra', 'Mandíbula', 'Couraça', 'Machado', 'Foice', 'Grilhão', 'Ferrolho', 'Turbina', 'Sirene', 'Radar', 'Fuligem',
  'Tempestade', 'Penhasco', 'Geleira', 'Deserto', 'Sombra', 'Névoa', 'Chumbo', 'Cobalto', 'Titânio', 'Rubi', 'Ônix', 'Quartzo', 'Enxofre', 'Carvão', 'Faísca', 'Pavio',
  'Detonador', 'Estopim', 'Muralha', 'Torre', 'Ponte', 'Calabouço', 'Fortaleza', 'Arsenal', 'Bastião', 'Guilhotina', 'Ampulheta', 'Cometa', 'Meteoro', 'Órbita', 'Gravidade', 'Vácuo'];
const N_POR_LISTA = 8;
const nomeGerado = (chave, i) => PALAVRAS[(semente(chave) + i * 37) % PALAVRAS.length];
const famDe = af => af.startsWith('drop') || af === 'sete-drop-a' ? 'drop' : 'padrao';
const cacheGer = new Map();
function criarModelo({ cat, sub, nivel, tam, i }) {
  const chave = `${cat}:${sub}:${nivel}:${tam}`, id = `${chave}:${i}`, compassos = TAMANHOS.find(t => t[0] === tam)[2];
  const est = cat === 'tecnica' ? null : estiloDe(sub), tec = cat === 'tecnica' ? TECNICAS_TREINO.find(t => t.id === sub) : null;
  const base = est || estiloDe(tec.est || 'heavy');
  const afin = (est ? est.afin : base.afin)[nivel - 1];
  const ehRiff = cat === 'riffs' || (tec && (tec.tipo === 'riff' || tec.tipo === 'dedos'));
  // cada treino é conferido com os irmãos da mesma lista: se sair igual a um deles, sorteia de novo
  const assinatura = g => JSON.stringify(g.evs.map(e => [e.d, e.n, e.t]));
  let tent = null;
  const tentativa = () => {
    if (tent != null) return tent;
    const irmaos = Array.from({ length: i }, (_, j) => MODELOS.find(x => x.id === `${chave}:${j}`)).filter(Boolean).map(x => assinatura(x.gerar(x.cfg0())));
    for (tent = 0; tent < 5; tent++) if (!irmaos.includes(assinatura(gerarCom(cfg0(), tent)))) break;
    if (tent >= 5) tent = 0; return tent;
  };
  const cfg0 = () => ({ raiz: m.raizPadrao != null ? m.raizPadrao : 4, pos: 0 });
  const gerar = c => gerarCom(c, tentativa());
  const gerarCom = (c, t) => {
    const ch = `${id}|${c.raiz}|${c.pos}|${t}`; if (cacheGer.has(ch)) return cacheGer.get(ch);
    const r = sorteio(semente(id + (t ? '#' + t : ''))); let g;
    if (tec && tec.tipo === 'dedos') g = gerarDedos({ r, nivel, compassos });
    else if (ehRiff) {
      const t = tec || {};
      g = gerarRiff({ r, nivel, est: base, compassos: tec ? Math.min(compassos, 8) : compassos, afin, afinFam: famDe(afin), tex: t.tex, cel: t.cel ? Object.fromEntries(t.cel[nivel - 1].map(x => [x, 3])) : null, so: t.cel ? t.cel[nivel - 1] : null, sus: t.sus,
        metro: t.metros ? r.um(t.metros[nivel - 1]) : null });
      if (tec && compassos > 8) { const g2 = gerarRiff({ r, nivel, est: base, compassos: 8, afin, afinFam: famDe(afin), tex: t.tex, so: t.cel ? t.cel[nivel - 1] : null, cel: t.cel ? Object.fromEntries(t.cel[nivel - 1].map(x => [x, 3])) : null, metro: g.compasso }); g = { ...g, evs: g.evs.concat(g2.evs), partes: (g.partes || []).concat((g2.partes || []).map(p => ({ i: p.i + g.evs.length, nome: p.nome + ' (variação)' }))) }; }
    } else {
      const escala = c.escala || (tec ? r.um(['menor', 'menor-harmonica', 'frigio', 'penta-menor', 'dorico'].filter(e => nivel >= 2 || e !== 'dorico')) : r.um(base.solo));
      const metro = est ? r.um(est.metros[nivel - 1].filter(m => m[0] * m[1] >= 3)) || M44 : M44;
      g = gerarFrase({ r, nivel, est: base, escala, raiz: c.raiz, pos: c.pos, compassos, metro, so: tec ? tec.so[nivel - 1] : null, frase: tec ? Object.fromEntries(tec.so[nivel - 1].map(x => [x, 3])) : null });
      g.raiz = c.raiz;
    }
    g.afin = ehRiff ? afin : 'padrao';
    cacheGer.set(ch, g); return g;
  };
  const m = { id, cat, sub, nivel, tamanho: tam, ehRiff, afinPadrao: afin, usaTom: !ehRiff, manterAltura: !ehRiff, raizPadrao: ehRiff ? null : pc(afinacaoDe(afin)[2][0] + (afinacaoDe(afin)[2].length === 7 ? 0 : 0)),
    nome: nomeGerado(chave, i), rotulo: tec && tec.tipo === 'dedos' ? 'dedo' : 'nota', bpm: Math.max(60, Math.min(150, Math.round((base.bpm || 110) * (ehRiff ? .8 : .6) / 5) * 5)), alvo: base.bpm || 120,
    regioes: c => ehRiff ? ['Riff'] : posicoesEscala(c.escala || 'menor', c.raiz != null ? c.raiz : 9, 'nps').map((p, j) => rotuloPos(j, naMaoPos(p))).slice(0, 5),
    gerar, cfg0,
    resumo: () => resumoDe(gerar(cfg0()), compassos) };
  if (m.raizPadrao != null && est && ['hard-rock', 'punk', 'grunge', 'doom'].includes(est.id) && afin === 'padrao') m.raizPadrao = 9; // solo em Lá no rock clássico
  return m;
}
// o resumo diz o que o treino tem: técnicas, escala, compasso e tamanho
function resumoDe(g, compassos) {
  const T = new Set(); g.evs.forEach(e => tecs(e).forEach(t => T.add(t)));
  if (g.evs.some(e => e.n.length >= 2 && !tecs(e).includes('pm'))) T.add('acordes');
  if (g.evs.some(e => Math.abs(e.d - 1 / 6) < .01 || Math.abs(e.d - 1 / 3) < .01)) T.add('quiálteras');
  if (g.evs.some(e => e.d <= .13)) T.add('fusas');
  if (g.evs.some(e => !e.n.length)) T.add('pausas');
  const nomes = { pm: 'palm mute', acordes: 'power chords', pinch: 'pinch', harm: 'harmônico', x: 'nota morta', b: 'bend', b2: 'bend', r: '', v: 'vibrato', h: 'ligados', p: '', t: 'tapping', s: 'slide', dive: 'alavanca', tr: 'trinado', hy: 'híbrida', quiálteras: 'quiálteras', fusas: 'fusas', pausas: 'pausas' };
  const lista = [...new Set([...T].map(t => nomes[t]).filter(Boolean))].slice(0, 5);
  const [cn, cp] = g.compasso || M44, comp = `${cn}/${cp === 1 ? 4 : cp === .5 ? 8 : 16}`;
  return `${lista.join(', ') || 'notas soltas'} · ${g.escala ? nomeEscala(g.escala) : 'cromático'} · ${comp}`;
}
// registra os riffs, solos e técnica: estilos × níveis × tamanhos × N, e técnicas × níveis × tamanhos × N
[['riffs', ESTILOS.map(e => e.id)], ['solos', ESTILOS.map(e => e.id)], ['tecnica', TECNICAS_TREINO.map(t => t.id)]].forEach(([cat, subs]) => subs.forEach(sub => [1, 2, 3].forEach(nivel => TAMANHOS.forEach(([tam]) => {
  for (let i = 0; i < N_POR_LISTA; i++) { const m = criarModelo({ cat, sub, nivel, tam, i }); m.alvo = Math.max(m.alvo, m.bpm + 20); MODELOS.push(m); }
}))));
const contarCatalogo = () => MODELOS.length;

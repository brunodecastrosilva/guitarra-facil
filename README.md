# Guitarra Fácil

Treinos de guitarra de rock e metal no celular e no computador: riffs, solos e técnica em 17 estilos, três níveis e
quatro tamanhos de linha, com afinações drop e sete cordas. O app conta, toca junto (limpo ou distorcido), acende a
nota da vez no braço desenhado e rola a tablatura.

**Fase de testes** · versão 0.6.0 · app web em <https://brunodecastrosilva.github.io/guitarra-facil/>

Faz parte da família do **Projeto Integrador** (Conta Fácil, Elétrica Fácil, Estudo Fácil, Guitarra Fácil). As leis
globais e o padrão técnico (`comum/PADRAO.md`) valem acima das regras deste app.

## O que o app faz

Barra de baixo: **Início, Treinos, Afinador, Teoria e Mais** (Metrônomo, Bateria, Mapa do braço, Acordes, Músicas,
Progresso e Ajustes).

- **Início:** a sequência de dias numa linha, o **treino do dia**, o último treino para continuar e o menu de dez botões
  grandes (com **Favoritos**).
- **Treinos** (um toque por vez): categoria (Riffs, Solos e licks, Técnica, Escalas e arpejos) › estilo ou técnica ›
  nível › tamanho › lista de 8. São 4.934 treinos.
  - **17 estilos:** hard rock, punk e hardcore, heavy clássico, thrash, speed e power, groove, death, death
    melódico, black, doom e stoner, metalcore, deathcore, nu metal, djent e prog moderno, progressivo, grunge e
    alternativo, shred e neoclássico. Cada um tem as bandas de referência; riffs e solos são originais do app.
  - **17 técnicas:** palhetada alternada, para baixo, palm mute e chugs, galope, tremolo picking, legato, tapping,
    varredura, pulando cordas, palhetada econômica, híbrida, bends e vibrato, harmônicos e efeitos, power chords,
    independência dos dedos, ritmo e polirritmia, troca de posição.
  - **Níveis exclusivos:** cada nível tem os seus treinos. A dificuldade está na complexidade (técnicas misturadas,
    quiálteras, fusas, pausas, compassos ímpares, grupos que atravessam o compasso), não no andamento.
  - **Tamanho da linha:** curto (1 compasso), moderado (2 a 4), longo (8: partes A e B ou breakdown), muito longo
    (16: riff A, riff B, breakdown ou ponte e solo).
- **Janela do treino:** braço (um compasso de cada vez nas linhas longas), tablatura com PM e técnicas, a parte da vez,
  andamento e um botão grande. Em **Ajustes**: afinação (9), tom, posição, escala, figura, o que fazer a cada etapa
  (repetir, próximo tom, próxima posição), voltas por etapa (2, 4, 8), subida do andamento, som (distorcido ou limpo),
  rótulos no braço, exemplo e metrônomo. Estrela de favorito; aviso da próxima etapa uma volta antes.
- **Treino do dia:** técnica, riff, solo e uma linha longa do nível escolhido, em fila, trocando sozinho.
- **Afinador:** ponteiro, a corda mais perto e 9 afinações, inclusive drops e sete cordas.
- **Teoria**, **Metrônomo**, **Bateria**, **Mapa do braço**, **Acordes**, **Músicas** (17 playlists de inspiração, uma
  por estilo, com links para YouTube e Spotify) e **Progresso** (semana, andamentos e conquistas).

## Onde ficam os dados

| O quê | Onde |
|---|---|
| Treinos, favoritos, conquistas, músicas, tempo de prática e preferências | neste aparelho (`guitarrafacil.db`) |
| Os mesmos dados, com a sincronização ligada | gist secreto na conta GitHub do usuário, criptografado no aparelho |
| Avaliações e relatos de problema | Firestore do Projeto Integrador (coleção `feedback`), guardados por 2 anos |

Todo o som é gerado no aparelho. Só o afinador usa o microfone, enquanto está ligado e com permissão: o som é
analisado em memória, não é gravado nem enviado.

## Modelo de dados

Um só objeto (`guitarrafacil.db`, versão 1): `cfg` (meta, metrônomo, afinação do afinador, os últimos ajustes de cada
treino em `trCfg`, voltas por etapa, percurso, som) e as listas `musicas`, `praticas`, `treinos` (modelo, ajustes,
voltas, andamento, minutos, se saiu limpo, se foi do treino do dia), `conquistas` e `favoritos`. `feitas` e
`andamentos` são da versão com aulas: guardadas e sincronizadas, sem aparecer.

**Os treinos** são gerados no aparelho a partir de uma semente (`riffs:thrash:3:longo:2` = categoria, estilo ou
técnica, nível, tamanho, número): saem sempre iguais e não ocupam espaço. Um treino é uma lista de eventos
`{ d, n: [[corda, casa, dedo]], t }` (n vazio = pausa; várias notas = acorde; t = técnicas). Cada treino é conferido
com os irmãos da mesma lista para não sair igual.

## Para desenvolver

```
npm start          # servidor local em http://localhost:8080/guitarra-facil/
npm run verificar  # confere o padrão do Projeto Integrador
npm test           # testes do Kit e do app (Chromium do Playwright)
```

Sem etapa de build: HTML, CSS e JavaScript puros. Ao publicar uma versão, aumente a versão no `package.json`, na
constante `VERSAO` (`app.js`), no cache do `sw.js`, no `?v=` do `index.html`, no topo do `CHANGELOG.md` e em
`novidades` (`KitFacil.iniciar`).

## Estrutura

| Arquivo | Conteúdo |
|---|---|
| `index.html` | moldura e visual (grafite de amplificador) |
| `teoria.js` | motor de teoria (escalas, acordes, intervalos, campo harmônico), afinações e conversão entre elas, e os desenhos do braço e do círculo |
| `catalogo.js` | níveis, tamanhos, categorias, posições pelo braço, escalas, sequências e arpejos, e a volta do treino (afinação, dedos, compasso) |
| `metal.js` | os 17 estilos e as 17 técnicas, o gerador de riffs (ritmo, texturas, partes, breakdown), de frases de solo e de técnica, e o registro dos treinos |
| `pratica.js` | braço e tablatura do treino, som de guitarra (distorção, palm mute, pinch, harmônico, nota morta, bend, slide, vibrato, alavanca), tocador em voltas e bateria |
| `musicas.js` | playlists de inspiração por estilo (título, artista e o que ouvir) |
| `app.js` | dados, telas (uma por função), janela do treino, sequência e conquistas, metrônomo, afinador e ligação com o Kit |
| `comum/` | **Kit Fácil**: igual nos apps da família; não edite só aqui |
| `sw.js`, `manifest.webmanifest`, `icons/` | instalação e uso sem internet |
| `tests/` | testes do app |

## Publicação

Direto na `main`; o GitHub Pages publica a pasta raiz.

## Uso do código

Repositório público sem licença: todos os direitos reservados a Bruno de Castro Silva.

# Guitarra Fácil

Treinos de guitarra elétrica no celular e no computador, no andamento que você escolher: o app conta, toca junto,
acende a nota da vez no braço desenhado e rola a tablatura. Para quem começa e para quem já toca: não há trilha nem
nível, cada um escolhe o treino.

**Fase de testes** · versão 0.4.0 · app web em <https://brunodecastrosilva.github.io/guitarra-facil/>

Faz parte da família do **Projeto Integrador** (Conta Fácil, Elétrica Fácil, Estudo Fácil, Guitarra Fácil). As leis
globais e o padrão técnico (`comum/PADRAO.md`) valem acima das regras deste app.

## O que o app faz

Barra de baixo: **Hoje, Treinos, Teoria, Ferramentas e Mais** (Músicas, Progresso e Ajustes).

- **Hoje:** sequência de dias seguidos, a semana com os dias praticados, a meta de minutos do dia, o último treino
  para continuar, o plano do dia (aquecimento com a combinação do cromático de hoje, técnica com o desenho da
  pentatônica de hoje, teoria e repertório, cada um com o seu botão) e o resumo da semana.
- **Treinos:** o cromático 1-2-3-4 com as 24 combinações dos dedos, as escalas (pentatônica menor, maior e blues)
  nos cinco desenhos em qualquer tom, palhetada e arpejos, riffs e frases originais.
- **Janela do treino:** o braço (dedo em cada nota, a da vez acesa, a próxima tracejada, a tônica marcada) e a
  tablatura rolando; andamento de 30 a 240 bpm, de 1 em 1 ou de 5 em 5; subida automática a cada volta; ao fim de
  cada volta, repetir, seguir para a próxima combinação ou desenho, sortear ou subir uma casa. Ajustes do cromático:
  combinação, casa inicial, cordas e figura. Ao parar, "Saiu limpo" registra o melhor andamento.
- **Teoria:** escalas no braço com os desenhos da pentatônica (e o botão "Treinar este desenho"), construtor de
  acordes, círculo das quintas, campo harmônico, intervalos e figuras rítmicas. O braço desenhado é o padrão visual
  do app.
- **Ferramentas:** metrônomo, bateria de acompanhamento, afinador pelo microfone e notas de referência, mapa das notas
  no braço e dez acordes.
- **Músicas (em Mais):** sua lista (Quero aprender, Aprendendo, Já toco) e playlists recomendadas da mais fácil à
  mais difícil, com links para o YouTube e o Spotify (gravações, letras e cifras ficam fora do app por direitos
  autorais).
- **Progresso (em Mais):** dias seguidos, maior sequência, minutos dos últimos 7 dias em gráfico, as 24 combinações
  com o melhor andamento de cada uma, os andamentos dos outros treinos e 13 conquistas.
- **Ajustes:** as oito guias comuns da família e a guia própria **Prática** (meta de minutos por dia).

## Onde ficam os dados

| O quê | Onde |
|---|---|
| Treinos, conquistas, músicas, tempo de prática e preferências | neste aparelho (`guitarrafacil.db`) |
| Os mesmos dados, com a sincronização ligada | gist secreto na conta GitHub do usuário, criptografado no aparelho |
| Avaliações e relatos de problema | Firestore do Projeto Integrador (coleção `feedback`), guardados por 2 anos |

Todo o som (treinos, metrônomo, bateria, notas) é gerado no aparelho. Só o afinador usa o microfone, enquanto está
ligado e com permissão: o som é analisado em memória, não é gravado nem enviado.

## Modelo de dados

Um só objeto (`guitarrafacil.db`, versão 1): `cfg` (meta diária, andamento do metrônomo, os últimos ajustes do
cromático e das escalas) e as listas `musicas`, `praticas` (minutos de prática), `treinos` (exercício, ajustes,
andamento, voltas, minutos e se saiu limpo) e `conquistas` (id e data). As listas `feitas` e `andamentos` são da
versão com aulas (até a 0.3.0): continuam guardadas e sincronizadas, mas não aparecem. Ids de treino: `crom:1324`,
`esc:penta-menor:9:0` (escala, tônica, desenho) ou o id de um exercício pronto. As listas sincronizam registro a
registro; a mudança mais recente vence.

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
| `teoria.js` | motor de teoria (escalas, acordes, intervalos, campo harmônico) e os desenhos do braço e do círculo |
| `pratica.js` | catálogo de treinos, cromático (24 combinações), escalas por desenho, braço e tablatura do treino, tocador em voltas e bateria |
| `musicas.js` | playlists recomendadas (título, artista e motivo) |
| `app.js` | dados, telas, janela do treino, sequência e conquistas, metrônomo, afinador e ligação com o Kit |
| `comum/` | **Kit Fácil**: igual nos apps da família; não edite só aqui |
| `sw.js`, `manifest.webmanifest`, `icons/` | instalação e uso sem internet |
| `tests/` | testes do app |

## Publicação

Direto na `main`; o GitHub Pages publica a pasta raiz.

## Uso do código

Repositório público sem licença: todos os direitos reservados a Bruno de Castro Silva.

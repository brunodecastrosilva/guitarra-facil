# Guitarra Fácil

Treinos de guitarra elétrica no celular e no computador, no andamento que você escolher: o app conta, toca junto,
acende a nota da vez no braço desenhado e rola a tablatura. Cada função tem a sua tela e só aparece o que está em uso.

**Fase de testes** · versão 0.5.0 · app web em <https://brunodecastrosilva.github.io/guitarra-facil/>

Faz parte da família do **Projeto Integrador** (Conta Fácil, Elétrica Fácil, Estudo Fácil, Guitarra Fácil). As leis
globais e o padrão técnico (`comum/PADRAO.md`) valem acima das regras deste app.

## O que o app faz

Barra de baixo: **Início, Treinos, Afinador, Teoria e Mais** (Metrônomo, Bateria, Mapa do braço, Acordes, Músicas,
Progresso e Ajustes).

- **Início:** a sequência de dias numa linha, o último treino para continuar e o menu de nove botões grandes e
  ilustrados.
- **Treinos:** um toque por vez: categoria (escalas, sequências, arpejos, licks, riffs, técnica) › nível (iniciante,
  intermediário, avançado) › duração (curto 2 min, moderado 5, longo 10, muito longo 20) › lista. O caminho no topo
  volta um passo. 118 modelos que se transpõem para os 12 tons e para todas as posições do braço (mais de 5 mil
  variações). Licks e riffs são originais do app.
- **Duração:** é o tempo da sessão, com relógio. Curto: um tom e uma posição. Moderado: todas as posições num tom.
  Longo: todo o braço em quatro tons (ciclo das quartas). Muito longo: todo o braço nos 12 tons.
- **Janela do treino:** braço (a nota da vez acesa, a próxima tracejada, a tônica marcada), tablatura rolando,
  andamento de 30 a 240 bpm e um botão grande. Em **Ajustes**, numa vista separada: tom, posição, escala (nas
  sequências), ordem dos dedos (no cromático), figura, duração, subida do andamento a cada volta, o que o braço mostra
  (dedos, notas ou graus), exemplo tocando e metrônomo. Ao terminar, "Saiu limpo" registra o melhor andamento.
- **Afinador:** ponteiro em cents, a corda mais perto acesa, as seis cordas para ouvir e quatro afinações (padrão,
  meio tom abaixo, Drop D, um tom abaixo).
- **Teoria:** menu de cinco assuntos (escalas no braço, construtor de acordes, círculo das quintas, intervalos, ritmo),
  um de cada vez. "Treinar esta escala" abre o treino na mesma posição.
- **Metrônomo** (compasso e toque no ritmo), **Bateria** (seis estilos), **Mapa do braço**, **Acordes** (para ouvir),
  **Músicas** (abas Minhas músicas e Playlists) e **Progresso** (abas Semana, Andamentos e Conquistas).
- **Ajustes:** as oito guias comuns da família e a guia própria **Prática** (meta de minutos por dia).

## Onde ficam os dados

| O quê | Onde |
|---|---|
| Treinos, conquistas, músicas, tempo de prática e preferências | neste aparelho (`guitarrafacil.db`) |
| Os mesmos dados, com a sincronização ligada | gist secreto na conta GitHub do usuário, criptografado no aparelho |
| Avaliações e relatos de problema | Firestore do Projeto Integrador (coleção `feedback`), guardados por 2 anos |

Todo o som é gerado no aparelho. Só o afinador usa o microfone, enquanto está ligado e com permissão: o som é
analisado em memória, não é gravado nem enviado.

## Modelo de dados

Um só objeto (`guitarrafacil.db`, versão 1): `cfg` (meta diária, metrônomo, afinação, os últimos ajustes de cada
treino em `trCfg`, a última duração) e as listas `musicas`, `praticas` (minutos de prática), `treinos` (modelo,
ajustes, duração, se chegou ao fim, andamento, voltas, minutos, se saiu limpo e as posições, tons e combinações por
onde passou) e `conquistas` (id e data). `feitas` e `andamentos` são da versão com aulas (até a 0.3.0): continuam
guardadas e sincronizadas, mas não aparecem. Ids de treino: `esc:dorico`, `seq:grupos4:maior`, `arp:m7`, `lick:a3`,
`riff:galope`, `tec:crom`; os ids das versões 0.3 e 0.4 são convertidos (`normalizarTreino`). As listas sincronizam
registro a registro; a mudança mais recente vence.

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
| `catalogo.js` | catálogo de treinos: posições pelo braço (2 e 3 notas por corda, caixa), digitação, padrões de sequência, licks e riffs originais, técnica e o plano da sessão por duração |
| `pratica.js` | braço e tablatura do treino, som de guitarra (bend, slide, vibrato), tocador em voltas e bateria |
| `musicas.js` | playlists recomendadas (título, artista e motivo) |
| `app.js` | dados, telas (uma por função), janela do treino, sequência e conquistas, metrônomo, afinador e ligação com o Kit |
| `comum/` | **Kit Fácil**: igual nos apps da família; não edite só aqui |
| `sw.js`, `manifest.webmanifest`, `icons/` | instalação e uso sem internet |
| `tests/` | testes do app |

## Publicação

Direto na `main`; o GitHub Pages publica a pasta raiz.

## Uso do código

Repositório público sem licença: todos os direitos reservados a Bruno de Castro Silva.

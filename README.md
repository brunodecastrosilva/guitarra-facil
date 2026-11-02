# Guitarra Fácil

Um ambiente para aprender, treinar, explorar e criar na guitarra, do primeiro dia ao avançado, com o rock e o metal
presentes sem dominar (Documento Mestre, no projeto do Claude). O braço desenhado é o centro: sempre do mesmo
tamanho, desliza até a nota da vez e mostra bends, slides e ligados; a tablatura escreve o ritmo e se liga ao braço.
O som é gravado (FluidR3, MIT): guitarra limpa, baixo, cordas de fundo, bateria e metrônomo.

**Fase de testes** · versão 0.16.0 · app web em <https://brunodecastrosilva.github.io/guitarra-facil/>

Faz parte da família do **Projeto Integrador** (Conta Fácil, Elétrica Fácil, Estudo Fácil, Guitarra Fácil). As leis
globais e o padrão técnico (`comum/PADRAO.md`) valem acima das regras deste app.

## O que o app faz

Barra de baixo: **Início, Treinos, Afinador, Teoria e Mais** (Metrônomo, Bateria, Braço, Estúdio, Biblioteca,
Acordes, Músicas, Progresso e Ajustes).

- **Primeira experiência** (na tela inicial): experiência, objetivos, gosto musical, tempo por dia e uma apresentação
  do app em desenhos. Dá para pular. Guarda o perfil em `cfg.perfil`.
- **Início:** a sequência de dias e, em destaque, o que fazer agora: o **próximo passo do caminho do iniciante** (com
  o caminho inteiro e "Você está aqui") ou a **sessão de hoje**; o último treino para continuar; as **metas**; atalhos
  para sessão, treino do dia, favoritos, Estúdio e plano de 4 semanas.
- **Sessão de hoje:** tempo disponível (10 a 60 min) e as cinco etapas do Documento Mestre (preparo guiado com desenhos,
  aquecimento, treino principal, aplicação musical e encerramento). O principal segue o caminho ou a competência menos
  treinada; a aplicação segue o gosto. Trocar, tirar (com Desfazer), acrescentar e reordenar; guardar como **rotina**.
- **Caminho do iniciante:** cinco etapas de quatro passos (Primeiro contato, Palhetada e ritmo, Power chords, Primeiros
  riffs e Primeiros solos), do primeiro toque numa corda solta ao primeiro bend. Cada passo é um treino curto e
  original, com os dedos no braço e uma dica do que fazer; conta quando a pessoa marca "Saiu limpo".
- **Buscar e filtrar** (em Treinos): busca por texto e filtros combinados de categoria, competência, técnica, estilo,
  nível, tamanho, mão trabalhada e objetivo, sobre o modelo único de exercício (`exercicios.js`).
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
- **Janela do treino:** braço sempre do mesmo tamanho (casa 0 a 24), que desliza até as notas da vez e anima bend,
  volta do bend, slide, ligados, tapping, vibrato e trinado (um compasso de cada vez nas linhas longas), tablatura com PM e técnicas, a parte da vez,
  andamento com a porcentagem da meta, um botão grande de tocar e, ao lado, **Gravar**. Embaixo, os compassos: tocar
  num compasso (e depois em outro) repete **só aquele trecho em laço**. Em **Ajustes**: afinação (9), tom, posição,
  escala, figura, o que fazer a cada etapa (repetir, próximo tom, próxima posição), voltas por etapa (2, 4, 8), subida
  do andamento, **mostrar o braço e a tablatura** (um dos dois pode sair), **acompanhamento** (metrônomo, bateria em 10 estilos ou nada), **segunda
  guitarra** (terças, quintas ou oitava), **ir para 50, 70, 85 ou 100% da meta**, rótulos no braço e exemplo junto. Estrela de favorito; aviso da próxima etapa uma volta antes.
- **Gravar e comparar:** com o microfone ligado pela pessoa (botão Gravar), o treino é gravado para ela ouvir junto com o
  exemplo e julgar. O app não dá nota pela gravação (Documento Mestre, seção 7). "Saiu limpo" é marcado pela pessoa e
  aparece como "marcado por você". A gravação fica só na memória do aparelho e some ao fechar a janela.
- **Plano de 4 semanas:** técnica › nível › meta de andamento (+20, +40, +60 ou +80 bpm sobre o melhor limpo). Cada
  semana tem um andamento-alvo e quatro treinos da técnica (curto, moderado, longo e muito longo); um treino conta
  quando sai limpo no andamento da semana.
- **Treino do dia:** técnica, riff, solo e uma linha longa do nível escolhido, em fila, trocando sozinho.
- **Afinador:** ponteiro, a corda mais perto e 9 afinações, inclusive drops e sete cordas.
- **Braço** (laboratório): o braço inteiro em cinco modos (notas, escala, acorde, intervalos e livre, que diz o nome do
  acorde montado), em qualquer afinação. "Ver no braço" na janela do treino abre a escala do exercício.
- **Estúdio:** ideias e riffs escritos pelo braço ou por corda e casa, com duração, pausas, acordes e técnicas; tablatura
  com ritmo; ouvir, treinar com bateria e fazer variações. Pode guardar de onde veio o trecho (uso pessoal).
- **Biblioteca:** obras em domínio público (Grieg, Beethoven, Bach, Greensleeves) e riffs originais do app, por origem
  e dificuldade, com recomendação pela competência da vez. Nenhuma música protegida.
- **Progresso:** semana, **mapa de competências** (praticado e concluído; o app não avalia a execução), **metas** de
  curto, médio e longo prazo, andamentos e conquistas.
- **Volumes** (Ajustes do treino): exemplo, segunda guitarra, baixo, cordas de fundo e bateria, cada um de 0 a 100.
- **Teoria**, **Metrônomo**, **Bateria** (12 estilos, com bumbo duplo, blast beat, d-beat, thrash, galope e meio tempo),
  **Acordes**, **Músicas** (17 playlists de inspiração, com links para YouTube e Spotify).

## Aparência

O app abre no tema escuro (Documento Mestre, decisão 3A; Kit Fácil 2.8 com `padrao: 'escuro'` e `data-theme="dark"` na
tag `<html>`). O claro e o automático continuam em Ajustes › Aparência.

## Onde ficam os dados

| O quê | Onde |
|---|---|
| Treinos, favoritos, conquistas, músicas, tempo de prática e preferências | neste aparelho (`guitarrafacil.db`) |
| Os mesmos dados, com a sincronização ligada | gist secreto na conta GitHub do usuário, criptografado no aparelho |
| Avaliações e relatos de problema | Firestore do Projeto Integrador (coleção `feedback`), guardados por 2 anos |

Os sons (guitarra limpa, bateria e metrônomo) são gravações do banco FluidR3, sob licença MIT
(`sons/LICENCA-FluidR3.txt`), que acompanham o app e ficam guardadas para uso sem internet; tudo toca no aparelho. O microfone só é usado com permissão e enquanto está ligado: no afinador, o som é
analisado em memória, não é gravado nem enviado; o botão Gravar guarda o áudio só na memória do aparelho, para ouvir na
hora, e apaga ao fechar a janela do treino. Nada é enviado nem avaliado.

## Modelo de dados

Um só objeto (`guitarrafacil.db`, versão 1): `cfg` (meta, onde o caminho do iniciante começa em `caminhoDe`, metrônomo, afinação do afinador, os últimos ajustes de cada
treino em `trCfg`, voltas por etapa, percurso, o que mostrar (braço e tablatura), acompanhamento, bateria, harmonia e o plano de
4 semanas em `plano` = `{ tec, nivel, ini, meta, em, fim }`, o perfil da primeira experiência em `perfil`, o tempo da
sessão em `sessaoMin` e os volumes em `mix`) e as listas `rotinas`, `metas`, `ideias`, `musicas`, `praticas`, `treinos` (modelo, ajustes,
voltas, andamento, minutos, se saiu limpo, se foi do treino do dia ou da sessão e o trecho repetido; treinos antigos podem ter `ritmo`, a nota da conferência que saiu na 0.10.0), `conquistas` e `favoritos`. `rotinas` são sessões guardadas, `metas` têm prazo, tipo e alvo, e `ideias` são as
criações do Estúdio (notas no mesmo formato dos treinos). `feitas` e
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

Scripts clássicos, carregados nesta ordem (sem build). Arquitetura e decisões: `claude/arquitetura.md` no projeto.

| Arquivo | Conteúdo |
|---|---|
| `index.html` | moldura e visual (grafite de amplificador, fonte dos títulos Big Shoulders Display) |
| `base.js` | versão, atalhos do DOM, ícones, ilustrações, migalhas e botão grande; o registro das telas (`VIEWS`) |
| `teoria.js` | motor de teoria (escalas, acordes, intervalos, campo harmônico), afinações e desenhos do braço e do círculo |
| `catalogo.js` | níveis, tamanhos, categorias, escalas, sequências e arpejos, e a volta do treino (afinação, dedos, compasso) |
| `metal.js` | os 17 estilos e as 17 técnicas e os geradores de riffs, solos e técnica |
| `caminho.js` | o caminho do iniciante: cinco etapas, vinte passos escritos à mão |
| `exercicios.js` | o modelo único de exercício: origem, objetivo, estilo, técnicas, competências e mão; índice, filtros e busca |
| `som.js` | o som: guitarra limpa, bateria e metrônomo a partir de `sons/`, com nivelamento e limitador |
| `pratica.js` | braço do treino (fixo, deslizando, técnicas animadas), tablatura, tocador em voltas, trecho em laço, harmonia, gravação e bateria |
| `musicas.js` | playlists de inspiração por estilo |
| `dados.js` | o objeto salvo, sincronização, constância, histórico (praticado e concluído), treino do dia e conquistas |
| `plano.js` | plano de 4 semanas |
| `sessao.js` | sessão por duração, etapas, preparo guiado e rotinas |
| `evolucao.js` | mapa de competências e metas de curto, médio e longo prazo |
| `laboratorio.js` | o Braço, laboratório em cinco modos |
| `estudio.js` | o Estúdio de criação |
| `biblioteca.js` | a biblioteca: domínio público e riffs originais |
| `tela-*.js` | uma tela por arquivo: Início e caminho, Treinos, Músicas, Progresso, Teoria |
| `ferramentas.js` | metrônomo, bateria, mapa do braço, acordes e afinador |
| `janela-treino.js` | a janela do treino e os seus ajustes |
| `app.js` | rotas, navegação, Ajustes, desenho das telas e início do Kit |
| `sons/` | gravações do FluidR3 (MIT): guitarra, baixo, cordas de fundo, bateria e metrônomo; a licença |
| `comum/` | **Kit Fácil**: igual nos apps da família; não edite só aqui |
| `sw.js`, `manifest.webmanifest`, `icons/` | instalação e uso sem internet |
| `tests/` | testes do app |

## Publicação

Direto na `main`; o GitHub Pages publica a pasta raiz.

## Uso do código

Repositório público sem licença: todos os direitos reservados a Bruno de Castro Silva.

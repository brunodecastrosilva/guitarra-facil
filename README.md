# Guitarra Fácil

Treinos de guitarra elétrica do primeiro contato ao estudo avançado, com o braço virtual, a tablatura e o som
trabalhando juntos. Identidade: pedal de efeito vermelho sobre grafite de amplificador, escuro de fábrica e títulos em
Big Shoulders Display.

**Fase de testes** · versão 0.1.0 · <https://brunodecastrosilva.github.io/guitarra-facil/>

O app faz parte do Projeto Fácil. O [Código do Projeto Fácil](comum/CODIGO.md) e os [Anexos](comum/ANEXOS.md) têm
precedência sobre este README.

## Telas

| Navegação | Tela | Para quê |
|---|---|---|
| Barra de baixo | Início | sessão de hoje, próximo passo, continuar, semana, favoritos e caminho do iniciante |
| Barra de baixo | Treinos | catálogo por número e objetivo, com busca, nível, competência e mão; favoritos |
| Barra de baixo | Explorar | o braço como laboratório: notas, escalas, acordes, intervalos e modo livre, com som |
| Barra de baixo | Estúdio | ideias escritas no braço, para ouvir, treinar e variar |
| Mais | Afinador, Metrônomo, Bateria | ferramentas |
| Mais | Biblioteca | obras em domínio público e riffs originais |
| Mais | Acordes | 161 formas com diagrama, notas, fórmula e som |
| Mais | Progresso | semana, competências, histórico e metas |
| Mais | Ajustes | as oito guias comuns e a guia própria Prática |
| Interna | Treino | roteiro (partes desenhadas, ouvir a parte), palco (braço e tablatura com o som) e fim (saiu limpo?) |
| Interna | Sessão de hoje | as cinco etapas, editáveis, e o Começar no pé |
| Interna | Ideia | o editor do Estúdio |

Nas telas internas, a barra de cima tem voltar, título, nuvem e balão, e as ações ficam na barra de baixo da tela, no
lugar da navegação (Código, Arts. 58 e 64).

## Exercícios

Gerados em `exercicios.js` por regras musicais (afinação, métrica, posição e dedilhado), numerados de `#0001` em diante e
identificados por objetivo. Modelo: `{ id, num, objetivo, familia, tecnica, competencia, nivel, mao, bpm: { ini, meta },
compasso, partes: [{ nome, evs }], dica, tipo }`. Evento: `{ d: tempos, n: [[corda, casa, dedo]], t: técnica }`, com a
corda 0 sendo a 6ª. Os testes conferem números únicos, compassos inteiros, casas possíveis e que toda forma de acorde é
reconhecida pela teoria.

Três estados da prática, sempre separados: **praticado** (o app registra o tempo tocado), **concluído** (a pessoa marca
"Saiu limpo") e **avaliado** (não existe: o app não ouve nem avalia a execução).

## Privacidade e dados

| Dado | Onde fica |
|---|---|
| Treinos registrados, andamentos, favoritos, ideias, metas e ajustes de prática | Neste aparelho (`guitarrafacil.db`) |
| Os mesmos dados, com a sincronização ligada | Gist secreto da própria pessoa, criptografado no aparelho |
| Volumes e sessão do dia | Só neste aparelho (`guitarrafacil.aparelho`) |
| Afinador | Som analisado na memória; nada é gravado nem enviado |

## Desenvolvimento

```sh
npm install
npm start          # http://localhost:8080/guitarra-facil/
npm run verificar  # padrão do Código
npm test           # testes do Kit e do app, sem internet
```

Não há etapa de build: HTML, CSS e JavaScript clássicos, carregados em ordem pelo `index.html`.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `index.html`, `estilo.css` | moldura e cores do app |
| `base.js` | versão, atalhos e ícones |
| `teoria.js`, `formas.js` | notas, afinações, intervalos, escalas, acordes e formas de acorde |
| `som.js`, `tocador.js` | gravações FluidR3 e o tempo (trechos, metrônomo e bateria) |
| `braco.js` | desenhos: braço, parte com setas e dedos, tablatura com ritmo e diagrama de acorde |
| `exercicios.js`, `biblioteca.js` | catálogo e obras |
| `dados.js` | o que fica guardado e a junção com a nuvem |
| `telas.js`, `treino.js`, `explorar.js`, `estudio.js`, `ferramentas.js` | telas |
| `guia.js` | guia em dois níveis |
| `app.js` | rotas, navegação, Ajustes e ligação com o Kit |
| `comum/` | Kit Fácil 0.3.0, igual nos quatro apps |
| `tests/` | testes do app |

## Exceções ao padrão

Nenhuma. A exceção anterior (barra de baixo em pilha de amplificadores e fogo animado) foi retirada em 10/11/2026, por
decisão do Bruno.

## Publicação

Direto na `main`; o GitHub Pages serve a pasta raiz. Ao publicar, atualizar a versão em `package.json`, `base.js`,
`sw.js`, os `?v=` do `index.html`, o `CHANGELOG.md` e as novidades em `app.js`.

Os sons vêm do banco FluidR3 (licença MIT; veja `sons/LICENCA-FluidR3.txt`). Repositório público sem licença: todos os
direitos reservados a Bruno de Castro Silva.

# Guitarra Fácil

Ambiente visual e interativo para aprender, explorar e criar na guitarra, do primeiro contato ao estudo avançado. O braço virtual, a tablatura e o som trabalham juntos; a interface usa uma identidade escura, premium e direta, com vermelho como acento.

**Fase de testes** · versão 0.25.3 · <https://brunodecastrosilva.github.io/guitarra-facil/>

O app faz parte do Projeto Fácil. As regras globais e o padrão técnico em `comum/PADRAO.md` têm precedência.

## Arquitetura da experiência

A navegação principal foi reduzida a quatro intenções:

- **Início:** próximo passo, sessão recomendada, sequência, metas e atalhos.
- **Treinos:** catálogo por categoria, técnica, nível, tamanho, competência, mão e objetivo. Gênero musical não é etapa nem filtro.
- **Explorar:** braço virtual, escalas, acordes, intervalos, modo livre, harmonia e ritmo. Substitui as antigas telas separadas de Teoria e Braço.
- **Estúdio:** criação de riffs e ideias por braço ou tablatura, com ritmo, técnicas, reprodução e variações.

Em **Mais** ficam Afinador, Metrônomo, Bateria, Biblioteca, Acordes, Progresso e Ajustes.

Ao abrir, uma apresentação curta (desligável em Ajustes → Preferências gerais) oferece o **guia em 3 níveis**: essencial, exploração e completo.

## Recursos centrais

- **Exercícios identificados por número e objetivo:** por exemplo, `#0001 · Praticar palhetada alternada`. Nomes fantasiosos e rótulos públicos de gênero não fazem parte da escolha.
- **Treino em tela cheia:** braço, tablatura, orientação, andamento e reprodução formam um ambiente único de foco. A tablatura pode rolar horizontalmente quando a linha exigir.
- **Preview antes de tocar:** todo treino abre num roteiro com cada parte desenhada no braço (onde começa, a ordem
  com setas, o dedo), um botão para ouvir só a parte e o Começar preso no rodapé. O botão Roteiro volta a ele.
- **Pausa entre treinos:** na sessão e no treino do dia, o som para no fim de cada treino; a pessoa marca se saiu
  limpo, vê o próximo e segue com "Ver o próximo", que abre o preview dele. Parar e recomeçar fica no mesmo treino.
- **1-2-3-4 previsível:** uma ordem, um desenho e uma casa por parte, subindo e descendo as cordas inteiras.
  Iniciante sem mudar de casa; intermediário sobe uma casa por parte; avançado sobe duas, com aranha e salto de
  cordas. 60 bpm de partida.
- **Técnicas animadas:** bends, slides, hammer-ons, pull-offs, tapping e vibrato têm demonstrações lentas, etapas e instruções visuais.
- **Sessões adaptáveis:** preparação, aquecimento, treino principal, aplicação musical e encerramento dentro do tempo escolhido. Na tela, cada etapa é uma linha que abre para editar, e o Começar fica preso embaixo.
- **Caminho do iniciante:** progressão visual do primeiro toque ao primeiro solo, sem impedir a exploração livre.
- **Biblioteca unificada:** trechos para praticar, repertório pessoal e referências organizadas pelo que se pode aprender. Substitui as antigas telas separadas de Biblioteca e Músicas.
- **Acordes:** mais de 100 formas abertas e móveis, busca por nome ou cifra, famílias, diagramas para destros e canhotos, notas, fórmula, instruções, som e integração com o braço e os treinos.
- **Progresso:** histórico, metas, competências, andamentos e conquistas. O app diferencia prática registrada de habilidade efetivamente avaliada.
- **Áudio local:** guitarra, baixo, cordas de fundo, bateria e metrônomo (bloco de madeira) usam gravações FluidR3 sob licença MIT e funcionam sem internet depois de armazenados.

## Privacidade e dados

| Dado | Onde fica |
|---|---|
| Treinos, favoritos, conquistas, músicas, ideias, metas e preferências | Neste aparelho (`guitarrafacil.db`) |
| Os mesmos dados, quando a sincronização é ativada | Gist secreto da pessoa, criptografado no aparelho |
| Afinador | Áudio analisado em memória; não é gravado nem enviado |
| Gravação de treino | Memória do aparelho; apagada ao fechar o treino e nunca avaliada automaticamente |

## Desenvolvimento

```sh
npm install
npm start
npm run verificar
npm test
```

Não há etapa de build: HTML, CSS e JavaScript clássicos são servidos diretamente. O GitHub Actions executa o verificador, os testes de navegador e as capturas visuais.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `index.html`, `direcao-arte.css` | moldura e direção visual |
| `base.js` | versão, ícones, ilustrações e componentes básicos |
| `dados.js`, `exercicios.js` | persistência, identidade pública dos exercícios, índice e filtros |
| `catalogo.js`, `metal.js` | geradores e regras musicais internas do catálogo |
| `pratica.js`, `janela-treino.js`, `tecnicas.js` | braço, tablatura, reprodução, player e demonstrações técnicas |
| `laboratorio.js`, `tela-teoria.js` | módulo Explorar e teoria aplicada |
| `biblioteca.js`, `tela-musicas.js`, `musicas.js` | Biblioteca unificada e referências |
| `ferramentas.js` | Acordes, Afinador, Metrônomo e Bateria |
| `estudio.js` | criação e edição musical |
| `sessao.js`, `plano.js`, `evolucao.js` | sessões, planejamento e progresso |
| `tela-*.js`, `app.js` | telas, rotas e navegação |
| `comum/` | Kit Fácil compartilhado; deve permanecer idêntico nos apps da família |
| `tests/` | testes funcionais e capturas reproduzíveis |

## Publicação

As versões são publicadas diretamente na `main`; o GitHub Pages serve a pasta raiz. Ao publicar, atualizar `package.json`, `base.js`, `sw.js`, os parâmetros `?v=` de `index.html`, `CHANGELOG.md` e as novidades de `app.js`.

Repositório público sem licença: todos os direitos reservados a Bruno de Castro Silva.

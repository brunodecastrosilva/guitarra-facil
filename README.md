# Guitarra Fácil

Aulas de guitarra elétrica no celular e no computador, para quem começa do zero e para quem já toca: um teste de nível
escolhe onde a trilha começa, e o app acompanha a prática com metrônomo, notas para afinar e os primeiros acordes.

**Fase de testes** · versão 0.1.0 · app web em <https://brunodecastrosilva.github.io/guitarra-facil/>

Faz parte da família do **Projeto Integrador** (Conta Fácil, Elétrica Fácil, Estudo Fácil, Guitarra Fácil). As leis
globais e o padrão técnico (`comum/PADRAO.md`) valem acima das regras deste app.

## O que o app faz

- **Hoje:** a próxima aula da trilha e a prática do dia (meta em minutos).
- **Trilha:** cinco níveis (Primeiros passos, Primeiros acordes, Primeira música, Riffs e escalas, Solos), cada um com
  as suas aulas. Toque no círculo para marcar a aula como feita.
- **Ferramentas:** metrônomo, notas de referência para afinar e diagramas dos primeiros acordes.
- **Músicas:** lista de músicas por situação (Quero aprender, Aprendendo, Já toco).
- **Progresso** (em Mais): aulas feitas, minutos praticados e músicas que você já toca.
- **Ajustes:** as oito guias comuns da família e a guia própria **Prática** (meta diária e onde a trilha começa).

## Onde ficam os dados

| O quê | Onde |
|---|---|
| Aulas feitas, músicas, tempo de prática e preferências | neste aparelho (`guitarrafacil.db`) |
| Os mesmos dados, com a sincronização ligada | gist secreto na conta GitHub do usuário, criptografado no aparelho |
| Avaliações e relatos de problema | Firestore do Projeto Integrador (coleção `feedback`), guardados por 2 anos |

O som do metrônomo e das notas é gerado no aparelho. O app não usa o microfone (o afinador com microfone fica para
uma próxima versão).

## Modelo de dados

Um só objeto (`guitarrafacil.db`, versão 1): `cfg` (nível inicial, meta diária, andamento do metrônomo) e as listas
`feitas` (aulas feitas), `musicas` e `praticas` (minutos de cada sessão com o metrônomo). As listas sincronizam registro
a registro; a mudança mais recente vence.

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
| `app.js` | dados, telas, metrônomo, notas para afinar, acordes e ligação com o Kit |
| `comum/` | **Kit Fácil**: igual nos apps da família; não edite só aqui |
| `sw.js`, `manifest.webmanifest`, `icons/` | instalação e uso sem internet |
| `tests/` | testes do app |

## Publicação

Direto na `main`; o GitHub Pages publica a pasta raiz.

## Uso do código

Repositório público sem licença: todos os direitos reservados a Bruno de Castro Silva.

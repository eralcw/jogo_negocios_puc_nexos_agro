# Nexus Dossiê — jogo de empresas

Jogo de simulação empresarial para a disciplina de **Empreendedorismo em CD e IA**. Cada mesa administra uma empresa que vende agentes de IA para dossiês regulatórios e disputa os mesmos clientes. Em cada rodada, as mesas decidem **preço, marketing, qualidade/compliance e capacidade**; o sistema calcula clientes, receita, custos, lucro e caixa e mostra o placar.

Feito para rodar em sala: abre no navegador, sem instalar nada e sem internet.

---

## Como jogar

1. Abra o arquivo **`jogo.html`** no navegador (duplo clique). É a versão em arquivo único, fácil de compartilhar. A versão modular fica em `index.html`.
2. Leia a aba **Regras** com a turma.
3. Em **Configuração**, defina as mesas, as rodadas e o mercado de cada rodada.
4. Em **Decisões**, lance as decisões de cada mesa e clique em **Calcular rodada**.
5. Em **Resultados**, veja o placar e siga para a próxima rodada.
6. Em **Histórico**, exporte os resultados em CSV.

Roteiro completo para conduzir a aula: [`docs/ROTEIRO-FACILITADOR.md`](docs/ROTEIRO-FACILITADOR.md).
Regras completas: [`docs/REGRAS.md`](docs/REGRAS.md).

---

## Arquivos

| Arquivo | Função |
|---|---|
| `jogo.html` | **Versão em arquivo único** (CSS e JS embutidos) — abra esta |
| `index.html` | Versão modular (carrega `style.css`, `sim.js` e `app.js`) |
| `style.css` | Visual |
| `sim.js` | Motor de simulação (regras e cálculo), sem DOM |
| `app.js` | Interface e interação |
| `test/sim.test.js` | Testes do motor (`node test/sim.test.js`) |
| `build.js` | Gera o `jogo.html` a partir dos arquivos separados (`node build.js`) |
| `docs/REGRAS.md` | Regras completas e folha de decisões para imprimir |
| `docs/ROTEIRO-FACILITADOR.md` | Passo a passo para conduzir a rodada em sala |

---

## Se os botões não responderem

1. Abra o **`jogo.html`** com duplo clique, no **Chrome, Edge ou Firefox**. Não use o visualizador de arquivos nem o preview do Claude — ele mostra a página, mas não deixa clicar.
2. Olhe o selo no canto superior direito:
   - **AGUARDANDO CONFIGURAÇÃO** → o jogo carregou e os botões funcionam.
   - **—** → o JavaScript não rodou; confira se abriu no navegador e se o JavaScript está ativado.
3. Se aparecer uma faixa vermelha de erro no topo, ela diz o que falhou.

> Dica: se o navegador abrir o arquivo em outro programa, clique com o botão direito em `jogo.html` → **Abrir com** → Chrome/Edge.

---

## Modo demonstração

Para mostrar um placar de exemplo sem jogar, abra o jogo com `?demo=1` no endereço (por exemplo, `jogo.html?demo=1`). Ele carrega uma partida de 3 rodadas já calculada, com vencedor e histórico — útil para explicar as regras antes de começar.

Se estiver abrindo o arquivo direto (sem servidor), digite o endereço completo no navegador, por exemplo:
`file:///C:/Users/win/OneDrive/repos/jogo_negocios_puc_nexos_agro/jogo.html?demo=1`.

---

## Regras em resumo

- **Objetivo:** terminar com o maior caixa acumulado.
- **Mercado:** 16 → 20 → 24 clientes (padrão).
- **Decisões por rodada:** preço (R$ 5–12 mil), marketing (R$ 0–20 mil), qualidade (R$ 0–20 mil), capacidade (4, 6 ou 8 clientes).
- **Atratividade:** qualidade e marketing atraem; preço afasta.
- **Clientes:** mercado dividido por atratividade, limitado pela capacidade.
- **Qualidade abaixo de R$ 5 mil:** incidente de compliance e perda de 1 cliente.
- **Receita:** clientes × preço × 3 meses.
- **Custos:** 15 fixo + marketing + qualidade + custo da capacidade + 2 × clientes.

Todos os valores em R$ mil. O cálculo é determinístico: as mesmas decisões geram o mesmo resultado.

---

## Ajustar o jogo

As regras ficam em `sim.js`, no objeto `DEFAULTS`:

```js
const DEFAULTS = {
  basePrice: 8,          // preço de referência
  priceExponent: 1.5,    // sensibilidade a preço
  fixedCost: 15,         // custo fixo por rodada
  varCostPerClient: 2,   // custo variável por cliente
  monthsPerRound: 3,     // meses faturados por rodada
  qualityFloor: 5,       // abaixo disso, perde 1 cliente
  capacityCost: { 4: 8, 6: 14, 8: 22 },
  marketSizes: [16, 20, 24],
  startCash: 0,
  rounds: 3,
};
```

Alterar esses valores muda o equilíbrio do jogo. Depois de mexer, rode os testes:

```bash
node test/sim.test.js
```

---

## Testes

```bash
node test/sim.test.js
```

Verificam: divisão do mercado, efeito do preço, limite de capacidade, incidente de qualidade, clientes não atendidos e acúmulo de caixa.

---

## Observações técnicas

- Sem dependências e sem build: HTML, CSS e JavaScript puro.
- Funciona offline. Para compartilhar, envie a pasta inteira (ou compacte em `.zip`).
- O progresso é salvo no navegador (`localStorage`). O botão **Nova partida** limpa a sessão.
- Se o navegador bloquear o armazenamento local, o jogo continua funcionando na sessão atual, sem salvar.

---

## Créditos

Projeto acadêmico — PUC-SP, Ciência de Dados e Inteligência Artificial, disciplina Empreendedorismo em CD e IA (Prof. Wagner Tufano). Tema inspirado no plano de negócios da Nexus Agro.

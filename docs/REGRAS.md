# Nexus Dossiê — Regras do jogo

**Jogo de empresas para a disciplina de Empreendedorismo em CD e IA**
Tema: uma disputa pelo mercado de dossiês regulatórios no setor de proteção de cultivos.

---

## 1. O que é o jogo

Cada **mesa** é uma empresa que vende uma plataforma de agentes de IA para montar e revisar dossiês regulatórios. Todas as mesas disputam os **mesmos clientes**: empresas de proteção de cultivos que precisam registrar produtos.

**Objetivo:** ao fim das rodadas, vence a mesa com o **maior caixa acumulado** (soma dos lucros).

> O jogo não é de sorte. É de **estratégia consistente**: preço, marketing, qualidade e capacidade puxam o resultado em direções diferentes.

---

## 2. Como funciona uma rodada

1. O facilitador anuncia o **tamanho do mercado** da rodada (quantos clientes estão disponíveis).
2. Cada mesa discute e anota **4 decisões** na folha de decisões.
3. O facilitador lança as decisões de todas as mesas no sistema.
4. O sistema calcula clientes, receita, custos, lucro e caixa e mostra o **placar**.
5. O facilitador comenta os resultados e libera a rodada seguinte.

Duração sugerida: 8 a 12 minutos por rodada.

---

## 3. As 4 decisões

| Decisão | Faixa | O que faz |
|---|---|---|
| **Preço** | R$ 5 a 12 mil por cliente/mês | Preço maior aumenta a receita por cliente, mas reduz a atratividade. |
| **Marketing** | R$ 0 a 20 mil | Aumenta a atratividade e a captação de clientes. Custa na rodada. |
| **Qualidade / compliance** | R$ 0 a 20 mil | Aumenta a atratividade e evita incidente. **Abaixo de R$ 5 mil, a empresa perde 1 cliente.** |
| **Capacidade** | 4, 6 ou 8 clientes | Limita quantos clientes a empresa atende. Custa R$ 8, 14 ou 22 mil. |

Todos os valores em **R$ mil**.

---

## 4. Como o resultado é calculado

**1. Atratividade de cada empresa**

```
atratividade = (1 + qualidade ÷ 10) × (1 + marketing ÷ 10) ÷ (preço ÷ 8)^1,5
```

**2. Clientes**

O mercado da rodada é dividido entre as empresas **proporcionalmente à atratividade**, mas cada empresa só recebe até a sua **capacidade**. Quem não tem vaga perde clientes para os concorrentes com espaço.

**3. Receita**

```
receita = clientes × preço × 3 meses
```

**4. Custos**

```
custos = 15 (fixo) + marketing + qualidade + custo da capacidade + 2 × clientes
```

Onde o custo da capacidade é: 4 → R$ 8 mil; 6 → R$ 14 mil; 8 → R$ 22 mil.

**5. Lucro e caixa**

```
lucro = receita − custos
caixa = caixa anterior + lucro
```

---

## 5. Mercado por rodada

Padrão: **16 → 20 → 24 clientes**. O mercado cresce a cada rodada, como no setor real.

Se a soma das capacidades das mesas for menor que o mercado, sobram **clientes não atendidos** — e ninguém fatura com eles. É a lição de capacidade.

---

## 6. Incidente de compliance

Se uma empresa investir **menos de R$ 5 mil em qualidade**, ela sofre um **incidente de compliance** e perde 1 cliente naquela rodada.

A mensagem: cortar qualidade para economizar parece barato, mas custa cliente e reputação.

---

## 7. Exemplo de uma rodada

Quatro mesas, mercado de 16 clientes. Decisões:

| Mesa | Preço | Marketing | Qualidade | Capacidade |
|---|---|---|---|---|
| A | 8 | 10 | 10 | 6 |
| B | 6 | 15 | 5 | 8 |
| C | 11 | 5 | 15 | 6 |
| D | 8 | 5 | 5 | 4 |

Resultado aproximado:

| Mesa | Clientes | Receita | Custos | Lucro | Caixa |
|---|---|---|---|---|---|
| A | 4 | R$ 96 mil | R$ 57 mil | R$ 39 mil | R$ 39 mil |
| B | 6 | R$ 108 mil | R$ 69 mil | R$ 39 mil | R$ 39 mil |
| C | 3 | R$ 99 mil | R$ 55 mil | R$ 44 mil | R$ 44 mil |
| D | 3 | R$ 72 mil | R$ 39 mil | R$ 33 mil | R$ 33 mil |

Repare: a mesa C cobrou caro e investiu em qualidade — ganhou menos clientes, mas teve o maior lucro. A mesa B comprou volume com preço baixo. Nenhuma estratégia é obviamente errada; o jogo premia a **coerência**.

---

## 8. Folha de decisões (para imprimir)

Uma por mesa, por rodada.

| Rodada | Preço (R$ 5–12) | Marketing (R$ 0–20) | Qualidade (R$ 0–20) | Capacidade (4/6/8) |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Após cada rodada, anote:**

- Clientes conquistados: ____
- Lucro da rodada: R$ ____ mil
- Caixa acumulado: R$ ____ mil

---

## 9. O que o jogo ensina

- **Não existe decisão isolada boa.** Preço, marketing, qualidade e capacidade se compensam.
- **Capacidade sem demanda é custo; demanda sem capacidade é cliente perdido.**
- **Compliance é parte do produto.** Cortar qualidade gera incidente e perde cliente.
- **Estratégia consistente vence lance isolado.** É melhor ter uma proposta clara do que ser agressivo em tudo.
- **O mercado cresce, mas a competição também.** Quem não acompanha perde espaço.

---

## 10. Dicas para as mesas

1. Escolham **uma estratégia** antes da primeira rodada: volume (preço baixo), valor (preço alto + qualidade) ou equilíbrio.
2. Olhem a **capacidade** antes de investir em marketing: não adianta atrair clientes que não consegue atender.
3. Não zerem qualidade: o incidente custa mais do que a economia.
4. Anotem o caixa a cada rodada — é ele que define o vencedor, não o lucro de uma rodada só.
5. Ajustem com base no placar, não no palpite.

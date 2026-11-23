/* Testes rápidos do motor (node test/sim.test.js) */
const Sim = require("../sim.js");

let ok = 0, fail = 0;
function check(name, cond, info) {
  if (cond) { ok++; console.log("  OK  ", name); }
  else { fail++; console.log("  FAIL", name, info ?? ""); }
}
const cfg = { ...Sim.DEFAULTS };

// 1) times idênticos dividem o mercado e lucram
{
  const state = { teams: [{ name: "A", cash: 0 }, { name: "B", cash: 0 }, { name: "C", cash: 0 }, { name: "D", cash: 0 }], roundIndex: 0, history: [] };
  const dec = state.teams.map(() => ({ price: 8, marketing: 8, quality: 8, capacity: 6 }));
  const r = Sim.runRound(state, dec, cfg);
  console.log("\n1) idênticos:", r.results.map(x => `${x.name}:${x.clients}c/${x.profit}l`).join("  "), "| não atendidos:", r.unserved);
  check("soma dos clientes = mercado", r.results.reduce((a, x) => a + x.clients, 0) === r.marketSize);
  check("todos lucram", r.results.every(x => x.profit > 0));
}

// 2) preço alto perde clientes
{
  const state = { teams: [{ name: "Caro", cash: 0 }, { name: "B", cash: 0 }, { name: "C", cash: 0 }, { name: "D", cash: 0 }], roundIndex: 0, history: [] };
  const dec = [
    { price: 12, marketing: 8, quality: 8, capacity: 8 },
    { price: 8, marketing: 8, quality: 8, capacity: 8 },
    { price: 8, marketing: 8, quality: 8, capacity: 8 },
    { price: 8, marketing: 8, quality: 8, capacity: 8 },
  ];
  const r = Sim.runRound(state, dec, cfg);
  console.log("2) preço alto:", r.results.map(x => `${x.name}:${x.clients}c`).join("  "));
  check("caro tem menos clientes que os demais", r.results[0].clients < r.results[1].clients);
}

// 3) capacidade limita e redistribui
{
  const state = { teams: [{ name: "A", cash: 0 }, { name: "B", cash: 0 }, { name: "C", cash: 0 }, { name: "D", cash: 0 }], roundIndex: 0, history: [] };
  const dec = [
    { price: 6, marketing: 20, quality: 20, capacity: 4 }, // atrai muito, mas só atende 4
    { price: 8, marketing: 0, quality: 8, capacity: 8 },
    { price: 8, marketing: 0, quality: 8, capacity: 8 },
    { price: 8, marketing: 0, quality: 8, capacity: 8 },
  ];
  const r = Sim.runRound(state, dec, cfg);
  console.log("3) capacidade:", r.results.map(x => `${x.name}:${x.clients}c`).join("  "));
  check("A não passa da capacidade 4", r.results[0].clients <= 4);
  check("mercado ainda é atendido", r.unserved === 0);
}

// 4) piso de qualidade gera incidente
{
  const state = { teams: [{ name: "A", cash: 0 }, { name: "B", cash: 0 }], roundIndex: 0, history: [] };
  const dec = [
    { price: 8, marketing: 8, quality: 2, capacity: 8 },
    { price: 8, marketing: 8, quality: 8, capacity: 8 },
  ];
  const r = Sim.runRound(state, dec, cfg);
  console.log("4) qualidade baixa:", r.results.map(x => `${x.name}:${x.clients}c incidente=${x.incident}`).join("  "));
  check("A sofre incidente", r.results[0].incident === true);
  check("B não sofre incidente", r.results[1].incident === false);
}

// 5) mercado maior que a capacidade total
{
  const state = { teams: [{ name: "A", cash: 0 }, { name: "B", cash: 0 }, { name: "C", cash: 0 }], roundIndex: 0, history: [] };
  const dec = state.teams.map(() => ({ price: 8, marketing: 0, quality: 8, capacity: 4 })); // 3 x 4 = 12 < 16
  const r = Sim.runRound(state, dec, cfg);
  console.log("5) capacidade total baixa: clientes não atendidos =", r.unserved);
  check("há clientes não atendidos", r.unserved === 4);
}

// 6) caixa acumula entre rodadas
{
  let state = { teams: [{ name: "A", cash: 0 }], roundIndex: 0, history: [] };
  const d = [{ price: 8, marketing: 5, quality: 8, capacity: 6 }];
  state = Sim.applyRound(state, Sim.runRound(state, d, cfg));
  const after1 = state.teams[0].cash;
  state = Sim.applyRound(state, Sim.runRound(state, d, cfg));
  console.log("6) caixa após 2 rodadas:", after1, "->", state.teams[0].cash);
  check("caixa mudou após 2 rodadas", state.teams[0].cash !== after1);
  check("histórico tem 2 rodadas", state.history.length === 2);
}

console.log(`\nRESULTADO: ${ok} ok, ${fail} falhas`);
process.exit(fail ? 1 : 0);

/*
 * Nexus Dossiê — motor de simulação (puro, sem DOM)
 * Unidades monetárias em R$ mil.
 * Funciona no navegador (window.Sim) e no Node (module.exports).
 */
(function (global) {
  "use strict";

  const DEFAULTS = {
    basePrice: 8,        // preço de referência (R$ mil/cliente/mês)
    priceExponent: 1.5,  // sensibilidade a preço
    fixedCost: 15,       // custo fixo por rodada (R$ mil)
    varCostPerClient: 2, // custo variável por cliente na rodada (R$ mil)
    monthsPerRound: 3,   // meses faturados por rodada
    qualityFloor: 5,     // abaixo disso, incidente de compliance: perde 1 cliente
    capacityCost: { 4: 8, 6: 14, 8: 22 }, // custo de equipe por capacidade (R$ mil/rodada)
    marketSizes: [16, 20, 24],
    startCash: 0,
    rounds: 3,
  };

  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

  // Atratividade de uma empresa: qualidade e marketing atraem; preço afasta.
  function attractiveness(d, cfg) {
    const price = Math.max(1, Number(d.price) || cfg.basePrice);
    const q = Math.max(0, Number(d.quality) || 0);
    const m = Math.max(0, Number(d.marketing) || 0);
    return ((1 + q / 10) * (1 + m / 10)) / Math.pow(price / cfg.basePrice, cfg.priceExponent);
  }

  /*
   * Distribui os clientes do mercado entre as empresas.
   * - proporcional à atratividade (método do maior resto)
   * - respeita a capacidade de cada empresa
   * - redistribui quem ficou sem vaga para quem tem espaço
   * - aplica o piso de qualidade (incidente de compliance)
   */
  function allocate(decisions, marketSize, cfg) {
    const n = decisions.length;
    const attrs = decisions.map((d) => Math.max(0.0001, attractiveness(d, cfg)));
    const total = attrs.reduce((a, b) => a + b, 0);
    const caps = decisions.map((d) => clamp(Number(d.capacity) || 4, 4, 8));

    // 1) cota bruta e parte inteira
    const raw = attrs.map((a) => (marketSize * a) / total);
    let alloc = raw.map((r) => Math.floor(r));
    let assigned = alloc.reduce((a, b) => a + b, 0);

    // 2) maior resto para fechar o mercado
    const order = raw
      .map((r, i) => ({ i, frac: r - Math.floor(r) }))
      .sort((a, b) => b.frac - a.frac);
    let k = 0;
    while (assigned < marketSize && k < order.length * 3) {
      const idx = order[k % n].i;
      if (alloc[idx] < caps[idx]) { alloc[idx] += 1; assigned += 1; }
      k += 1;
      if (k > n * 4) break;
    }

    // 3) respeita capacidade e acumula excedente
    let excess = 0;
    for (let i = 0; i < n; i++) {
      if (alloc[i] > caps[i]) { excess += alloc[i] - caps[i]; alloc[i] = caps[i]; }
    }

    // 4) redistribui o excedente para quem tem vaga (ponderado por atratividade)
    let guard = 0;
    while (excess > 0 && guard < 1000) {
      const takers = [];
      for (let i = 0; i < n; i++) if (alloc[i] < caps[i]) takers.push(i);
      if (takers.length === 0) break;
      const wsum = takers.reduce((a, i) => a + attrs[i], 0);
      // dá 1 cliente por vez ao de maior "demanda reprimida relativa"
      let best = takers[0], bestScore = -1;
      for (const i of takers) {
        const score = (attrs[i] / wsum) * (caps[i] - alloc[i]);
        if (score > bestScore) { bestScore = score; best = i; }
      }
      alloc[best] += 1;
      excess -= 1;
      guard += 1;
    }

    // 5) piso de qualidade
    const incident = decisions.map((d, i) => {
      const q = Number(d.quality) || 0;
      if (q < cfg.qualityFloor && alloc[i] > 0) { alloc[i] -= 1; return true; }
      return false;
    });

    const served = alloc.reduce((a, b) => a + b, 0);
    return { clients: alloc, incident, unserved: Math.max(0, marketSize - served) };
  }

  // Calcula uma rodada e devolve os resultados por empresa.
  function runRound(state, decisions, cfg) {
    const msz = cfg.marketSizes[state.roundIndex];
    const marketSize = (msz === undefined || msz === null) ? cfg.marketSizes[cfg.marketSizes.length - 1] : msz;
    const { clients, incident, unserved } = allocate(decisions, marketSize, cfg);

    const results = state.teams.map((team, i) => {
      const d = decisions[i];
      const c = clients[i];
      const revenue = c * (Number(d.price) || 0) * cfg.monthsPerRound;
      const tc = cfg.capacityCost[Number(d.capacity)];
      const teamCost = (tc === undefined) ? cfg.capacityCost[6] : tc;
      const costs =
        cfg.fixedCost +
        (Number(d.marketing) || 0) +
        (Number(d.quality) || 0) +
        teamCost +
        cfg.varCostPerClient * c;
      const profit = revenue - costs;
      const cash = (team.cash || 0) + profit;
      return {
        name: team.name,
        price: Number(d.price),
        marketing: Number(d.marketing),
        quality: Number(d.quality),
        capacity: Number(d.capacity),
        clients: c,
        revenue,
        costs,
        profit,
        cash,
        incident: incident[i],
      };
    });

    return { round: state.roundIndex + 1, marketSize, unserved, results };
  }

  // Aplica o resultado ao estado (mutável) e guarda no histórico.
  function applyRound(state, roundResult) {
    roundResult.results.forEach((r, i) => { state.teams[i].cash = r.cash; });
    state.history.push(roundResult);
    state.roundIndex += 1;
    return state;
  }

  function ranking(results) {
    return [...results].sort((a, b) => b.cash - a.cash);
  }

  const API = { DEFAULTS, attractiveness, allocate, runRound, applyRound, ranking, clamp };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else global.Sim = API;
})(typeof window !== "undefined" ? window : globalThis);

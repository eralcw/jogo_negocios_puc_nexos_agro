/* Nexus Dossiê — interface (JavaScript puro, sem dependências)
 * Interação ligada por onclick direto no HTML + boot imediato.
 */
(function () {
  "use strict";

  var KEY = "nexus-jogo-v2";
  var booted = false;

  function $(sel) { return document.querySelector(sel); }
  function $$(sel, root) {
    var base = (root && typeof root.querySelectorAll === "function") ? root : document;
    return Array.prototype.slice.call(base.querySelectorAll(sel));
  }

  function defDec() { return { price: 8, marketing: 8, quality: 8, capacity: 6 }; }

  var S = load() || {
    started: false, teams: [],
    config: { rounds: 3, marketSizes: [16, 20, 24], startCash: 0 },
    roundIndex: 0, history: [], decisions: [], lastResult: null, finished: false
  };

  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function load() { try { var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }

  function fmt(n) { return "R$ " + Math.round(n).toLocaleString("pt-BR") + " mil"; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function clampInt(v, lo, hi, dflt) { var n = parseInt(v, 10); if (isNaN(n)) return dflt; return Math.max(lo, Math.min(hi, n)); }
  function clampNum(v, lo, hi, dflt) { var n = parseFloat(v); if (isNaN(n)) return dflt; return Math.max(lo, Math.min(hi, n)); }

  /* ---------------- navegação ---------------- */
  function go(name) {
    $$(".tabs button").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-tab") === name); });
    $$(".tab").forEach(function (t) { t.classList.toggle("active", t.id === "tab-" + name); });
    if (name === "decisoes") renderDecisions();
    if (name === "resultados") renderResults();
    if (name === "historico") renderHistory();
    if (name === "config") renderConfig();
  }

  /* ---------------- cabeçalho ---------------- */
  function renderHeader() {
    var el = $("#roundPill");
    if (!el) return;
    if (!S.started) { el.textContent = "AGUARDANDO CONFIGURAÇÃO"; return; }
    if (S.finished) { el.textContent = "PARTIDA ENCERRADA"; return; }
    el.textContent = "RODADA " + (S.roundIndex + 1) + " / " + S.config.rounds;
  }

  /* ---------------- configuração ---------------- */
  function renderConfig() {
    var cfgTeams = $("#cfgTeams");
    if (!cfgTeams) return;
    var n = clampInt(cfgTeams.value, 2, 8, 4);
    var wrap = $("#teamNames");
    var current = $$("input", wrap).map(function (i) { return i.value; });
    wrap.innerHTML = "";
    for (var i = 0; i < n; i++) {
      var label = document.createElement("label");
      label.appendChild(document.createTextNode("MESA " + (i + 1)));
      var inp = document.createElement("input");
      inp.type = "text";
      inp.value = current[i] || "Mesa " + (i + 1);
      label.appendChild(inp);
      wrap.appendChild(label);
    }
  }

  function parseMarket(txt, rounds) {
    var vals = String(txt || "").split(/[,;\s]+/).map(function (x) { return parseInt(x, 10); }).filter(function (x) { return !isNaN(x) && x > 0; });
    if (!vals.length) { vals = [16, 20, 24]; }
    while (vals.length < rounds) { vals.push(vals[vals.length - 1]); }
    return vals.slice(0, rounds);
  }

  function startGame() {
    var n = clampInt($("#cfgTeams").value, 2, 8, 4);
    var rounds = clampInt($("#cfgRounds").value, 1, 5, 3);
    var cash = clampInt($("#cfgCash").value, 0, 500, 0);
    var market = parseMarket($("#cfgMarket").value, rounds);
    var names = $$("input", $("#teamNames")).map(function (i, k) { return (i.value.trim() || "Mesa " + (k + 1)); });

    var teams = [];
    for (var i = 0; i < names.length; i++) { teams.push({ name: names[i], cash: cash }); }

    S = {
      started: true, teams: teams,
      config: { rounds: rounds, marketSizes: market, startCash: cash },
      roundIndex: 0, history: [], decisions: names.map(defDec), lastResult: null, finished: false
    };
    save(); renderHeader(); go("decisoes");
  }

  /* ---------------- decisões ---------------- */
  function marketFor(idx) {
    var m = S.config.marketSizes;
    var v = m[idx];
    return (v === undefined || v === null) ? m[m.length - 1] : v;
  }

  function renderDecisions() {
    if (!S.started) { go("config"); return; }
    var round = S.roundIndex + 1;
    $("#decTitle").textContent = "Decisões da rodada " + round;
    $("#decMarket").textContent = "MERCADO: " + marketFor(S.roundIndex) + " CLIENTES";
    $("#decHint").textContent = "Capacidade 4 custa R$ 8 mil; 6 custa R$ 14 mil; 8 custa R$ 22 mil.";

    var tbody = $("#decTable tbody");
    tbody.innerHTML = "";
    S.teams.forEach(function (t, i) {
      var d = S.decisions[i] || defDec();
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + esc(t.name) + "</td>" +
        '<td data-label="Preço"><input type="number" min="5" max="12" step="0.5" value="' + d.price + '" data-k="price"></td>' +
        '<td data-label="Marketing"><input type="number" min="0" max="20" step="1" value="' + d.marketing + '" data-k="marketing"></td>' +
        '<td data-label="Qualidade"><input type="number" min="0" max="20" step="1" value="' + d.quality + '" data-k="quality"></td>' +
        '<td data-label="Capacidade"><select data-k="capacity">' +
        '<option value="4"' + (d.capacity === 4 ? " selected" : "") + ">4</option>" +
        '<option value="6"' + (d.capacity === 6 ? " selected" : "") + ">6</option>" +
        '<option value="8"' + (d.capacity === 8 ? " selected" : "") + ">8</option>" +
        "</select></td>";
      tbody.appendChild(tr);
    });
    $("#calcMsg").textContent = "";
  }

  function calculate() {
    if (!S.started) { go("config"); return; }
    if (S.finished) { go("resultados"); return; }

    var rows = $$("#decTable tbody tr");
    var decisions = rows.map(function (tr) {
      function get(k) { return tr.querySelector('[data-k="' + k + '"]').value; }
      return {
        price: clampNum(get("price"), 5, 12, 8),
        marketing: clampNum(get("marketing"), 0, 20, 8),
        quality: clampNum(get("quality"), 0, 20, 8),
        capacity: Number(get("capacity"))
      };
    });

    S.decisions = decisions;
    var cfg = Object.assign({}, Sim.DEFAULTS, { marketSizes: S.config.marketSizes });
    var result = Sim.runRound(S, decisions, cfg);
    Sim.applyRound(S, result);
    S.lastResult = result;
    if (S.roundIndex >= S.config.rounds) { S.finished = true; }
    save(); renderHeader(); go("resultados");
  }

  /* ---------------- resultados ---------------- */
  function renderResults() {
    var wrap = $("#resWrap");
    if (!S.lastResult) {
      wrap.innerHTML = '<div class="card"><h2>Resultados</h2><p class="muted">Ainda não há rodada calculada. Vá em Decisões e clique em Calcular rodada.</p></div>';
      return;
    }
    var r = S.lastResult;
    var ranked = Sim.ranking(r.results);
    var max = 1;
    ranked.forEach(function (x) { if (Math.abs(x.cash) > max) max = Math.abs(x.cash); });
    var leader = ranked[0];

    var rows = ranked.map(function (x, i) {
      return "<tr>" +
        "<td>" + (i + 1) + "º</td>" +
        "<td>" + esc(x.name) + (x.incident ? ' <span class="badge">INCIDENTE</span>' : "") + "</td>" +
        "<td>" + x.clients + "</td>" +
        "<td>" + fmt(x.revenue) + "</td>" +
        "<td>" + fmt(x.costs) + "</td>" +
        '<td class="' + (x.profit < 0 ? "neg" : "pos") + '">' + fmt(x.profit) + "</td>" +
        "<td><strong>" + fmt(x.cash) + "</strong></td>" +
        "</tr>";
    }).join("");

    var bars = ranked.map(function (x) {
      var w = Math.max(2, (Math.abs(x.cash) / max) * 100);
      var color = x.cash < 0 ? "background:#FF6B5E" : "";
      return '<div class="bar-row"><span class="bar-name">' + esc(x.name) + "</span>" +
        '<span class="bar-track"><span class="bar-fill" style="width:' + w + "%;" + color + '"></span></span>' +
        '<span class="bar-val ' + (x.cash < 0 ? "neg" : "") + '">' + fmt(x.cash) + "</span></div>";
    }).join("");

    var html =
      '<div class="card">' +
        '<div class="res-head"><h2>Resultado da rodada ' + r.round + "</h2>" +
        '<span class="pill soft">MERCADO: ' + r.marketSize + " CLIENTES</span></div>" +
        '<div class="summary">' +
          '<div><span class="k">Líder no caixa</span><span class="v">' + esc(leader.name) + "</span></div>" +
          '<div><span class="k">Caixa do líder</span><span class="v">' + fmt(leader.cash) + "</span></div>" +
          '<div><span class="k">Não atendidos</span><span class="v">' + r.unserved + "</span></div>" +
          '<div><span class="k">Rodada</span><span class="v">' + r.round + " / " + S.config.rounds + "</span></div>" +
        "</div>" +
        '<div class="table-wrap"><table class="res-table"><thead><tr>' +
          "<th>#</th><th>Empresa</th><th>Clientes</th><th>Receita</th><th>Custos</th><th>Lucro</th><th>Caixa</th>" +
        "</tr></thead><tbody>" + rows + "</tbody></table></div>" +
        "<h3>Caixa acumulado</h3>" +
        '<div class="chart">' + bars + "</div>" +
      "</div>";

    if (S.finished) {
      html += '<div class="winner"><h2>Resultado final</h2><p><strong>' + esc(leader.name) + "</strong> venceu com caixa de " + fmt(leader.cash) + ".</p></div>" +
        '<div class="actions"><button class="btn primary" onclick="NX.go(\'historico\')">Ver histórico</button>' +
        '<button class="btn" onclick="NX.reset()">Nova partida</button></div>';
    } else {
      html += '<div class="actions"><button class="btn primary" onclick="NX.go(\'decisoes\')">Próxima rodada</button></div>';
    }

    wrap.innerHTML = html;
  }

  /* ---------------- histórico ---------------- */
  function renderHistory() {
    var wrap = $("#histWrap");
    if (!S.history.length) { wrap.innerHTML = '<p class="muted">Nenhuma rodada calculada ainda.</p>'; return; }
    wrap.innerHTML = S.history.map(function (r) {
      var rows = r.results.map(function (x) {
        return "<tr><td>" + esc(x.name) + "</td><td>" + x.price + "</td><td>" + x.marketing + "</td><td>" + x.quality + "</td><td>" + x.capacity + "</td><td>" + x.clients + "</td>" +
          '<td class="' + (x.profit < 0 ? "neg" : "pos") + '">' + fmt(x.profit) + "</td><td>" + fmt(x.cash) + "</td></tr>";
      }).join("");
      return '<div class="hist-round"><h3>Rodada ' + r.round + " · mercado de " + r.marketSize + " clientes</h3>" +
        '<div class="table-wrap"><table class="hist-table"><thead><tr><th>Empresa</th><th>Preço</th><th>Marketing</th><th>Qualidade</th><th>Capacidade</th><th>Clientes</th><th>Lucro</th><th>Caixa</th></tr></thead><tbody>' +
        rows + "</tbody></table></div></div>";
    }).join("");
  }

  /* ---------------- utilidades ---------------- */
  function exportCsv() {
    if (!S.history.length) { alert("Ainda não há resultados para exportar."); return; }
    var lines = ["rodada;empresa;preco_mil;marketing_mil;qualidade_mil;capacidade;clientes;receita_mil;custos_mil;lucro_mil;caixa_mil"];
    S.history.forEach(function (r) {
      r.results.forEach(function (x) {
        lines.push([r.round, x.name, x.price, x.marketing, x.quality, x.capacity, x.clients, Math.round(x.revenue), Math.round(x.costs), Math.round(x.profit), Math.round(x.cash)].join(";"));
      });
    });
    var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nexus-dossie-resultados.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function resetGame() {
    if (!confirm("Começar uma nova partida? Os resultados atuais serão apagados.")) return;
    try { localStorage.removeItem(KEY); } catch (e) {}
    S = { started: false, teams: [], config: { rounds: 3, marketSizes: [16, 20, 24], startCash: 0 }, roundIndex: 0, history: [], decisions: [], lastResult: null, finished: false };
    renderHeader(); go("config");
  }

  function demoState() {
    var st = { teams: [{ name: "Mesa 1", cash: 0 }, { name: "Mesa 2", cash: 0 }, { name: "Mesa 3", cash: 0 }, { name: "Mesa 4", cash: 0 }], roundIndex: 0, history: [] };
    var rounds = [
      [{ price: 8, marketing: 10, quality: 10, capacity: 6 }, { price: 6, marketing: 15, quality: 5, capacity: 8 }, { price: 11, marketing: 5, quality: 15, capacity: 6 }, { price: 8, marketing: 5, quality: 5, capacity: 4 }],
      [{ price: 9, marketing: 8, quality: 8, capacity: 6 }, { price: 7, marketing: 12, quality: 8, capacity: 8 }, { price: 10, marketing: 6, quality: 15, capacity: 6 }, { price: 8, marketing: 8, quality: 10, capacity: 6 }],
      [{ price: 10, marketing: 6, quality: 10, capacity: 6 }, { price: 7, marketing: 10, quality: 10, capacity: 8 }, { price: 9, marketing: 8, quality: 14, capacity: 6 }, { price: 8, marketing: 10, quality: 12, capacity: 6 }]
    ];
    rounds.forEach(function (dec) { var r = Sim.runRound(st, dec, Sim.DEFAULTS); Sim.applyRound(st, r); st.lastResult = r; });
    return { started: true, teams: st.teams, config: { rounds: 3, marketSizes: [16, 20, 24], startCash: 0 }, roundIndex: 3, history: st.history, decisions: rounds[2], lastResult: st.lastResult, finished: true };
  }

  /* ---------------- boot ---------------- */
  function boot() {
    if (booted) return;
    booted = true;
    var wantDemo = (typeof window !== "undefined" && window.__DEMO__) || (typeof location !== "undefined" && location.search.indexOf("demo") >= 0);
    if (wantDemo) { S = demoState(); save(); renderHeader(); go("resultados"); return; }
    renderConfig();
    renderHeader();
    if (S.started) {
      if (S.finished && S.lastResult) { go("resultados"); } else { go("decisoes"); }
    } else {
      go("regras");
    }
  }

  /* expõe para os onclick do HTML */
  window.NX = {
    go: go,
    start: startGame,
    calc: calculate,
    csv: exportCsv,
    reset: resetGame,
    configChanged: renderConfig
  };

  /* inicializa imediatamente (o script fica no fim do body) e também no DOMContentLoaded */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  }
  boot();
})();

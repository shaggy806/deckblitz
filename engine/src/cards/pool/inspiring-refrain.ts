import { defineCard } from "../define.js";

// EDHREC rank 4143. Cyclical Evolution's shape: the spell exiles itself with
// three time counters as it resolves (`give-suspend` on "source"), and it has
// suspend printed, so it's suspended again.
export default defineCard({
  name: "Inspiring Refrain",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  suspend: { n: 3, cost: "{2}{U}" },
  text: "Draw two cards. Exile Inspiring Refrain with three time counters on it.\nSuspend 3—{2}{U} (Rather than cast this card from your hand, you may pay {2}{U} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "give-suspend", target: "source", timeCounters: 3 },
    ],
  },
});

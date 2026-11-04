import { defineCard } from "../define.js";

// It exiles itself as it resolves, instead of going to the graveyard, and it has
// suspend, so it's suspended and comes back: every third upkeep, once cast.
export default defineCard({
  name: "Charnel Serenade",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  suspend: { n: 3, cost: "{2}{B}" },
  text: "Surveil 3, then return a creature card from your graveyard to the battlefield with a finality counter on it. Exile Charnel Serenade with three time counters on it.\nSuspend 3—{2}{B} (Rather than cast this card from your hand, you may pay {2}{B} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "surveil", amount: 3 },
      {
        kind: "return-from-graveyard",
        filter: { type: "creature" },
        destination: "battlefield",
        count: 1,
        withCounters: { kind: "finality", amount: 1 },
      },
      { kind: "give-suspend", target: "source", timeCounters: 3 },
    ],
  },
});

import { defineCard } from "../define.js";

// The sacrifice is part of the cost (no creature, no cast), and "the
// sacrificed creature's mana value" is read as it last existed on the
// battlefield (rule 608.2h). The find enters with the counter on it (rule
// 122.6 — `search-library`'s `withCounters`).
export default defineCard({
  name: "Neoform",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["sorcery"],
  text:
    "As an additional cost to cast this spell, sacrifice a creature.\n" +
    "Search your library for a creature card with mana value equal to 1 plus the sacrificed creature's mana value, put that card onto the battlefield with an additional +1/+1 counter on it, then shuffle.",
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  effect: {
    kind: "search-library",
    filter: {
      type: "creature",
      manaValue: { op: "eq", n: { amount: { sum: [{ manaValueOf: "sacrificed" }, 1] } } },
    },
    destination: "battlefield",
    min: 0,
    max: 1,
    withCounters: { kind: "+1/+1", amount: 1 },
  },
});

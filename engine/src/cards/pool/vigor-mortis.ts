import { defineCard } from "../define.js";

// EDHREC rank 18526.
//
// Rulings:
//   [2005-10-01] The +1/+1 counter from this ability is in addition to any other counters the
//     creature enters with.

export default defineCard({
  name: "Vigor Mortis",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to the battlefield. If {G} was spent to cast this spell, that creature enters with an additional +1/+1 counter on it.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { manaSpentOfColors: { G: 1 } } },
    then: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "+1/+1", amount: 1 } },
    else: { kind: "put-onto-battlefield", target: 0 },
  },
});

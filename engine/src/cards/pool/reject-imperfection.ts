import { defineCard } from "../define.js";

// EDHREC rank 4755. Sound the Trumpets' shape.
//
// "Was": the mana value the spell had on the stack ({X} counted), read before it's countered — a
// countered card's mana value in the graveyard drops its X. A spell that can't be countered is
// still read, so a cheap one still proliferates.

export default defineCard({
  name: "Reject Imperfection",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. If that spell's mana value was 3 or less, proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  targets: ["spell"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 3 } } },
    then: {
      kind: "sequence",
      effects: [{ kind: "counter", target: 0 }, { kind: "proliferate" }],
    },
    else: { kind: "counter", target: 0 },
  },
});

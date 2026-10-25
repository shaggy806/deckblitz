import { defineCard } from "../define.js";

// EDHREC rank 30622.
export default defineCard({
  name: "Self-Inflicted Wound",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent sacrifices a green or white creature of their choice. If that player does, they lose 2 life.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sacrifice",
        who: "target",
        filter: { type: "creature", anyOf: [{ colors: ["G"] }, { colors: ["W"] }] },
        count: 1,
      },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
        then: { kind: "lose-life", amount: 2, target: 0 },
      },
    ],
  },
});

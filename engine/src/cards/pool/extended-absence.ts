import { defineCard } from "../define.js";

// EDHREC rank 25786.

export default defineCard({
  name: "Extended Absence",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target creature or planeswalker. Extended Absence deals 1 damage to each opponent and you gain 1 life.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "damage", amount: 1, who: "each-opponent" },
      { kind: "gain-life", amount: 1 },
    ],
  },
});

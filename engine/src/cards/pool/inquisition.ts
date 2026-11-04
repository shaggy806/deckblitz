import { defineCard } from "../define.js";

// The hand is revealed and its white cards counted through `reveal-hand`'s
// `{ thisWay: "revealed" }`.
export default defineCard({
  name: "Inquisition",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player reveals their hand. Inquisition deals damage to that player equal to the number of white cards in their hand.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-hand", who: 0 },
      { kind: "damage", target: 0, amount: { thisWay: "revealed", filter: { colors: ["W"] } } },
    ],
  },
});

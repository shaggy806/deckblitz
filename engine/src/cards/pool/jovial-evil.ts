import { defineCard } from "../define.js";

// EDHREC rank 31788.
//
// The white creatures counted from the target opponent's side (`forTarget`),
// as the spell resolves.

export default defineCard({
  name: "Jovial Evil",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Jovial Evil deals X damage to target opponent, where X is twice the number of white creatures that player controls.",
  targets: ["opponent"],
  effect: {
    kind: "damage",
    target: 0,
    amount: { countOf: { type: "creature", colors: ["W"], controlledBy: "you" }, forTarget: 0, times: 2 },
  },
});

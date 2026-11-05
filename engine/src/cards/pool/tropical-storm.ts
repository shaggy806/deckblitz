import { defineCard } from "../define.js";

// EDHREC rank 29540. A blue flyer is dealt X+1 as one amount of damage; a blue
// creature without flying, 1.

export default defineCard({
  name: "Tropical Storm",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Tropical Storm deals X damage to each creature with flying and 1 additional damage to each blue creature.",
  targets: [],
  effect: {
    kind: "for-each-permanent",
    filter: { type: "creature", anyOf: [{ keyword: "flying" }, { colors: ["U"] }] },
    simultaneous: true,
    effect: {
      kind: "damage",
      target: 0,
      amount: {
        sum: [
          { ifCondition: { kind: "target", index: 0, filter: { keyword: "flying" } }, then: "x", else: 0 },
          { ifCondition: { kind: "target", index: 0, filter: { colors: ["U"] } }, then: 1, else: 0 },
        ],
      },
    },
  },
});

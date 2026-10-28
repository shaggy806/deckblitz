import { defineCard } from "../define.js";

// EDHREC rank 6297. Broken Wings' target with Extinguish the Light's gate:
// the destroyed permanent's mana value is read as it last existed (rule
// 608.2h).

export default defineCard({
  name: "Carnivorous Canopy",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target artifact, enchantment, or creature with flying. If that permanent's mana value was 3 or less, proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  targets: [
    {
      kind: "permanent",
      filter: { anyOf: [{ type: "artifact" }, { type: "enchantment" }, { type: "creature", keyword: "flying" }] },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 3 } } },
        then: { kind: "proliferate" },
      },
    ],
  },
});

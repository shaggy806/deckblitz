import { defineCard } from "../define.js";

export default defineCard({
  name: "Extinguish the Light",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature or planeswalker. If its mana value was 3 or less, you gain 3 life.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 3 } } },
        then: { kind: "gain-life", amount: 3 },
      },
    ],
  },
});

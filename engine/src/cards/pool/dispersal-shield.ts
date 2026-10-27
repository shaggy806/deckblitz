import { defineCard } from "../define.js";

// EDHREC rank 17208.
// Any spell may be targeted; the mana values are compared as it resolves.

export default defineCard({
  name: "Dispersal Shield",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell if its mana value is less than or equal to the greatest mana value among permanents you control.",
  targets: ["spell"],
  effect: {
    kind: "conditional",
    condition: {
      kind: "target",
      index: 0,
      filter: {
        manaValue: {
          op: "lte",
          n: { amount: { aggregate: "max", of: "mana-value", filter: { controlledBy: "you" } } },
        },
      },
    },
    then: { kind: "counter", target: 0 },
  },
});

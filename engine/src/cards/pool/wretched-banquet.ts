import { defineCard } from "../define.js";

// Conflux (CON).
//
// Any creature may be targeted; as it resolves, it's destroyed unless some
// creature on the battlefield — anyone's — has less power than it (the
// ruling). A tie for least still destroys it.

const LESS_POWER = {
  type: "creature",
  power: { op: "lt", n: { amount: { powerOf: 0 } } },
} as const;

export default defineCard({
  name: "Wretched Banquet",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature if it has the least power or is tied for least power among creatures on the battlefield.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: {
      kind: "not",
      of: {
        kind: "any",
        of: [
          { kind: "controls", filter: LESS_POWER, atLeast: 1 },
          { kind: "opponent-controls", filter: LESS_POWER, atLeast: 1 },
        ],
      },
    },
    then: { kind: "destroy", target: 0 },
  },
});

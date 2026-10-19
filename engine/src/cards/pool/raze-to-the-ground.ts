import { defineCard } from "../define.js";

// The Brothers' War. "Can't be countered" holds against ward too (the
// ruling). "Its mana value" is the artifact's as it last existed on the
// battlefield (Tainted Treats' shape) — and still read if it survived.
export default defineCard({
  name: "Raze to the Ground",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nDestroy target artifact. If its mana value was 1 or less, draw a card.",
  targets: ["artifact"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 1 } } },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});

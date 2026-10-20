import { defineCard } from "../define.js";

export default defineCard({
  name: "Fading Hope",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand. If its mana value was 3 or less, scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        // Its mana value as it last existed on the battlefield.
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 3 } } },
        then: { kind: "scry", amount: 1 },
      },
    ],
  },
});

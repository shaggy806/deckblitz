import { defineCard } from "../define.js";

// EDHREC rank 20461. Ixalan. Fading Hope's shape: the mana value is the
// permanent's as it last existed on the battlefield (the ruling), and an
// illegal target stops the whole spell, so no scry.

export default defineCard({
  name: "Perilous Voyage",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target nonland permanent you don't control to its owner's hand. If its mana value was 2 or less, scry 2.",
  targets: ["nonland-permanent-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 2 } } },
        then: { kind: "scry", amount: 2 },
      },
    ],
  },
});

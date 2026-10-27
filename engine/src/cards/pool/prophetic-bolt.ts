import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 13761. A Lightning-style 4 to any target, then
// Impulse.

export default defineCard({
  name: "Prophetic Bolt",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Prophetic Bolt deals 4 damage to any target. Look at the top four cards of your library. Put one of those cards into your hand and the rest on the bottom of your library in any order.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
    ],
  },
});

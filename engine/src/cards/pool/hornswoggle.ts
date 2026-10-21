import { defineCard } from "../define.js";

// EDHREC rank 13661. Rivals of Ixalan.
//
// A creature spell that can't be countered stays on the stack, and the
// Treasure is still made (the ruling).

export default defineCard({
  name: "Hornswoggle",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature spell. You create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  targets: ["creature-spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "create-token", token: "Treasure Token", count: 1 },
    ],
  },
});

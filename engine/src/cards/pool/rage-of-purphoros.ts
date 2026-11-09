import { defineCard } from "../define.js";

// EDHREC rank 29613.

export default defineCard({
  name: "Rage of Purphoros",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Rage of Purphoros deals 4 damage to target creature. It can't be regenerated this turn. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      { kind: "cant-regenerate", target: 0 },
      { kind: "scry", amount: 1 },
    ],
  },
});

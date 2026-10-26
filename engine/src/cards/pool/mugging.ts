import { defineCard } from "../define.js";

// EDHREC rank 21196.

export default defineCard({
  name: "Mugging",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Mugging deals 2 damage to target creature. That creature can't block this turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
    ],
  },
});

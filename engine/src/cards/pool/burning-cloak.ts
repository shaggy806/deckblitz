import { defineCard } from "../define.js";

// EDHREC rank 31224.

export default defineCard({
  name: "Burning Cloak",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target creature gets +2/+0 until end of turn. Burning Cloak deals 2 damage to that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "damage", target: 0, amount: 2 },
    ],
  },
});

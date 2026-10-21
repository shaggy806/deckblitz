import { defineCard } from "../define.js";

export default defineCard({
  name: "Blindblast",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Blindblast deals 1 damage to target creature. That creature can't block this turn.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      { kind: "draw", amount: 1 },
    ],
  },
});

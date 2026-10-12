import { defineCard } from "../define.js";

export default defineCard({
  name: "Stun",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature can't block this turn.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      { kind: "draw", amount: 1 },
    ],
  },
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Touch of Invisibility",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target creature can't be blocked this turn.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});

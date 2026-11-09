import { defineCard } from "../define.js";

// EDHREC rank 30094.

export default defineCard({
  name: "Reality Anchor",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature loses shadow until end of turn.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "become", target: 0, loseKeywords: ["shadow"], duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});

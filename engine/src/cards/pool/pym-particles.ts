import { defineCard } from "../define.js";

// EDHREC rank 8407.

export default defineCard({
  name: "Pym Particles",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target creature gains vigilance until end of turn and can't be blocked this turn.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Updraft",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature gains flying until end of turn.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});

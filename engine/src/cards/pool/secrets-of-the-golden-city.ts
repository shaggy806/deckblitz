import { defineCard } from "../define.js";

// EDHREC rank 15065. Ascend on a sorcery is its first instruction as it
// resolves (rule 702.131a), so the blessing it gives is had for the draw.

export default defineCard({
  name: "Secrets of the Golden City",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nDraw two cards. If you have the city's blessing, draw three cards instead.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "citys-blessing" },
    then: { kind: "draw", amount: 3 },
    else: { kind: "draw", amount: 2 },
  },
  resolve: null,
});

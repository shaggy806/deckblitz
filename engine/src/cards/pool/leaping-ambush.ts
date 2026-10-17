import { defineCard } from "../define.js";

// EDHREC rank 15087. High Stride's text and shape.

export default defineCard({
  name: "Leaping Ambush",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +1/+3 and gains reach until end of turn. Untap it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 3, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
      { kind: "untap", target: 0 },
    ],
  },
});

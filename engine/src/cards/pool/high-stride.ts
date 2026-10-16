import { defineCard } from "../define.js";

// Bloomburrow (BLB). EDHREC rank 12157. Pillar Launch's shape.
export default defineCard({
  name: "High Stride",
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

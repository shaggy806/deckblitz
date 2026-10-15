import { defineCard } from "../define.js";

// EDHREC rank 10823. Tethermage's Advantage's text and shape.
export default defineCard({
  name: "Pillar Launch",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 and gains reach until end of turn. Untap it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
      { kind: "untap", target: 0 },
    ],
  },
});

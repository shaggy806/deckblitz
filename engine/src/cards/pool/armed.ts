import { defineCard } from "../define.js";

const FACES = ["Armed // Dangerous", "Armed", "Dangerous"];

// The left half of Armed // Dangerous (see armed-dangerous.ts).
export default defineCard({
  name: "Armed",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target creature gets +1/+1 and gains double strike until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      {
        kind: "grant-keyword",
        target: 0,
        keyword: "double-strike",
        duration: "end-of-turn",
      },
    ],
  },
  faces: FACES,
  split: true,
});

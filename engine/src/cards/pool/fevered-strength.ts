import { defineCard } from "../define.js";

export default defineCard({
  name: "Fevered Strength",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +2/+0 until end of turn.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});

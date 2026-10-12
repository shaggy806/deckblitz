import { defineCard } from "../define.js";

export default defineCard({
  name: "Feral Instinct",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +1/+1 until end of turn.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});

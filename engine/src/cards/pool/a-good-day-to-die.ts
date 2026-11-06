import { defineCard } from "../define.js";

const TEXT = "Target creature gets +2/+0 until end of turn. When that creature dies this turn, you draw a card.";

export default defineCard({
  name: "A Good Day to Die",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: { kind: "draw", amount: 1 },
        text: "When that creature dies this turn, you draw a card.",
      },
    ],
  },
});

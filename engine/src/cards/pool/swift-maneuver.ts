import { defineCard } from "../define.js";

export default defineCard({
  name: "Swift Maneuver",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next 2 damage that would be dealt to any target this turn.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-damage", target: 0, amount: 2 },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});

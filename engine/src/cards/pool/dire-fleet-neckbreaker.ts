import { defineCard } from "../define.js";

const ANTHEM = "Attacking Pirates you control get +2/+0.";

export default defineCard({
  name: "Dire Fleet Neckbreaker",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 3,
  toughness: 2,
  text: ANTHEM,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", subtype: "Pirate", attacking: true, controlledBy: "you" },
      },
      grantPt: [2, 0],
      text: ANTHEM,
    },
  ],
});

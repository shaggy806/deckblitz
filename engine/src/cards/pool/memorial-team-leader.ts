import { defineCard } from "../define.js";

const ANTHEM_TEXT = "During your turn, other creatures you control get +1/+0.";

export default defineCard({
  name: "Memorial Team Leader",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu", "Soldier"],
  power: 4,
  toughness: 3,
  text: `${ANTHEM_TEXT}\nWarp {1}{R} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)`,
  warp: { cost: "{1}{R}" },
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      condition: { kind: "your-turn" },
      grantPt: [1, 0],
      text: ANTHEM_TEXT,
    },
  ],
});

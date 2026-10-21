import { defineCard } from "../define.js";

export default defineCard({
  name: "Warded Battlements",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 3,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\nAttacking creatures you control get +1/+0.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attacking: true, controlledBy: "you" } },
      grantPt: [1, 0],
      text: "Attacking creatures you control get +1/+0.",
    },
  ],
});

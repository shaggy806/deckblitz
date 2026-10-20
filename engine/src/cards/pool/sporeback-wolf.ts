import { defineCard } from "../define.js";

const TEXT = "During your turn, this creature gets +0/+2.";

export default defineCard({
  name: "Sporeback Wolf",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantPt: [0, 2],
      text: TEXT,
    },
  ],
});

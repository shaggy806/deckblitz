import { defineCard } from "../define.js";

const TEXT =
  "Metalcraft — As long as you control three or more artifacts, this creature gets +2/+2 and can attack as though it didn't have defender.";

export default defineCard({
  name: "Spire Serpent",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 3,
  toughness: 5,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "metalcraft" },
      grantPt: [2, 2],
      canAttackAsThoughNoDefender: true,
      text: TEXT,
    },
  ],
});

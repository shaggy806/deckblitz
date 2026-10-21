import { defineCard } from "../define.js";

const ATTACKING = "This creature gets +1/+0 as long as it's attacking.";

export default defineCard({
  name: "Grasping Scoundrel",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 1,
  toughness: 1,
  text: ATTACKING,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantPt: [1, 0],
      text: ATTACKING,
    },
  ],
});

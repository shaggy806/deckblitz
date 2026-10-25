import { defineCard } from "../define.js";

const TEXT = "As long as this creature is enchanted, it can attack as though it didn't have defender.";

export default defineCard({
  name: "Pillar of War",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { enchanted: true } },
      canAttackAsThoughNoDefender: true,
      text: TEXT,
    },
  ],
});

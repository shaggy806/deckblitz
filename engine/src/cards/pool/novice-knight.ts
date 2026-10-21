import { defineCard } from "../define.js";

const TEXT = "As long as this creature is enchanted or equipped, it can attack as though it didn't have defender.";

export default defineCard({
  name: "Novice Knight",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { anyOf: [{ enchanted: true }, { equipped: true }] } },
      canAttackAsThoughNoDefender: true,
      text: TEXT,
    },
  ],
});

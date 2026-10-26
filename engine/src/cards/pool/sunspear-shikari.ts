import { defineCard } from "../define.js";

const TEXT = "As long as this creature is equipped, it has first strike and lifelink.";

export default defineCard({
  name: "Sunspear Shikari",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${TEXT} (It deals combat damage before creatures without first strike. Damage dealt by it also causes you to gain that much life.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { equipped: true } },
      grantKeywords: ["first-strike", "lifelink"],
      text: TEXT,
    },
  ],
});

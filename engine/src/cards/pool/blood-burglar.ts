import { defineCard } from "../define.js";

export default defineCard({
  name: "Blood Burglar",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 2,
  toughness: 2,
  text: "During your turn, this creature has lifelink.(Damage dealt by this creature also causes you to gain that much life.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["lifelink"],
      text: "During your turn, this creature has lifelink.",
    },
  ],
});

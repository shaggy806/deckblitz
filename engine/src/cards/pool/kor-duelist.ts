import { defineCard } from "../define.js";

export default defineCard({
  name: "Kor Duelist",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier"],
  power: 1,
  toughness: 1,
  text: "As long as this creature is equipped, it has double strike. (It deals both first-strike and regular combat damage.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { equipped: true } },
      grantKeywords: ["double-strike"],
      text: "As long as this creature is equipped, it has double strike.",
    },
  ],
});

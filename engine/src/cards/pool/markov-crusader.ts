import { defineCard } from "../define.js";

// A static's `controls` condition leaves its own permanent out of the count,
// so this is "another Vampire".
const TEXT = "This creature has haste as long as you control another Vampire.";

export default defineCard({
  name: "Markov Crusader",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 4,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Vampire" }, atLeast: 1 },
      grantKeywords: ["haste"],
      text: TEXT,
    },
  ],
});

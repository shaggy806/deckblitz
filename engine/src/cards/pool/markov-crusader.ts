import { defineCard } from "../define.js";

// Eldritch Moon. EDHREC rank 24369. A static's `controls` condition leaves
// its own permanent out, so this is "another Vampire".
const HASTE_TEXT = "This creature has haste as long as you control another Vampire.";

export default defineCard({
  name: "Markov Crusader",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 4,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${HASTE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Vampire" }, atLeast: 1 },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
});

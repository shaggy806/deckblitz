import { defineCard } from "../define.js";

// EDHREC rank 24098.

const INDESTRUCTIBLE_TEXT = "During your turn, Colossus has indestructible.";
const LORD_TEXT = "Other Mutants you control get +1/+1.";

export default defineCard({
  name: "Colossus, Steel Stalwart",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Hero"],
  power: 4,
  toughness: 5,
  text: `${INDESTRUCTIBLE_TEXT} (Damage and effects that say "destroy" don't destroy him.)\n${LORD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["indestructible"],
      text: INDESTRUCTIBLE_TEXT,
    },
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Mutant" },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
});

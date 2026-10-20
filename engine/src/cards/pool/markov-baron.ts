import { defineCard } from "../define.js";

const LORD_TEXT = "Other Vampires you control get +1/+1.";

export default defineCard({
  name: "Markov Baron",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Noble"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  convoke: true,
  madness: { cost: "{2}{B}" },
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)
Lifelink
${LORD_TEXT}
Madness {2}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Vampire" },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// EDHREC rank 6858. Great Hall of the Citadel's restricted "any combination
// of colors", spendable only on a Lesson spell.
const LESSON_TEXT = "{T}: Add two mana in any combination of colors. Spend this mana only to cast Lesson spells.";

export default defineCard({
  name: "Hermitic Herbalist",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Human", "Druid", "Ally"],
  power: 2,
  toughness: 3,
  text: `{T}: Add one mana of any color.\n${LESSON_TEXT}`,
  activated: [
    addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." }),
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["W", "U", "B", "R", "G"] },
        amount: 2,
        spendOnly: { spell: { subtype: "Lesson" }, text: "Spend this mana only to cast Lesson spells." },
      },
      resolve: null,
      text: LESSON_TEXT,
    },
  ],
});

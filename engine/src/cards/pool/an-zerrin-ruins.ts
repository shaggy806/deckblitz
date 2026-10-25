import { defineCard } from "../define.js";

// Homelands. EDHREC rank 21931.
const UNTAP_TEXT = "Creatures of the chosen type don't untap during their controllers' untap steps.";

export default defineCard({
  name: "An-Zerrin Ruins",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  chooseCreatureTypeOnEnter: true,
  text: `As this enchantment enters, choose a creature type.\n${UNTAP_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", ofChosenType: true } },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});

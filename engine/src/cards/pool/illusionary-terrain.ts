import { BASIC_LAND_TYPE_CHOICES, cumulativeUpkeep } from "../helpers.js";
import { defineCard } from "../define.js";

// Two basic land types chosen as it enters (`chooseOnEnterCount: 2`, two
// different ones: the same type twice would change nothing); basic lands of
// the first (`ofChosenLandType`) are the second (`setsChosenLandType:
// "second"`, layer 4 — rule 305.7: they lose their old land type and its
// mana ability, and tap for the new one's). Supertypes (basic, snow) stay.
const UPKEEP =
  "Cumulative upkeep {2} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const LANDS = "Basic lands of the first chosen type are the second chosen type.";

export default defineCard({
  name: "Illusionary Terrain",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${UPKEEP}\nAs this enchantment enters, choose two basic land types.\n${LANDS}`,
  chooseOnEnter: BASIC_LAND_TYPE_CHOICES,
  chooseOnEnterCount: 2,
  triggered: [cumulativeUpkeep("{2}")],
  static: [
    {
      affects: { scope: "filter", filter: { type: "land", supertype: "basic", ofChosenLandType: true } },
      setsChosenLandType: "second",
      text: LANDS,
    },
  ],
});

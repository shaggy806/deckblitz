import { defineCard } from "../define.js";

// EDHREC rank 16760. Brass Herald's anthem: every creature of the chosen type,
// whoever controls it.

const CHOOSE = "As this enchantment enters, choose a creature type.";
const ANTHEM = "Creatures of the chosen type get +1/+1.";

export default defineCard({
  name: "Shared Triumph",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  chooseCreatureTypeOnEnter: true,
  text: `${CHOOSE}\n${ANTHEM}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", ofChosenType: true } },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 5629. Rivals of Ixalan.
//
// Icon of Ancestry's chosen-type anthem, with Skymarcher Aspirant's "as long
// as you have the city's blessing" on the vigilance half.

const CHOOSE_TEXT = "As this enchantment enters, choose a creature type.";
const ANTHEM_TEXT =
  "Creatures you control of the chosen type get +1/+1. As long as you have the city's blessing, they also have vigilance.";
const chosen = { type: "creature", controlledBy: "you", ofChosenType: true } as const;

export default defineCard({
  name: "Radiant Destiny",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["ascend"],
  chooseCreatureTypeOnEnter: true,
  text: `Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n${CHOOSE_TEXT}\n${ANTHEM_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: chosen },
      grantPt: [1, 1],
      text: "Creatures you control of the chosen type get +1/+1.",
    },
    {
      affects: { scope: "filter", filter: chosen },
      condition: { kind: "citys-blessing" },
      grantKeywords: ["vigilance"],
      text: "As long as you have the city's blessing, they also have vigilance.",
    },
  ],
});

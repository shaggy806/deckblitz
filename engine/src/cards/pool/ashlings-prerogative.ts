import { ODD_OR_EVEN } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 18168.
//
// "Enters tapped" looks at the creature as it would exist on the battlefield
// (rule 614.12), where the X in its cost is 0 (rule 107.3).

const HASTE_TEXT = "Each creature with mana value of the chosen quality has haste.";
const TAPPED_TEXT = "Each creature without mana value of the chosen quality enters tapped.";

export default defineCard({
  name: "Ashling's Prerogative",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `As this enchantment enters, choose odd or even. (Zero is even.)\n${HASTE_TEXT}\n${TAPPED_TEXT}`,
  chooseOnEnter: ODD_OR_EVEN,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", manaValueParity: "chosen" } },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", not: { manaValueParity: "chosen" } },
        tapped: true,
      },
      text: TAPPED_TEXT,
    },
  ],
});

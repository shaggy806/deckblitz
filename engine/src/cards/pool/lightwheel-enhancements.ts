import { defineCard } from "../define.js";
import { MAX_SPEED_CONDITION, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 12267. "Max speed — You may cast this card from your
// graveyard" works where it says, so the max speed ability does too (rule
// 702.178b): Gravecrawler's `castFromGraveyardIf`, asked of its owner's
// speed as it's cast, for its normal cost and timing.
const ANTHEM_TEXT = "Enchanted permanent gets +1/+1 and has vigilance.";
const CAST_TEXT = "You may cast this card from your graveyard.";

export default defineCard({
  name: "Lightwheel Enhancements",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["start-your-engines"],
  text: `Enchant creature or Vehicle\n${START_YOUR_ENGINES_TEXT}\n${ANTHEM_TEXT}\nMax speed — ${CAST_TEXT}`,
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["vigilance"],
      text: ANTHEM_TEXT,
    },
  ],
  castFromGraveyardIf: MAX_SPEED_CONDITION,
});

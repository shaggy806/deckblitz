import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 27557.
// A preparation card (rule 722): its prepare spell is Omit Variables.

const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;
const THRESHOLD_TEXT =
  "Threshold — This creature gets +1/+0 and has flying as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Theorix Metamage",
  manaCost: "{2}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Shade", "Wizard"],
  power: 2,
  toughness: 3,
  prepareSpell: "Omit Variables",
  text: `${ENTERS_TEXT}\n${THRESHOLD_TEXT}`,
  static: [
    entersPrepared(ENTERS_TEXT),
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 0],
      grantKeywords: ["flying"],
      text: THRESHOLD_TEXT,
    },
  ],
});

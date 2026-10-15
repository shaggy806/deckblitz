import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 27933.
//
// A preparation card (rule 722): its prepare spell is Omit Variables
// (`omit-variables.ts`, `prepareSpellOnly`).

const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;
const THRESHOLD_TEXT =
  "Threshold — This creature gets +1/+1 as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Void Extrapolator",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Aetherborn", "Warlock"],
  power: 2,
  toughness: 2,
  prepareSpell: "Omit Variables",
  text: `${ENTERS_TEXT}\n${THRESHOLD_TEXT}`,
  static: [
    entersPrepared(ENTERS_TEXT),
    { affects: { scope: "self" }, condition: { kind: "threshold" }, grantPt: [1, 1], text: THRESHOLD_TEXT },
  ],
});

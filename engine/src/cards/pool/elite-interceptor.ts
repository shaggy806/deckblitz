import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 13846. A preparation card (rule 722): its prepare spell is
// Rejoinder, a spell with no card of its own (`prepareSpellOnly`).
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Elite Interceptor",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  prepareSpell: "Rejoinder",
  text: ENTERS_TEXT,
  static: [entersPrepared(ENTERS_TEXT)],
});

import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Rampant Growth, the
// pool's own card — the same Oracle text.
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Studious First-Year",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear", "Wizard"],
  power: 1,
  toughness: 1,
  prepareSpell: "Rampant Growth",
  text: ENTERS_TEXT,
  static: [entersPrepared(ENTERS_TEXT)],
});

import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is All Aboard, no card of
// its own (`all-aboard.ts`, `prepareSpellOnly`). Being a Pilot, it can't
// blink itself with its own spell.
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Skycoach Conductor",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Pilot"],
  power: 2,
  toughness: 3,
  keywords: ["flash", "flying", "vigilance"],
  prepareSpell: "All Aboard",
  text: `Flash\nFlying, vigilance\n${ENTERS_TEXT}`,
  static: [entersPrepared(ENTERS_TEXT)],
});

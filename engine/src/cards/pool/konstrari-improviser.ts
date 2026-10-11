import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Soul Tether.
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Konstrari Improviser",
  manaCost: "{1}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  prepareSpell: "Soul Tether",
  text: ENTERS_TEXT,
  static: [entersPrepared(ENTERS_TEXT)],
});
